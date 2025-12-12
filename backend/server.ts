import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from 'url';

// Environment setup
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("WARNING: API_KEY is not set. AI features will fail.");
}

// App Setup
const app = express();
const PORT = 3001;
const DB_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }) as any);

// --- Simple File-Based Persistence ---
let db: Record<string, any[]> = {
    users: [],
    groups: [],
    connectors: [],
    hcps: [],
    rules: [],
    attributes: [],
    links: [],
    settings: []
};

// Load DB
if (fs.existsSync(DB_FILE)) {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        db = { ...db, ...JSON.parse(raw) };
        console.log("Database loaded.");
    } catch (e) {
        console.error("Failed to load DB, starting fresh.");
    }
}

const saveDb = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Failed to save DB:", e);
    }
};

// --- Generic CRUD Factory ---
const createCrudRoutes = (table: string) => {
    app.get(`/api/${table}`, (req, res) => {
        res.json(db[table] || []);
    });

    app.get(`/api/${table}/:id`, (req, res) => {
        const item = db[table]?.find((i: any) => (i.id === req.params.id || i.npi === req.params.id || i.key === req.params.id));
        if (item) res.json(item);
        else res.status(404).json({ error: "Not found" });
    });

    app.post(`/api/${table}`, (req, res) => {
        const newItem = req.body;
        const id = newItem.id || newItem.npi || newItem.key;
        if (!id) return res.status(400).json({ error: "Missing ID/NPI/Key" });

        // Upsert
        const idx = db[table].findIndex((i: any) => (i.id === id || i.npi === id || i.key === id));
        if (idx >= 0) {
            db[table][idx] = newItem;
        } else {
            db[table].push(newItem);
        }
        saveDb();
        res.json(newItem);
    });

    app.delete(`/api/${table}/:id`, (req, res) => {
        db[table] = db[table].filter((i: any) => (i.id !== req.params.id && i.npi !== req.params.id && i.key !== req.params.id));
        saveDb();
        res.json({ success: true });
    });
};

['users', 'groups', 'connectors', 'hcps', 'rules', 'attributes', 'links', 'settings'].forEach(createCrudRoutes);

// --- AI Endpoints ---

const ai = new GoogleGenAI({ apiKey: API_KEY });

// NLQ Endpoint
app.post('/api/nlq', async (req, res) => {
    try {
        const { query, history, instruction, context_data } = req.body;

        const systemPrompt = `
        ${instruction}

        CONTEXT DATA (First 10 records only for context):
        ${JSON.stringify(context_data, null, 2)}
        `;

        // Combine history for context (simplified)
        // In a real app, we'd structure this as a chat session.
        let fullPrompt = query;
        if (history && history.length > 0) {
            fullPrompt = `Previous conversation:\n${history.join('\n')}\n\nCurrent Query: ${query}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
            },
            contents: { role: 'user', parts: [{ text: fullPrompt }] }
        });

        res.json({ response: response.text });
    } catch (error: any) {
        console.error("NLQ Error:", error);
        res.status(500).json({ error: error.message || "AI Error" });
    }
});

// Segmentation Preview Endpoint
app.post('/api/segmentation/preview', async (req, res) => {
    try {
        const { hcp, instruction, context } = req.body;

        const systemPrompt = `
        You are an expert commercial analytics engine.
        Analyze the provided HCP profile and generate a qualitative segmentation result based on the user's instruction.
        
        Additional Context: ${context || 'None'}
        `;

        const userPrompt = `
        Instruction: ${instruction}

        HCP Profile:
        ${JSON.stringify(hcp, null, 2)}
        
        Return JSON matching this schema:
        {
            "persona": "string",
            "influence": "High" | "Medium" | "Low",
            "engagement_readiness": "Hot" | "Warm" | "Cold",
            "channel_preference": "In-person" | "Virtual" | "Email",
            "confidence": number (0.0 to 1.0),
            "key_drivers": ["string"],
            "recommended_next_action": "string",
            "rationale": "string"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json'
            },
            contents: { role: 'user', parts: [{ text: userPrompt }] }
        });

        const jsonText = response.text;
        res.json(JSON.parse(jsonText));

    } catch (error: any) {
        console.error("Segmentation Error:", error);
        res.status(500).json({ error: error.message || "AI Error" });
    }
});


app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
    console.log(`API Key present: ${!!API_KEY}`);
});