# CircularLoop REST API

Base URL locally: `http://localhost:5000/api`

All responses are JSON. Errors use `{ "success": false, "message": "..." }`. The frontend Axios client reads the backend error message. All endpoints query or modify Neo4j.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend and Neo4j connectivity |
| GET | `/dashboard` | Aggregated node counts |
| GET | `/items` | List items; optional `search` and `category` query parameters |
| GET | `/items/:id` | Item, components/materials and eligible actions |
| GET | `/items/:id/components` | Components with connected materials |
| GET | `/items/:id/lifecycle` | Eligible actions, facilities and next actions |
| POST | `/recommendations` | Rule-based graph recommendations |
| GET | `/graph/:itemId` | Multi-hop graph nodes and edges for React Flow |
| GET | `/actions` | List actions and associated facilities |
| GET | `/actions/:id` | One action and associated facilities |
| POST | `/actions` | Create a custom action node |
| PUT | `/actions/:id` | Update an action node |
| DELETE | `/actions/:id` | Delete a custom action and its direct relationships |
| GET | `/facilities` | List sample facilities and linked action names |

## Endpoint details

### GET /health
Returns HTTP 200 when Neo4j connectivity succeeds, otherwise HTTP 503.
```json
{"success":true,"backend":"ok","database":"connected"}
```

### GET /items?search=laptop&category=Computing
Search and category are optional. Returns `{ success, items: [...] }`.

### GET /items/:id
Returns `{ success, item, components, actions }`. Each component includes its connected materials. Each action may include one associated facility summary.

### GET /items/:id/components
Returns `{ success, components }`, where each component includes `materials`.

### GET /items/:id/lifecycle
Returns `{ success, actions }`. Action entries contain action properties, `facilities` and `nextActions`.

### POST /recommendations
Request:
```json
{"itemId":"item-laptop","condition":"damaged"}
```
Allowed conditions: `working`, `damaged`, `poor`, `non-functional`, `unknown`. Returns `recommendations` containing action properties, condition fit, components, materials, facilities and a multi-hop `pathway`. The backend ranks actions using a transparent rule that matches the supplied condition with action types, then impact and estimated cost. This is not AI diagnosis.

### GET /graph/:itemId
Returns `{ success, nodes, edges }`. Nodes contain `id`, `label`, `name`, and `properties`. Edges contain `id`, `source`, `target` and relationship `type`. The graph is fetched from Neo4j, not generated from frontend fixture data.

### GET /actions
Returns action nodes and connected facilities. Seeded actions include `custom:false`.

### GET /actions/:id
Returns the requested action and its connected facilities. Unknown IDs return 404.

### POST /actions
Request:
```json
{
  "name":"Community Device Check",
  "description":"Inspect a device and identify safe next steps.",
  "difficulty":"Easy",
  "estimated_cost":"INR 0-200",
  "impact":"Medium"
}
```
All fields are required. Difficulty must be `Easy`, `Moderate` or `Hard`. Impact must be `Low`, `Medium` or `High`. Successful creation returns HTTP 201 and the new action.

### PUT /actions/:id
Accepts the same required fields as POST. Updates the matching action and returns it. Unknown IDs return 404.

### DELETE /actions/:id
Deletes only custom actions (`custom:true`). Seeded actions are protected. `DETACH DELETE` removes the selected custom node and its direct relationships, not unrelated graph nodes. Returns 404 for seeded or unknown IDs.

### GET /facilities
Returns `{ success, facilities }`. Each facility includes the names of actions connected through `AVAILABLE_AT`. These records are sample facilities, not verified real-world service providers.

## Operational behavior

- Cypher parameters are used for user-provided values.
- Database sessions are created per operation and closed in `finally`.
- The Neo4j driver is shared by the backend process.
- Request validation errors return HTTP 400, unknown resources return HTTP 404, database/server errors return HTTP 500, and failed health connectivity returns HTTP 503.
