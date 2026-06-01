from app.schemas import CaptureCandidate
from typing import Literal

class ConfidenceRouter:
    @staticmethod
    def route(candidate: CaptureCandidate) -> Literal["AUTO", "REVIEW", "EXPLICIT"]:
        """
        Routes each candidate to a processing tier based on confidence score.
        
        AUTO     (>0.85)      — High confidence, auto-capture with 60s undo window
        REVIEW   (0.60-0.85)  — Medium confidence, doctor reviews with Confirm/Edit/Dismiss
        EXPLICIT (<0.60)      — Low confidence, doctor must manually edit content
        """
        confidence = candidate.confidence

        if confidence > 0.85:
            return "AUTO"
        elif confidence >= 0.60:
            return "REVIEW"
        else:
            return "EXPLICIT"