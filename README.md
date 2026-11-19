# ❤️ CardioGuard — Heart Disease Risk Predictor

A full-stack AI-powered web application that predicts heart disease risk using Machine Learning. Built with **React** (frontend) and **FastAPI** (backend).

## 🏗 Project Structure

```
CardioGuard/
├── ml/                          # Machine Learning Pipeline
│   ├── train_models.py          # Train 4 models, benchmark, export best
│   ├── data/
│   │   └── heart_disease.csv    # UCI Heart Disease Dataset (303 patients)
│   ├── models/
│   │   ├── best_model.pkl       # 🏆 Random Forest (best F1)
│   │   ├── scaler.pkl           # StandardScaler
│   │   ├── logistic_regression.pkl
│   │   ├── decision_tree.pkl
│   │   ├── random_forest.pkl
│   │   └── support_vector_machine.pkl
│   └── artifacts/               # JSON data for the web app
│       ├── model_comparison.json
│       ├── confusion_matrices.json
│       ├── roc_curves.json
│       ├── feature_importances.json
│       ├── dataset_stats.json
│       ├── distributions.json
│       ├── correlation_matrix.json
│       ├── dataset_sample.json
│       └── feature_metadata.json
├── backend/
│   └── main.py                  # FastAPI server (API endpoints + prediction)
├── frontend/                    # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx              # Main app with tab navigation
│   │   ├── components/
│   │   │   ├── Header.jsx       # Navigation header with heartbeat logo
│   │   │   └── ui.jsx           # Reusable UI components
│   │   ├── pages/
│   │   │   ├── DataExplorer.jsx # Dataset stats, distributions, correlation, table
│   │   │   ├── ModelArena.jsx   # Model comparison, ROC, confusion matrices
│   │   │   └── LivePredictor.jsx# Patient form + risk gauge + prediction
│   │   ├── hooks/useApi.js      # Data fetching hook
│   │   └── lib/api.js           # API client (axios)
│   └── ...
├── start.bat                    # One-click launcher (Windows)
└── README.md
```

## 🚀 How to Run

### 1. Train the Models (first time only)
```bash
cd ml
python train_models.py
```

### 2. Start the Backend
```bash
cd backend
python main.py
# → Running on http://localhost:8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install          # first time only
npm run dev
# → Running on http://localhost:5173
```

Or simply double-click **`start.bat`** to launch both!

## 🤖 Models Trained

| Model | Accuracy | F1 Score | ROC-AUC | CV Mean |
|-------|----------|----------|---------|---------|
| Logistic Regression | 80.3% | 83.3% | 86.9% | 83.1% |
| Decision Tree | 78.7% | 82.2% | 81.8% | 73.2% |
| **🏆 Random Forest** | **83.6%** | **86.5%** | **90.9%** | **82.7%** |
| Support Vector Machine | 82.0% | 84.9% | 88.3% | 80.2% |

**Winner: Random Forest** (saved as `best_model.pkl`)

## 📊 Dataset

- **Source**: UCI Heart Disease Dataset
- **Size**: 303 patients × 14 features
- **Features**: age, sex, chest pain type, blood pressure, cholesterol, fasting blood sugar, ECG, max heart rate, exercise angina, ST depression, slope, vessels, thalassemia
- **Target**: 1 = Heart Disease, 0 = Healthy

## 🛠 Tech Stack

- **ML**: scikit-learn, pandas, numpy, joblib
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: React, Vite, TailwindCSS, Recharts, Framer Motion, Lucide Icons
- **Deployment Format**: `.pkl` (pickle via joblib)

## 📸 Screenshots

The app features 3 main tabs:
1. **📊 Data Explorer** — Interactive dataset stats, feature distributions, correlation heatmap, and data table
2. **🤖 Model Arena** — Side-by-side model benchmark, ROC curves, confusion matrices, feature importance
3. **🔮 Live Predictor** — Patient input form with sliders, risk gauge (0-100%), clinical interpretation, and key risk factors breakdown
