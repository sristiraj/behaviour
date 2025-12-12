# Behaviour - Qualitative HCP Segmentation

Behaviour is an enterprise-grade application for qualitative Healthcare Professional (HCP) segmentation. It combines a flexible data ingestion layer with LLM-driven inference to generate deep insights, personas, and "what-if" analysis scenarios for commercial analytics teams.

## Tech Stack

- **Frontend**: React (ES Modules via CDN), TailwindCSS, Lucide Icons.
- **Backend**: FastAPI (Python), SQLite (Remote Persistence).
- **AI/LLM**: Google Gemini API (`gemini-2.5-flash`).
- **Storage**: Hybrid (Local Storage/IndexedDB via SQLite WASM OR Remote SQLite via FastAPI).

## Prerequisites

- **Python 3.10+** (for the backend)
- **Node.js** (optional, recommended for serving the frontend)
- **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/))

---

## Setup Instructions

### 1. Backend Setup

The backend handles remote data persistence and proxies calls to the Gemini API (NLQ & Segmentation).

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set your API Key:
   ```bash
   # Linux/Mac
   export API_KEY="your_gemini_api_key_here"

   # Windows (PowerShell)
   $env:API_KEY="your_gemini_api_key_here"
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000/api`.

### 2. Frontend Setup

The frontend is built using standard ES modules and does not require a complex build step. You simply need to serve the root directory.

**Using npx (Node.js):**
```bash
# Run from the project root
npx serve .
```

**Using Python:**
```bash
# Run from the project root
python -m http.server 3000
```

### 3. Usage

1. Open your browser to `http://localhost:3000` (or the port shown by your static server).
2. The app defaults to **Local Mode** (Data stored in browser).
3. To enable AI features and backend persistence:
   - Go to the **Settings** tab.
   - Under **Storage Provider**, select **Remote Server**.
   - Ensure the API URL is set to `http://localhost:8000/api`.
   - Click **Save Configuration**.
   - The app will reload and sync with the Python backend.

---

## Key Features to Test

- **Control Center**: View ingestion metrics.
- **HCP Scorecards**: Click an HCP to view their AI-generated qualitative profile.
- **NLQ (Natural Language Query)**: Ask questions like "Show me all RWE-focused cardiologists" (Requires Remote Mode).
- **Rules Engine**: Create a new segmentation rule and run it against the dataset.
