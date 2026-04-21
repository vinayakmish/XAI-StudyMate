# 🎓 XAI StudyMate — Explainable AI Student Placement Predictor

An AI-powered, explainable student placement prediction system built with **FastAPI**, **Scikit-learn**, **SHAP**, and a modern dark-themed frontend. It predicts placement outcomes, explains decisions using SHAP analysis, and generates personalized 8-week study improvement plans.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.8-orange?logo=scikitlearn)
![SHAP](https://img.shields.io/badge/SHAP-0.51-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔮 **Placement Prediction** | Dual-model pipeline (RandomForest classifier + regressor) predicts placement status and expected package |
| 🔍 **SHAP Explainability** | Per-feature SHAP analysis shows exactly what helps/hurts your placement chances |
| 📋 **Personalized Study Plan** | AI-generated 8-week improvement roadmap with prioritized action items |
| 💬 **AI Study Tutor** | Rule-based chatbot for placement preparation advice |
| 📊 **Model Dashboard** | View classification/regression metrics and global feature importances |
| 🌙 **Dark Theme UI** | Modern, responsive glassmorphism design with smooth animations |

## 🏗️ Architecture

```
XAI-StudyMate/
├── Indian_Student_Placement_Dataset_2025.csv   # 12,000 student records
├── test_api.py                                  # Endpoint smoke tests
├── ai-service/                                  # FastAPI microservice
│   ├── requirements.txt
│   ├── models/                                  # Trained model artifacts (auto-generated)
│   └── app/
│       ├── model.py          # PlacementModel — train/load/predict
│       ├── explainer.py      # SHAP TreeExplainer with domain-knowledge overrides
│       ├── recommender.py    # Study plan generator with React Flow graph data
│       ├── schemas.py        # Pydantic request/response models
│       └── main.py           # FastAPI app with 6 endpoints
└── frontend/
    └── index.html            # Single-page app (vanilla HTML/CSS/JS)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip

### 1. Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Start the AI Backend (port 5000)
```bash
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```
> On first run, the model trains automatically from the dataset (~2 seconds).  
> Subsequent runs load pre-trained models instantly.

### 3. Start the Frontend (port 3000)
Open a **second terminal**:
```bash
cd frontend
python -m http.server 3000
```

### 4. Open in Browser
Navigate to **http://localhost:3000**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness probe |
| `GET` | `/model-info` | Model metrics & feature importances |
| `POST` | `/predict` | Placement prediction |
| `POST` | `/explain` | SHAP-based feature explanations |
| `POST` | `/study-plan` | Personalized improvement plan |
| `POST` | `/chat` | AI study tutor chat |

### Example Request
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Male", "age": 21, "degree": "BTech", "branch": "CS",
    "cgpa": 7.5, "backlogs": 0, "internships": 1, "certifications": 2,
    "coding_skills": 6, "communication_skills": 8,
    "aptitude_score": 65, "projects": 2
  }'
```

## 🤖 ML Pipeline

- **Classification**: RandomForestClassifier (250 trees) → Placed / Not Placed
- **Regression**: RandomForestRegressor (200 trees) → Predicted Package (LPA)
- **Explainability**: SHAP TreeExplainer with domain-knowledge overrides
- **Dataset**: Indian Student Placement Dataset 2025 (12,000 records, 16 features)

### Top Predictive Features
1. **Coding Skills** — 40.9% importance
2. **Aptitude Score** — 33.2% importance
3. **CGPA** — 21.4% importance

## 📸 Screenshots

The application features a sleek dark-themed UI with:
- **Predict Tab** — Input form with real-time placement prediction
- **Explain Tab** — SHAP waterfall chart with strengths/weaknesses
- **Study Plan Tab** — Prioritized action items + 8-week timeline
- **AI Tutor Tab** — Interactive chat for placement prep advice
- **Model Info Tab** — Performance metrics + feature importance bars

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **ML**: Scikit-learn, SHAP, Pandas, NumPy
- **Frontend**: Vanilla HTML/CSS/JS (no frameworks)
- **Design**: Dark mode, glassmorphism, Inter font, CSS animations

## 📄 License

MIT License — feel free to use and modify.
