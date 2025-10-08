from flask import Blueprint, request, jsonify
from .movimentacoes_service import criar_resgate, confirmar_resgate, validar_estoque
from typing import Any, Dict

movs_bp = Blueprint("movimentacoes", __name__)

@movs_bp.route("/api/movimentacoes/resgate", methods=["POST"])
def api_criar_resgate():
    """
    Body esperado:
    {
      "userId": 123,
      "items": [{ "variantId": 101, "quantity": 2 }, ...],
      "totalPoints": 2400
    }
    """
    body: Dict[str, Any] = request.get_json() or {}
    user_id = int(body.get("userId") or 0)
    items = body.get("items") or []
    total_points = int(body.get("totalPoints") or 0)

    if user_id <= 0 or not items:
        return jsonify({"ok": False, "error": "userId e items são obrigatórios"}), 400

    # opcional: validação extra rápida
    if not validar_estoque(items):
        return jsonify({"ok": False, "error": "Estoque insuficiente ou custo inválido"}), 400

    res = criar_resgate(user_id, items, total_points)
    if not res.get("ok"):
        return jsonify(res), 400
    return jsonify(res), 201

@movs_bp.route("/api/movimentacoes/confirmar", methods=["POST"])
def api_confirmar_resgate():
    """
    Body esperado: { "movId": 1 }
    """
    body: Dict[str, Any] = request.get_json() or {}
    mov_id = int(body.get("movId") or 0)
    if mov_id <= 0:
        return jsonify({"ok": False, "error": "movId inválido"}), 400

    res = confirmar_resgate(mov_id)
    if not res.get("ok"):
        return jsonify(res), 400
    return jsonify(res), 200
