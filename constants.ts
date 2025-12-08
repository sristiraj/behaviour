
import { HCP, Connector, SegmentationRule, User, Group, EntityAttribute } from "./types";

export const DEFAULT_ATTRIBUTES: EntityAttribute[] = [
    // Identity & Core Profile
    { key: 'npi', label: 'NPI', type: 'string', required: true, description: 'National Provider Identifier' },
    { key: 'first_name', label: 'First Name', type: 'string', required: true, description: 'Given name' },
    { key: 'last_name', label: 'Last Name', type: 'string', required: true, description: 'Family name' },
    { key: 'specialty', label: 'Specialty', type: 'string', required: false, description: 'Primary medical specialty' },
    { key: 'practice_name', label: 'Practice Name', type: 'string', required: false, description: 'Name of primary practice' },
    { key: 'practice_type', label: 'Practice Type', type: 'string', required: false, description: 'Academic, Private, Health System, etc.' },
    { key: 'role', label: 'Role/Title', type: 'string', required: false, description: 'Job title or role (e.g., Chief of Cardiology)' },
    
    // Contact / Location
    { key: 'city', label: 'City', type: 'string', required: false, description: 'Practice city' },
    { key: 'state', label: 'State', type: 'string', required: false, description: 'Practice state' },
    { key: 'zip', label: 'Zip Code', type: 'string', required: false, description: 'Practice zip code' },
    { key: 'email', label: 'Email', type: 'string', required: false, description: 'Contact email' },

    // Structured Metrics
    { key: 'years_in_practice', label: 'Years in Practice', type: 'number', required: false, description: 'Years since residency' },
    { key: 'publications_count', label: 'Publication Count', type: 'number', required: false, description: 'Total count of authored papers' },
    { key: 'claims_volume', label: 'Claims Volume', type: 'number', required: false, description: 'Aggregated claims volume proxy' },
    { key: 'rx_volume', label: 'Rx Volume', type: 'number', required: false, description: 'Prescription volume proxy' },
    { key: 'patient_volume', label: 'Patient Volume', type: 'number', required: false, description: 'Estimated patient panel size' },

    // Complex Objects (Arrays/JSON)
    { key: 'affiliations', label: 'Affiliations', type: 'array', required: false, description: 'List of hospital/system affiliations' },
    { key: 'clinical_trials', label: 'Clinical Trials', type: 'array', required: false, description: 'Active or past clinical trials investigated' },
    
    // Unstructured Text Data (for RAG)
    { key: 'call_notes', label: 'Call Notes', type: 'array', required: false, description: 'CRM call notes and interactions' },
    { key: 'publications', label: 'Publications', type: 'array', required: false, description: 'Full abstracts or citation data' },
    { key: 'abstracts', label: 'Abstracts', type: 'array', required: false, description: 'Conference abstracts' },
    { key: 'social_posts', label: 'Social Media', type: 'array', required: false, description: 'Professional social media activity' },
    { key: 'emails', label: 'Emails', type: 'array', required: false, description: 'Email correspondence history' },

    // Behavioral / Time Series
    { key: 'campaign_history', label: 'Campaign History', type: 'array', required: false, description: 'Marketing campaigns targeted' },
    { key: 'event_attendance', label: 'Event Attendance', type: 'array', required: false, description: 'Webinars, congresses, and meetings attended' },
    { key: 'content_consumption', label: 'Content Consumption', type: 'array', required: false, description: 'Digital content clicks and views' },
];

export const MOCK_HCPS: HCP[] = [
  {
    npi: "1234567890",
    first_name: "Alex",
    last_name: "Smith",
    specialty: "Cardiology",
    subspecialty: ["Interventional Cardiology"],
    practice_name: "HeartCare Associates",
    practice_type: "Private",
    role: "Attending Physician",
    primary_address: {
      street: "123 Main St",
      city: "Raleigh",
      state: "NC",
      zip: "27601",
    },
    years_in_practice: 12,
    publications_count: 14,
    claims_volume: 1200,
    rx_volume: 450,
    patient_volume: 2500,
    affiliations: [
      { hospital: "St. Mary's", role: "Attending" },
      { hospital: "Duke Health", role: "Clinical Affiliate" }
    ],
    clinical_trials: ["NCT04567890 (Registry)"],
    call_notes: [
        "Expressed interest in RWE safety data during last visit.",
        "Asked about coverage for new anticoagulants."
    ],
    abstracts: ["Title: Registry Outcomes in AFib - ACC 2023"],
    social_posts: [],
    emails: [],
    campaign_history: ["Q4 Launch", "Safety First Webinar"],
    event_attendance: ["ACC 2023"],
    content_consumption: ["Email Click: Safety PDF"],
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
    practice_type: "Academic",
    role: "Director of Research",
    primary_address: {
      street: "456 Oak Ave",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
    years_in_practice: 20,
    publications_count: 45,
    claims_volume: 800,
    rx_volume: 150,
    patient_volume: 1200,
    affiliations: [
      { hospital: "Mt. Sinai", role: "Director of Research" }
    ],
    clinical_trials: ["NCT01234567 (Phase 3)", "NCT09876543 (Phase 2)"],
    call_notes: ["Discussed protocol amendment for upcoming trial.", "Requested meeting with Medical Director."],
    abstracts: ["Keynote: Future of Heme-Onc - ASCO 2023"],
    social_posts: ["Excited to present at #ASCO23 this weekend!"],
    emails: ["Invitation: Advisory Board"],
    campaign_history: ["KOL Engagement Program"],
    event_attendance: ["ASCO 2023", "ASH 2022"],
    content_consumption: [],
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
    practice_type: "Private",
    role: "Partner",
    primary_address: {
      street: "789 Pine Ln",
      city: "White Plains",
      state: "NY",
      zip: "10601",
    },
    years_in_practice: 5,
    publications_count: 1,
    claims_volume: 3500,
    rx_volume: 1200,
    patient_volume: 5000,
    affiliations: [],
    clinical_trials: [],
    call_notes: ["Short interaction, asked for samples.", "Too busy for full detail."],
    abstracts: [],
    social_posts: [],
    emails: ["Opened: Monthly Newsletter"],
    campaign_history: ["Sample Drop Program"],
    event_attendance: [],
    content_consumption: ["Webinar: Billing Codes Update"],
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
