from flask import Flask
from flask_cors import CORS
from Modules.Auth.auth_controller import auth_bp
from Modules.Pontos.pontos_service import calcular_saldos
from flask import jsonify

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# registra rotas de login
app.register_blueprint(auth_bp)

# rota de pontos
@app.route("/api/pontos/<int:usuario_id>", methods=["GET"])
def pontos_usuario(usuario_id):
    return jsonify(calcular_saldos(usuario_id))

if __name__ == "__main__":
    app.run(debug=True, port=5000)
