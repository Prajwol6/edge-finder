import io
import os
import pdfplumber
from flask import Flask, jsonify, request

app = Flask(__name__)

MAX_SIZE = 5 * 1024 * 1024  # 5MB
INTERNAL_TOKEN = os.environ.get("PDF_SERVICE_SECRET")

@app.route("/parse", methods=["POST"])
def parse():
    if not INTERNAL_TOKEN or request.headers.get("X-Internal-Token") != INTERNAL_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    
    data = file.read()
    
    # Check file size
    if len(data) > MAX_SIZE:
        return jsonify({"error": "File too large"}), 400
    
    # Check magic bytes — PDF must start with %PDF
    if not data.startswith(b"%PDF"):
        return jsonify({"error": "Invalid PDF file"}), 400
    
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join(
                (page.extract_text() or "") for page in pdf.pages
            )
        
        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400
            
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
