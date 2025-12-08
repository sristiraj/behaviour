export interface HCP {
  npi: string;
  first_name: string;
  last_name: string;
  specialty: string;
  subspecialty: string[];
  practice_name: string;
  primary_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  affiliations: { hospital: string; role: string }[];
  metadata: {
    years_in_practice: number;
    publications_count: number;
    last_call_date: string;
  };
  // Allow dynamic access
  [key: string]: any;
}

export interface EntityAttribute {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  description?: string;
}

export interface SegmentationResult {
  persona: string;
  influence: "High" | "Medium" | "Low";
  engagement_readiness: "Hot" | "Warm" | "Cold";
  channel_preference: "In-person" | "Virtual" | "Email";
  confidence: number;
  key_drivers: string[];
  recommended_next_action: string;
  rationale: string;
  run_date: string;
}

export interface ScheduleConfig {
  mode: "manual" | "cron" | "webhook";
  cron_expression?: string;
  webhook_url?: string;
  webhook_secret?: string;
}

export interface Connector {
  id: string;
  name: string;
  type: "oracle" | "rest_api" | "gcs" | "local_file";
  status: "active" | "error" | "idle" | "disabled";
  last_run: string;
  row_count: number;
  config: Record<string, any>;
  schedule?: ScheduleConfig;
}

export interface JoinCondition {
  sourceField: string;
  targetField: string;
}

export interface DataSourceLink {
  id: string;
  sourceConnectorId: string;
  targetConnectorId: string;
  conditions: JoinCondition[];
}

export interface SegmentationRule {
  id: string;
  name: string;
  description: string;
  type: "rule_based" | "llm_instruction";
  instruction: string; // The prompt or logic
  context?: string; // Additional context/background for LLM
  active: boolean;
  priority: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface Entitlements {
  regions: string[];
  countries: string[];
  territories: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  entitlements: Entitlements;
  memberIds: string[];
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "analyst" | "rep";
  email: string;
  avatar?: string;
  preferences: {
    nlq_instruction?: string;
  };
  groupIds?: string[];
  entitlements?: Entitlements; // Direct entitlements
}

export interface SystemSettings {
  llmConfig: {
    mode: 'direct' | 'gcp_agent';
    agentEndpoint: string;
    agentAuthToken?: string;
    location?: string; // e.g., us-central1
  };
  tracingConfig: {
    provider: 'none' | 'google_cloud_trace';
    projectId?: string;
    sampleRate: number; // 0.0 to 1.0
  };
}