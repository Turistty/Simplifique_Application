# Modules/Pontos/pontos_controller.py
from flask import Blueprint, jsonify, request
from Modules.Auth.auth_middleware import require_auth
from Modules.Pontos.pontos_service import calcular_saldos

pontos_bp = Blueprint("pontos", __name__)

@pontos_bp.route("/api/me", methods=["GET"])
@require_auth
def me():
    # identidade para header do front
    return jsonify({"id": request.user["id"], "nome": request.user["nome"], "role": request.user["role"]})

@pontos_bp.route("/api/pontos", methods=["GET"])
@require_auth
def pontos_do_usuario_autenticado():
    usuario_id = request.user["id"]
    return jsonify(calcular_saldos(usuario_id))
