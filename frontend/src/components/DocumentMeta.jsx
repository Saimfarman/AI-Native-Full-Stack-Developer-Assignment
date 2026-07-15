function DocumentMeta({ document }) {
  if (!document) {
    return null
  }

  return (
    <div className="document-meta">
      <div>
        <span>Owner</span>
        <strong>{document.owner?.display_name || 'Unknown owner'}</strong>
      </div>
      <div>
        <span>Access</span>
        <strong>{document.access_role === 'owned' ? 'Owned by you' : 'Shared with you'}</strong>
      </div>
    </div>
  )
}

export default DocumentMeta
