# 🎓 XAI StudyMate — Explainable AI Student Placement Predictor

A full-stack, AI-powered student placement prediction system with **SHAP explainability**, personalized study plans, and an **admin dashboard** for monitoring at-risk students. Built with a modern microservice architecture.

![Java](https://img.shields.io/badge/Java-21-red?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green?logo=springboot)
![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
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
| 👑 **Admin Dashboard** | Monitor at-risk students, view analytics, contact students via email/phone |
| 🔐 **JWT Authentication** | Secure login/register with role-based access (Student/Admin) |
| 🌙 **Dark Theme UI** | Modern glassmorphism design with smooth animations and radial gauges |

## 🏗️ Architecture

```
XAI-StudyMate/
├── Indian_Student_Placement_Dataset_2025.csv   # 12,000 student records
├── ai-service/                                  # Python AI Microservice
│   ├── requirements.txt
│   ├── models/                                  # Trained model artifacts
│   └── app/
│       ├── model.py          # PlacementModel — train/load/predict
│       ├── explainer.py      # SHAP TreeExplainer
│       ├── recommender.py    # Study plan generator
│       ├── schemas.py        # Pydantic request/response models
│       └── main.py           # FastAPI endpoints
├── backend/                                     # Java Spring Boot Backend
│   ├── pom.xml
│   └── src/main/java/com/xaistudymate/backend/
│       ├── config/           # Security, CORS, RestTemplate, DataSeeder
│       ├── controller/       # Auth, Prediction, Chat, Admin, Dashboard
│       ├── dto/              # Request/Response DTOs
│       ├── entity/           # JPA entities (User, StudentProfile, etc.)
│       ├── exception/        # Global exception handling
│       ├── repository/       # Spring Data JPA repositories
│       ├── security/         # JWT filter, provider, UserDetailsService
│       └── service/          # Business logic + AI service client
├── frontend/                                    # React single-page application
│   ├── index.html              # Vite HTML entry point
│   ├── vite.config.js          # React plugin, dev server, and API proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx            # React application entry point
│       ├── App.jsx             # Application routes and layout
│       ├── api.js              # Backend API client
│       ├── index.css           # Global styles
│       ├── components/         # Shared React components
│       └── pages/              # Landing, student, and admin pages
├── package.json                                 # Root convenience scripts
└── README.md
```

```mermaid
graph LR
    A[Frontend :3000] --> B[Spring Boot :8080]
    B --> C[H2/PostgreSQL]
    B --> D[FastAPI AI Service :5000]
    D --> E[ML Model + SHAP]
    D --> F[Dataset CSV]
```

## 🚀 Quick Start

### Prerequisites
- **Java 21+** and **Maven 3.9+**
- **Python 3.10+** with pip
- **Node.js 20+** and npm

### 1. Install the frontend dependencies
```bash
npm run install:frontend
```

### 2. Set up the AI service (Windows)
From the repository root, create its virtual environment and install dependencies:
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

### 3. Start the application (Windows)
From the repository root, start the AI service, Spring Boot backend, and Vite frontend together:
```bash
npm start
```

The frontend is served at **http://localhost:3000**. Vite proxies `/api` requests to the backend at port 8080. The backend calls the AI service on port 5000.

> The combined `npm start` script uses the Windows virtual-environment path `ai-service/venv/Scripts/python.exe`. For other operating systems, start the AI service with its virtual-environment Python and Uvicorn, the backend with the Maven command below, and the frontend with `npm --prefix frontend run dev` in separate terminals.

The services can also be started separately:

**AI service (port 5000)**
```bash
cd ai-service
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```
> First run trains the model automatically (~2 seconds). Subsequent runs load instantly.

**Spring Boot backend (port 8080)**
```bash
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```
> Uses H2 in-memory database — no PostgreSQL installation needed for development. An admin user is auto-seeded on startup.

**React frontend (port 3000)**
```bash
npm --prefix frontend run dev
```

Open **http://localhost:3000** in your browser.

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@xaistudymate.com` | `admin123` |
| 🎓 Student | Register a new account | Your choice |

## 📡 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, get JWT |
| `GET` | `/api/auth/me` | Get current user |

### Student (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Placement prediction |
| `POST` | `/api/explain` | SHAP-based explanations |
| `POST` | `/api/study-plan` | Personalized study plan |
| `POST` | `/api/chat` | AI study tutor |
| `GET` | `/api/model-info` | Model metrics & importances |

### Admin (JWT + Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Overview stats + student list |
| `GET` | `/api/admin/at-risk` | Students with <50% probability |
| `GET` | `/api/admin/students/{id}/study-plan` | Student study plan detail |

## 🤖 ML Pipeline

- **Classification**: RandomForestClassifier (250 trees) → Placed / Not Placed
- **Regression**: RandomForestRegressor (200 trees) → Predicted Package (LPA)
- **Explainability**: SHAP TreeExplainer with domain-knowledge overrides
- **Dataset**: Indian Student Placement Dataset 2025 (12,000 records, 16 features)

### Top Predictive Features
1. **Coding Skills** — 40.9% importance
2. **Aptitude Score** — 33.2% importance
3. **CGPA** — 21.4% importance

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Service** | Python, FastAPI, Scikit-learn, SHAP, Pandas |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Security, JPA |
| **Database** | H2 (dev) / PostgreSQL (prod) |
| **Auth** | JWT (jjwt 0.12), BCrypt |
| **Frontend** | React 19, Vite 6, JavaScript, CSS, Inter font, Glassmorphism |

## 📄 License

MIT License — feel free to use and modify.
