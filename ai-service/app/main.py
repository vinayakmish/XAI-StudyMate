"""
FastAPI application — XAI StudyMate AI Microservice.

Endpoints:
  GET  /health             → liveness probe
  GET  /model-info         → model metrics + feature importances
  POST /predict            → placement prediction
  POST /explain            → SHAP-based explanation
  POST /study-plan         → personalised improvement plan
  POST /chat               → simple rule-based AI tutor
"""
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    StudentInput, PredictionResponse, ExplanationResponse,
    StudyPlanResponse, ChatMessage, ChatResponse, ModelInfoResponse,
)
from .model import PlacementModel
from .explainer import SHAPExplainer
from .recommender import generate_study_plan

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Globals ─────────────────────────────────────────────────────────
model = PlacementModel()
explainer_instance = SHAPExplainer(model)

DATA_PATH = os.environ.get(
    "DATASET_PATH",
    os.path.join(os.path.dirname(os.path.dirname(__file__)),
                 "..", "Indian_Student_Placement_Dataset_2025.csv"),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train or load model on startup."""
    abs_data = os.path.abspath(DATA_PATH)
    logger.info("Dataset path: %s", abs_data)

    if not model.load():
        if not os.path.exists(abs_data):
            logger.error("Dataset not found at %s", abs_data)
        else:
            model.train(abs_data)
    else:
        logger.info("Loaded pre-trained model")

    # Pre-warm SHAP explainer
    explainer_instance.initialize()
    yield


app = FastAPI(
    title="XAI StudyMate AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _input_to_dict(inp: StudentInput) -> dict:
    return inp.model_dump()


# ── Endpoints ───────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "model_ready": model.is_trained}


@app.get("/model-info", response_model=ModelInfoResponse)
async def model_info():
    if not model.is_trained:
        raise HTTPException(503, "Model not trained yet")
    return ModelInfoResponse(
        is_trained=True,
        classification_metrics=model.clf_metrics,
        regression_metrics=model.reg_metrics,
        feature_importances=model.feature_importances,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(student: StudentInput):
    if not model.is_trained:
        raise HTTPException(503, "Model not trained yet")
    result = model.predict(_input_to_dict(student))
    return PredictionResponse(**result)


@app.post("/explain", response_model=ExplanationResponse)
async def explain(student: StudentInput):
    if not model.is_trained:
        raise HTTPException(503, "Model not trained yet")
    result = explainer_instance.explain(_input_to_dict(student))
    return ExplanationResponse(**result)


@app.post("/study-plan", response_model=StudyPlanResponse)
async def study_plan(student: StudentInput):
    if not model.is_trained:
        raise HTTPException(503, "Model not trained yet")
    result = generate_study_plan(_input_to_dict(student), explainer_instance)
    return StudyPlanResponse(**result)


@app.post("/chat", response_model=ChatResponse)
async def chat(msg: ChatMessage):
    """Simple rule-based study coach."""
    text = msg.message.lower().strip()
    context = msg.student_context

    # Basic keyword matching
    if any(w in text for w in ["hi", "hello", "hey"]):
        return ChatResponse(
            response="Hello! I'm your XAI StudyMate assistant. Ask me about placement preparation, "
                     "skill improvement, or anything related to your academic profile.",
            suggestions=["How can I improve my placement chances?",
                         "What skills should I focus on?",
                         "Tell me about my weaknesses"],
        )

    if any(w in text for w in ["cgpa", "gpa", "marks", "grade"]):
        advice = (
            "CGPA is one of the strongest predictors of placement success. "
            "Companies typically set a cutoff of 7.0+. Focus on:\n"
            "• Attending all lectures consistently\n"
            "• Revising notes within 24 hours\n"
            "• Solving previous year papers\n"
            "• Forming study groups for difficult subjects"
        )
        if context and context.cgpa < 7.0:
            advice += f"\n\nYour current CGPA ({context.cgpa}) is below the typical cutoff. Make this a top priority!"
        return ChatResponse(response=advice, suggestions=["How to clear backlogs?", "Tips for exam preparation"])

    if any(w in text for w in ["coding", "dsa", "leetcode", "programming"]):
        return ChatResponse(
            response="Coding skills are crucial for technical rounds:\n"
                     "• Start with easy problems on LeetCode/HackerRank\n"
                     "• Master arrays, strings, linked lists, trees, and DP\n"
                     "• Practice 2-3 problems daily\n"
                     "• Learn at least one language deeply (Python/Java/C++)\n"
                     "• Participate in weekly contests",
            suggestions=["Best resources for DSA?", "How much coding practice is enough?"],
        )

    if any(w in text for w in ["intern", "internship"]):
        return ChatResponse(
            response="Internships significantly boost placement chances:\n"
                     "• Apply on Internshala, LinkedIn, AngelList\n"
                     "• Target companies in your field (IT/DS/AI)\n"
                     "• Even a 1-month summer internship counts\n"
                     "• Document what you learned and add to resume\n"
                     "• Try to convert internships into pre-placement offers",
            suggestions=["Where to find internships?", "How to write a good resume?"],
        )

    if any(w in text for w in ["project", "portfolio", "github"]):
        return ChatResponse(
            response="Strong projects demonstrate practical skill:\n"
                     "• Build 2-3 end-to-end projects\n"
                     "• Host code on GitHub with detailed README\n"
                     "• Include diverse tech: web app, ML model, API\n"
                     "• Deploy at least one project live\n"
                     "• Be ready to explain every line in interviews",
            suggestions=["What kind of projects impress recruiters?", "How to document projects?"],
        )

    if any(w in text for w in ["placement", "chance", "probability", "predict"]):
        if context:
            result = model.predict(_input_to_dict(context))
            prob = result["placement_probability"]
            return ChatResponse(
                response=f"Based on your profile, your placement probability is **{prob*100:.1f}%**.\n"
                         f"Risk level: **{result['risk_level']}**.\n"
                         "Use the Study Plan feature for a detailed improvement roadmap!",
                suggestions=["Show me my study plan", "What should I improve first?"],
            )
        return ChatResponse(
            response="I can predict your placement chances! Fill in your profile on the Predict page "
                     "and come back, or tell me your details.",
            suggestions=["What factors affect placement?", "How to increase my chances?"],
        )

    if any(w in text for w in ["weak", "improve", "help", "suggestion", "tip"]):
        return ChatResponse(
            response="Great mindset! Here are the top areas to focus on:\n"
                     "1. **CGPA** — Maintain above 7.0\n"
                     "2. **Coding Skills** — Practice DSA daily\n"
                     "3. **Internships** — Get at least 1-2\n"
                     "4. **Aptitude** — Practice quant & verbal\n"
                     "5. **Communication** — Work on spoken English & confidence\n\n"
                     "Use the **Explain** tab to see which factors affect YOUR profile the most!",
            suggestions=["Tell me about aptitude preparation", "Best communication tips"],
        )

    if any(w in text for w in ["aptitude", "quant", "reasoning", "verbal"]):
        return ChatResponse(
            response="Aptitude preparation tips:\n"
                     "• Practice from RS Aggarwal (Quant) & Arun Sharma (Reasoning)\n"
                     "• Use PrepInsta or IndiaBix for online practice\n"
                     "• Take timed mock tests every weekend\n"
                     "• Focus on: percentages, time & work, profit/loss, syllogisms\n"
                     "• Many companies like TCS, Infosys, Wipro have aptitude rounds",
            suggestions=["Which companies test aptitude?", "How important is aptitude vs coding?"],
        )

    # Default
    return ChatResponse(
        response="I'm here to help with your placement preparation! You can ask me about:\n"
                 "• Improving CGPA and academics\n"
                 "• Coding and technical skills\n"
                 "• Internship strategies\n"
                 "• Communication and soft skills\n"
                 "• Aptitude preparation\n"
                 "• Your placement prediction\n\n"
                 "Try asking something specific!",
        suggestions=["How to prepare for placements?",
                     "What's my placement probability?",
                     "How to improve coding skills?"],
    )
