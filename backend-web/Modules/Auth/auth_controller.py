from flask import Blueprint, request, jsonify
from Modules.Auth.auth_service import autenticar

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = autenticar(username, password)
    if not user:
        return jsonify({"message": "Credenciais inválidas"}), 401

    return jsonify({
        "message": "Login OK",
        "usuario": {
            "id": user["id"],
            "nome": user["nome"],
            "perfil": user["perfil"]
        },
        "role": user["perfil"]  # para bater com seu front
    })
