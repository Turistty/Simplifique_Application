# app.py
from flask import Flask
from flask_cors import CORS
from Modules.Auth.auth_controller import auth_bp
from Modules.Pontos.pontos_controller import pontos_bp  
from Modules.Brindes.brindes_controller import brindes_bp
from Modules.Movimentacoes.movimentacoes_controller import movs_bp




app = Flask(__name__)
app.config["SECRET_KEY"] = "troque-por-uma-chave-forte"

# Permitir credenciais entre 3000 ↔ 5000
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(pontos_bp)
app.register_blueprint(brindes_bp)
app.register_blueprint(movs_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
# --- IGNORE ---