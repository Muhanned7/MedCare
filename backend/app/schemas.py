from pydantic import BaseModel, Field
from typing import Literal, List, Optional

from typing import Optional
from datetime import datetime

class TranscriptPayload(BaseModel):
    patient_id: str
    raw_text: str

class TranscriptReview(BaseModel):
    patient_id: str
    reviewed_text: str

class CaptureCandidate(BaseModel):
    type: Literal["CONSTRAINT", "DECISION", "ANTI_PATTERN", "FACT"]
    title: str
    content: str
    importance: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    suggested_level: str
    department: Optional[str] = None
    rationale: Optional[str] = None


class ConflictMatch(BaseModel):
    existing_node_id: str
    similarity_score: float
    existing_content: str
    action_suggestion: Literal["DUPLICATE", "UPDATE", "COEXIST", "NEW", "SUPERSEDE"]
    created_at: Optional[datetime] = None

class PipelineResponse(BaseModel):
    candidate: CaptureCandidate
    routing_tier: Literal["AUTO", "REVIEW", "EXPLICIT"]
    conflicts: List[ConflictMatch]

class CreateNodePayload(BaseModel):
    patient_id: str
    type: Literal["CONSTRAINT", "DECISION", "ANTI_PATTERN", "FACT"]
    title: str
    content: str
    importance: float
    suggested_level: str
    department: Optional[str] = None

class MergeNodePayload(BaseModel):
    existing_node_id: str
    new_content: str

class DismissPayload(BaseModel):
    candidate_content: str
    reason: Optional[str] = "Doctor dismissed"
    patient_id: str