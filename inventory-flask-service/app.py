from flask import Flask
from flask_cors import CORS

from routes.qc import qc_bp
from routes.reports import reports_bp

app = Flask(__name__)
CORS(app)  # 🔥 VERY IMPORTANT for MERN

app.register_blueprint(qc_bp, url_prefix="/qc")
app.register_blueprint(reports_bp, url_prefix="/reports")

@app.route("/health")
def health():
    return {"status": "Flask service running"}

if __name__ == "__main__":
    app.run(port=5001, debug=True)
