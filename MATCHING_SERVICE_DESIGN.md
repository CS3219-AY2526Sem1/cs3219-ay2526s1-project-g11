# Matching Service Design Decisions

## Matching Algorithm and Criteria

### Algorithm: FIFO Queue-Based Matching with Topic and Difficulty Constraints

**Matching Criteria:**
- **Topics**: Users are matched based on shared programming topics (e.g., arrays, graphs, dynamic programming)
- **Difficulty Level**: Users must request the same difficulty (easy, medium, hard)
- **Queue Organization**: Redis sorted sets organized by `queue:{topics}:{difficulty}` with timestamp-based scoring

**Design Justification:**
- **FIFO (First-In-First-Out)**: Ensures fairness - users who wait longer are matched first, preventing starvation
- **Redis Sorted Sets**: Provides O(log N) performance for enqueue/dequeue operations and natural timestamp-based ordering
- **Topic Normalization**: Topics are sorted alphabetically before creating queue keys, ensuring `["array", "graph"]` and `["graph", "array"]` match to the same queue
- **Simple & Scalable**: Pure FIFO matching is predictable, easy to debug, and scales horizontally since Redis handles concurrent access

**Smart Question Selection:**
- **Progressive Sampling** (10 → 50 → 100 questions): Balances efficiency with thoroughness - starts with small samples for quick results, increases if no suitable question found
- **Multi-Phase Filtering**:
  - Phase 1: Prioritizes questions neither user has completed (optimal learning experience)
  - Phase 2: Allows questions only one user completed (acceptable fallback)
  - Phase 3: Returns `no_suitable_question` status (graceful degradation)
- **Justification**: This approach maximizes the chance both users work on fresh problems while gracefully handling edge cases when question pools are exhausted

---

## Edge Case Handling

### 1. No Matches Available
- **Scenario**: User requests match but no other user is in the same topic/difficulty queue
- **Handling**: Return `{"status": "waiting"}` and keep user in queue with 10-minute TTL
- **User Experience**: Frontend can poll periodically or display "waiting for partner" UI
- **Justification**: Non-blocking approach allows users to cancel if wait time is too long

### 2. Simultaneous Requests
- **Scenario**: Multiple users request matches at the same time for the same queue
- **Handling**: Redis atomic operations (`ZPopMin`) ensure exactly 2 users are popped per match, no race conditions
- **Justification**: Redis guarantees atomicity - even with concurrent requests, users are matched exactly once

### 3. No Suitable Questions
- **Scenario**: Both users have completed all available questions for the selected topic/difficulty
- **Handling**: Return `{"status": "no_suitable_question"}` with empty questionId
- **User Experience**: Frontend prompts users to select different topics/difficulty or accept a repeated question
- **Justification**: Failing gracefully is better than throwing errors - gives users control over next steps

### 4. User Cancellation
- **Scenario**: User cancels match request while waiting or after being matched
- **Handling**:
  - If waiting: Remove from queue via `ZRem`
  - If matched: Delete match record and user mappings
  - Return status code indicating cancellation state (`cancelled_waiting` or `cancelled_matched`)
- **Justification**: Clean state management prevents orphaned records and allows users to re-enter matching flow

### 5. Service Unavailability
- **Scenario**: User-service or question-service is down during matching
- **Handling**:
  - HTTP client timeouts (10-15 seconds)
  - If user-service fails: Proceed with empty completed questions list (all questions eligible)
  - If question-service fails: Try next sample size, eventually return `no_suitable_question`
- **Justification**: Degraded functionality is better than complete failure - users can still match even if question filtering doesn't work

### 6. TTL Expiration
- **Scenario**: Match data expires from Redis after 10 minutes
- **Handling**: Return 404/not found when querying expired matches
- **Justification**: TTL prevents stale data accumulation; 10 minutes is reasonable for users to poll and join collaboration session

---

## Integration with Collaboration Service

### Current Architecture

**Matching Service Responsibilities:**
1. Pair users based on topic/difficulty
2. Select appropriate question for the pair
3. Store match data (matchId, partnerId, questionId) in Redis with 10-minute TTL
4. Provide polling endpoints for match status

### Integration Design

**Data Handoff:**
- Matching service returns `matchId`, `partnerId`, and `questionId` in the response
- Collaboration service can retrieve full match details via `GET /match/status/:matchId`
- Match record in Redis contains all necessary context:
  ```json
  {
    "partnerId": "user456",
    "questionId": "question-uuid-123"
  }
  ```

**Collaboration Service Flow:**
1. Frontend receives match response with `matchId` and `questionId`
2. Frontend redirects both users to collaboration service with `matchId` as parameter
3. Collaboration service queries matching service to get match details
4. Collaboration service fetches question details from question-service using `questionId`
5. Collaboration service creates WebSocket/real-time session for both users

### Design Justification

**Loose Coupling:**
- Matching service doesn't know about collaboration sessions - only stores match data
- Collaboration service owns session lifecycle (WebSocket connections, code execution, etc.)
- Services communicate via REST APIs, not direct database access
- **Benefit**: Each service can be deployed, scaled, and updated independently

**Single Source of Truth:**
- Matching service is authoritative for "who should work together on what question"
- Collaboration service is authoritative for "active coding sessions"
- User service is authoritative for "completed questions history"
- **Benefit**: Clear ownership boundaries prevent data inconsistencies

**Idempotency:**
- Match records are stored with deterministic IDs (`match:{topics}:{timestamp}`)
- Multiple calls to get match status return consistent results
- **Benefit**: Handles network retries and duplicate requests gracefully

**Scalability Considerations:**
- Redis-backed matching allows horizontal scaling (multiple matching service instances)
- Stateless REST API design - no in-memory state
- TTL-based cleanup reduces manual maintenance
- **Benefit**: Can handle high concurrent matching requests

**Future Enhancements:**
- Webhook/event-driven integration: Matching service publishes `match.created` events, collaboration service subscribes
- This would eliminate polling and enable real-time notifications
- Current REST polling is simpler to implement and debug for MVP
