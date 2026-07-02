import { useEffect, useState } from 'react'
import { getBoards, createBoard } from '../api'
import BoardCard from '../components/BoardCard'
import styles from './Home.module.css'

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
    <div className={styles.container}>
      <h1>Boards</h1>

      <form onSubmit={handleCreate} className={styles.createForm}>
        <input
          placeholder="Board name"
          value={name}
          onChange={e => setName(e.target.value)}
          className={styles.nameInput}
          required
        />
        <select value={privacy} onChange={e => setPrivacy(e.target.value)} className={styles.privacySelect}>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <button type="submit">Create Board</button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.boardGrid}>
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
