import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
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

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return

    const activeCard = board.lists.flatMap(l => l.cards).find(c => c.id === active.id)
    if (!activeCard) return

    const overListId = String(over.id).startsWith('list-')
      ? parseInt(String(over.id).replace('list-', ''))
      : board.lists.find(l => l.cards.some(c => c.id === over.id))?.id

    if (!overListId) return

    if (activeCard.boardListId !== overListId) {
      await moveCard(activeCard.id, { targetListId: overListId })
    } else {
      const afterCardId = String(over.id).startsWith('list-') ? null : over.id
      await reorderCard(activeCard.id, { afterCardId })
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
        <form onSubmit={handleCreateList} style={{ display: 'flex', gap: 8 }}>
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
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8 }}>
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
      </DndContext>
    </div>
  )
}
