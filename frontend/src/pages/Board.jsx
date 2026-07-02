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

  const refresh = () => getBoard(id).then(setBoard).catch(console.error)

  useEffect(() => {
    refresh()
    getUsers().then(setUsers).catch(console.error)
  }, [id])

  const handleCreateList = async (e) => {
    e.preventDefault()
    try {
      await createList(id, { name: listName })
      setListName('')
      refresh()
    } catch (err) {
      console.error('Failed to create list', err)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await addMember(id, { userId: parseInt(selectedUserId) })
      setSelectedUserId('')
      setShowMemberForm(false)
      refresh()
    } catch (err) {
      console.error('Failed to add member', err)
    }
  }

  const handleDragStart = ({ active }) => {
    const card = board.lists.flatMap(l => l.cards).find(c => c.id === Number(active.id))
    setActiveCard(card || null)
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null)
    if (!over || active.id === over.id) return

    const draggedCard = board.lists.flatMap(l => l.cards).find(c => c.id === Number(active.id))
    if (!draggedCard) return

    const isOverList = String(over.id).startsWith('list-')
    const overListId = isOverList
      ? parseInt(String(over.id).replace('list-', ''))
      : board.lists.find(l => l.cards.some(c => c.id === Number(over.id)))?.id

    if (!overListId) return

    if (draggedCard.boardListId !== overListId) {
      await moveCard(draggedCard.id, { targetListId: overListId })
    } else {
      const afterCardId = isOverList ? null : Number(over.id)
      await reorderCard(draggedCard.id, { afterCardId })
    }
    refresh()
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
              onBoardRefresh={refresh}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className={styles.dragOverlayCard}>
              <div>{activeCard.name}</div>
              {activeCard.description && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{activeCard.description}</div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
