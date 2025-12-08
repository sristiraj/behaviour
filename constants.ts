import { HCP, Connector, SegmentationRule, User, Group, EntityAttribute } from "./types";

export const DEFAULT_ATTRIBUTES: EntityAttribute[] = [
    { key: 'npi', label: 'NPI', type: 'string', required: true, description: 'National Provider Identifier' },
    { key: 'first_name', label: 'First Name', type: 'string', required: true, description: 'Given name' },
    { key: 'last_name', label: 'Last Name', type: 'string', required: true, description: 'Family name' },
    { key: 'specialty', label: 'Specialty', type: 'string', required: false, description: 'Primary medical specialty' },
    { key: 'practice_name', label: 'Practice Name', type: 'string', required: false, description: 'Name of primary practice' },
    { key: 'city', label: 'City', type: 'string', required: false, description: 'Practice city' },
    { key: 'state', label: 'State', type: 'string', required: false, description: 'Practice state' },
    { key: 'zip', label: 'Zip Code', type: 'string', required: false, description: 'Practice zip code' },
    { key: 'email', label: 'Email', type: 'string', required: false, description: 'Contact email' },
    { key: 'publications_count', label: 'Publications', type: 'number', required: false, description: 'Total count of authored papers' },
];

export const MOCK_HCPS: HCP[] = [
  {
    npi: "1234567890",
    first_name: "Alex",
    last_name: "Smith",
    specialty: "Cardiology",
    subspecialty: ["Interventional Cardiology"],
    practice_name: "HeartCare Associates",
    primary_address: {
      street: "123 Main St",
      city: "Raleigh",
      state: "NC",
      zip: "27601",
    },
    affiliations: [
      { hospital: "St. Mary's", role: "Attending" },
      { hospital: "Duke Health", role: "Clinical Affiliate" }
    ],
    metadata: {
      years_in_practice: 12,
      publications_count: 14,
      last_call_date: "2023-11-01",
    },
    segmentation_result: {
      persona: "RWE-focused",
      influence: "High",
      engagement_readiness: "Warm",
      channel_preference: "Email",
      confidence: 0.87,
      key_drivers: [
        "Authored registry study in 2023",
        "Repeatedly asked for real-world safety evidence in call notes",
        "Affiliated to major tertiary hospital",
      ],
      recommended_next_action: "Send RWE safety deck + schedule MSL consult",
      rationale: "Dr. Smith consistently references registry data in recent publications and interactions.",
      run_date: "2023-11-15T10:00:00Z"
    },
  },
  {
    npi: "9876543210",
    first_name: "Sarah",
    last_name: "Jones",
    specialty: "Oncology",
    subspecialty: ["Hematology"],
    practice_name: "City Cancer Center",
    primary_address: {
      street: "456 Oak Ave",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    affiliations: [
      { hospital: "Mt. Sinai", role: "Director of Research" }
    ],
    metadata: {
      years_in_practice: 20,
      publications_count: 45,
      last_call_date: "2023-10-20",
    },
    segmentation_result: {
      persona: "KOL / Academic Lead",
      influence: "High",
      engagement_readiness: "Hot",
      channel_preference: "In-person",
      confidence: 0.95,
      key_drivers: [
        "Principal Investigator on 3 active trials",
        "Speaker at ASCO 2023",
        "High volume of peer-to-peer interactions"
      ],
      recommended_next_action: "Schedule executive leadership visit",
      rationale: "Strong academic footprint and high referral volume influence network.",
      run_date: "2023-11-15T10:05:00Z"
    },
  },
  {
    npi: "5551234567",
    first_name: "David",
    last_name: "Chen",
    specialty: "Cardiology",
    subspecialty: ["General Cardiology"],
    practice_name: "Suburban Cardio",
    primary_address: {
      street: "789 Pine Ln",
      city: "White Plains",
      state: "NY",
      zip: "10601",
    },
    affiliations: [],
    metadata: {
      years_in_practice: 5,
      publications_count: 1,
      last_call_date: "2023-09-15",
    },
    segmentation_result: {
      persona: "Clinical Volume Driver",
      influence: "Low",
      engagement_readiness: "Cold",
      channel_preference: "Virtual",
      confidence: 0.72,
      key_drivers: [
        "High patient volume reported",
        "Limited academic activity",
        "Prefers quick virtual touchbases"
      ],
      recommended_next_action: "Send monthly email newsletter",
      rationale: "Focused on clinical throughput with limited time for scientific exchange.",
      run_date: "2023-11-15T10:10:00Z"
    },
  },
];

export const MOCK_CONNECTORS: Connector[] = [
  {
    id: "conn_01",
    name: "Oracle Hospital DB",
    type: "oracle",
    status: "active",
    last_run: "2023-11-14 02:00 AM",
    row_count: 15400,
    config: { host: "oracle.company.net", service: "ORCL" },
    schedule: { mode: "cron", cron_expression: "0 2 * * *" }
  },
  {
    id: "conn_02",
    name: "PubMed API",
    type: "rest_api",
    status: "active",
    last_run: "2023-11-14 03:00 AM",
    row_count: 850,
    config: { endpoint: "https://api.ncbi.nlm.nih.gov/" },
    schedule: { mode: "webhook", webhook_url: "https://api.behaviour.com/hooks/v1/conn_02" }
  },
  {
    id: "conn_03",
    name: "Call Notes GCS",
    type: "gcs",
    status: "idle",
    last_run: "2023-11-10 12:00 PM",
    row_count: 5000,
    config: { bucket: "commercial-data-lake", prefix: "call-notes/" },
    schedule: { mode: "manual" }
  },
];

export const MOCK_RULES: SegmentationRule[] = [
  {
    id: "rule_01",
    name: "RWE Safety-Oriented Persona",
    description: "Identifies HCPs who prioritize real-world evidence over RCTs.",
    type: "llm_instruction",
    instruction: "Read the call notes and publications. If HCP shows preference for real-world evidence over RCTs, set persona='RWE-focused'. Look for keywords like 'registry', 'observational', 'real-world'.",
    active: true,
    priority: 1,
  },
  {
    id: "rule_02",
    name: "Digital Native Check",
    description: "Tags HCPs as 'Digital First' if they engage primarily via email/web.",
    type: "rule_based",
    instruction: "IF interactions.email_open_rate > 0.5 AND interactions.virtual_meeting_count > 3 THEN persona='Digital Native'",
    active: true,
    priority: 2,
  },
];

const DEFAULT_ADMIN_INSTRUCTION = `You are an expert commercial analytics agent for a pharmaceutical company. 
You have access to a list of HCPs (Healthcare Professionals) and their qualitative segmentation data.

Your goals:
1. Answer queries about the HCP population.
2. Perform "What-If" analysis on segmentation rules.
3. Explain the rationale behind specific personas.`;

const REP_INSTRUCTION = `You are a helpful field sales assistant. 
Your goal is to summarize HCP profiles quickly and suggest next best actions for a sales rep on the road.
Keep answers concise, bulleted, and actionable. Focus on engagement readiness and location.`;

export const MOCK_GROUPS: Group[] = [
  {
    id: "grp_01",
    name: "North America Regional Team",
    description: "Access to all data in US and Canada.",
    entitlements: {
      regions: ["North America"],
      countries: ["USA", "Canada"],
      territories: []
    },
    memberIds: ["usr_analyst"]
  },
  {
    id: "grp_02",
    name: "NY Metro Sales",
    description: "Field team for New York metropolitan area.",
    entitlements: {
      regions: [],
      countries: ["USA"],
      territories: ["NY-Metro", "NY-Upstate"]
    },
    memberIds: ["usr_rep"]
  }
];

export const MOCK_USERS: User[] = [
  {
    id: "usr_admin",
    name: "Admin User",
    role: "admin",
    email: "admin@behaviour.com",
    preferences: {
      nlq_instruction: DEFAULT_ADMIN_INSTRUCTION
    },
    groupIds: [],
    entitlements: { regions: [], countries: [], territories: [] }
  },
  {
    id: "usr_analyst",
    name: "Jane Analyst",
    role: "analyst",
    email: "jane@behaviour.com",
    preferences: {
      nlq_instruction: "You are a data scientist. Focus on statistical significance, confidence scores, and data anomalies in the HCP segmentation."
    },
    groupIds: ["grp_01"],
    entitlements: { regions: [], countries: [], territories: [] }
  },
  {
    id: "usr_rep",
    name: "John Rep",
    role: "rep",
    email: "john@behaviour.com",
    preferences: {
      nlq_instruction: REP_INSTRUCTION
    },
    groupIds: ["grp_02"],
    entitlements: { regions: [], countries: [], territories: ["NJ-North"] }
  }
];