# Ajaia Collaborative Document Editor

A lightweight full stack document editor built with Django, React, and PostgreSQL.

## Current scope

- Create new documents
- Rename documents
- Edit document content in the browser
- Save and reopen documents
- Basic rich text formatting: bold, italic, underline, headings, bulleted lists, numbered lists
- Import `.txt` and `.md` files into new editable documents
- Share documents between seeded demo users with owned/shared visibility in the UI

## Architecture

- React is split into small components for the user switcher, document list, editor toolbar, document metadata, and sharing panel.
- Django owns persistence and access rules, with seeded demo users representing the lightweight sharing model.
- Document content is stored as HTML so formatting survives refresh and reopening.
- File import converts supported `.txt` and `.md` files into structured HTML before saving them as new documents.

## Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
$env:DJANGO_USE_SQLITE='1'
python manage.py test documents.tests
python manage.py migrate
python manage.py runserver
```

Set the PostgreSQL environment variables in `backend/.env` or your shell before running the server.
For production or review deployments, keep `DJANGO_USE_SQLITE` unset so the app uses PostgreSQL.
The backend uses seeded demo users and stores document ownership and sharing in PostgreSQL.

## Frontend

```bash
cd frontend
npm install
npm test
npm run dev
```

Set `VITE_API_BASE_URL` in `frontend/.env` if your API is not running at `http://localhost:8000/api`.

The file import workflow supports `.txt` and `.md` files only.

## Deployment

Preferred review path: deploy the Django API on a managed Postgres-backed host and the Vite frontend on a static host such as Vercel or Netlify, then point `VITE_API_BASE_URL` at the live API.

## AI-native workflow note

- AI tools used: GitHub Copilot in VS Code, plus local code-generation and refactoring support inside this workspace.
- AI sped up: initial project scaffolding, the React editor shell, the file import parser, and the sharing model/API wiring.
- AI output changed or rejected: the first pass used a monolithic editor component; I split it into smaller components and added test-only SQLite support so the project is easier to validate.
- Verification: I ran the frontend production build, Django system checks, backend unit tests on SQLite, and checked the user-facing import/share flows for supported file types and access behavior.
