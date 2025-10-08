from flask import Blueprint, jsonify, request
from .rewards_service import list_rewards, group_by_variants

rewards_bp = Blueprint("rewards", __name__)

@rewards_bp.get("/api/rewards")
def get_rewards():
    grouped = (request.args.get("grouped","").strip().lower() in {"1", "true","yes", "sim"})
    items = list_rewards()
    if grouped:
        items = group_by_variants(items)
    return jsonify(items), 200
    