function UserSwitcher({ users, currentUserId, disabled, onChange }) {
  return (
    <label className="user-switcher">
      <span>Viewing as</span>
      <select value={currentUserId ?? ''} onChange={onChange} disabled={disabled || users.length === 0}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.display_name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default UserSwitcher
