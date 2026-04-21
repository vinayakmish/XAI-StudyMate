"""
SHAP-based explainability for the placement classifier.
Aggregates one-hot-encoded SHAP values back to original features.
"""
import numpy as np
import shap
import logging
from .model import (
    PlacementModel, CATEGORICAL_FEATURES, NUMERIC_FEATURES,
    ALL_INPUT_FEATURES, DISPLAY_NAMES, FEATURE_OPTIMAL,
)
import pandas as pd

logger = logging.getLogger(__name__)


class SHAPExplainer:
    """Wraps SHAP TreeExplainer for the placement classifier."""

    def __init__(self, model: PlacementModel):
        self.perf_model = model
        self.explainer = None

    def initialize(self):
        if self.perf_model.clf_pipeline is None:
            raise ValueError("Classifier must be trained first")
        clf = self.perf_model.clf_pipeline.named_steps["clf"]
        self.explainer = shap.TreeExplainer(clf)
        logger.info("SHAP TreeExplainer initialized")

    def explain(self, features: dict) -> dict:
        """Full per-feature explanation for a single student."""
        if self.explainer is None:
            self.initialize()

        prediction = self.perf_model.predict(features)
        X_trans = self.perf_model.get_transformed(features)
        trans_names = self.perf_model.get_transformed_feature_names()

        shap_values = self.explainer.shap_values(X_trans)

        # Extract the class-1 (placed) SHAP values as a 1-D array
        if isinstance(shap_values, list):
            # Older SHAP: list of 2 arrays, each shape (n_samples, n_features)
            sv = np.array(shap_values[1]).flatten()
        elif isinstance(shap_values, np.ndarray):
            if shap_values.ndim == 3:
                # shape (n_samples, n_features, n_classes)
                sv = shap_values[0, :, 1].flatten()
            elif shap_values.ndim == 2:
                sv = shap_values[0].flatten()
            else:
                sv = shap_values.flatten()
        else:
            sv = np.array(shap_values).flatten()

        # Aggregate one-hot SHAP values back to original features
        agg_shap: dict[str, float] = {}
        for name, val in zip(trans_names, sv):
            original = name
            for cat in CATEGORICAL_FEATURES:
                if name.startswith(cat + "_"):
                    original = cat
                    break
            agg_shap[original] = agg_shap.get(original, 0) + float(np.float64(val))

        # Build ranked explanations
        explanations = []
        for fname in ALL_INPUT_FEATURES:
            shap_val = agg_shap.get(fname, 0.0)
            impact = "positive" if shap_val >= 0 else "negative"

            # Domain-knowledge override: if a feature is already at or
            # beyond its optimal level, a tiny negative SHAP value is
            # statistical noise — never label it as hurting the student.
            optimal = FEATURE_OPTIMAL.get(fname)
            if optimal and impact == "negative":
                current = features.get(fname, 0)
                direction = optimal["direction"]
                at_optimal = (
                    (direction == "higher" and current >= optimal["min"])
                    or (direction == "lower" and current <= optimal["max"])
                )
                if at_optimal:
                    impact = "positive"

            explanations.append({
                "feature": fname,
                "display_name": DISPLAY_NAMES.get(fname, fname),
                "shap_value": round(shap_val, 4),
                "current_value": str(features.get(fname, "")),
                "impact": impact,
            })

        explanations.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        for rank, exp in enumerate(explanations, 1):
            exp["importance_rank"] = rank

        positives = [e for e in explanations if e["impact"] == "positive"]
        negatives = [e for e in explanations if e["impact"] == "negative"]

        top_strengths = [
            f"{e['display_name']} ({e['current_value']}) boosts placement chance by {abs(e['shap_value']):.3f}"
            for e in positives[:3]
        ]
        top_weaknesses = [
            f"{e['display_name']} ({e['current_value']}) reduces placement chance by {abs(e['shap_value']):.3f}"
            for e in negatives[:3]
        ]

        return {
            "placed": prediction["placed"],
            "placement_probability": prediction["placement_probability"],
            "predicted_package": prediction["predicted_package"],
            "risk_level": prediction["risk_level"],
            "explanations": explanations,
            "top_strengths": top_strengths,
            "top_weaknesses": top_weaknesses,
        }
