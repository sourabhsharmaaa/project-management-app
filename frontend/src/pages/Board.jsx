import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBoard, createList, addMember, getUsers } from '../api'
import List from '../components/List'

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState(null)
  const [listName, setListName] = useState('')
  const [users, setUsers] = useState([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

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

  if (!board) return <div style={{ padding: 32 }}>Loading…</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="secondary" onClick={() => navigate('/')}>← Boards</button>
        <h1 style={{ fontSize: 22 }}>{board.name}</h1>
        <span style={{ fontSize: 13, color: '#666' }}>{board.privacy}</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleCreateList} style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="New list name"
            value={listName}
            onChange={e => setListName(e.target.value)}
            style={{ width: 180 }}
            required
          />
          <button type="submit">Add List</button>
        </form>

        {showMemberForm ? (
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8 }}>
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={{ width: 160 }} required>
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

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
        {board.lists.map(list => (
          <List
            key={list.id}
            list={list}
            lists={board.lists}
            boardMembers={board.members}
            onBoardRefresh={refresh}
          />
        ))}
      </div>
    </div>
  )
}
