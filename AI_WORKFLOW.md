# AI-Native Workflow Note

## AI Tools Used
- GitHub Copilot in VS Code for inline suggestions.
- Local code-generation and refactoring support within the workspace via AI assistants.

## How AI Accelerated the Project
- **Project Scaffolding:** Quickly generated the boilerplate for both the Django backend and Vite/React frontend.
- **Component Creation:** Scaffolding the React editor shell, including the `contentEditable` behavior and toolbar actions.
- **Data Parsing:** Writing the file import parser that converts `.txt` and `.md` file contents into structured HTML.
- **Sharing Model:** Designing and wiring the sharing model, access rules, and API endpoints for seeded users.
- **Debugging:** Fixing complex logic bugs, such as correcting the state derived from shared users so the application properly filters available users to share documents with.

## Iterations and Refinement
- **Refactoring:** The initial AI pass used a large monolithic editor component. This was manually and AI-assisted refactored into smaller, modular components (`SharingPanel`, `EditorToolbar`, `DocumentMeta`, etc.) to improve maintainability.
- **Testing Capabilities:** Test-only SQLite support was added for easier validation, whereas the initial pass was strictly PostgreSQL-only.
- **Logic Correction:** AI was used to fix a sharing logic bug where the frontend only allowed sharing with users who were *already* shared, adjusting it to check against the global user list instead.

## Verification
- Ran the frontend production build.
- Ran Django system checks and backend unit tests on SQLite.
- Verified user-facing import and share flows in the browser for supported file types and correct access behavior.
