function EditorToolbar({ actions, canEdit, onAction, onSave, onDelete }) {
  return (
    <div className="toolbar" aria-label="Formatting toolbar">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onAction(action.command, action.value)}
          disabled={!canEdit}
        >
          {action.label}
        </button>
      ))}
      <button type="button" className="ghost-button" onClick={onSave} disabled={!canEdit}>
        Save now
      </button>
      <button type="button" className="ghost-button danger-button" onClick={onDelete} disabled={!canEdit}>
        Delete
      </button>
    </div>
  )
}

export default EditorToolbar
