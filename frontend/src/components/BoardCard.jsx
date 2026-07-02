import { useNavigate } from 'react-router-dom'
import { deleteBoard } from '../api'
import styles from './BoardCard.module.css'

export default function BoardCard({ board, onDelete }) {
  const navigate = useNavigate()

  const handleDeleteBoard = async (e) => {
    e.stopPropagation()
    try {
      await deleteBoard(board.id)
      onDelete(board.id)
    } catch (err) {
      console.error('Failed to delete board', err)
    }
  }

  return (
    <div className={styles.card} onClick={() => navigate(`/boards/${board.id}`)}>
      <strong className={styles.name}>{board.name}</strong>
      <span className={styles.meta}>{board.privacy}</span>
      <span className={styles.meta}>
        {board.lists?.length ?? 0} lists · {board.members?.length ?? 0} members
      </span>
      <button className={`danger ${styles.deleteBtn}`} onClick={handleDeleteBoard}>
        Delete
      </button>
    </div>
  )
}
