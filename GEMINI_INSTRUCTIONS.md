# Gemini Interaction & Development Rules

This document serves as the ground truth for AI interaction logic and development standards for the Behaviour application. It allows future iterations (and the Gemini agent itself) to maintain consistency and avoid regression.

## 1. Development & Code Standards

*   **Immutable Core Structure**: Do not alter the fundamental project structure (single-level flat directory for this environment) unless explicitly requested.
*   **Environment Variables**: Always rely on `process.env.API_KEY`. Do not mock API keys in code or commit credentials.
*   **Gemini SDK Usage**:
    *   Always use `ai.models.generateContent` with the specified model (e.g., `gemini-2.5-flash`).
    *   Do NOT use deprecated methods like `getGenerativeModel`.
    *   Use specific model versions (e.g., `gemini-2.5-flash`, `gemini-3-pro-preview`) based on task complexity.
    *   When using `responseSchema`, ensure it is valid JSON Schema compatible with the SDK types.
*   **State Management**: For this React MVP, prefer local state (`useState`) or simple Context. Do not introduce Redux or other heavy libraries unless the app complexity necessitates it.
*   **UI/UX**:
    *   Maintain the "Glass UI" aesthetic (translucency, blurs, rounded corners).
    *   Ensure all new components are responsive (Tailwind classes for mobile/desktop).
    *   Use `lucide-react` for iconography.
    *   **Connector Rules**:
        *   **Oracle DB**: Must always allow setting TNS details (Host, Port, SID) and Credentials (User, Password). Support for JDBC URL is optional but secondary to TNS.
        *   **GCS**: Must support Authentication Method selection (System, Service Account, Token).

## 2. Research & Plan Phase Guidelines

*   **UI Logic Verification**: When implementing multi-state UI components (e.g., Tabs, Mode Toggles, Modals), **you must explicitely verify that all conditional rendering paths are implemented**.
    *   *Example Error*: Creating a state variable `mode='webhook'` but failing to add `{mode === 'webhook' && <WebhookUI />}` in the JSX.
    *   *Correction*: Review the `render()` or `return()` block to ensure every state value has a corresponding visual output.
*   **Context Verification**: Before generating code, verify existing file contents. Do not overwrite features (like the Settings tab or NLQ history) when adding new ones.
*   **Incremental Updates**: When asked to add a feature (e.g., "Add user entitlements"), extend existing types (`User`, `Group`) rather than creating parallel structures.
*   **Mock vs. Real**: Clearly distinguish between mock data (for UI dev) and real API calls. If an API key is missing, fallback gracefully to mock data but log a warning.

## 3. Application AI Persona (System Prompting)

When configuring the AI agent *within* the application (the NLQ or Segmentation features), follow these persona rules:

*   **Role**: "Expert Commercial Analytics Agent".
*   **Tone**: Professional, data-driven, concise, and objective.
*   **Safety**:
    *   Do not invent medical data.
    *   Do not reveal PII (Personally Identifiable Information) unless it is part of the simulated dataset explicitly provided in the context.
    *   If confidence is low (< 0.5), explicitly state "Low Confidence" in the rationale.
*   **Context Awareness**: The agent must always respect the provided `Ontology` and `Rules`. If a rule says "RWE-focused requires registry keyword", the agent must not assign that persona without evidence of that keyword.

## 4. Error Handling & Recovery

*   **API Failures**: If the Gemini API fails (429, 500), the UI should show a user-friendly toast/notification, not a white screen.
*   **Validation**: Validate all JSON outputs from the LLM using the requested schema. If parsing fails, trigger a retry or fallback to a default "Unsegmented" state.