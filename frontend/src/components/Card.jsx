import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateCard, assignUser, unassignUser, deleteCard } from '../api'
import styles from './Card.module.css'

export default function Card({ card, boardMembers, onCardUpdate, onCardDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(card.name)
  const [description, setDescription] = useState(card.description || '')

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleSave = async () => {
    try {
      const updated = await updateCard(card.id, { name, description })
      setEditing(false)
      onCardUpdate(updated)
    } catch (err) {
      console.error('Failed to save card', err)
    }
  }

  const handleAssign = async (e) => {
    if (e.target.value === '') return
    const userId = parseInt(e.target.value)
    try {
      const updated = userId
        ? await assignUser(card.id, { userId })
        : await unassignUser(card.id)
      onCardUpdate(updated)
    } catch (err) {
      console.error('Failed to assign user', err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCard(card.id)
      onCardDelete(card.id)
    } catch (err) {
      console.error('Failed to delete card', err)
    }
  }

  return (
    <div ref={setNodeRef} style={dragStyle} className={styles.card} {...attributes} {...listeners}>
      {editing ? (
        <div className={styles.editForm}>
          <input value={name} onChange={e => setName(e.target.value)} />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
          />
          <div className={styles.editButtons}>
            <button onClick={handleSave}>Save</button>
            <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.cardName}>{card.name}</div>
          {card.description && (
            <div className={styles.description}>{card.description}</div>
          )}
          {card.assignedUser && (
            <div className={styles.assignedUser}>Assigned: {card.assignedUser.name}</div>
          )}
          <div className={styles.actions}>
            <button className={`secondary ${styles.actionBtn}`} onClick={() => setEditing(true)}>Edit</button>
            <select onChange={handleAssign} defaultValue="" className={styles.actionBtn}>
              <option value="">Assign user…</option>
              {card.assignedUserId && <option value="0">Unassign</option>}
              {boardMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
            <button className={`danger ${styles.actionBtn}`} onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  )
}
