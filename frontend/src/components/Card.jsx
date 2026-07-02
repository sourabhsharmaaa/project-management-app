import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateCard, assignUser, unassignUser, deleteCard } from '../api'
import styles from './Card.module.css'

export default function Card({ card, boardMembers, onCardUpdate, onCardDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(card.name)
  const [editedDescription, setEditedDescription] = useState(card.description || '')

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  const handleSaveCard = async () => {
    try {
      const updatedCard = await updateCard(card.id, { name: editedName, description: editedDescription })
      setIsEditing(false)
      onCardUpdate(updatedCard)
    } catch (err) {
      console.error('Failed to save card', err)
    }
  }

  const handleAssignUser = async (e) => {
    if (e.target.value === '') return
    const selectedUserId = parseInt(e.target.value)
    try {
      const updatedCard = selectedUserId
        ? await assignUser(card.id, { userId: selectedUserId })
        : await unassignUser(card.id)
      onCardUpdate(updatedCard)
    } catch (err) {
      console.error('Failed to assign user', err)
    }
  }

  const handleDeleteCard = async () => {
    try {
      await deleteCard(card.id)
      onCardDelete(card.id)
    } catch (err) {
      console.error('Failed to delete card', err)
    }
  }

  return (
    <div ref={setNodeRef} style={dragStyle} className={styles.card} {...attributes} {...listeners}>
      {isEditing ? (
        <div className={styles.editForm}>
          <input value={editedName} onChange={e => setEditedName(e.target.value)} />
          <textarea
            value={editedDescription}
            onChange={e => setEditedDescription(e.target.value)}
            rows={2}
            placeholder="Description (optional)"
          />
          <div className={styles.editButtons}>
            <button onClick={handleSaveCard}>Save</button>
            <button className="secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.cardName}>{card.name}</div>
          {card.description && (
            <div className={styles.description}>{card.description}</div>
          )}
          <div className={styles.actions}>
            <button className={`secondary ${styles.actionBtn}`} onClick={() => setIsEditing(true)}>Edit</button>
            <select onChange={handleAssignUser} value={card.assignedUserId || ''} className={styles.actionBtn}>
              <option value="">Assign user…</option>
              {card.assignedUserId && <option value="0">Unassign</option>}
              {boardMembers.map(member => (
                <option key={member.userId} value={member.userId}>{member.user.name}</option>
              ))}
            </select>
            <button className={`danger ${styles.actionBtn}`} onClick={handleDeleteCard}>Delete</button>
          </div>
        </>
      )}
    </div>
  )
}
