# Project Management API — Documentation

Base URL: `http://localhost:3000`

---

## Users

### Create a User
**POST** `/users`

Request body:
```json
{ "name": "Alice", "email": "alice@example.com" }
```
Response (201):
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "..." }
```
Errors: `400` name or email missing | `409` email already in use

---

### Get All Users
**GET** `/users`

Response (200): Array of user objects.

---

## Boards

### Create a Board
**POST** `/boards`

Request body:
```json
{ "name": "My Project", "privacy": "PUBLIC" }
```
`privacy` is optional — defaults to `"PUBLIC"`. Accepted values: `"PUBLIC"`, `"PRIVATE"`.

Response (201):
```json
{ "id": 1, "name": "My Project", "privacy": "PUBLIC", "url": "/boards/1", "createdAt": "..." }
```
Errors: `400` name missing | `400` invalid privacy value

---

### Get All Boards
**GET** `/boards`

Response (200): Array of boards, each with members, lists, and cards nested inside.

---

### Get One Board
**GET** `/boards/:id`

Response (200): Board with members, lists, and cards all nested inside.

Errors: `404` board not found

---

### Update a Board
**PUT** `/boards/:id`

Request body (all fields optional):
```json
{ "name": "New Name", "privacy": "PRIVATE" }
```
Response (200): Updated board object.

Errors: `404` board not found | `400` invalid privacy value

---

### Delete a Board
**DELETE** `/boards/:id`

Response (200):
```json
{ "message": "Board deleted" }
```
Deletes all lists and cards inside the board automatically.

Errors: `404` board not found

---

### Add a User to a Board
**POST** `/boards/:id/members`

Request body:
```json
{ "userId": 1 }
```
Response (201):
```json
{ "id": 1, "userId": 1, "boardId": 1, "user": { ... } }
```
Errors: `400` userId missing | `404` board not found | `404` user not found | `409` user already a member

---

## BoardLists

### Create a List
**POST** `/boards/:boardId/lists`

Request body:
```json
{ "name": "To Do" }
```
Response (201):
```json
{ "id": 1, "name": "To Do", "boardId": 1, "createdAt": "..." }
```
Errors: `400` name missing | `404` board not found

---

### Update a List
**PUT** `/lists/:id`

Request body:
```json
{ "name": "Backlog" }
```
Response (200): Updated list object.

Errors: `400` name missing | `404` list not found

---

### Delete a List
**DELETE** `/lists/:id`

Response (200):
```json
{ "message": "List deleted" }
```
Deletes all cards inside the list automatically.

Errors: `404` list not found

---

## Cards

### Create a Card
**POST** `/lists/:listId/cards`

Request body:
```json
{ "name": "Build login page", "description": "Use React" }
```
`description` is optional. Card is unassigned by default (`assignedUserId: null`).

Response (201):
```json
{ "id": 1, "name": "Build login page", "description": "Use React", "boardListId": 1, "assignedUserId": null, "createdAt": "..." }
```
Errors: `400` name missing | `404` list not found

---

### Update a Card
**PUT** `/cards/:id`

Request body (all fields optional):
```json
{ "name": "New name", "description": "New description" }
```
Response (200): Updated card object.

Errors: `404` card not found

---

### Delete a Card
**DELETE** `/cards/:id`

Response (200):
```json
{ "message": "Card deleted" }
```
Errors: `404` card not found

---

### Assign a User to a Card
**PUT** `/cards/:id/assign`

Request body:
```json
{ "userId": 1 }
```
The user must be a member of the board this card belongs to.

Response (200): Updated card with `assignedUser` included.

Errors: `400` userId missing | `404` card not found | `404` user not found | `400` user not a board member

---

### Unassign a User from a Card
**PUT** `/cards/:id/unassign`

No request body needed.

Response (200): Updated card with `assignedUserId: null`.

Errors: `404` card not found

---

### Move a Card to Another List
**PUT** `/cards/:id/move`

Request body:
```json
{ "targetListId": 2 }
```
The target list must be in the same board as the card's current list.

Response (200): Updated card with new `boardListId`.

Errors: `400` targetListId missing | `404` card not found | `404` target list not found | `400` target list is in a different board

---

### Reorder a Card Within Its List
**PUT** `/cards/:id/reorder`

Request body:
```json
{ "afterCardId": 3 }
```
- `afterCardId: null` — move the card to the top of the list
- `afterCardId: <id>` — place the card immediately after the card with that id

Response (200): Updated card object with new `position` value.

Errors: `404` card not found | `404` reference card not found | `400` reference card is not in the same list
