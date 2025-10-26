## Matching Service API

Base URL: `http://localhost:8080`

### Health
- **GET** `/` → 200, `{ "message": "Matching service is running" }`
- **GET** `/health` → 200, `{ "message": "Matching service is running" }`

### Request Match
- **POST** `/match/request`
- **Body** (application/json):
```json
{
  "topics": ["algorithms", "graphs"],
  "difficulty": "easy",
  "userId": "u123"
}
```
- **200 Responses**:
  - Waiting:
  ```json
  { "status": "waiting" }
  ```
  - Matched:
  ```json
  {
    "matchId": "match:algorithms,graphs:1727282828123456000",
    "partnerId": "u456",
    "status": "matched"
  }
  ```

### Check Match Status (by matchId)
- **GET** `/match/status/:id`
- **Path Params**:
  - `id`: the `matchId` returned from Request Match
- **200 Response** (when found):
```json
{
  "matchId": "match:algorithms,graphs:1727282828123456000",
  "partnerId": "u456",
  "status": "matched"
}
```
- **404 Response** (when not found):
```json
{ "error": "not found" }
```

### Check Match Status By User
- **GET** `/match/status/by-user/:userId`
- **Path Params**:
  - `userId`: the user identifier used in Request Match
- **200 Response**:
  - Matched:
  ```json
  { "status": 2, "matchId": "match:algorithms,graphs:1727282828123456000" }
  ```
  - Waiting:
  ```json
  { "status": 1, "queue": "queue:algorithms,graphs:easy", "position": 0 }
  ```
  - Not Found:
  ```json
  { "status": 0 }
  ```

### Cancel Match (by matchId)
- **DELETE** `/match/cancel/:id`
- **200 Response**:
```json
{ "status": "cancelled" }
```

### Cancel Match (by userId)
- **DELETE** `/match/cancel/by-user/:userId`
- **200 Response** (state varies):
```json
{ "status": "cancelled_matched", "matchId": "match:..." }
```
```json
{ "status": "cancelled_waiting", "matchId": null }
```
```json
{ "status": "not_found", "matchId": null }
```

### Notes
- Matches are stored temporarily and may expire after a short TTL.
- No authentication is enforced in this demo service.

### Curl Examples
```bash
# Request a match with multiple topics
curl -s -X POST http://localhost:8080/match/request \
  -H 'Content-Type: application/json' \
  -d '{"topics":["algorithms","graphs"],"difficulty":"easy","userId":"u1"}'

# Check match status by matchId
curl -s http://localhost:8080/match/status/<matchId>

# Check match status by userId
curl -s http://localhost:8080/match/status/by-user/<userId>

# Cancel a match by matchId
curl -s -X DELETE http://localhost:8080/match/cancel/<matchId>

# Cancel a match by userId (works when waiting or matched)
curl -s -X DELETE http://localhost:8080/match/cancel/by-user/<userId>
```