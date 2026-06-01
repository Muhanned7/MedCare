import os
from typing import List
from google import genai
from app.database import get_supabase_client
from app.schemas import CaptureCandidate, ConflictMatch

class VectorService:
    @staticmethod
    def get_embedding(text: str) -> List[float]:
        """
        Generates a 768-dimensional vector embedding using Gemini's free tier.
        """
        if not os.getenv("GEMINI_API_KEY"):
            raise ValueError("GEMINI_API_KEY is not set in the environment variables.")
        
        client = genai.Client()
        response = client.models.embed_content(
            model="gemini-embedding-2",  # <-- Change this from text-embedding-004
            contents=text,
            config={"output_dimensionality": 768}  # <-- Force it to match our 768 pgvector schema!
        )
        # Extract the list of floats from the embedding response object
        return response.embeddings[0].values

    @classmethod
    async def check_conflicts(cls, patient_id: str, candidate: CaptureCandidate) -> List[ConflictMatch]:
        """
        Computes the candidate's embedding and searches Supabase using pgvector 
        to isolate and categorize potential semantic conflicts for this patient.
        """
        # 1. Compute the real dense vector embedding
        embedding_vector = cls.get_embedding(candidate.content)
        
        supabase = get_supabase_client()
        
        try:
            # 2. Invoke our custom remote RPC matching function inside Supabase
            # We filter tightly by patient_id to optimize row compute scans
            response = supabase.rpc(
                "match_knowledge_nodes",
                {
                    "query_patient_id": patient_id,
                    "query_embedding": embedding_vector,
                    "match_threshold": 0.70, # Core minimum filter threshold (70%)
                    "match_count": 3
                }
            ).execute()
            
            conflicts = []
            
            for row in response.data:
                # Calculate the raw cosine similarity score
                similarity = row["similarity"]
                
                # Apply the mathematical boundary categories defined by BRAHMO
                if similarity >= 0.95:
                    suggestion = "DUPLICATE"
                elif similarity >= 0.85:
                    suggestion = "UPDATE"
                else:
                    suggestion = "COEXIST"
                    
                conflicts.append(
                    ConflictMatch(
                        existing_node_id=str(row["id"]),
                        similarity_score=similarity,
                        existing_content=row["content"],
                        action_suggestion=suggestion
                    )
                )
                
            return conflicts
            
        except Exception as e:
            print(f"[VectorService Error]: Supabase pgvector query failed: {str(e)}")
            # Fail gracefully by returning an empty conflicts array during sandbox disruptions
            return []