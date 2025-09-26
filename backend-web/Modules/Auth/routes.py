from flask import request, jsonify, current_app
from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt  # PyJWT

from . import auth_bp

# MOCK de usuários só para teste (você pode trocar depois por DB/AD)
USERS = {
    "evandro": {"password": "1234", "name": "evandro", "role": "user"},
    "admin":   {"password": "admin", "name": "Administrador", "role": "admin"},
}

def _now_utc():
    return datetime.now(timezone.utc)

def _make_token(username: str, name: str, role: str) -> str:
    cfg = current_app.config
    payload = {
        "sub": username,
        "name": name,                    # o Next lê "name" no Server Component
        "role": role,
        "iss": cfg["JWT_ISSUER"],
        "aud": cfg["JWT_AUDIENCE"],
        "iat": int(_now_utc().timestamp()),
        "exp": int((_now_utc() + timedelta(minutes=cfg["JWT_EXPIRES_IN_MIN"])).timestamp()),
    }
    token = jwt.encode(payload, cfg["JWT_SECRET"], algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def _decode_token(token: str):
    cfg = current_app.config
    return jwt.decode(
        token,
        cfg["JWT_SECRET"],
        algorithms=["HS256"],
        audience=cfg["JWT_AUDIENCE"],
        issuer=cfg["JWT_ISSUER"],
    )

def bearer_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"message": "Unauthorized"}), 401
        token = auth.split(" ", 1)[1]
        try:
            # Decodifica/valida; se quiser, anexe ao request (ex.: g.user = ...)
            _decode_token(token)
        except jwt.PyJWTError:
            return jsonify({"message": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

# === ROTAS ===

@auth_bp.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    user = USERS.get(username)
    if not user or user["password"] != password:
        return jsonify({"message": "Credenciais inválidas"}), 401

    token = _make_token(username, user.get("name", username), user.get("role", "user"))
    return jsonify({"token": token, "role": user["role"]}), 200

@auth_bp.get("/api/user/balances")
@bearer_required
def balances():
    # Exemplo de retorno protegido
    return jsonify({
        "saldoAtualPts": 1200,
        "pontosRetiradosPts": 450,
        "pontosProcessandoPts": 200,
        "saldoTotalPts": 1850
    }), 200