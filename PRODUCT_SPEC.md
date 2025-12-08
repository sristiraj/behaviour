# Product Spec — Qualitative HCP Segmentation Application

Below is a complete specification for a web application that performs LLM-driven qualitative HCP segmentation, implementing the exact features you listed. It’s written so engineers, product, and security teams can pick it up and run with it.

1. Problem summary

Commercial teams and field leaders need fast, reliable qualitative segmentation of healthcare professionals (HCPs) — not just volume-based scores but attitudes, influence, barriers, and engagement readiness inferred from many heterogeneous data sources (call notes, publications, affiliations, CRM logs, APIs). Current rule-based systems miss nuance embedded in unstructured text (call notes, abstracts, bios). The business needs an app to ingest varied datasets, surface an ontology, let users define segmentation instructions, and run an explainable LLM-driven segmentation that produces HCP scorecards and natural-language “what-if” analysis.

2. Summary for application

A secure web application (React frontend + FastAPI backend) that:

Ingests heterogeneous HCP datasets via configurable connectors (Oracle, REST APIs, GCS, local files).

Normalizes and stores batched snapshots into an internal application database (SQLite for MVP).

Provides a UI to define segmentation instructions (rules + LLM prompts) and to create/extend an ontology of attributes.

Trains / configures LLM-based segmentation using the ontology + instructions (RAG + prompt templates + local feature-engineering).

Produces an HCP qualitative scorecard (photo, profile, influence, engagement, persona, key drivers) and a natural-language query / what-if interface for analysts and reps.

Designed for extendability (additional connectors, external DBs, enterprise auth) and enterprise security/compliance (HIPAA-safe design choices, RBAC, audit logs, encryption).

3. High level solution design
3.0 High-level components

Frontend: React (Next.js optional) authenticated app.

Backend API: FastAPI (Python) serving endpoints for connectors, ingestion, model orchestration, scoring, queries.

App DB (MVP): SQLite for normalized, batched snapshots and metadata.

Vector/index store (optional but recommended): Local FAISS or SQLite-based embeddings table for RAG (embeddings stored in files or SQLite BLOBs).

Connector/ETL layer: Connector modules that pull batch snapshots, transform into canonical HCP schema and write to SQLite.

LLM / Embeddings: Hosted LLM & embedding provider (Azure OpenAI / OpenAI / local LLM) — access controlled. Use LLM for text inference, prompt execution; use embeddings + vector search for retrieval.

Jobs / Orchestration: Scheduler (cron or lightweight job runner) to run periodic connector pulls and ingestion pipelines. For MVP simple cron + FastAPI endpoint to trigger ingestion; for production, Airflow/Celery/Kubernetes jobs.

Storage for files & uploads: Local file store (upload) and connectors to GCS.

Logging / Audit / Security: Centralized audit log table + exportable logs. RBAC and SSO.

Diagram (conceptual): Frontend ↔ FastAPI ↔ (Connectors → SQLite + Embeddings store) ↔ (LLM service & Embedding API) → Results to Frontend. Audit, RBAC, and SSO wrap around all calls.

3.1 A web app secured by login screen for authentication

Requirements

Login screen supporting: SSO (SAML/OAuth2) and local username/password (for small orgs).

Session management (JWT short-lived tokens, refresh tokens).

Role-Based Access Control (RBAC): roles = admin, ops, analyst, manager, rep. Each role has access scopes (see Security section).

MFA support optional (TOTP).

Account provisioning UI for admins.

Implementation suggestions

Use Auth library: Auth0, Keycloak, or cloud IAM (Azure AD). For MVP, FastAPI + python-jose with simple DB of users + bcrypt hashed passwords.

Frontend: React login form, token stored in secure httpOnly cookie.

3.2 A place to setup instruction for different segmentation rules

UI & Functionality

Segmentation Rule Editor page:

Rule metadata: name, description, owner, active toggle, priority.

Two rule types: Rule-based (if/then) and LLM-instruction-based (prompt + few-shot examples + expected JSON schema for output).

Option to attach training examples (call note excerpts + label).

Versioning and audit trail for rule changes.

Execution mode: preview (run rule on sample HCPs) and bulk (apply to entire store).

Rule library with search and tags.

**Run Segmentation**: A functional button to trigger the backend segmentation engine. This applies all active rules to the dataset, updating HCP profiles with new personas, scores, and confidence levels. It includes a loading state to indicate processing.

**Delete Rule**: Ability to delete a rule definition. This action requires user confirmation (e.g., "Are you sure? This will invalidate existing results") and should prompt the user to re-run segmentation to ensure data consistency.

Data model (Rule)

{
  "id": "seg_rule_001",
  "name": "RWE Safety-Oriented Persona",
  "type": "llm_instruction",
  "instruction": "Read the call notes and publications. If HCP shows preference for real-world evidence over RCTs, set persona='RWE-focused'...",
  "few_shot_examples": [...],
  "output_schema": {"persona":"string", "confidence":"float", "rationale":"string"}
}

3.3 A frontend app using react and integrated with backend using FastAPI

Frontend

Tech: React + TypeScript, React Router, component library (MUI or Tailwind UI), swagger client or generated API client from FastAPI OpenAPI spec.

Pages:

Login

Dashboard (ingestion status, recent runs)

Connectors (add/edit)

Data Schema & Ontology

Segmentation Rules (editor)

Scorecard / HCP viewer

Natural Language Query (chat-like)

Admin (users, RBAC, audit)

Components: DataTable, Map (if desired), ScoreBadge, PersonaChip, DocumentViewer (call notes), FileUploader.

Backend

FastAPI endpoints described later (API surface).

Authentication middleware for JWT/SSO.

Connector scheduler endpoints.

Segmentation service endpoints (run rule, preview, bulk apply).

NLQ endpoint (query processing + RAG call).

3.4 Data connection management (connectors)

Provide a Connectors UI to add and manage connectors. Connector types to support (MVP list you requested):

Supported connectors (MVP)

a. Oracle

Connection config: host, port, service_name/SID, username (or service account), auth type (username/password or key), SSL options, schema, query or table name, incremental column (e.g., last_updated).

Driver: cx_Oracle or oracledb Python client.

Connector config example:

{
  "type": "oracle",
  "name": "HospitalAffiliations",
  "config": {
    "host":"oracle.company.net",
    "port":1521,
    "service":"ORCL",
    "user":"readonly",
    "auth_type":"password",
    "password":"<encrypted>"
  },
  "query":"SELECT hcp_npi, hospital, role, last_modified FROM hospital_affiliations WHERE last_modified > :last_run"
}


b. REST API (supports PAT token / OAuth2 / JWT)

Config: base_url, auth_type (pat | oauth2 | jwt), token, client_id/secret for OAuth, scopes, endpoints, pagination strategy, rate limits.

Example: PubMed API, partner data APIs.

Support response JSON → mapping to canonical model.

c. GCS bucket (two auth options)

Service account: JSON key file OR Workload Identity.

Access token: short-lived OAuth token stored in connector config.

Config: bucket name, prefix, file patterns, file format (CSV/JSON/NDJSON/Parquet).

Ability to read files in batch (list + download).

d. Local file upload / local files

Support CSV/JSON/Parquet, with a required schema mapping step (map columns to canonical fields).

Upload UI with a preview and sample row mapping.

Option to save uploaded file to the app’s local file store or to move to GCS.

Connector capabilities

Schema mapping UI: map source fields to the canonical HCP model. Save mappings.

Incremental pull support: last_modified column or watermark (if available).

Batch pull only: connectors run on schedule and create snapshot tables in SQLite. (No streaming in MVP.)

Connector extensibility: factory pattern to add new connectors (MySQL, Postgres, Snowflake) with minimal code.

3.5 All these connection should be batch pull to application internal storage which can be sqlite.

Flow

Connector runs (manual trigger or scheduled).

Connector downloads data (full or incremental).

Extraction → Transformation (apply mapping, clean names, normalize addresses, parse dates) → Load to SQLite (app schema).

Store raw source snapshot table + normalized canonical table + connector metadata table (last_run, row_counts, errors).

After load, optional post-processing: text normalization, language detection, embedding creation.

SQLite schema (high-level)

sources (id, name, type, config, last_run, status)

raw_<source> tables per connector (JSON blob or structured fields)

hcps canonical table (npi, first_name, last_name, specialty, practice_name, primary_address, affiliations, metadata_json)

documents (doc_id, hcp_npi, doc_type, text, source, created_at) — call notes, abstracts, bios.

ontology (term, type, mapped_fields)

segmentation_results (hcp_npi, rule_id, output_json, confidence, run_id, created_at)

audit_logs (user, action, target, timestamp, details)

Why SQLite?

Lightweight, zero-ops for MVP, portable.

Works well for single-instance deployments and demos.

For scale, replace with Postgres / PostGIS + vector DB.

3.6 There should be option to extend to add new data store connection like mysql db, oracle db etc.

Design

Connector interface base class with methods: connect(), fetch(last_run), transform(mapping), close().

Register connector types via configuration; new connectors implemented as subclasses.

Provide template & docs for adding mysql, postgres, snowflake, etc.

UI: "Add connector type" with code scaffolding or plugin mechanism for enterprise.

3.7 Option to create ontology with all the imported dataset.

Purpose

Canonical vocabulary that maps heterogeneous source fields and terms into standardized attributes used by segmentation rules and LLM prompts (e.g., map “cardiology”/“cardiologist”/“cardio” → specialty: Cardiology).

Features

Ontology Editor UI:

Terms & synonyms

Taxonomy (disease area → specialty → sub-specialty)

Attribute classes (influence, engagement, barrier, persona tag)

Field mappings (maps source fields or tokens to ontology terms)

Export / import (JSON-LD or simple JSON)

Versioning & lineage

Auto-suggestion: propose terms by scanning imported documents (NLP: entity extraction with spaCy) to seed ontology.

Ontology persistence: ontology table in SQLite and downloadable JSON.

Example ontology snippet

{
  "term":"RWE-focused",
  "type":"persona_trait",
  "synonyms":["real-world evidence", "RWE", "registry data"],
  "mapped_fields":["documents:contains(RWE)", "publications:has_term('registry')"]
}

3.8 Use instruction and ontology for training AI for segmentation.

Approach (MVP & production)

MVP strategy (no model fine-tuning required):

Use LLM-inference with prompt + few-shot examples + ontology context (RAG pattern). For each HCP:

Retrieve top-k relevant documents from documents table via vector search (if embeddings exist) or text search.

Construct system prompt: include ontology summary, segmentation rule instruction, and retrieved context (max tokens limit).

Call LLM to produce structured JSON (persona, scores, rationale).

Store results in segmentation_results.

Optional advanced strategies:

Fine-tune a lightweight model on labeled segmentation examples (if allowed by provider).

Use a separate lightweight classifier trained on LLM-labeled examples for fast offline scoring (bootstrap).

Maintain human-in-the-loop labeling to build ground truth and retrain models.

Prompt engineering

Always include: canonical ontology snapshot, rule-specific instruction, few-shot examples, expected JSON schema, and constraints (confidence between 0–1).

Example prompt (short):

System: You are a pharma commercial analytics assistant.
Context: Ontology terms: ["RWE-focused","KOL","Skeptic"]...
Instruction: Read the following HCP documents and assign persona and rationale. Return JSON: {persona, confidence, rationale}.
Examples: [...]
Documents: <doc1> <doc2> ...


Output validation

Validate LLM output against output_schema. If invalid, run up to N retries or flag for manual review.

3.9 A score card screen which shows HCP photo, name, and profile details

UI: HCP Scorecard

Header: photo (if available), full name, NPI, specialty, location, practice.

Score widgets (with badges):

Influence (High/Med/Low + numeric 0–100)

Engagement readiness (Hot/Warm/Cold + numeric)

Persona (e.g., RWE-focused / Skeptic / Early adopter)

Channel preference (In-person / Virtual / Email)

Key drivers (short bullet points): top 3 textual reasons from LLM (rationale).

Documents carousel (call notes, publications, CRM notes) with timestamps + source. Click to view full doc.

Timeline: changes to persona/score over time (runs).

Actions: suggested Next Best Actions (send RWE deck, schedule MSL meeting), button to create task in CRM (link to Veeva / Salesforce).

Audit note: which rule & run created the current score, plus confidence and link to raw LLM output.

Backend data for scorecard

segmentation_results (most recent), documents, hcps.

3.10 A natural language querying screen that allows users to query profile data and allow user to perform what if on qualitative profile.

UI: NLQ Screen

Chat-like interface: user enters query (examples: “Show me cardiologists in NY who are RWE-focused and under-visited”, “What would happen to persona if we add RWE outreach campaign?”).

Query modes:

Exploratory: RAG + LLM answers (summaries + lists).

What-if: simulate changes to ontology/rules or data and re-run rule in sandbox on selected HCPs (no write to production).

Response elements:

Natural-language answer + supporting evidence (document snippets) with source links.

Structured result (list of HCPs) with export CSV option.

“Show rationale” button (full LLM reasoning).

Safety: For anything affecting production (reassigning persona, updating rule), require confirmation and a privileged role.

Backend behavior

NLQ handler:

Parse query, detect intent (semantic parsing).

If retrieval needed, perform vector search on documents.

Compose prompt with retrieved context + ontology + user query.

Call LLM and post-process into answer + source citations.

If “what-if,” spin up sandbox run: apply modified instruction on selected HCPs and return differences.

4. Security & Compliance
4.1 HIPAA-safe architecture (no PHI expected but possible)

Principle: Design for HIPAA-safe operations from day one: encryption, access controls, logging, minimal retention, and data segregation.

Network: VPC-only deployment in cloud, private subnets for DB and connectors.

Data minimization: Avoid storing patient-level PHI. If ingesting claims/EHR data, require data de-identification pipeline before ingestion (hashing, tokenization, remove names/SSNs).

Business Associate Agreement (BAA): If using cloud provider for LLM or storage, obtain BAA where needed (Azure, AWS with healthcare add-ons).

Access controls: enforce least privilege via RBAC.

Audit trail: immutable logs of data access and segmentation changes.

4.2 SOC 2

Design systems to support SOC 2 controls: change management, incident response, monitoring, logging, encryption, vendor management, periodic security reviews.

Keep evidence for access reviews, penetration testing, and policies.

4.3 Role-Based Access Control (Ops, Rep, Manager)

Roles & capabilities:

admin — full system, user management, connector config.

ops — connectors, data ingestion, ontology management.

analyst / manager — create segmentation rules, run sandbox, view results, export lists.

rep — view scorecards for assigned HCPs, NLQ for their territory, limited exports.

Enforce RBAC both in frontend UI and backend endpoints. Token scopes validated on each API call.

4.4 Audit logs for zoning changes

Maintain audit_logs table with: user_id, action_type (create_rule, edit_rule, run_ingest, update_connector), target_id, previous_state (optional), new_state, timestamp, ip.

Provide Admin UI for log search and export.

Log LLM outputs (hash or pointer) but redact sensitive text unless privileged role.

4.5 Data encryption in transit + rest

TLS 1.2+ for all HTTP endpoints.

Database encryption at rest (SQLite file encrypted using OS disk encryption for MVP; for production, use encrypted managed DB).

Secrets management: store connector credentials in secret manager (Vault, AWS Secrets Manager, Azure Key Vault), not in DB.

Encryption keys managed by enterprise KMS for production.

Additional operational details
A. API surface (selected endpoints)

POST /api/connectors — create connector

GET /api/connectors — list

POST /api/connectors/{id}/run — trigger ingestion

GET /api/hcps/{npi} — get HCP profile & scorecard

POST /api/rules — create segmentation rule

POST /api/rules/{id}/run — run rule (preview/bulk)

POST /api/nlq — natural language query

GET /api/segmentation_results?hcp_npi=... — results history

POST /api/uploads — file upload

B. Data validation & QA

Use JSON schema validation for LLM outputs.

Manual review queue for low-confidence outputs (< threshold).

Metrics to track: % valid outputs, avg confidence, number of manual corrections, coverage across HCP population.

C. Testing & Acceptance Criteria

Connector test harness with sample source data and end-to-end ingestion verification.

UI: Create rule → run preview on at least 10 HCPs → valid JSON output for all.

Security: Pen test baseline, RBAC enforcement verified, SSO login flows tested.

D. Scalability & Production Roadmap

MVP: single-instance FastAPI + SQLite + optional FAISS local.

Prod: move to Postgres + PostGIS, vector DB (Pinecone / Weaviate / FAISS on S3), Kubernetes, distributed worker for ingestion and embedding creation.

Add auditing, monitoring (Prometheus/Grafana), SSO enforced, integration with enterprise CRM (Veeva, Salesforce).

Example artifacts
Example canonical HCP JSON (canonical table)
{
  "npi":"1234567890",
  "first_name":"Alex",
  "last_name":"Smith",
  "specialty":"Cardiology",
  "subspecialty":["Interventional Cardiology"],
  "practice_name":"HeartCare Associates",
  "primary_address":{"street":"...","city":"Raleigh","state":"NC","zip":"27601"},
  "affiliations":[{"hospital":"St. Mary's", "role":"Attending"}],
  "metadata": {
    "years_in_practice": 12,
    "publications_count": 14,
    "last_call_date":"2025-11-01"
  }
}

Example LLM output JSON (segmentation_results.output_json)
{
  "persona": "RWE-focused",
  "influence":"High",
  "engagement_readiness":"Warm",
  "channel_preference":"Email",
  "confidence":0.87,
  "key_drivers":[
    "Authored registry study in 2023",
    "Repeatedly asked for real-world safety evidence in call notes",
    "Affiliated to major tertiary hospital"
  ],
  "recommended_next_action":"Send RWE safety deck + schedule MSL consult"
}

Example prompt template (for a rule)
System: You are an expert commercial analytics agent.
Ontology: <small JSON of key terms and mapping>
Instruction: Using the ontology and the following documents for HCP {npi}, determine persona, influence (High/Med/Low), engagement readiness (Hot/Warm/Cold), channel_preference, confidence, reasons. Output valid JSON matching schema.
Few_shot_examples: [...]
Documents: <doc1> <doc2> ...
