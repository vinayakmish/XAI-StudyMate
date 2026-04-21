"""
ML Models for the Indian Student Placement Dataset 2025.

Two models:
  1. RandomForestClassifier  → predicts placed (0/1)
  2. RandomForestRegressor   → predicts package_lpa (for placed students)

Categorical columns (gender, degree, branch) are one-hot encoded.
"""
import os
import logging
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, mean_squared_error, mean_absolute_error, r2_score,
)
import joblib

logger = logging.getLogger(__name__)

# Resolve model directory relative to this file (ai-service/models/)
_BASE_DIR = Path(__file__).resolve().parent.parent
_MODEL_DIR = _BASE_DIR / "models"

# ── Column definitions ──────────────────────────────────────────────
NUMERIC_FEATURES = [
    "age", "cgpa", "backlogs", "internships", "certifications",
    "coding_skills", "communication_skills", "aptitude_score", "projects",
]
CATEGORICAL_FEATURES = ["gender", "degree", "branch"]
ALL_INPUT_FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES

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

FEATURE_OPTIMAL = {
    "cgpa":                 {"min": 7.5, "max": 10, "unit": "", "direction": "higher"},
    "backlogs":             {"min": 0,   "max": 0,  "unit": "", "direction": "lower"},
    "internships":          {"min": 2,   "max": 3,  "unit": "", "direction": "higher"},
    "certifications":       {"min": 3,   "max": 5,  "unit": "", "direction": "higher"},
    "coding_skills":        {"min": 7,   "max": 10, "unit": "/10", "direction": "higher"},
    "communication_skills": {"min": 7,   "max": 10, "unit": "/10", "direction": "higher"},
    "aptitude_score":       {"min": 70,  "max": 100, "unit": "/100", "direction": "higher"},
    "projects":             {"min": 3,   "max": 5,  "unit": "", "direction": "higher"},
}


class PlacementModel:
    """Trains and serves placement-prediction models."""

    def __init__(self):
        self.clf_pipeline: Pipeline | None = None
        self.reg_pipeline: Pipeline | None = None
        self.is_trained = False
        self.clf_metrics: dict = {}
        self.reg_metrics: dict = {}
        self.feature_importances: list = []
        self._preprocessor = None

    # ── build shared preprocessor ────────────────────────────────────
    def _build_preprocessor(self):
        return ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
                ("num", "passthrough", NUMERIC_FEATURES),
            ]
        )

    # ── train ────────────────────────────────────────────────────────
    def train(self, csv_path: str):
        logger.info("Loading dataset from %s …", csv_path)
        df = pd.read_csv(csv_path)
        logger.info("Dataset shape: %s", df.shape)

        X = df[ALL_INPUT_FEATURES]
        y_cls = df["placed"]
        y_pkg = df["package_lpa"]

        X_train, X_test, y_cls_train, y_cls_test, y_pkg_train, y_pkg_test = (
            train_test_split(X, y_cls, y_pkg, test_size=0.2, random_state=42, stratify=y_cls)
        )

        # ── Classification pipeline ────────────────────────────────
        self.clf_pipeline = Pipeline([
            ("pre", self._build_preprocessor()),
            ("clf", RandomForestClassifier(
                n_estimators=250, max_depth=14, min_samples_split=4,
                min_samples_leaf=2, class_weight="balanced",
                random_state=42, n_jobs=-1,
            )),
        ])
        self.clf_pipeline.fit(X_train, y_cls_train)

        y_cls_pred = self.clf_pipeline.predict(X_test)
        y_cls_proba = self.clf_pipeline.predict_proba(X_test)[:, 1]
        self.clf_metrics = {
            "accuracy":  round(float(accuracy_score(y_cls_test, y_cls_pred)), 4),
            "precision": round(float(precision_score(y_cls_test, y_cls_pred)), 4),
            "recall":    round(float(recall_score(y_cls_test, y_cls_pred)), 4),
            "f1":        round(float(f1_score(y_cls_test, y_cls_pred)), 4),
            "auc_roc":   round(float(roc_auc_score(y_cls_test, y_cls_proba)), 4),
        }
        logger.info("Classification → %s", self.clf_metrics)

        # ── Regression pipeline (only on placed students) ──────────
        placed_mask_train = y_cls_train == 1
        placed_mask_test = y_cls_test == 1

        self.reg_pipeline = Pipeline([
            ("pre", self._build_preprocessor()),
            ("reg", RandomForestRegressor(
                n_estimators=200, max_depth=12, min_samples_split=5,
                min_samples_leaf=2, random_state=42, n_jobs=-1,
            )),
        ])
        self.reg_pipeline.fit(
            X_train[placed_mask_train], y_pkg_train[placed_mask_train]
        )

        y_pkg_pred = self.reg_pipeline.predict(X_test[placed_mask_test])
        self.reg_metrics = {
            "rmse": round(float(np.sqrt(mean_squared_error(y_pkg_test[placed_mask_test], y_pkg_pred))), 4),
            "mae":  round(float(mean_absolute_error(y_pkg_test[placed_mask_test], y_pkg_pred)), 4),
            "r2":   round(float(r2_score(y_pkg_test[placed_mask_test], y_pkg_pred)), 4),
        }
        logger.info("Regression    → %s", self.reg_metrics)

        # ── Feature importances (from classifier) ──────────────────
        self._compute_feature_importances()

        self.is_trained = True

        # ── Persist ────────────────────────────────────────────────
        _MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.clf_pipeline, _MODEL_DIR / "clf_pipeline.joblib")
        joblib.dump(self.reg_pipeline, _MODEL_DIR / "reg_pipeline.joblib")
        joblib.dump(
            {"clf_metrics": self.clf_metrics, "reg_metrics": self.reg_metrics},
            _MODEL_DIR / "metrics.joblib",
        )
        logger.info("Models saved to %s", _MODEL_DIR)

    # ── load ─────────────────────────────────────────────────────────
    def load(self) -> bool:
        clf_path = _MODEL_DIR / "clf_pipeline.joblib"
        reg_path = _MODEL_DIR / "reg_pipeline.joblib"
        met_path = _MODEL_DIR / "metrics.joblib"
        if clf_path.exists() and reg_path.exists():
            self.clf_pipeline = joblib.load(clf_path)
            self.reg_pipeline = joblib.load(reg_path)
            self.is_trained = True
            self._compute_feature_importances()
            # Restore persisted metrics if available
            if met_path.exists():
                saved = joblib.load(met_path)
                self.clf_metrics = saved.get("clf_metrics", {})
                self.reg_metrics = saved.get("reg_metrics", {})
            logger.info("Models loaded from %s", _MODEL_DIR)
            return True
        return False

    # ── predict ──────────────────────────────────────────────────────
    def predict(self, features: dict) -> dict:
        if not self.is_trained:
            raise ValueError("Model not trained")

        df = pd.DataFrame([features])[ALL_INPUT_FEATURES]

        placed_prob = float(self.clf_pipeline.predict_proba(df)[0, 1])
        placed = placed_prob >= 0.5
        pkg = float(self.reg_pipeline.predict(df)[0]) if placed else 0.0
        pkg = max(0, round(pkg, 2))

        # confidence from tree agreement
        clf_model = self.clf_pipeline.named_steps["clf"]
        preprocessor = self.clf_pipeline.named_steps["pre"]
        X_trans = preprocessor.transform(df)
        tree_preds = np.array([t.predict(X_trans)[0] for t in clf_model.estimators_])
        agreement = np.mean(tree_preds == (1 if placed else 0))
        confidence = round(float(agreement), 3)

        if placed_prob < 0.3:    risk = "critical"
        elif placed_prob < 0.45: risk = "high"
        elif placed_prob < 0.6:  risk = "medium"
        elif placed_prob < 0.75: risk = "low"
        else:                    risk = "minimal"

        return {
            "placed": placed,
            "placement_probability": round(placed_prob, 4),
            "predicted_package": pkg,
            "risk_level": risk,
            "confidence": confidence,
        }

    # ── transformed features (for SHAP) ──────────────────────────────
    def get_transformed(self, features: dict):
        """Return preprocessed feature array + underlying sklearn model."""
        df = pd.DataFrame([features])[ALL_INPUT_FEATURES]
        preprocessor = self.clf_pipeline.named_steps["pre"]
        return preprocessor.transform(df)

    def get_transformed_feature_names(self) -> list[str]:
        preprocessor = self.clf_pipeline.named_steps["pre"]
        cat_encoder: OneHotEncoder = preprocessor.transformers_[0][1]
        cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        return cat_names + NUMERIC_FEATURES

    # ── helper ───────────────────────────────────────────────────────
    def _compute_feature_importances(self):
        clf_model = self.clf_pipeline.named_steps["clf"]
        importances = clf_model.feature_importances_
        names = self.get_transformed_feature_names()

        # Aggregate one-hot back to original feature
        agg: dict[str, float] = {}
        for name, imp in zip(names, importances):
            # one-hot names look like "gender_Male", "degree_BTech" etc.
            original = name
            for cat in CATEGORICAL_FEATURES:
                if name.startswith(cat + "_"):
                    original = cat
                    break
            agg[original] = agg.get(original, 0) + imp

        self.feature_importances = sorted(
            [
                {"feature": f, "display_name": DISPLAY_NAMES.get(f, f), "importance": round(v, 4)}
                for f, v in agg.items()
            ],
            key=lambda x: x["importance"],
            reverse=True,
        )
