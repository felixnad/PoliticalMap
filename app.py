# app.py
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Route pour servir le fichier HTML principal
@app.route('/')
def index():
    """
    Rend la page HTML principale de l'application.
    """
    return render_template('index.html')

# Route pour servir les fichiers statiques (CSS, JS, JSON, GeoJSON)
@app.route('/static/<path:filename>')
def static_files(filename):
    """
    Sert les fichiers statiques depuis le répertoire 'static'.
    """
    return send_from_directory('static', filename)

if __name__ == '__main__':
    # Exécute l'application Flask en mode debug
    # Pour un déploiement en production, utilisez un serveur WSGI comme Gunicorn ou uWSGI.
    app.run(debug=True)
