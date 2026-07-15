function SharingPanel({ document, canShare, sharedUsers, sharedUserIds, onToggleSharedUser }) {
  return (
    <section className="sharing-panel">
      <div className="sharing-panel__header">
        <div>
          <p className="eyebrow">Sharing</p>
          <h3>{canShare ? 'Grant access' : 'Sharing details'}</h3>
        </div>
        {document ? <span className={`role-chip ${document.access_role}`}>{document.access_role}</span> : null}
      </div>

      {document ? (
        canShare ? (
          <>
            <p className="support-note">
              Shared users can edit the document content. Only the owner can change access.
            </p>
            <div className="sharing-list">
              {sharedUsers.length === 0 ? (
                <p className="empty-sharing-state">No other users available to share with.</p>
              ) : (
                sharedUsers.map((user) => (
                  <label key={user.id} className="share-checkbox">
                    <input
                      type="checkbox"
                      checked={sharedUserIds.includes(user.id)}
                      onChange={() => onToggleSharedUser(user.id)}
                    />
                    <div>
                      <strong>{user.display_name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="support-note">
            This document was shared by {document.owner?.display_name || 'another user'}.
          </p>
        )
      ) : (
        <p className="support-note">Open or create a document to manage sharing.</p>
      )}
    </section>
  )
}

export default SharingPanel
