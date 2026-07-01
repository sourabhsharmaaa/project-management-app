import { useEffect, useState } from 'react'
import { getBoards, createBoard } from '../api'
import BoardCard from '../components/BoardCard'

export default function Home() {
  const [boards, setBoards] = useState([])
  const [name, setName] = useState('')
  const [privacy, setPrivacy] = useState('PUBLIC')
  const [error, setError] = useState('')

  useEffect(() => {
    getBoards().then(setBoards).catch(console.error)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const board = await createBoard({ name, privacy })
      setBoards([...boards, board])
      setName('')
    } catch (err) {
      setError(err.error || 'Failed to create board')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 24 }}>Boards</h1>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          placeholder="Board name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ maxWidth: 240 }}
          required
        />
        <select value={privacy} onChange={e => setPrivacy(e.target.value)} style={{ width: 120 }}>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <button type="submit">Create Board</button>
      </form>

      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {boards.map(b => (
          <BoardCard
            key={b.id}
            board={b}
            onDelete={(id) => setBoards(boards.filter(x => x.id !== id))}
          />
        ))}
      </div>
    </div>
  )
}
