# Modules/Admin/admin_controller.py
from flask import Blueprint, jsonify, request
from Modules.Auth.auth_middleware import require_auth

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/api/admin/dashboard", methods=["GET"])
@require_auth
def admin_dashboard():
    if request.user["role"] != "admin":
        return jsonify({"message": "Forbidden"}), 403
    return jsonify({"message": "Bem-vindo, admin!"})
# --- IGNORE ---