import { SystemSettings } from "../types";
import { dbService } from "./db";

const SETTINGS_ID = 'system_settings';

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const data = await dbService.getById('settings', SETTINGS_ID);
  if (data) return data;
  
  // Default fallback if DB fails or empty
  return {
    llmConfig: { mode: 'direct', agentEndpoint: '', location: 'us-central1' },
    tracingConfig: { provider: 'none', sampleRate: 1.0 }
  };
};

export const updateSystemSettings = async (settings: SystemSettings): Promise<SystemSettings> => {
  await dbService.upsert('settings', { id: SETTINGS_ID, ...settings });
  return settings;
};