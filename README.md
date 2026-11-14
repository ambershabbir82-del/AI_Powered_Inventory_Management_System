# AI-Powered Inventory Management System

A responsive inventory dashboard built with Python, Flask, Object-Oriented Programming, HTML, CSS, JavaScript, JSON storage, and the Groq API.

## Features
- Add, view, search, update, and delete products (CRUD)
- Dashboard statistics: product count, total units, inventory value, low-stock and out-of-stock alerts
- Product and PerishableProduct classes
- Groq-powered inventory analysis, reorder suggestions, inventory Q&A, and product-description generation
- Graceful messages when AI credentials are not configured

## Requirements
- Python 3.10 or newer
- Git (for GitHub upload)
- A Groq API key for AI features

## Run on Windows
Open PowerShell in this project folder:

```powershell
py --version
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `.env` and set your private credentials:

```env
GROQ_API_KEY=your_actual_groq_api_key
GROQ_MODEL=your_available_groq_model
```

Choose a model identifier currently available to your Groq account. Do not assume a model name remains available forever. Never share or upload `.env`.

Start the application:

```powershell
python app.py
```

Open the local URL printed in the terminal, usually http://127.0.0.1:5000. Keep the terminal open while using the app.

## GitHub upload
Create an empty repository on GitHub, then run these commands in the project folder:

```bash
git init
git branch -M main
git add .
git status
git commit -m "Initial commit: AI Powered Inventory Management System"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Before committing, confirm that `.env` and `venv/` are not included in `git status`.

## Deployment note
The included `vercel.json` and `api/index.py` provide a starting point for a Vercel Python/Flask deployment. Deployment conventions can change; check the current Vercel Python runtime instructions if the build configuration differs.

**Important data limitation:** this starter version stores products in `data/products.json`. Vercel serverless deployments do not provide durable writable local-file storage. Use Supabase or managed PostgreSQL and update `InventoryManager` before relying on a hosted deployment for real inventory records. Treat the Vercel version as a demonstration until database persistence is implemented.

## Project structure

```text
AI_Powered_Inventory_Management_System/
├── app.py
├── models.py
├── inventory.py
├── ai_helper.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── vercel.json
├── api/
│   └── index.py
├── data/
│   └── products.json
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── app.js
```
