from flask import Blueprint, jsonify, request
from .brindes_service import listar_variacoes, agrupar_por_produto

brindes_bp = Blueprint("brindes", __name__)

@brindes_bp.route("/api/brindes", methods=["GET"])
def api_listar_variacoes():
    # retorna as variações com estoque atual
    data = listar_variacoes()
    return jsonify(data), 200

@brindes_bp.route("/api/brindes/produtos", methods=["GET"])
def api_agrupar_produtos():
    # retorna produtos agrupados (cards)
    data = agrupar_por_produto()
    return jsonify(data), 200

@brindes_bp.route("/api/brindes/<int:variant_id>/estoque", methods=["GET"])
def api_estoque_variant(variant_id):
    items = listar_variacoes()
    item = next((i for i in items if i["id"] == variant_id), None)
    if not item:
        return jsonify({"ok": False, "error": "Variante não encontrada"}), 404
    return jsonify({"variantId": variant_id, "stockCurrent": item["stockCurrent"]}), 200
