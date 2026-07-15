function DocumentList({ documents, activeDocumentId, onSelect }) {
  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <p>No documents yet.</p>
        <p>Create a blank draft or import a file to begin.</p>
      </div>
    )
  }

  return (
    <div className="document-list">
      {documents.map((document) => {
        const roleLabel = document.access_role === 'owned' ? 'Owned' : 'Shared'
        return (
          <button
            key={document.id}
            type="button"
            className={`document-item ${document.id === activeDocumentId ? 'active' : ''}`}
            onClick={() => onSelect(document)}
          >
            <div className="document-item__row">
              <strong>{document.title}</strong>
              <span className={`role-chip ${document.access_role}`}>{roleLabel}</span>
            </div>
            <span>{document.owner?.display_name || 'Unknown owner'}</span>
            <span>{new Date(document.updated_at).toLocaleString()}</span>
          </button>
        )
      })}
    </div>
  )
}

export default DocumentList
