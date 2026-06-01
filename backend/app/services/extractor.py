import os
import json
from typing import List
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.schemas import CaptureCandidate

class CaptureCandidateListWrapper(BaseModel):
    candidates: List[CaptureCandidate]

class LLMExtractor:
    @staticmethod
    async def extract(reviewed_text: str, existing_context: List[dict] = None) -> List[CaptureCandidate]:
        if not os.getenv("GEMINI_API_KEY"):
            raise ValueError("GEMINI_API_KEY is not set in the environment variables.")

        client = genai.Client()

        context_str = "None"
        if existing_context:
            context_str = json.dumps(existing_context, indent=2)

        system_instruction = """
You are BRAHMO, a Clinical Knowledge Graph Extraction Engine for Supra Multi-Specialty Hospital.
Analyze the doctor's transcript and extract ONLY new or reinforced knowledge worth storing.

STRICT TYPE DEFINITIONS:

CONSTRAINT (importance 0.8-1.0):
  Hard rules that MUST be followed. Drug contraindications, allergy warnings, absolute protocol requirements.
  Violation = patient safety risk. Examples: "No NSAIDs for Ramaiah", "Never prescribe penicillin to Aadhya".

DECISION (importance 0.5-0.8):
  Active clinical actions taken THIS session. Medications started/stopped, treatment changes, referrals made.
  Examples: "Tramadol 50mg trial initiated", "Azithromycin prescribed for ear infection".

ANTI_PATTERN (importance 0.7-0.9):
  Behaviors or approaches that should NOT be repeated. Patient non-compliance patterns, unsafe requests.
  Examples: "Patient keeps requesting contraindicated medication", "Mother requests amoxicillin despite allergy".

FACT (importance 0.3-0.6):
  Observable facts, symptoms, monitoring notes. True but not prescriptive.
  Examples: "Monitor for dizziness on Tramadol", "5th ear infection this year".

CONFIDENCE SCORING:
  >0.85 — Explicit, unambiguous statement in transcript
  0.60-0.85 — Clear but requires some interpretation
  <0.60 — Speculative, vague, or implicit

SUGGESTED LEVEL:
  "patient" — applies only to this specific patient
  "department" — applies to the whole department
  "hospital" — applies hospital-wide

CRITICAL RULES:
1. Do NOT extract knowledge already covered by existing context nodes below.
2. Do NOT extract general medical textbook knowledge.
3. Each candidate MUST have a unique title (max 6 words).
4. If nothing new is worth capturing, return empty candidates array.
5. Return ONLY the JSON. No preamble, no markdown.

EXISTING PATIENT CONTEXT:
--------------------------
""" + context_str + """
--------------------------
"""

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"Doctor transcript to extract knowledge from:\n\n{reviewed_text}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=CaptureCandidateListWrapper,
                    temperature=0.1,
                ),
            )

            raw_json = json.loads(response.text)
            validated_wrapper = CaptureCandidateListWrapper(**raw_json)
            return validated_wrapper.candidates

        except Exception as e:
            print(f"[LLMExtractor Error]: {str(e)}")
            raise e