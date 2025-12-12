# Behaviour - Qualitative HCP Segmentation

Behaviour is an enterprise-grade application for qualitative Healthcare Professional (HCP) segmentation. It combines a flexible data ingestion layer with LLM-driven inference to generate deep insights, personas, and "what-if" analysis scenarios for commercial analytics teams.

## Tech Stack

- **Frontend**: React (ES Modules via CDN), TailwindCSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, @google/genai SDK.
- **AI/LLM**: Google Gemini API (`gemini-2.5-flash`).
- **Storage**: Hybrid (Local Storage/IndexedDB via SQLite WASM OR Remote JSON Persistence via Node.js).

## Prerequisites

- **Node.js (v18+)**
- **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/))

---

## Setup Instructions

### 1. Backend Setup

The backend handles remote data persistence (saving to `backend/database.json`) and proxies calls to the Gemini API (NLQ & Segmentation).

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set your API Key:
   ```bash
   # Linux/Mac
   export API_KEY="your_gemini_api_key_here"

   # Windows (PowerShell)
   $env:API_KEY="your_gemini_api_key_here"
   ```

4. Run the server:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3001/api`.

### 2. Frontend Setup

The frontend is built using standard ES modules and does not require a build step. You simply need to serve the root directory.

**Using npx (Node.js):**
```bash
# Run from the project root (not inside backend/)
npx serve .
```

**Using Python (Simple HTTP Server):**
```bash
# Run from the project root
python -m http.server 3000
```

### 3. Usage

1. Open your browser to `http://localhost:3000` (or the port shown by your static server).
2. The app defaults to **Remote Mode** trying to connect to port 3001.
3. If the backend is running, you should see data populated.
4. To verify or change storage settings:
   - Go to the **Settings** tab.
   - Under **Storage Provider**, ensure **Remote Server** is selected.
   - Ensure the API URL is set to `http://localhost:3001/api`.
   - Click **Save Configuration**.

---

## Key Features to Test

- **Control Center**: View ingestion metrics.
- **HCP Scorecards**: Click an HCP to view their AI-generated qualitative profile.
- **NLQ (Natural Language Query)**: Ask questions like "Show me all RWE-focused cardiologists" (Requires Backend running with API Key).
- **Rules Engine**: Create a new segmentation rule and run it against the dataset.
