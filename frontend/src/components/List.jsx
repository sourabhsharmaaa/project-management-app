import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createCard, deleteList } from '../api'
import CardComponent from './Card'
import styles from './List.module.css'

export default function List({ list, boardMembers, onListDelete, onCardCreate, onCardUpdate, onCardDelete }) {
  const { setNodeRef } = useDroppable({ id: `list-${list.id}` })
  const [cardName, setCardName] = useState('')
  const [cardDesc, setCardDesc] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleDeleteList = async () => {
    try {
      await deleteList(list.id)
      onListDelete(list.id)
    } catch (err) {
      console.error('Failed to delete list', err)
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    try {
      const newCard = await createCard(list.id, { name: cardName, description: cardDesc })
      setCardName('')
      setCardDesc('')
      setShowForm(false)
      onCardCreate(list.id, newCard)
    } catch (err) {
      console.error('Failed to create card', err)
    }
  }

  return (
    <div ref={setNodeRef} className={styles.list}>
      <div className={styles.header}>
        <h3 className={styles.title}>{list.name}</h3>
        <button className={`danger ${styles.deleteBtn}`} onClick={handleDeleteList}>Delete</button>
      </div>

      <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.cardsContainer}>
          {list.cards.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              boardMembers={boardMembers}
              onCardUpdate={onCardUpdate}
              onCardDelete={onCardDelete}
            />
          ))}
        </div>
      </SortableContext>

      {showForm ? (
        <form onSubmit={handleCreateCard} className={styles.addCardForm}>
          <input
            placeholder="Card name"
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            required
            autoFocus
          />
          <input
            placeholder="Description (optional)"
            value={cardDesc}
            onChange={e => setCardDesc(e.target.value)}
          />
          <div className={styles.addCardFormButtons}>
            <button type="submit">Add Card</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className={`secondary ${styles.addCardBtn}`} onClick={() => setShowForm(true)}>
          + Add Card
        </button>
      )}
    </div>
  )
}
