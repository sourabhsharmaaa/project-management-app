import { useState } from 'react'
import { updateCard, moveCard, assignUser, unassignUser, deleteCard } from '../api'

export default function Card({ card, lists, boardMembers, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(card.name)
  const [description, setDescription] = useState(card.description || '')

  const handleSave = async () => {
    try {
      const updated = await updateCard(card.id, { name, description })
      onUpdate(updated)
      setEditing(false)
    } catch (err) {
      console.error('Failed to save card', err)
    }
  }

  const handleMove = async (e) => {
    const targetListId = parseInt(e.target.value)
    if (!targetListId) return
    try {
      const updated = await moveCard(card.id, { targetListId })
      onUpdate(updated)
      e.target.value = ''
    } catch (err) {
      console.error('Failed to move card', err)
      e.target.value = ''
    }
  }

  const handleAssign = async (e) => {
    if (e.target.value === '') return
    const userId = parseInt(e.target.value)
    try {
      if (!userId) {
        const updated = await unassignUser(card.id)
        onUpdate(updated)
      } else {
        const updated = await assignUser(card.id, { userId })
        onUpdate(updated)
      }
    } catch (err) {
      console.error('Failed to assign user', err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCard(card.id)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete card', err)
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 6,
      padding: 12,
      marginBottom: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={name} onChange={e => setName(e.target.value)} />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave}>Save</button>
            <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{card.name}</div>
          {card.description && (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{card.description}</div>
          )}
          {card.assignedUser && (
            <div style={{ fontSize: 12, color: '#0052cc', marginBottom: 6 }}>
              Assigned: {card.assignedUser.name}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <button className="secondary" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>
              Edit
            </button>
            <select onChange={handleAssign} defaultValue="" style={{ fontSize: 12 }}>
              <option value="">Assign user…</option>
              {card.assignedUserId && <option value="0">Unassign</option>}
              {boardMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
            <select onChange={handleMove} defaultValue="" style={{ fontSize: 12 }}>
              <option value="">Move to list…</option>
              {lists.filter(l => l.id !== card.boardListId).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <button className="danger" style={{ fontSize: 12 }} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
