from flask import Blueprint, jsonify

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/summary", methods=["GET"])
def summary():
    return jsonify({
        "success": True,
        "message": "Reports service working"
    })
