import { useEffect, useState } from 'react'
import { getBoards, createBoard } from '../api'
import BoardCard from '../components/BoardCard'
import styles from './Home.module.css'

export default function Home() {
  const [boards, setBoards] = useState([])
  const [boardName, setBoardName] = useState('')
  const [boardPrivacy, setBoardPrivacy] = useState('PUBLIC')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getBoards().then(setBoards).catch(console.error)
  }, [])

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    try {
      const newBoard = await createBoard({ name: boardName, privacy: boardPrivacy })
      setBoards([...boards, newBoard])
      setBoardName('')
    } catch (err) {
      setErrorMessage(err.error || 'Failed to create board')
    }
  }

  return (
    <div className={styles.container}>
      <h1>Boards</h1>

      <form onSubmit={handleCreateBoard} className={styles.createForm}>
        <input
          placeholder="Board name"
          value={boardName}
          onChange={e => setBoardName(e.target.value)}
          className={styles.nameInput}
          required
        />
        <select value={boardPrivacy} onChange={e => setBoardPrivacy(e.target.value)} className={styles.privacySelect}>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <button type="submit">Create Board</button>
      </form>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.boardGrid}>
        {boards.map(board => (
          <BoardCard
            key={board.id}
            board={board}
            onDelete={(deletedBoardId) => setBoards(boards.filter(b => b.id !== deletedBoardId))}
          />
        ))}
      </div>
    </div>
  )
}
