# Architecture Note

Ajaia is a lightweight, full-stack collaborative document editor.

## Tech Stack
- **Frontend**: React (built with Vite)
- **Backend**: Django (Python)
- **Database**: PostgreSQL (with SQLite support for local testing)

## Frontend Architecture
The React application is modularly structured, split into small, focused components:
- **`AppShell`**: The main container managing state and data fetching.
- **`UserSwitcher`**: Handles changing the active demo user to test different permissions.
- **`DocumentList`**: Displays the list of available documents.
- **`EditorToolbar`**: Provides rich text formatting actions.
- **`DocumentMeta`**: Shows document metadata.
- **`SharingPanel`**: Manages document access control and sharing between users.

Document content is managed as raw HTML. The `contentEditable` div acts as the primary editor, ensuring that rich text formatting is preserved across sessions and page reloads. A file import utility converts `.txt` and `.md` files into structured HTML before sending the payload to the backend.

## Backend Architecture
The Django API serves as the source of truth for persistence and access rules.
- **Data Model**: Stores documents with a title, HTML content, an owner, and a many-to-many relationship for shared users.
- **Access Control**: Built-in permission checks ensure that only owners can delete or share documents, while shared users can only edit the content.
- **Demo Users**: The system is seeded with demo users to easily test the sharing and collaboration model without a complex authentication system.

## Deployment Strategy
- **API**: Deployed on a managed host with a PostgreSQL database.
- **Frontend**: Deployed as a static site (e.g., on Vercel or Netlify) with `VITE_API_BASE_URL` pointing to the live API.
