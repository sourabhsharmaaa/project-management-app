const cardsRepository = require('./cards.repository')
const listsRepository = require('../lists/lists.repository')
const boardsRepository = require('../boards/boards.repository')
const usersRepository = require('../users/users.repository')

const createCard = async (listId, name, description) => {
  if (!name) throw { status: 400, message: 'name is required' }
  const list = await listsRepository.findById(listId)
  if (!list) throw { status: 404, message: 'List not found' }
  const lastCardInList = await cardsRepository.findLastInList(listId)
  const newPosition = lastCardInList ? lastCardInList.position + 1 : 1.0
  return cardsRepository.create({ name, description: description || null, boardListId: listId, position: newPosition })
}

const updateCard = async (cardId, name, description) => {
  const card = await cardsRepository.findById(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  return cardsRepository.update(cardId, {
    ...(name && { name }),
    ...(description !== undefined && { description })
  })
}

const deleteCard = async (cardId) => {
  const card = await cardsRepository.findById(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  await cardsRepository.remove(cardId)
}

const assignUser = async (cardId, userId) => {
  if (!userId) throw { status: 400, message: 'userId is required' }
  const card = await cardsRepository.findByIdWithList(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  const user = await usersRepository.findById(userId)
  if (!user) throw { status: 404, message: 'User not found' }
  const boardMembership = await boardsRepository.findMember(userId, card.boardList.boardId)
  if (!boardMembership) throw { status: 400, message: 'User is not a member of this board' }
  return cardsRepository.updateWithUser(cardId, { assignedUserId: userId })
}

const unassignUser = async (cardId) => {
  const card = await cardsRepository.findById(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  return cardsRepository.update(cardId, { assignedUserId: null })
}

const moveCard = async (cardId, targetListId) => {
  if (!targetListId) throw { status: 400, message: 'targetListId is required' }
  const card = await cardsRepository.findByIdWithList(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }
  const targetList = await listsRepository.findById(targetListId)
  if (!targetList) throw { status: 404, message: 'Target list not found' }
  if (targetList.boardId !== card.boardList.boardId) {
    throw { status: 400, message: 'Cannot move card to a list in a different board' }
  }
  const lastCardInTargetList = await cardsRepository.findLastInList(targetListId)
  const newPosition = lastCardInTargetList ? lastCardInTargetList.position + 1 : 1.0
  return cardsRepository.update(cardId, { boardListId: targetListId, position: newPosition })
}

const reorderCard = async (cardId, afterCardId) => {
  const card = await cardsRepository.findById(cardId)
  if (!card) throw { status: 404, message: 'Card not found' }

  let newPosition

  if (afterCardId === null || afterCardId === undefined) {
    const firstCardInList = await cardsRepository.findFirstInList(card.boardListId, cardId)
    newPosition = firstCardInList ? firstCardInList.position / 2 : 1.0
  } else {
    const afterCard = await cardsRepository.findById(parseInt(afterCardId))
    if (!afterCard) throw { status: 404, message: 'Reference card not found' }
    if (afterCard.boardListId !== card.boardListId) {
      throw { status: 400, message: 'Reference card is not in the same list' }
    }
    const nextCard = await cardsRepository.findNextAfterPosition(card.boardListId, afterCard.position, cardId)
    newPosition = nextCard ? (afterCard.position + nextCard.position) / 2 : afterCard.position + 1
  }

  return cardsRepository.update(cardId, { position: newPosition })
}

module.exports = { createCard, updateCard, deleteCard, assignUser, unassignUser, moveCard, reorderCard }
