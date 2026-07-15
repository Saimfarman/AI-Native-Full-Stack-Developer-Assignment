import { useEffect, useMemo, useRef, useState } from 'react'

import {
  createDocument as apiCreateDocument,
  deleteDocument as apiDeleteDocument,
  fetchDocuments as apiFetchDocuments,
  fetchUsers as apiFetchUsers,
  updateDocument as apiUpdateDocument,
} from './api'
import DocumentList from './components/DocumentList'
import DocumentMeta from './components/DocumentMeta'
import EditorToolbar from './components/EditorToolbar'
import SharingPanel from './components/SharingPanel'
import UserSwitcher from './components/UserSwitcher'
import { fileNameWithoutExtension, textToHtml } from './utils/documentImport'

const STORAGE_KEY = 'ajaia.current-demo-user-id'

const defaultDocument = {
  id: null,
  title: 'Untitled Document',
  content_html: '<h1>Start writing</h1><p>Use the toolbar to format text, then save your work.</p>',
}

const toolbarActions = [
  { label: 'Bold', command: 'bold' },
  { label: 'Italic', command: 'italic' },
  { label: 'Underline', command: 'underline' },
  { label: 'H1', command: 'formatBlock', value: 'h1' },
  { label: 'H2', command: 'formatBlock', value: 'h2' },
  { label: 'Bullets', command: 'insertUnorderedList' },
  { label: 'Numbered', command: 'insertOrderedList' },
]

function AppShell() {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [documents, setDocuments] = useState([])
  const [activeDocumentId, setActiveDocumentId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('Untitled Document')
  const [draftHtml, setDraftHtml] = useState(defaultDocument.content_html)
  const [sharedUserIds, setSharedUserIds] = useState([])
  const [status, setStatus] = useState('Loading workspace...')
  const [saving, setSaving] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const editorRef = useRef(null)
  const autosaveTimer = useRef(null)
  const fileInputRef = useRef(null)

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [users, currentUserId],
  )

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) || null,
    [documents, activeDocumentId],
  )

  const sharedUsers = useMemo(() => {
    if (!activeDocument) {
      return []
    }
    return users.filter((user) => user.id !== currentUserId)
  }, [activeDocument, currentUserId, users])

  const canEdit = Boolean(activeDocument?.can_edit)
  const canShare = Boolean(activeDocument?.can_share)

  useEffect(() => {
    void loadUsers()

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== draftHtml) {
      editorRef.current.innerHTML = draftHtml
    }
  }, [draftHtml])

  useEffect(() => {
    if (currentUserId !== null) {
      window.localStorage.setItem(STORAGE_KEY, String(currentUserId))
      void loadDocuments()
    }
  }, [currentUserId])

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const data = await apiFetchUsers()
      setUsers(data)
      const savedUserId = Number(window.localStorage.getItem(STORAGE_KEY))
      const initialUser = data.find((user) => user.id === savedUserId) || data[0] || null
      setCurrentUserId(initialUser ? initialUser.id : null)
      if (initialUser) {
        setStatus(`Viewing as ${initialUser.display_name}`)
      } else {
        setStatus('No demo users were found.')
      }
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  async function loadDocuments(nextActiveId = null) {
    if (!currentUserId) {
      return
    }

    try {
      const data = await apiFetchDocuments(currentUserId)
      setDocuments(data)

      if (data.length === 0) {
        setActiveDocumentId(null)
        setDraftTitle(defaultDocument.title)
        setDraftHtml(defaultDocument.content_html)
        setSharedUserIds([])
        setStatus('Create your first document to begin.')
        return
      }

      const selected = nextActiveId
        ? data.find((document) => document.id === nextActiveId) || data[0]
        : data.find((document) => document.id === activeDocumentId) || data[0]

      openDocument(selected)
    } catch (error) {
      setStatus(error.message)
    }
  }

  function openDocument(document) {
    setActiveDocumentId(document.id)
    setDraftTitle(document.title)
    setDraftHtml(document.content_html || '')
    setSharedUserIds(document.shared_user_ids || [])
    setStatus(`Editing ${document.title}`)
  }

  async function createDocumentWithPayload(payload) {
    if (!currentUserId) {
      return
    }

    setSaving(true)
    setStatus('Creating document...')
    try {
      const created = await apiCreateDocument(currentUserId, payload)
      await loadDocuments(created.id)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function createDocument() {
    await createDocumentWithPayload({
      title: 'Untitled Document',
      content_html: '<p></p>',
    })
  }

  async function importFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['txt', 'md'].includes(fileExtension)) {
      setStatus('Only .txt and .md files are supported for import.')
      return
    }

    try {
      const text = await file.text()
      const html = textToHtml(text)
      await createDocumentWithPayload({
        title: fileNameWithoutExtension(file.name) || 'Imported document',
        content_html: html,
      })
    } catch (error) {
      setStatus(error.message)
    }
  }

  function queueAutosave(nextTitle, nextHtml, nextSharedUserIds = sharedUserIds) {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
    }
    autosaveTimer.current = setTimeout(() => {
      void saveDocument(nextTitle, nextHtml, false, nextSharedUserIds)
    }, 600)
  }

  async function saveDocument(
    nextTitle = draftTitle,
    nextHtml = draftHtml,
    showSuccess = true,
    nextSharedUserIds = sharedUserIds,
  ) {
    if (activeDocumentId === null || !currentUserId) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: nextTitle,
        content_html: nextHtml,
      }

      if (canShare) {
        payload.shared_user_ids = nextSharedUserIds
      }

      const updated = await apiUpdateDocument(currentUserId, activeDocumentId, payload)
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === updated.id ? updated : document,
        ),
      )
      setSharedUserIds(updated.shared_user_ids || nextSharedUserIds)
      setStatus(showSuccess ? 'Document saved.' : 'Saving...')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeDocument() {
    if (!activeDocument || !currentUserId) {
      return
    }

    const confirmed = window.confirm(`Delete "${activeDocument.title}"? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    setSaving(true)
    setStatus('Deleting document...')
    try {
      await apiDeleteDocument(currentUserId, activeDocumentId)
      await loadDocuments()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setSaving(false)
    }
  }

  function handleTitleChange(event) {
    const nextTitle = event.target.value
    setDraftTitle(nextTitle)
    queueAutosave(nextTitle, draftHtml, sharedUserIds)
  }

  function handleEditorInput(event) {
    const nextHtml = event.currentTarget.innerHTML
    setDraftHtml(nextHtml)
    queueAutosave(draftTitle, nextHtml, sharedUserIds)
  }

  function applyFormat(command, value = null) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    const nextHtml = editorRef.current?.innerHTML || ''
    setDraftHtml(nextHtml)
    queueAutosave(draftTitle, nextHtml, sharedUserIds)
  }

  function toggleSharedUser(userId) {
    if (!canShare) {
      return
    }

    setSharedUserIds((currentSharedUserIds) => {
      const nextSharedUserIds = currentSharedUserIds.includes(userId)
        ? currentSharedUserIds.filter((sharedUserId) => sharedUserId !== userId)
        : [...currentSharedUserIds, userId]

      queueAutosave(draftTitle, draftHtml, nextSharedUserIds)
      return nextSharedUserIds
    })
  }

  function handleUserChange(event) {
    setCurrentUserId(Number(event.target.value))
    setActiveDocumentId(null)
    setStatus('Switching workspace view...')
  }

  function openImporter() {
    fileInputRef.current?.click()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Ajaia Docs</p>
          <h1>Collaborative writing, trimmed to the core workflow.</h1>
          <p className="sidebar-copy">
            Create a document, import a .txt or .md file, share it with a teammate, and reopen it from the list.
          </p>
        </div>

        <UserSwitcher users={users} currentUserId={currentUserId} disabled={loadingUsers} onChange={handleUserChange} />

        <button className="primary-button" onClick={createDocument} disabled={saving || !currentUserId}>
          New document
        </button>
        <button className="ghost-button" onClick={openImporter} disabled={saving || !currentUserId}>
          Import .txt/.md
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          onChange={importFile}
          hidden
        />
        <p className="support-note">Supported file types: .txt and .md. Imports create a new editable document.</p>

        <DocumentList documents={documents} activeDocumentId={activeDocumentId} onSelect={openDocument} />
      </aside>

      <main className="editor-pane">
        <div className="editor-header">
          <div>
            <p className="eyebrow">Document editor</p>
            <h2>{activeDocument ? 'Editing document' : 'No document open'}</h2>
          </div>
          <div className="status-pill">{saving ? 'Saving...' : status}</div>
        </div>

        <label className="title-field">
          <span>Document title</span>
          <input
            type="text"
            value={draftTitle}
            onChange={handleTitleChange}
            disabled={!canEdit}
            placeholder="Untitled Document"
          />
        </label>

        <DocumentMeta document={activeDocument} />

        <EditorToolbar
          actions={toolbarActions}
          canEdit={canEdit}
          onAction={applyFormat}
          onSave={() => saveDocument()}
          onDelete={removeDocument}
        />

        <SharingPanel
          document={activeDocument}
          canShare={canShare}
          sharedUsers={sharedUsers}
          sharedUserIds={sharedUserIds}
          onToggleSharedUser={toggleSharedUser}
        />

        <div
          ref={editorRef}
          className="document-editor"
          contentEditable={canEdit}
          suppressContentEditableWarning
          onInput={handleEditorInput}
          role="textbox"
          aria-multiline="true"
        />

        {!canEdit ? (
          <div className="placeholder-panel">
            <p>{activeDocument ? 'You only have read access to this document.' : 'Create a new document to start editing.'}</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default AppShell
