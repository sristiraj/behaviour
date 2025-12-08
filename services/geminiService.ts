import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HCP, SegmentationResult } from "../types";
import { getSystemSettingsSync } from "./settingsService";

// In a real app, this would be strictly server-side or proxy via backend.
// For this demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey });

export const getGeminiClient = () => ai;

export const DEFAULT_NLQ_INSTRUCTION = `You are an expert commercial analytics agent for a pharmaceutical company. 
You have access to a list of HCPs (Healthcare Professionals) and their qualitative segmentation data.

Your goals:
1. Answer queries about the HCP population.
2. Perform "What-If" analysis on segmentation rules.
3. Explain the rationale behind specific personas.`;

const generateTraceHeader = (projectId?: string) => {
    // Generate a mock X-Cloud-Trace-Context header
    // Format: TRACE_ID/SPAN_ID;o=TRACE_TRUE
    const traceId = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const spanId = Math.floor(Math.random() * 10000000000000000).toString();
    return `${traceId}/${spanId};o=1`;
};

/**
 * Simulates the "What-If" or NLQ analysis on an HCP profile.
 */
export const runNLQAnalysis = async (
  query: string,
  currentContext: HCP[],
  conversationHistory: string[] = [],
  instructionOverride?: string
): Promise<string> => {
  const settings = getSystemSettingsSync();

  // GCP Agent Mode
  if (settings.llmConfig.mode === 'gcp_agent') {
      if (!settings.llmConfig.agentEndpoint) {
          return "Configuration Error: GCP Agent Endpoint is missing in System Settings.";
      }

      try {
          const headers: Record<string, string> = {
              'Content-Type': 'application/json',
          };

          if (settings.llmConfig.agentAuthToken) {
              headers['Authorization'] = `Bearer ${settings.llmConfig.agentAuthToken}`;
          }

          if (settings.tracingConfig.provider === 'google_cloud_trace') {
              headers['X-Cloud-Trace-Context'] = generateTraceHeader(settings.tracingConfig.projectId);
              if (settings.tracingConfig.projectId) {
                  headers['X-GCP-Project-ID'] = settings.tracingConfig.projectId;
              }
          }

          const payload = {
              query,
              context: currentContext.slice(0, 5), // Send subset
              history: conversationHistory,
              instruction: instructionOverride || DEFAULT_NLQ_INSTRUCTION
          };

          // Simulate fetch if localhost/demo, otherwise real fetch
          // In a real scenario: const response = await fetch(settings.llmConfig.agentEndpoint, { ... });
          
          console.log(`[GCP Agent] Calling ${settings.llmConfig.agentEndpoint}`);
          console.log(`[GCP Agent] Trace Header: ${headers['X-Cloud-Trace-Context']}`);
          
          // Allow simulated error for demo if URL is "error"
          if (settings.llmConfig.agentEndpoint === 'error') throw new Error("Simulated Agent Error");

          // Simulate network latency for the agent
          await new Promise(resolve => setTimeout(resolve, 1500));

          return `[GCP Agent Response] Processed by ${settings.tracingConfig.provider === 'google_cloud_trace' ? 'Trace-Enabled ' : ''}Agent at ${settings.llmConfig.location || 'GCP'}.\n\nBased on the analysis of the provided HCP context, the agent confirms: "${query}" matches 2 profiles in the dataset.`;
      } catch (error) {
          console.error("GCP Agent Error:", error);
          return "Error communicating with the GCP Agent. Please check your System Settings and network connection.";
      }
  }

  // Direct Mode (Fallback)
  if (!apiKey) {
    return "API Key is missing. Running in Demo Mode. \n\n(Mock Response): Based on the query, we found 3 HCPs matching 'RWE-focused' in the NY area. Changing the engagement strategy to 'Virtual' usually increases engagement scores by 15% for this segment.";
  }

  try {
    const model = "gemini-2.5-flash";
    
    // Construct a context-aware prompt
    const baseInstruction = instructionOverride || DEFAULT_NLQ_INSTRUCTION;
    const systemInstruction = `${baseInstruction}

    HCP Data Context:
    ${JSON.stringify(currentContext.slice(0, 5))} // Limiting context for demo
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...conversationHistory.map(text => ({ role: "user", parts: [{ text }] })),
        { role: "user", parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("NLQ Error:", error);
    return "Error connecting to the intelligence engine. Please check your API key.";
  }
};

/**
 * Simulates running a segmentation rule on a specific HCP.
 * In production, this runs in batch on the backend.
 */
export const runSegmentationPreview = async (
  hcp: HCP,
  ruleInstruction: string,
  ruleContext?: string
): Promise<SegmentationResult> => {
  const settings = getSystemSettingsSync();

   if (settings.llmConfig.mode === 'gcp_agent') {
        // Return mock agent response for segmentation preview
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            persona: "GCP Agent Segmented",
            influence: "High",
            engagement_readiness: "Warm",
            channel_preference: "Virtual",
            confidence: 0.99,
            key_drivers: ["Agent Logic 1", "Agent Logic 2"],
            recommended_next_action: "Agent Recommended Action",
            rationale: `Processed by GCP Agent at ${settings.llmConfig.agentEndpoint} with active tracing.`,
            run_date: new Date().toISOString()
        };
   }

  if (!apiKey) {
    // Return mock data if no key
    return {
      persona: "RWE-focused (Preview)",
      influence: "High",
      engagement_readiness: "Warm",
      channel_preference: "Email",
      confidence: 0.85,
      key_drivers: ["Mock driver 1", "Mock driver 2"],
      recommended_next_action: "Mock Action",
      rationale: "This is a mock rationale generated without an API key.",
      run_date: new Date().toISOString()
    };
  }

  try {
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        persona: { type: Type.STRING },
        influence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        engagement_readiness: { type: Type.STRING, enum: ["Hot", "Warm", "Cold"] },
        channel_preference: { type: Type.STRING, enum: ["In-person", "Virtual", "Email"] },
        confidence: { type: Type.NUMBER },
        key_drivers: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommended_next_action: { type: Type.STRING },
        rationale: { type: Type.STRING },
      },
      required: ["persona", "influence", "engagement_readiness", "confidence", "key_drivers", "rationale"]
    };

    const promptContext = ruleContext ? `Additional Context: ${ruleContext}\n\n` : '';
    const contents = `Analyze this HCP profile based on the following instruction: "${ruleInstruction}". \n\n ${promptContext}Profile: ${JSON.stringify(hcp)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");

    const result = JSON.parse(text);
    return {
      ...result,
      run_date: new Date().toISOString()
    };

  } catch (error) {
    console.error("Segmentation Error:", error);
    throw error;
  }
};