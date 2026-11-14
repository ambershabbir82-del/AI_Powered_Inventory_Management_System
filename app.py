import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from inventory import InventoryManager
from ai_helper import InventoryAI

load_dotenv()
app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "products.json")
inventory = InventoryManager(DATA_FILE)
ai = InventoryAI()

@app.route("/")
def home():
    return render_template("index.html")

@app.get("/api/products")
def get_products():
    return jsonify({"products": inventory.get_all(), "stats": inventory.get_stats()})

@app.post("/api/products")
def add_product():
    data = request.get_json(silent=True) or {}
    try:
        product = inventory.add_product(data)
        return jsonify({"message": "Product added successfully.", "product": product, "stats": inventory.get_stats()}), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

@app.put("/api/products/<product_id>")
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    try:
        product = inventory.update_product(product_id, data)
        return jsonify({"message": "Product updated successfully.", "product": product, "stats": inventory.get_stats()})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

@app.delete("/api/products/<product_id>")
def delete_product(product_id):
    try:
        inventory.delete_product(product_id)
        return jsonify({"message": "Product deleted successfully.", "stats": inventory.get_stats()})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 404

@app.post("/api/ai/analyze")
def analyze_inventory():
    return ai_response("analyze", inventory.get_all())

@app.post("/api/ai/reorders")
def reorder_suggestions():
    return ai_response("reorders", inventory.get_all())

@app.post("/api/ai/ask")
def ask_inventory():
    data = request.get_json(silent=True) or {}
    question = str(data.get("question", "")).strip()
    if not question:
        return jsonify({"error": "Please enter a question."}), 400
    return ai_response("ask", inventory.get_all(), question)

@app.post("/api/ai/description")
def generate_description():
    data = request.get_json(silent=True) or {}
    product_name = str(data.get("name", "")).strip()
    category = str(data.get("category", "")).strip()
    if not product_name:
        return jsonify({"error": "Enter a product name first."}), 400
    return ai_response("description", inventory.get_all(), {"name": product_name, "category": category})

def ai_response(action, products, extra=None):
    try:
        result = ai.run(action, products, extra)
        return jsonify({"result": result})
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception:
        app.logger.exception("AI request failed")
        return jsonify({"error": "The AI request failed. Check your Groq API key, model name, internet connection, and server logs."}), 502

if __name__ == "__main__":
    app.run(debug=True)
