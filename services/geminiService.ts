
import { HCP, SegmentationResult } from "../types";
import { getSystemSettings } from "./settingsService";
import { dbService } from "./db";

export const DEFAULT_NLQ_INSTRUCTION = `You are an expert commercial analytics agent for a pharmaceutical company. 
You have access to a list of HCPs (Healthcare Professionals) and their qualitative segmentation data.

Your goals:
1. Answer queries about the HCP population.
2. Perform "What-If" analysis on segmentation rules.
3. Explain the rationale behind specific personas.`;

/**
 * Simulates the "What-If" or NLQ analysis on an HCP profile.
 * Now delegated to Node.js Backend.
 */
export const runNLQAnalysis = async (
  query: string,
  currentContext: HCP[],
  conversationHistory: string[] = [],
  instructionOverride?: string
): Promise<string> => {
  const settings = await getSystemSettings();
  const apiBase = dbService.getApiUrl();
  const instruction = instructionOverride || DEFAULT_NLQ_INSTRUCTION;

  try {
    const response = await fetch(`${apiBase}/nlq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            history: conversationHistory,
            instruction,
            context_data: currentContext.slice(0, 10) // Send subset to backend
        })
    });

    if (!response.ok) {
         throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "No response text received.";

  } catch (error) {
    console.error("NLQ Error (Backend):", error);
    // Fallback Mock
    return "Error connecting to the intelligence engine (Backend). Please ensure the Node.js server is running on port 3001.\n\n(Mock): Based on the query, we found matching profiles.";
  }
};

/**
 * Simulates running a segmentation rule on a specific HCP.
 * Now delegated to Node.js Backend.
 */
export const runSegmentationPreview = async (
  hcp: HCP,
  ruleInstruction: string,
  ruleContext?: string
): Promise<SegmentationResult> => {
  const apiBase = dbService.getApiUrl();
  
  try {
    const response = await fetch(`${apiBase}/segmentation/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            hcp,
            instruction: ruleInstruction,
            context: ruleContext
        })
    });

    if (!response.ok) {
         throw new Error(`Backend Error: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      ...result,
      run_date: new Date().toISOString()
    };

  } catch (error) {
    console.error("Segmentation Error (Backend):", error);
    // Return mock if backend fails to allow UI testing
    return {
      persona: "Error (Backend unavailable)",
      influence: "Low",
      engagement_readiness: "Cold",
      channel_preference: "Email",
      confidence: 0.0,
      key_drivers: ["Backend connection failed"],
      recommended_next_action: "Check console logs",
      rationale: "Could not reach Node.js backend on port 3001.",
      run_date: new Date().toISOString()
    };
  }
};