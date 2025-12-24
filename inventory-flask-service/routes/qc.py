from flask import Blueprint, request, jsonify
from services.qc_service import run_qc

qc_bp = Blueprint("qc", __name__)

@qc_bp.route("/check", methods=["POST"])
def qc_check():
    data = request.json
    result = run_qc(data)
    return jsonify(result)
