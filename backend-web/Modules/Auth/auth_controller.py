# Modules/Auth/auth_controller.py
import jwt
import datetime
from flask import Blueprint, request, jsonify, make_response, current_app
from Modules.Auth.auth_service import autenticar

auth_bp = Blueprint("auth", __name__)

def create_token(payload: dict, expires_minutes=120):
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_minutes)
    payload = {**payload, "exp": exp}
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    user = autenticar(username, password)
    if not user:
        return jsonify({"message": "Credenciais inválidas"}), 401

    token = create_token({"sub": user["id"], "role": user["perfil"], "nome": user["nome"]})

    resp = make_response(jsonify({
        "message": "Login OK",
        "role": user["perfil"]
    }))
    # Cookie HTTP-only, não acessível via JS
    resp.set_cookie(
        "auth",
        token,
        httponly=True,
        samesite="Lax",   # em dev Lax é ok; produção pode ser "None" + secure
        secure=False,     # em produção: True (HTTPS)
        max_age=60*10   # 10 min de validade
    )
    return resp

@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify({"message": "logout"}))
    resp.set_cookie("auth", "", httponly=True, samesite="Lax", secure=False, max_age=0)
    return resp
# --- IGNORE ---