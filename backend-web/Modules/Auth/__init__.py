from flask import Blueprint
from .auth import login

auth_bp = Blueprint("auth_bp", __name__)

auth_bp.route("/api/login", methods=["POST"])(login)
