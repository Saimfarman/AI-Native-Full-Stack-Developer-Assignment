const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

function buildHeaders(userId, includeJson = true) {
  const headers = {}
  if (includeJson) {
    headers['Content-Type'] = 'application/json'
  }
  if (userId) {
    headers['X-User-Id'] = String(userId)
  }
  return headers
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users/`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

export async function fetchDocuments(userId) {
  const response = await fetch(`${API_BASE_URL}/documents/`, {
    headers: buildHeaders(userId, false),
  })
  if (!response.ok) {
    throw new Error('Failed to fetch documents')
  }
  return response.json()
}

export async function createDocument(userId, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/documents/`, {
    method: 'POST',
    headers: buildHeaders(userId),
    body: JSON.stringify({
      title: 'Untitled Document',
      content_html: '<p></p>',
      ...payload,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create document')
  }

  return response.json()
}

export async function updateDocument(userId, id, payload) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
    method: 'PATCH',
    headers: buildHeaders(userId),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to save document')
  }

  return response.json()
}

export async function deleteDocument(userId, id) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
    method: 'DELETE',
    headers: buildHeaders(userId, false),
  })

  if (!response.ok) {
    throw new Error('Failed to delete document')
  }
}
