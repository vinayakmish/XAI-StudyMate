"""
Pydantic schemas for the XAI StudyMate AI Service.
Tailored to the Indian Student Placement Dataset 2025.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict


# ── Feature names & display labels ──────────────────────────────────
FEATURE_COLS = [
    "gender", "age", "degree", "branch", "cgpa", "backlogs",
    "internships", "certifications", "coding_skills",
    "communication_skills", "aptitude_score", "projects",
]

DISPLAY_NAMES = {
    "gender": "Gender",
    "age": "Age",
    "degree": "Degree",
    "branch": "Branch",
    "cgpa": "CGPA",
    "backlogs": "Backlogs",
    "internships": "Internships",
    "certifications": "Certifications",
    "coding_skills": "Coding Skills",
    "communication_skills": "Communication Skills",
    "aptitude_score": "Aptitude Score",
    "projects": "Projects Completed",
}


# ── Request / Response Models ───────────────────────────────────────

class StudentInput(BaseModel):
    """Raw student profile sent from the frontend."""
    gender: str = Field(..., description="Male / Female")
    age: int = Field(..., ge=18, le=30)
    degree: str = Field(..., description="BE / BTech / BSc / BCA")
    branch: str = Field(..., description="CS / IT / DS / AI / Electrical / Mechanical")
    cgpa: float = Field(..., ge=0, le=10)
    backlogs: int = Field(..., ge=0, le=10)
    internships: int = Field(..., ge=0, le=5)
    certifications: int = Field(..., ge=0, le=10)
    coding_skills: int = Field(..., ge=0, le=10)
    communication_skills: int = Field(..., ge=0, le=10)
    aptitude_score: int = Field(..., ge=0, le=100)
    projects: int = Field(..., ge=0, le=10)


class PredictionResponse(BaseModel):
    placed: bool
    placement_probability: float
    predicted_package: float
    risk_level: str
    confidence: float


class FeatureExplanation(BaseModel):
    feature: str
    display_name: str
    shap_value: float
    current_value: str
    impact: str            # "positive" / "negative"
    importance_rank: int


class ExplanationResponse(BaseModel):
    placed: bool
    placement_probability: float
    predicted_package: float
    risk_level: str
    explanations: List[FeatureExplanation]
    top_strengths: List[str]
    top_weaknesses: List[str]


class StudyPlanItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str          # "high" / "medium" / "low"
    category: str
    current_value: str
    target_value: str
    estimated_impact: float
    timeline_week: int
    dependencies: List[str] = []


class StudyPlanResponse(BaseModel):
    student_summary: str
    placement_probability: float
    predicted_package: float
    risk_level: str
    plan_items: List[StudyPlanItem]
    flow_nodes: List[Dict]
    flow_edges: List[Dict]
    weekly_milestones: List[Dict]


class ChatMessage(BaseModel):
    message: str
    student_context: Optional[StudentInput] = None


class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []


class ModelInfoResponse(BaseModel):
    is_trained: bool
    classification_metrics: Dict
    regression_metrics: Dict
    feature_importances: List[Dict]
