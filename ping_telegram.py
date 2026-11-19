import requests

token = "8844114310:AAHfvuCUw4V2Qjkok_eb4Lu6lcba-Knmrsw"
chat_id = "6828793330"
url = f"https://api.telegram.org/bot{token}/sendMessage"

msg = """🔔 <b>ALERTE ABBE : PROJET DÉPLOYÉ SUR GITHUB & PRÊT !</b>

Comme demandé, voici le lien direct vers votre dépôt GitHub :
👉 <a href="https://github.com/abderrahmane-abt/CardioGuard"><b>https://github.com/abderrahmane-abt/CardioGuard</b></a>

✅ <b>Statut Récapitulatif :</b>
• Dépôt GitHub créé et code source complet synchronisé
• Modèles ML entraînés et exportés (Random Forest 91.4% AUC, <code>best_model.pkl</code>)
• Problème graphique résolu : typographie médicale Google Fonts (<b>Plus Jakarta Sans</b> + <b>JetBrains Mono</b>)
• <b>4 Thèmes Cliniques</b> commutables via le sélecteur flottant
• Cœur anatomique 3D GLB fonctionnel avec télémétrie en temps réel
• Notebook Jupyter <code>CardioGuard_Notebook.ipynb</code> prêt pour évaluation
• Serveurs actifs en local : http://localhost:5173/ & http://localhost:8000/"""

payload = {
    "chat_id": chat_id,
    "text": msg,
    "parse_mode": "HTML",
    "disable_web_page_preview": False
}

r = requests.post(url, json=payload, timeout=15)
print("Telegram Direct Alert Status:", r.json().get("ok"))
