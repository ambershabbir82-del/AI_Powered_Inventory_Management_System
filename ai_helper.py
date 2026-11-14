import os
import json
from groq import Groq

class InventoryAI:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "").strip()

    def run(self, action, products, extra=None):
        if not self.api_key:
            raise RuntimeError("AI is not configured yet. Add GROQ_API_KEY to your .env file and restart the app.")
        if not self.model or self.model == "your_available_groq_model":
            raise RuntimeError("Set GROQ_MODEL in your .env file to a model currently available in your Groq account.")
        client = Groq(api_key=self.api_key)
        inventory_json = json.dumps(products, ensure_ascii=False)
        if action == "analyze":
            prompt = f"Analyze this inventory for a small business. Give concise headings for overall position, risks, and practical actions. Do not invent sales data. Inventory: {inventory_json}"
        elif action == "reorders":
            prompt = f"Review this inventory and suggest which products may need reordering. Explain using quantity and reorder level. Do not invent suppliers or order quantities. Inventory: {inventory_json}"
        elif action == "ask":
            prompt = f"Answer the user's inventory question using only the supplied inventory. If the data does not contain the answer, say so. Inventory: {inventory_json}\nQuestion: {extra}"
        elif action == "description":
            prompt = f"Write a clear, attractive but factual product description in 2-3 sentences. Do not invent specifications. Product: {json.dumps(extra)}"
        else:
            raise ValueError("Unknown AI action.")
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a careful inventory management assistant. Be practical, clear, and honest about missing data."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=900
        )
        return response.choices[0].message.content.strip()
