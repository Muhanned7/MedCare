from fastapi import APIRouter, HTTPException
from app.schemas import TranscriptReview, PipelineResponse, CreateNodePayload, MergeNodePayload, DismissPayload
from app.services.extractor import LLMExtractor
from app.services.router import ConfidenceRouter
from app.services.vector import VectorService
from app.database import get_supabase_client
from pydantic import BaseModel
from typing import List
import os

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

# ─────────────────────────────────────────────
# STAGE 3-5: Extract → Route → Conflict Check
# ─────────────────────────────────────────────
@router.post("/extract", response_model=List[PipelineResponse])
async def process_reviewed_transcript(payload: TranscriptReview):
    try:
        supabase = get_supabase_client()

        # 1. Fetch existing patient context so LLM doesn't re-extract known nodes
        existing_nodes = supabase.table("knowledge_nodes")\
            .select("id, title, content, type")\
            .execute()

        context = [
            {"id": n["id"], "title": n["title"], "content": n["content"], "type": n["type"]}
            for n in existing_nodes.data
        ]

        # With this — only pass patient-relevant nodes as context:
        existing_nodes = supabase.table("knowledge_nodes")\
            .select("id, title, content, type, hierarchy_level_id")\
            .in_("hierarchy_level_id", ["HL-12-RAMAIAH", "HL-12-AADHYA"])\
            .execute()

        context = [
            {"id": n["id"], "title": n["title"], "content": n["content"], "type": n["type"]}
            for n in existing_nodes.data
        ]

        # 2. Run LLM extraction with context
        candidates = await LLMExtractor.extract(payload.reviewed_text, existing_context=[])

        # 3. Route each candidate + check for vector conflicts
        processed_pipeline = []
        for c in candidates:
            tier = ConfidenceRouter.route(c)
            conflicts = await VectorService.check_conflicts(payload.patient_id, c)

            processed_pipeline.append({
                "candidate": c,
                "routing_tier": tier,
                "conflicts": conflicts
            })

        return processed_pipeline

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Save a confirmed new node
# ─────────────────────────────────────────────
@router.post("/node/save")
async def save_knowledge_node(payload: CreateNodePayload):
    try:
        supabase = get_supabase_client()

        # 1. Resolve hierarchy level from suggested_level + patient
        level_map = {
            "patient": f"HL-12-{payload.patient_id.replace('PAT-', '')}",
            "department": f"HL-05-{(payload.department or 'ortho').upper()}",
            "hospital": "HL-03"
        }
        hierarchy_level_id = level_map.get(payload.suggested_level, "HL-03")

        # 2. Generate embedding
        embedding_vector = VectorService.get_embedding(payload.content)

        # 3. Insert node
        import uuid
        node_id = f"N-{str(uuid.uuid4())[:8].upper()}"

        response = supabase.table("knowledge_nodes").insert({
            "id": node_id,
            "org_id": "supra",
            "hierarchy_level_id": hierarchy_level_id,
            "type": payload.type,
            "title": payload.title,
            "content": payload.content,
            "importance": payload.importance,
            "department": payload.department,
            "embedding": embedding_vector,
            "source": "CAPTURE",
            "created_by": "U-SHARMA"
        }).execute()

        # 4. Log to event_log
        supabase.table("event_log").insert({
            "entity_type": "knowledge_node",
            "entity_id": node_id,
            "action": "CAPTURE_CONFIRMED",
            "payload": {"type": payload.type, "title": payload.title}
        }).execute()

        return {"status": "success", "inserted_id": node_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save node: {str(e)}")


# ─────────────────────────────────────────────
# Merge candidate into existing node
# ─────────────────────────────────────────────
@router.post("/node/merge")
async def merge_knowledge_node(payload: MergeNodePayload):
    try:
        supabase = get_supabase_client()

        # 1. Fetch existing node
        existing = supabase.table("knowledge_nodes")\
            .select("content")\
            .eq("id", payload.existing_node_id)\
            .single()\
            .execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Target node not found.")

        # 2. Enrich content
        enriched_content = f"{existing.data['content']} UPDATE: {payload.new_content}"

        # 3. Recompute embedding on enriched content
        updated_embedding = VectorService.get_embedding(enriched_content)

        # 4. Update node
        supabase.table("knowledge_nodes").update({
            "content": enriched_content,
            "embedding": updated_embedding,
            "source": "CAPTURE"
        }).eq("id", payload.existing_node_id).execute()

        # 5. Audit log
        supabase.table("event_log").insert({
            "entity_type": "knowledge_node",
            "entity_id": payload.existing_node_id,
            "action": "CAPTURE_MERGED",
            "payload": {"appended_text": payload.new_content}
        }).execute()

        return {"status": "success", "merged_id": payload.existing_node_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to merge node: {str(e)}")


# ─────────────────────────────────────────────
# Dismiss a candidate — logs to event_log
# ─────────────────────────────────────────────
@router.post("/node/dismiss")
async def dismiss_candidate(payload: DismissPayload):
    try:
        supabase = get_supabase_client()

        supabase.table("event_log").insert({
            "entity_type": "capture_candidate",
            "entity_id": "dismissed",
            "action": "CAPTURE_DISMISSED",
            "payload": {
                "content": payload.candidate_content,
                "reason": payload.reason,
                "patient_id": payload.patient_id
            }
        }).execute()

        return {"status": "dismissed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log dismissal: {str(e)}")

class UndoMergePayload(BaseModel):
    node_id: str
    original_content: str

@router.post("/node/undo-merge")
async def undo_merge(payload: UndoMergePayload):
    try:
        supabase = get_supabase_client()

        # Recompute embedding for original content
        original_embedding = VectorService.get_embedding(payload.original_content)

        supabase.table("knowledge_nodes").update({
            "content": payload.original_content,
            "embedding": original_embedding,
            "source": "CAPTURE"
        }).eq("id", payload.node_id).execute()

        supabase.table("event_log").insert({
            "entity_type": "knowledge_node",
            "entity_id": payload.node_id,
            "action": "CAPTURE_MERGE_UNDONE",
            "payload": {"restored_content": payload.original_content}
        }).execute()

        return {"status": "undone", "node_id": payload.node_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Undo failed: {str(e)}")


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@router.get("/health/supabase")
async def check_supabase():
    try:
        supabase = get_supabase_client()
        response = supabase.table("knowledge_nodes").select("id").limit(1).execute()
        return {"status": "connected", "sample": response.data}
    except Exception as e:
        return {"status": "failed", "error": str(e)}