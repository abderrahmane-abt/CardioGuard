"""
CardioGuard — FastAPI Backend
Serves ML predictions and dataset/model artifacts to the React frontend.
"""

import json, os
from pathlib import Path
from typing import Dict, Any

import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Paths ──────────────────────────────────────────────────────
BASE = Path(__file__).parent.parent
ML_DIR   = BASE / "ml"
MODEL_DIR = ML_DIR / "models"
ART_DIR   = ML_DIR / "artifacts"
DATA_DIR  = ML_DIR / "data"

# ── Load Model & Scaler ──────────────────────────────────────
best_model = joblib.load(MODEL_DIR / "best_model.pkl")
scaler     = joblib.load(MODEL_DIR / "scaler.pkl")

# ── Load Artifacts ────────────────────────────────────────────
def load_json(name: str) -> dict:
    return json.loads((ART_DIR / name).read_text())

dataset_stats       = load_json("dataset_stats.json")
distributions       = load_json("distributions.json")
correlation_matrix  = load_json("correlation_matrix.json")
dataset_sample      = load_json("dataset_sample.json")
feature_metadata    = load_json("feature_metadata.json")
model_comparison    = load_json("model_comparison.json")
confusion_matrices  = load_json("confusion_matrices.json")
roc_curves          = load_json("roc_curves.json")
feature_importances = load_json("feature_importances.json")

# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="CardioGuard API",
    description="Heart Disease Risk Prediction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response Models ─────────────────────────────────
class PatientInput(BaseModel):
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str
    risk_label: str
    feature_contributions: Dict[str, float]

# ── API Endpoints ─────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "healthy", "model": model_comparison["best_model"]}

# -- Dataset endpoints --
@app.get("/api/dataset/stats")
def get_dataset_stats():
    return dataset_stats

@app.get("/api/dataset/sample")
def get_dataset_sample():
    return dataset_sample

@app.get("/api/dataset/distributions")
def get_distributions():
    return distributions

@app.get("/api/dataset/correlation")
def get_correlation():
    return correlation_matrix

@app.get("/api/dataset/features")
def get_features():
    return feature_metadata

# -- Model endpoints --
@app.get("/api/models/comparison")
def get_model_comparison():
    return model_comparison

@app.get("/api/models/confusion-matrices")
def get_confusion_matrices():
    return confusion_matrices

@app.get("/api/models/roc-curves")
def get_roc_curves():
    return roc_curves

@app.get("/api/models/feature-importances")
def get_feature_importances():
    return feature_importances

# -- Prediction endpoint --
@app.post("/api/predict", response_model=PredictionResponse)
def predict(patient: PatientInput):
    try:
        features = np.array([[
            patient.age, patient.sex, patient.cp, patient.trestbps,
            patient.chol, patient.fbs, patient.restecg, patient.thalach,
            patient.exang, patient.oldpeak, patient.slope, patient.ca,
            patient.thal
        ]])
        
        features_scaled = scaler.transform(features)
        
        prediction = int(best_model.predict(features_scaled)[0])
        probability = float(best_model.predict_proba(features_scaled)[0][1])
        
        # Risk level
        if probability < 0.3:
            risk_level = "low"
            risk_label = "Low Risk"
        elif probability < 0.6:
            risk_level = "moderate"
            risk_label = "Moderate Risk"
        elif probability < 0.8:
            risk_level = "high"
            risk_label = "High Risk"
        else:
            risk_level = "critical"
            risk_label = "Critical Risk"
        
        # Feature contributions (using absolute difference from mean)
        feature_names = list(feature_metadata.keys())
        mean_values = scaler.mean_
        std_values = scaler.scale_
        
        contributions = {}
        for i, name in enumerate(feature_names):
            z_score = abs((features[0][i] - mean_values[i]) / std_values[i]) if std_values[i] > 0 else 0
            contributions[name] = round(float(z_score), 3)
        
        # Normalize contributions to percentages
        total = sum(contributions.values())
        if total > 0:
            contributions = {k: round(v / total * 100, 1) for k, v in contributions.items()}
        
        return PredictionResponse(
            prediction=prediction,
            probability=round(probability, 4),
            risk_level=risk_level,
            risk_label=risk_label,
            feature_contributions=contributions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.staticfiles import StaticFiles

# ── Serve Built React Frontend (if available) ─────────────────
DIST_DIR = BASE / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
