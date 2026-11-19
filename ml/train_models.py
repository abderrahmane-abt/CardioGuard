"""
CardioGuard — ML Pipeline
Downloads the UCI Heart Disease dataset, trains 4 models,
benchmarks them, saves the best as .pkl, and exports all
comparison artifacts as JSON for the web app.
"""

import json, os, warnings, urllib.request
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report
)
import joblib

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────
BASE = Path(__file__).parent
DATA_DIR   = BASE / "data"
MODEL_DIR  = BASE / "models"
ART_DIR    = BASE / "artifacts"

for d in [DATA_DIR, MODEL_DIR, ART_DIR]:
    d.mkdir(parents=True, exist_ok=True)

CSV_PATH = DATA_DIR / "heart_disease.csv"

# ── 1. Download Dataset ───────────────────────────────────────
URL = "https://raw.githubusercontent.com/mrdbourke/zero-to-mastery-ml/master/data/heart-disease.csv"

if not CSV_PATH.exists():
    print("⬇  Downloading Heart Disease dataset …")
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        CSV_PATH.write_bytes(resp.read())
    print("✅ Saved to", CSV_PATH)
else:
    print("✅ Dataset already exists at", CSV_PATH)

df = pd.read_csv(CSV_PATH)
# Standardize target so: 1 = Heart Disease Detected, 0 = Healthy (absence)
# In this specific Kaggle mirror, labels were inverted (0 had angina/ST-depression)
df["target"] = 1 - df["target"]
print(f"📊 Dataset shape: {df.shape}")
print(df.head())

# ── 2. EDA Artifacts ──────────────────────────────────────────
# Column metadata for the UI
FEATURE_META = {
    "age":      {"label": "Age",                        "unit": "years",   "type": "continuous", "min": 20, "max": 100, "step": 1,   "default": 50},
    "sex":      {"label": "Sex",                        "unit": "",        "type": "categorical", "options": {"Female": 0, "Male": 1}, "default": 1},
    "cp":       {"label": "Chest Pain Type",            "unit": "",        "type": "categorical", "options": {"Typical Angina": 0, "Atypical Angina": 1, "Non-anginal": 2, "Asymptomatic": 3}, "default": 0},
    "trestbps": {"label": "Resting Blood Pressure",    "unit": "mm Hg",   "type": "continuous", "min": 80,  "max": 220, "step": 1,   "default": 120},
    "chol":     {"label": "Serum Cholesterol",          "unit": "mg/dl",   "type": "continuous", "min": 100, "max": 600, "step": 1,   "default": 200},
    "fbs":      {"label": "Fasting Blood Sugar > 120",  "unit": "mg/dl",   "type": "categorical", "options": {"No": 0, "Yes": 1}, "default": 0},
    "restecg":  {"label": "Resting ECG",                "unit": "",        "type": "categorical", "options": {"Normal": 0, "ST-T Abnormality": 1, "LV Hypertrophy": 2}, "default": 0},
    "thalach":  {"label": "Max Heart Rate",             "unit": "bpm",     "type": "continuous", "min": 60,  "max": 220, "step": 1,   "default": 150},
    "exang":    {"label": "Exercise Induced Angina",    "unit": "",        "type": "categorical", "options": {"No": 0, "Yes": 1}, "default": 0},
    "oldpeak":  {"label": "ST Depression (Oldpeak)",    "unit": "",        "type": "continuous", "min": 0.0, "max": 7.0, "step": 0.1, "default": 1.0},
    "slope":    {"label": "ST Slope",                   "unit": "",        "type": "categorical", "options": {"Upsloping": 0, "Flat": 1, "Downsloping": 2}, "default": 1},
    "ca":       {"label": "Major Vessels (Fluoroscopy)","unit": "",        "type": "categorical", "options": {"0": 0, "1": 1, "2": 2, "3": 3}, "default": 0},
    "thal":     {"label": "Thalassemia",                "unit": "",        "type": "categorical", "options": {"Normal": 0, "Fixed Defect": 1, "Reversible Defect": 2, "3": 3}, "default": 2},
}

# Dataset statistics
dataset_stats = {
    "total_patients": int(len(df)),
    "features_count": int(len(df.columns) - 1),
    "disease_count":  int(df["target"].sum()),
    "healthy_count":  int((df["target"] == 0).sum()),
    "disease_rate":   round(float(df["target"].mean() * 100), 1),
    "avg_age":        round(float(df["age"].mean()), 1),
    "age_range":      [int(df["age"].min()), int(df["age"].max())],
    "male_count":     int((df["sex"] == 1).sum()),
    "female_count":   int((df["sex"] == 0).sum()),
}

# Feature distributions (histograms)
distributions = {}
for col in df.columns:
    if col == "target":
        continue
    if df[col].nunique() <= 10:
        vc = df[col].value_counts().sort_index()
        distributions[col] = {
            "type": "bar",
            "labels": [str(v) for v in vc.index.tolist()],
            "values": vc.values.tolist(),
        }
    else:
        counts, bin_edges = np.histogram(df[col].dropna(), bins=20)
        distributions[col] = {
            "type": "histogram",
            "labels": [f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}" for i in range(len(counts))],
            "values": counts.tolist(),
        }

# Correlation matrix
corr = df.corr()
correlation_matrix = {
    "features": corr.columns.tolist(),
    "values": corr.values.round(3).tolist(),
}

# Dataset sample (first 50 rows for the table)
dataset_sample = df.head(50).to_dict(orient="records")

# Feature metadata
feature_metadata = FEATURE_META

# Save EDA artifacts
(ART_DIR / "dataset_stats.json").write_text(json.dumps(dataset_stats, indent=2))
(ART_DIR / "distributions.json").write_text(json.dumps(distributions, indent=2))
(ART_DIR / "correlation_matrix.json").write_text(json.dumps(correlation_matrix, indent=2))
(ART_DIR / "dataset_sample.json").write_text(json.dumps(dataset_sample, indent=2))
(ART_DIR / "feature_metadata.json").write_text(json.dumps(feature_metadata, indent=2))
print("✅ EDA artifacts saved")

# ── 3. Preprocessing ─────────────────────────────────────────
X = df.drop("target", axis=1)
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# Save scaler
joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
print("✅ Scaler saved")

# ── 4. Train 4 Models ────────────────────────────────────────
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Decision Tree":       DecisionTreeClassifier(max_depth=5, random_state=42),
    "Random Forest":       RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    "Support Vector Machine": SVC(kernel="rbf", probability=True, random_state=42),
}

results = {}
confusion_matrices = {}
roc_curves_data = {}
feature_importances = {}

for name, model in models.items():
    print(f"\n🔧 Training {name} …")
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring="accuracy")
    
    # Metrics
    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec  = recall_score(y_test, y_pred)
    f1   = f1_score(y_test, y_pred)
    auc  = roc_auc_score(y_test, y_proba)
    
    results[name] = {
        "accuracy":    round(float(acc), 4),
        "precision":   round(float(prec), 4),
        "recall":      round(float(rec), 4),
        "f1_score":    round(float(f1), 4),
        "roc_auc":     round(float(auc), 4),
        "cv_mean":     round(float(cv_scores.mean()), 4),
        "cv_std":      round(float(cv_scores.std()), 4),
    }
    
    print(f"   Accuracy: {acc:.4f} | F1: {f1:.4f} | AUC: {auc:.4f} | CV: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    confusion_matrices[name] = {
        "matrix": cm.tolist(),
        "labels": ["Healthy", "Heart Disease"],
    }
    
    # ROC curve data
    fpr, tpr, thresholds = roc_curve(y_test, y_proba)
    # Sample to ~50 points for smooth curves in charts
    step = max(1, len(fpr) // 50)
    roc_curves_data[name] = {
        "fpr": [round(float(v), 4) for v in fpr[::step]],
        "tpr": [round(float(v), 4) for v in tpr[::step]],
        "auc": round(float(auc), 4),
    }
    
    # Feature importance
    if hasattr(model, "feature_importances_"):
        fi = model.feature_importances_
    elif hasattr(model, "coef_"):
        fi = np.abs(model.coef_[0])
    else:
        fi = np.zeros(X.shape[1])
    
    fi_normalized = (fi / fi.max() * 100) if fi.max() > 0 else fi
    feature_importances[name] = {
        "features": X.columns.tolist(),
        "importance": [round(float(v), 2) for v in fi_normalized],
    }
    
    # Save individual model
    joblib.dump(model, MODEL_DIR / f"{name.lower().replace(' ', '_')}.pkl")

# ── 5. Select Best Model ─────────────────────────────────────
best_name = max(results, key=lambda k: results[k]["f1_score"])
best_model = models[best_name]

print(f"\n🏆 Best Model: {best_name}")
print(f"   F1 Score: {results[best_name]['f1_score']}")
print(f"   ROC-AUC:  {results[best_name]['roc_auc']}")

# Save best model
joblib.dump(best_model, MODEL_DIR / "best_model.pkl")

# ── 6. Save All Comparison Artifacts ─────────────────────────
model_comparison = {
    "models": results,
    "best_model": best_name,
    "best_metrics": results[best_name],
    "feature_names": X.columns.tolist(),
}

(ART_DIR / "model_comparison.json").write_text(json.dumps(model_comparison, indent=2))
(ART_DIR / "confusion_matrices.json").write_text(json.dumps(confusion_matrices, indent=2))
(ART_DIR / "roc_curves.json").write_text(json.dumps(roc_curves_data, indent=2))
(ART_DIR / "feature_importances.json").write_text(json.dumps(feature_importances, indent=2))

print("\n✅ All artifacts saved!")
print(f"   Models dir:    {MODEL_DIR}")
print(f"   Artifacts dir: {ART_DIR}")
print("\n📁 Generated files:")
for f in sorted(ART_DIR.glob("*.json")):
    print(f"   {f.name}")
for f in sorted(MODEL_DIR.glob("*.pkl")):
    print(f"   {f.name}")
