# Product Spec — Qualitative HCP Segmentation Application

## 1. Problem Summary

Commercial teams and field leaders need fast, reliable qualitative segmentation of healthcare professionals (HCPs) — not just volume-based scores but attitudes, influence, barriers, and engagement readiness inferred from many heterogeneous data sources (call notes, publications, affiliations, CRM logs, APIs). Current rule-based systems miss nuance embedded in unstructured text. The business needs an app to ingest varied datasets, surface an ontology, let users define segmentation instructions, and run an explainable LLM-driven segmentation.

## 2. Solution Summary

A secure web application (React frontend + FastAPI backend mock) that:
*   Ingests heterogeneous HCP datasets via configurable connectors.
*   Normalizes and stores batched snapshots.
*   Provides a UI to define segmentation instructions (rules + LLM prompts).
*   Produces an HCP qualitative scorecard (persona, influence, key drivers).
*   Offers a natural-language "what-if" analysis interface.

## 3. High-Level Design

### 3.1 Components
*   **Frontend**: React + Tailwind CSS (Glass UI).
*   **AI Engine**: Google Gemini API (via `@google/genai` SDK).
*   **Storage**: In-memory / LocalStorage for MVP (Simulating SQLite).
*   **Connectors**: Oracle, REST API, GCS, Local File.

### 3.2 User Roles
*   **Admin**: System config, user management.
*   **Analyst**: Define rules, run bulk segmentation.
*   **Rep**: View scorecards, run field queries.

## 4. Key Features

### 4.1 Authentication & Entitlements
*   Login screen (Simulated).
*   RBAC (Role-Based Access Control).
*   Geographic entitlements (Region/Country/Territory) managed via Groups.

### 4.2 Data Connectors
*   Support for Oracle, REST API, GCS, and Local Files.
*   **Source Definition**:
    *   **SQL (Oracle)**: Define extraction via SQL Query (`SELECT * FROM...`).
    *   **REST API**: Define response structure via JSON Sample to guide mapping.
    *   **File**: Auto-detect headers from file uploads.
*   **Management**: Create, Update, and Delete connectors.

### 4.3 Data Model & Mapping
*   **Data Model UI**: A dedicated interface to define the internal Canonical Data Model (Entities and Attributes, e.g., HCP Profile).
*   **Inbound Mapping**:
    *   Map source fields (extracted from SQL aliases, JSON keys, or File headers) to Canonical Attributes.
    *   Support different mapping configurations per connector.
*   **Data Linking**:
    *   Define relationships between data sources.
    *   **Composite Keys**: Support linking multiple attributes (e.g., Join on `NPI` AND `VisitDate`).
    *   Support identifying primary vs. secondary data sources.

### 4.4 Segmentation Rules
*   **Rule Types**:
    *   **LLM Instruction**: Natural language prompt for the AI to interpret unstructured text.
    *   **Rule-Based**: Deterministic Logic (e.g., `IF visits > 5 THEN...`).
*   **Editor**: UI to create, edit, and test rules.

### 4.5 HCP Scorecard
*   Visual dashboard for a single HCP.
*   **Metrics**: Influence, Engagement Readiness, Persona.
*   **Rationale**: LLM-generated explanation for the assigned segment.
*   **Radar Chart**: Visual representation of qualitative attributes.

### 4.6 Natural Language Query (NLQ)
*   Chat interface for analysts/reps.
*   "What-If" capabilities (e.g., "How would the segment change if we increased virtual visits?").
*   Persona customization via System Settings.

## 5. Security & Compliance
*   **HIPAA**: Design for minimal PHI retention.
*   **Audit**: Logging of all rule changes and data access.
*   **Encryption**: TLS 1.2+ for transit (simulated).

## 6. Future Roadmap
*   Migration to Postgres/Vector DB.
*   Real-time streaming connectors.
*   Integration with Veeva CRM.