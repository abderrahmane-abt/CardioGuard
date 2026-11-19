"""
CardioGuard AI — Application Streamlit
Prédiction du Risque de Cardiopathie (Maladie Cardiaque)
Université Chouaib Doukkali - Sidi Bennour - Semestre 5
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import streamlit as st
import matplotlib.pyplot as plt

# ── Paths ──────────────────────────────────────────────────────
BASE = Path(__file__).parent
ML_DIR = BASE / "ml"
MODEL_DIR = ML_DIR / "models"
ART_DIR = ML_DIR / "artifacts"
DATA_DIR = ML_DIR / "data"

# ── Page Config ───────────────────────────────────────────────
st.set_page_config(
    page_title="CardioGuard — Heart Disease AI",
    page_icon="❤️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS for visual polish ─────────────────────────────
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #0d9488, #06b6d4);
        padding: 24px;
        border-radius: 14px;
        color: white;
        margin-bottom: 25px;
        box-shadow: 0 4px 20px rgba(13, 148, 136, 0.25);
    }
    .metric-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }
    .winner-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        font-weight: bold;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# ── Load Model & Artifacts ────────────────────────────────────
@st.cache_resource
def load_assets():
    best_model = joblib.load(MODEL_DIR / "best_model.pkl")
    scaler = joblib.load(MODEL_DIR / "scaler.pkl")
    
    def load_j(name):
        return json.loads((ART_DIR / name).read_text())
        
    return {
        "model": best_model,
        "scaler": scaler,
        "stats": load_j("dataset_stats.json"),
        "comparison": load_j("model_comparison.json"),
        "confusion": load_j("confusion_matrices.json"),
        "roc": load_j("roc_curves.json"),
        "importance": load_j("feature_importances.json"),
        "features": load_j("feature_metadata.json"),
        "sample": load_j("dataset_sample.json"),
        "corr": load_j("correlation_matrix.json")
    }

assets = load_assets()

# ── Top Banner ────────────────────────────────────────────────
st.markdown("""
<div class="main-header">
    <h1 style="margin:0; font-size: 2.2rem; display: flex; align-items: center; gap: 12px;">
        ❤️ CardioGuard AI
    </h1>
    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 1.05rem;">
        Système d'Aide au Diagnostic Médical des Cardiopathies par Machine Learning
    </p>
    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 8px;">
        Université Chouaïb Doukkali · Faculté Polydisciplinaire de Sidi Bennour · Licence IA S5
    </div>
</div>
""", unsafe_allow_html=True)

# ── Navigation Tabs ───────────────────────────────────────────
tab_predict, tab_arena, tab_data = st.tabs([
    "🔮 Prédiction en Direct (Live)",
    "🤖 Arène des 4 Modèles (Benchmark)",
    "📊 Exploration des Données (EDA)"
])

# ══════════════════════════════════════════════════════════════
# TAB 1: PRÉDICTION EN DIRECT
# ══════════════════════════════════════════════════════════════
with tab_predict:
    st.subheader("📋 Formulaire Médical du Patient")
    st.caption("Renseignez les paramètres cliniques puis cliquez sur **Valider la Prédiction** pour évaluer le risque.")

    # Preset selector
    col_preset1, col_preset2 = st.columns([1, 3])
    with col_preset1:
        preset = st.selectbox(
            "Exemples pré-remplis :",
            ["Par défaut (Standard)", "Patient Sain (Faible Risque)", "Patient à Risque Élevé"]
        )

    # Defaults according to preset
    if preset == "Patient Sain (Faible Risque)":
        d_age, d_sex, d_cp, d_trestbps, d_chol, d_fbs, d_restecg, d_thalach, d_exang, d_oldpeak, d_slope, d_ca, d_thal = (
            42, 0, 2, 115, 180, 0, 0, 168, 0, 0.2, 2, 0, 2
        )
    elif preset == "Patient à Risque Élevé":
        d_age, d_sex, d_cp, d_trestbps, d_chol, d_fbs, d_restecg, d_thalach, d_exang, d_oldpeak, d_slope, d_ca, d_thal = (
            65, 1, 0, 160, 285, 1, 1, 110, 1, 2.8, 1, 2, 3
        )
    else:
        d_age, d_sex, d_cp, d_trestbps, d_chol, d_fbs, d_restecg, d_thalach, d_exang, d_oldpeak, d_slope, d_ca, d_thal = (
            54, 1, 1, 130, 235, 0, 0, 150, 0, 1.0, 1, 0, 2
        )

    # Input Form
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("##### 👤 Données Démographiques")
        age = st.slider("Âge (années)", 20, 90, d_age)
        sex = st.selectbox("Sexe", options=[1, 0], format_func=lambda x: "Homme (1)" if x == 1 else "Femme (0)", index=0 if d_sex == 1 else 1)
        cp_options = {0: "0: Angine Typique", 1: "1: Angine Atypique", 2: "2: Douleur Non-angineuse", 3: "3: Asymptomatique"}
        cp = st.selectbox("Type de Douleur Thoracique (cp)", options=[0, 1, 2, 3], format_func=lambda x: cp_options[x], index=d_cp)

    with col2:
        st.markdown("##### 🩺 Paramètres Cliniques")
        trestbps = st.slider("Tension Artérielle au Repos (mm Hg)", 90, 200, d_trestbps)
        chol = st.slider("Cholestérol Sérique (mg/dl)", 120, 560, d_chol)
        fbs = st.selectbox("Glycémie à Jeun > 120 mg/dl (fbs)", options=[0, 1], format_func=lambda x: "Non (< 120)" if x == 0 else "Oui (> 120)", index=d_fbs)
        ecg_options = {0: "0: Normal", 1: "1: Anomalie ST-T", 2: "2: Hypertrophie Ventricule G."}
        restecg = st.selectbox("Électrocardiogramme au repos", options=[0, 1, 2], format_func=lambda x: ecg_options[x], index=d_restecg)

    with col3:
        st.markdown("##### 🏃 Test d'Effort & Fluoroscopie")
        thalach = st.slider("Fréquence Cardiaque Maximale (bpm)", 70, 210, d_thalach)
        exang = st.selectbox("Angine Induite par l'Exercice (exang)", options=[0, 1], format_func=lambda x: "Non (0)" if x == 0 else "Oui (1)", index=d_exang)
        oldpeak = st.slider("Dépression ST induite (oldpeak)", 0.0, 6.2, float(d_oldpeak), step=0.1)
        slope_opts = {0: "0: Montante (Upsloping)", 1: "1: Plate (Flat)", 2: "2: Descendante (Downsloping)"}
        slope = st.selectbox("Pente du Segment ST (slope)", options=[0, 1, 2], format_func=lambda x: slope_opts[x], index=d_slope)
        ca = st.selectbox("Nb de Vaisseaux Majeurs (ca)", options=[0, 1, 2, 3], index=d_ca)
        thal_opts = {0: "0: Normal", 1: "1: Défaut Fixe", 2: "2: Défaut Réversible", 3: "3: Autre"}
        thal = st.selectbox("Thalassémie (thal)", options=[0, 1, 2, 3], format_func=lambda x: thal_opts[x], index=d_thal)

    st.markdown("---")
    
    # Valider Button (as shown on teacher's whiteboard)
    btn_predict = st.button("🚀 Valider la Prédiction", type="primary", use_container_width=True)

    if btn_predict:
        # Prepare inputs
        features_arr = np.array([[age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]])
        features_scaled = assets["scaler"].transform(features_arr)
        
        pred = assets["model"].predict(features_scaled)[0]
        prob = assets["model"].predict_proba(features_scaled)[0][1]
        pct = prob * 100

        st.markdown("### 📊 Résultat du Diagnostic")
        
        res_col1, res_col2 = st.columns([1, 1])

        with res_col1:
            if pred == 1:
                st.error(f"⚠️ **RISQUE ÉLEVÉ DÉTECTÉ** : Cardiopathie Probable ({pct:.1f}%)")
                st.progress(prob)
                st.markdown("""
                **Interprétation Clinique :**
                Les indicateurs du patient (douleur, tension, dépression ST, etc.) suggèrent une probabilité élevée de maladie coronarienne.
                Une consultation cardiologique immédiate avec coronarographie ou épreuve d'effort approfondie est vivement recommandée.
                """)
            else:
                st.success(f"✅ **FAIBLE RISQUE** : Absence de Cardiopathie ({pct:.1f}%)")
                st.progress(prob)
                st.markdown("""
                **Interprétation Clinique :**
                Les indicateurs analysés sont favorables. Le profil hémodynamique et électrocardiographique ne présente pas de signe prédominant de pathologie cardiaque.
                Recommander le maintien d'une hygiène de vie saine et un suivi périodique normal.
                """)

        with res_col2:
            st.markdown("##### 🔍 Poids Relatif des Facteurs")
            # Feature contribution approximation using z-score distance
            mean_vals = assets["scaler"].mean_
            std_vals = assets["scaler"].scale_
            names = list(assets["features"].keys())
            z_scores = [abs((features_arr[0][i] - mean_vals[i]) / std_vals[i]) for i in range(len(names))]
            tot = sum(z_scores)
            contrib_df = pd.DataFrame({
                "Attribut": [assets["features"][n]["label"] for n in names],
                "Impact (%)": [round((z / tot) * 100, 1) for z in z_scores]
            }).sort_values("Impact (%)", ascending=False).head(6)

            st.dataframe(contrib_df, hide_index=True, use_container_width=True)

# ══════════════════════════════════════════════════════════════
# TAB 2: ARÈNE DES MODÈLES (BENCHMARK)
# ══════════════════════════════════════════════════════════════
with tab_arena:
    comp = assets["comparison"]
    best_m = comp["best_model"]
    best_m_metrics = comp["best_metrics"]

    st.markdown(f"""
    <div class="winner-badge">
        🏆 Modèle Vainqueur : {best_m} (F1-Score: {best_m_metrics['f1_score']*100:.1f}%, ROC-AUC: {best_m_metrics['roc_auc']*100:.1f}%)
        <br><span style="font-size:0.85rem; font-weight:normal; opacity:0.9;">Exporté automatiquement au format <code>best_model.pkl</code> pour le déploiement.</span>
    </div>
    """, unsafe_allow_html=True)

    st.subheader("📈 Tableau Comparatif des 4 Modèles")
    
    # Build dataframe for models
    models_df = pd.DataFrame(comp["models"]).T
    models_df = models_df[["accuracy", "precision", "recall", "f1_score", "roc_auc", "cv_mean"]]
    models_df.columns = ["Accuracy", "Précision", "Rappel", "F1-Score", "ROC-AUC", "Cross-Val (5-Fold)"]
    models_df = (models_df * 100).round(2)
    st.dataframe(models_df, use_container_width=True)

    # Bar chart comparison
    st.subheader("📊 Comparaison Graphique des Performances")
    st.bar_chart(models_df[["Accuracy", "F1-Score", "ROC-AUC"]])

    st.markdown("---")

    col_roc, col_cm = st.columns([1, 1])

    with col_roc:
        st.subheader("📉 Courbes ROC (Receiver Operating Characteristic)")
        fig, ax = plt.subplots(figsize=(6, 4))
        for name, data in assets["roc"].items():
            ax.plot(data["fpr"], data["tpr"], label=f"{name} (AUC={data['auc']:.2f})")
        ax.plot([0, 1], [0, 1], 'k--', label="Aléatoire (AUC=0.50)")
        ax.set_xlabel("Taux de Faux Positifs (FPR)")
        ax.set_ylabel("Taux de Vrais Positifs (TPR)")
        ax.set_title("Comparaison ROC des 4 Modèles")
        ax.legend(loc="lower right", fontsize=8)
        ax.grid(True, alpha=0.3)
        st.pyplot(fig)

    with col_cm:
        st.subheader(f"🎯 Matrice de Confusion ({best_m})")
        cm = assets["confusion"][best_m]["matrix"]
        fig, ax = plt.subplots(figsize=(5, 4))
        im = ax.imshow(cm, cmap="Blues")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Sain (0)", "Cardiopathie (1)"])
        ax.set_yticklabels(["Sain (0)", "Cardiopathie (1)"])
        ax.set_xlabel("Prédiction")
        ax.set_ylabel("Vérité Terrain")
        ax.set_title(f"Matrice de Confusion — {best_m}")

        for i in range(2):
            for j in range(2):
                ax.text(j, i, cm[i][j], ha="center", va="center", color="red" if i != j else "black", fontsize=14, fontweight="bold")
        st.pyplot(fig)

    # Feature importances
    st.subheader("💡 Importance des Variables (Features)")
    fi = assets["importance"][best_m]
    fi_df = pd.DataFrame({
        "Variable": fi["features"],
        "Importance Relative (%)": fi["importance"]
    }).sort_values("Importance Relative (%)", ascending=True)

    fig, ax = plt.subplots(figsize=(8, 4))
    ax.barh(fi_df["Variable"], fi_df["Importance Relative (%)"], color="#0d9488")
    ax.set_xlabel("Importance (%)")
    ax.set_title(f"Importance des Attributs selon {best_m}")
    ax.grid(True, alpha=0.3, axis="x")
    st.pyplot(fig)

# ══════════════════════════════════════════════════════════════
# TAB 3: EXPLORATION DES DONNÉES (EDA)
# ══════════════════════════════════════════════════════════════
with tab_data:
    st.subheader("📊 Aperçu du Dataset (UCI Heart Disease)")
    stats = assets["stats"]

    # Quick metric tiles
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Patients Totaux", stats["total_patients"])
    m2.metric("Taux de Cardiopathie", f"{stats['disease_rate']}%", f"{stats['disease_count']} patients")
    m3.metric("Âge Moyen", f"{stats['avg_age']} ans", f"{stats['age_range'][0]}-{stats['age_range'][1]} ans")
    m4.metric("Nombre d'Attributs", stats["features_count"])

    st.markdown("#### 📑 Échantillon des Données (50 premières lignes)")
    sample_df = pd.DataFrame(assets["sample"])
    st.dataframe(sample_df, use_container_width=True)

    st.markdown("#### 🔗 Matrice de Corrélation de Pearson")
    corr_data = assets["corr"]
    corr_df = pd.DataFrame(corr_data["values"], index=corr_data["features"], columns=corr_data["features"])
    
    fig, ax = plt.subplots(figsize=(10, 6))
    cax = ax.matshow(corr_df, cmap="coolwarm", vmin=-1, vmax=1)
    fig.colorbar(cax)
    ax.set_xticks(range(len(corr_df.columns)))
    ax.set_yticks(range(len(corr_df.columns)))
    ax.set_xticklabels(corr_df.columns, rotation=45, ha="left", fontsize=8)
    ax.set_yticklabels(corr_df.columns, fontsize=8)
    st.pyplot(fig)
