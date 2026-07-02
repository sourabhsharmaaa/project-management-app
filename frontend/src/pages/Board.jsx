import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import { getBoard, createList, addMember, getUsers, moveCard, reorderCard } from '../api'
import List from '../components/List'
import styles from './Board.module.css'

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState(null)
  const [listName, setListName] = useState('')
  const [users, setUsers] = useState([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [activeCard, setActiveCard] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    getBoard(id).then(setBoard).catch(console.error)
    getUsers().then(setUsers).catch(console.error)
  }, [id])

  const handleCreateList = async (e) => {
    e.preventDefault()
    try {
      const newList = await createList(id, { name: listName })
      setListName('')
      setBoard(prev => ({ ...prev, lists: [...prev.lists, { ...newList, cards: [] }] }))
    } catch (err) {
      console.error('Failed to create list', err)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      const newMember = await addMember(id, { userId: parseInt(selectedUserId) })
      setSelectedUserId('')
      setShowMemberForm(false)
      setBoard(prev => ({ ...prev, members: [...prev.members, newMember] }))
    } catch (err) {
      console.error('Failed to add member', err)
    }
  }

  const handleListDelete = (listId) => {
    setBoard(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== listId) }))
  }

  const handleCardCreate = (listId, card) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, card] } : l)
    }))
  }

  const handleCardUpdate = (updatedCard) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => ({
        ...l,
        cards: l.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
      }))
    }))
  }

  const handleCardDelete = (cardId) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => ({ ...l, cards: l.cards.filter(c => c.id !== cardId) }))
    }))
  }

  const handleDragStart = ({ active }) => {
    const card = board.lists.flatMap(l => l.cards).find(c => c.id === Number(active.id))
    setActiveCard(card || null)
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null)
    if (!over || active.id === over.id) return

    const activeId = Number(active.id)
    const isDroppedOnList = String(over.id).startsWith('list-')

    const sourceList = board.lists.find(l => l.cards.some(c => c.id === activeId))
    if (!sourceList) return

    const targetListId = isDroppedOnList
      ? parseInt(String(over.id).replace('list-', ''))
      : board.lists.find(l => l.cards.some(c => c.id === Number(over.id)))?.id

    if (!targetListId) return

    if (sourceList.id !== targetListId) {
      const updatedCard = await moveCard(activeId, { targetListId })
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => {
          if (l.id === sourceList.id) return { ...l, cards: l.cards.filter(c => c.id !== activeId) }
          if (l.id === targetListId) return { ...l, cards: [...l.cards, updatedCard].sort((a, b) => a.position - b.position) }
          return l
        })
      }))
    } else {
      let afterCardId
      if (isDroppedOnList) {
        afterCardId = null
      } else {
        const activeIndex = sourceList.cards.findIndex(c => c.id === activeId)
        const overIndex = sourceList.cards.findIndex(c => c.id === Number(over.id))
        afterCardId = activeIndex > overIndex
          ? (overIndex > 0 ? sourceList.cards[overIndex - 1].id : null)
          : Number(over.id)
      }

      const updatedCard = await reorderCard(activeId, { afterCardId })
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => {
          if (l.id !== targetListId) return l
          return { ...l, cards: l.cards.map(c => c.id === updatedCard.id ? updatedCard : c).sort((a, b) => a.position - b.position) }
        })
      }))
    }
  }

  if (!board) return <div className={styles.container}>Loading…</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className="secondary" onClick={() => navigate('/')}>← Boards</button>
        <h1 className={styles.title}>{board.name}</h1>
        <span className={styles.privacy}>{board.privacy}</span>
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleCreateList} className={styles.inlineForm}>
          <input
            placeholder="New list name"
            value={listName}
            onChange={e => setListName(e.target.value)}
            className={styles.listNameInput}
            required
          />
          <button type="submit">Add List</button>
        </form>

        {showMemberForm ? (
          <form onSubmit={handleAddMember} className={styles.inlineForm}>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className={styles.memberSelect}
              required
            >
              <option value="">Select user…</option>
              {users.filter(u => !board.members.find(m => m.userId === u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button type="submit">Add</button>
            <button type="button" className="secondary" onClick={() => setShowMemberForm(false)}>Cancel</button>
          </form>
        ) : (
          <button className="secondary" onClick={() => setShowMemberForm(true)}>+ Add Member</button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.listsContainer}>
          {board.lists.map(list => (
            <List
              key={list.id}
              list={list}
              boardMembers={board.members}
              onListDelete={handleListDelete}
              onCardCreate={handleCardCreate}
              onCardUpdate={handleCardUpdate}
              onCardDelete={handleCardDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className={styles.dragOverlayCard}>
              <div>{activeCard.name}</div>
              {activeCard.description && (
                <div className={styles.dragOverlayDescription}>{activeCard.description}</div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
