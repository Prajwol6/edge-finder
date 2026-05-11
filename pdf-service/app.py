import io

import pdfplumber
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/parse", methods=["POST"])
def parse():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        with pdfplumber.open(io.BytesIO(file.read())) as pdf:
            text = "\n".join(
                (page.extract_text() or "") for page in pdf.pages
            )
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
