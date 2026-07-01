import { useNavigate } from 'react-router-dom'

export default function BoardCard({ board }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/boards/${board.id}`)}
      style={{
        background: 'white',
        borderRadius: 8,
        padding: 20,
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        minHeight: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      <strong style={{ fontSize: 16 }}>{board.name}</strong>
      <span style={{ fontSize: 12, color: '#666' }}>{board.privacy}</span>
      <span style={{ fontSize: 12, color: '#666' }}>
        {board.lists?.length ?? 0} lists · {board.members?.length ?? 0} members
      </span>
    </div>
  )
}
