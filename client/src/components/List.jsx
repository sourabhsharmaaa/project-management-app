import { useState } from 'react'
import { createCard, deleteList } from '../api'
import CardComponent from './Card'

export default function List({ list, lists, boardMembers, onBoardRefresh }) {
  const [cardName, setCardName] = useState('')
  const [cardDesc, setCardDesc] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleDeleteList = async () => {
    try {
      await deleteList(list.id)
      onBoardRefresh()
    } catch (err) {
      console.error('Failed to delete list', err)
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    await createCard(list.id, { name: cardName, description: cardDesc })
    setCardName('')
    setCardDesc('')
    setShowForm(false)
    onBoardRefresh()
  }

  return (
    <div style={{
      background: '#ebecf0',
      borderRadius: 8,
      padding: 12,
      minWidth: 280,
      maxWidth: 280,
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15 }}>{list.name}</h3>
        <button className="danger" onClick={handleDeleteList} style={{ fontSize: 11, padding: '3px 8px' }}>Delete</button>
      </div>

      {list.cards.map(card => (
        <CardComponent
          key={card.id}
          card={card}
          lists={lists}
          boardMembers={boardMembers}
          onUpdate={onBoardRefresh}
        />
      ))}

      {showForm ? (
        <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit">Add Card</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="secondary" style={{ width: '100%', marginTop: 4 }} onClick={() => setShowForm(true)}>
          + Add Card
        </button>
      )}
    </div>
  )
}
