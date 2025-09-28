# Modules/Auth/auth_middleware.py
import jwt
from functools import wraps
from flask import request, jsonify, current_app

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("auth")
        if not token:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user = {"id": payload["sub"], "role": payload.get("role"), "nome": payload.get("nome")}
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Session expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        return fn(*args, **kwargs)
    return wrapper
