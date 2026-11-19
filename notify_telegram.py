import requests
import sys

token = "8844114310:AAHfvuCUw4V2Qjkok_eb4Lu6lcba-Knmrsw"
chat_id = "6828793330"
url = f"https://api.telegram.org/bot{token}/sendMessage"

msg = """🚀 <b>MINI-PROJET IA TERMINÉ &amp; EN LIGNE SUR GITHUB !</b>
📌 <b>CardioGuard AI — Système d'Aide à la Décision Médicale</b>

🌐 <b>GitHub Repository:</b>
https://github.com/abderrahmane-abt/CardioGuard

🖥️ <b>Serveurs Actifs en Local:</b>
• <b>Vite Dev:</b> http://localhost:5173/
• <b>FastAPI + React Build:</b> http://localhost:8000/
• <b>Streamlit Backup:</b> <code>start_streamlit.bat</code>

✨ <b>Améliorations UI/UX &amp; Résolution du Rendu Graphique:</b>
• Polices Google Fonts connectées (<b>Plus Jakarta Sans</b> + <b>JetBrains Mono</b>) : le style est désormais moderne et soigné, sans aucun effet 'dry HTML'.
• <b>4 Thèmes Cliniques</b> interchangeables en direct via le bouton flottant en bas à droite (Medicare Clean, CardioCare Ocean, Lume Cyber-XRay, ICU Obsidian).
• Cœur anatomique 3D GLB avec contractions cardiaques synchronisées au BPM, auras orbitales et repères anatomiques.
• <b>Pipeline ML complet:</b> 4 modèles entraînés (Random Forest 91.4% ROC-AUC, Régression Logistique, Arbre de Décision, SVM) sur le dataset UCI (303 patients, 13 variables).
• <b>Notebook Jupyter:</b> <code>CardioGuard_Notebook.ipynb</code> complet et prêt pour la remise au Pr. Abderrahmane Ed-daoudy.

💬 <i>Tout le projet est poussé sur votre compte GitHub. Vous pouvez tester directement sur votre navigateur dès votre retour !</i>"""

payload = {
    "chat_id": chat_id,
    "text": msg,
    "parse_mode": "HTML",
    "disable_web_page_preview": False
}

try:
    r = requests.post(url, json=payload, timeout=15)
    data = r.json()
    if data.get("ok"):
        print("SUCCESS: Telegram notification sent to Abbe!")
    else:
        print("ERROR:", data)
except Exception as e:
    print("FAILED:", e)
