from flask import request, jsonify
import json
import os

def load_users():
    path = os.path.join(os.path.dirname(__file__), "users.json")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Usuário e senha são obrigatórios"}), 400

    users = load_users()
    user = users.get(username)

    if not user:
        return jsonify({"message": "Usuário não encontrado"}), 404

    if user["password"] != password:
        return jsonify({"message": "Senha incorreta"}), 401

    return jsonify({"message": "Login bem-sucedido", "role": user["role"]}), 200
