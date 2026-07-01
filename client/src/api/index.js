const BASE = 'http://localhost:3000'

const json = (res) => {
  if (!res.ok) return res.json().then(e => Promise.reject(e))
  return res.json()
}

const post = (url, data) =>
  fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(json)

const put = (url, data) =>
  fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(json)

const del = (url) =>
  fetch(`${BASE}${url}`, { method: 'DELETE' }).then(json)

const get = (url) => fetch(`${BASE}${url}`).then(json)

export const getBoards = () => get('/boards')
export const createBoard = (data) => post('/boards', data)
export const getBoard = (id) => get(`/boards/${id}`)
export const createList = (boardId, data) => post(`/boards/${boardId}/lists`, data)
export const createCard = (listId, data) => post(`/lists/${listId}/cards`, data)
export const updateCard = (id, data) => put(`/cards/${id}`, data)
export const moveCard = (id, data) => put(`/cards/${id}/move`, data)
export const reorderCard = (id, data) => put(`/cards/${id}/reorder`, data)
export const assignUser = (id, data) => put(`/cards/${id}/assign`, data)
export const unassignUser = (id) => put(`/cards/${id}/unassign`, {})
export const getUsers = () => get('/users')
export const addMember = (boardId, data) => post(`/boards/${boardId}/members`, data)
