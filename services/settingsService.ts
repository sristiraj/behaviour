import { SystemSettings } from "../types";

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  llmConfig: {
    mode: 'direct', // Default to direct for demo purposes, can be switched to gcp_agent
    agentEndpoint: '',
    location: 'us-central1'
  },
  tracingConfig: {
    provider: 'none',
    sampleRate: 1.0
  }
};

let settingsStore: SystemSettings = { ...DEFAULT_SETTINGS };

export const getSystemSettings = async (): Promise<SystemSettings> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return { ...settingsStore };
};

export const updateSystemSettings = async (settings: SystemSettings): Promise<SystemSettings> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  settingsStore = { ...settings };
  return { ...settingsStore };
};

// Synchronous getter for use in non-async contexts if needed (careful with race conditions in real app)
export const getSystemSettingsSync = (): SystemSettings => {
    return { ...settingsStore };
};