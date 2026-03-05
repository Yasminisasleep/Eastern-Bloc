# Kulto: Backlog

Prioritization: MoSCoW. Estimation in story points (1 = trivial, 2 = simple, 3 = medium, 5 = complex, 8 = very complex).

---

## MVP: MUST (v1.0.0)

### US-01: User Registration (Sprint 2)

**As a** new user, **I want to** create an account, **so that** I can access the platform and receive match suggestions.

Acceptance criteria:
- Registration form: first name, last name, email, password, date of birth, city
- Email must be unique (409 if already taken)
- Password policy: min 8 characters, 1 uppercase, 1 digit
- Account created with `USER` role by default
- API returns a JWT on successful registration
- Client-side validation on the React form

Points: 3

---

### US-02: Login / Authentication (Sprint 2)

**As a** registered user, **I want to** log in with my email and password, **so that** I can access my personalized features.

Acceptance criteria:
- Login via email + password, returns JWT
- Protected endpoints return 401 without a valid token, 403 without proper role
- Frontend stores the token and sends it in the `Authorization` header
- Logout clears the token client-side

Points: 3

---

### US-03: Create a Cultural Event (Sprint 1)

**As an** admin, **I want to** manually create a cultural event, **so that** I can populate the catalog.

Acceptance criteria:
- `POST /api/events` protected (ADMIN role only)
- Required fields: title, description, category (cinema, concert, exhibition, theatre, festival), date, time, venue, city
- Optional fields: image URL, price, external link, tags
- Stored with status `ACTIVE`
- Returns 201 with created event
- Validation: date must be in the future, required fields non-empty

Points: 3

---

### US-04: List Events with Filtering (Sprint 1)

**As a** user, **I want to** browse upcoming events and filter by category, date, and city, **so that** I can find outings that interest me.

Acceptance criteria:
- `GET /api/events` returns a paginated list (page, size, sorted by date)
- Filters: category, city, date range, tags
- Only `ACTIVE` events with future dates are returned
- Text search on title (query param `q`)
- Public endpoint (no auth required)
- Frontend displays a grid/list with interactive filters

Points: 5

---

### US-05: Event Detail View (Sprint 1)

**As a** user, **I want to** view the full details of an event, **so that** I can decide whether to attend.

Acceptance criteria:
- `GET /api/events/{id}` returns all event fields
- Detail page: title, description, image, date/time, venue, category, tags, price
- 404 if not found
- Public endpoint

Points: 2

---

### US-06: Update / Delete an Event (Sprint 1)

**As an** admin, **I want to** edit or remove an event, **so that** the catalog stays up to date.

Acceptance criteria:
- `PUT /api/events/{id}` updates an event (ADMIN role)
- `DELETE /api/events/{id}` performs a soft delete (status → `CANCELLED`)
- 404 if not found
- Cancelled events no longer appear in public listings

Points: 2

---

### US-07: Cultural Preferences (Sprint 2)

**As a** logged-in user, **I want to** set my cultural preferences, **so that** the platform can suggest relevant matches.

Acceptance criteria:
- `PUT /api/users/{id}/preferences` to create/update preferences
- Preferences include: preferred categories (multi-select), interest tags, geographic radius
- On save, a message is published to the `user-preferences-updated` Kafka topic
- Frontend with selection form (checkboxes, chips)
- JWT-based ownership check: users can only modify their own preferences

Points: 5

---

### US-08: Event Ingestion via Kafka (Sprint 1)

**As an** external partner system, **I want to** publish events into `events-ingestion`, **so that** they are automatically added to the Kulto catalog.

Acceptance criteria:
- Kafka consumer listens on `events-ingestion`
- JSON message: title, description, category, date, venue, city, source
- Consumer validates schema and persists to DB
- Invalid messages are logged (dead-letter or error log)
- `POST /api/events/ingest` endpoint to simulate a Kafka message (for testing/demo)
- Ingested events carry a `source` field identifying the partner

Points: 8

---

### US-09: User Matching (Sprint 2)

**As a** user, **I want to** be matched with someone who shares my cultural taste and has a compatible event nearby, **so that** I can find someone to go out with.

Acceptance criteria:
- Matching Engine consumes `user-preferences-updated`
- Algorithm v1: score = shared tags / total tags
- Match created if score >= configurable threshold (default: 0.3)
- Match linked to a compatible event (same category, same city, future date)
- Stored with status `PENDING`
- Publishes to `match-notifications`

Points: 8

---

### US-10: Match Notifications (Sprint 2)

**As a** user, **I want to** receive a notification when a match is found, **so that** I can accept or reject it.

Acceptance criteria:
- Kafka consumer listens on `match-notifications`
- Checks daily quota (configurable, default: 5/day)
- Under quota: notification created with status `UNREAD`
- Over quota: notification queued for the next day
- `GET /api/users/{id}/notifications` returns unread notifications
- Frontend: notification badge + match suggestion list

Points: 5

---

### US-11: Accept or Reject a Match (Sprint 2)

**As a** user, **I want to** accept or reject a proposed match, **so that** I can confirm my interest in the outing.

Acceptance criteria:
- `PUT /api/matches/{id}/accept` → status `ACCEPTED` on user's side
- `PUT /api/matches/{id}/reject` → status `REJECTED`
- Both accept → match status `CONFIRMED`
- One rejects → match status `CANCELLED`
- Frontend: match detail (other user's profile + event) with accept/reject buttons

Points: 5

---

## Post-MVP

### US-12: Group Outings (SHOULD)

**As a** user, **I want to** be matched with a group (3-6 people) with similar taste, **so that** I can attend an event as a group.

Acceptance criteria:
- Profile option: duo or group preference
- N-to-N matching in the engine
- Group formed when >= 3 people share tags + compatible event
- All members must accept to confirm the group

Points: 8

---

### US-13: Chat Between Matched Users (SHOULD)

**As a** user with a confirmed match, **I want to** chat with my outing partner, **so that** we can coordinate details.

Acceptance criteria:
- Chat channel auto-created on match confirmation
- Messages stored in DB, retrievable via API
- Simple text-based chat UI
- Access restricted to match participants

Points: 8

---

### US-14: Outing History (SHOULD)

**As a** user, **I want to** view my past outings, **so that** I can keep track of my experiences.

Acceptance criteria:
- `GET /api/users/{id}/history` returns confirmed matches where the event date has passed
- Chronological list, filterable by category and date

Points: 3

---

### US-15: Post-Outing Feedback (COULD)

**As a** user, **I want to** rate my outing after the event, **so that** future matches can be improved.

Acceptance criteria:
- 1-5 star rating + optional comment
- Feedback factored into future scoring
- `POST /api/matches/{id}/feedback`

Points: 3

---

### US-16: Admin Dashboard (COULD)

**As an** admin, **I want to** view usage statistics, **so that** I can monitor and moderate the platform.

Acceptance criteria:
- Stats: registered users, active events, matches created/confirmed, acceptance rate
- Profile moderation (disable accounts)
- ADMIN role required

Points: 5

---

## Summary

| US | Title | Priority | Sprint | Points |
|----|-------|----------|--------|--------|
| 01 | Registration | MUST | 2 | 3 |
| 02 | Login | MUST | 2 | 3 |
| 03 | Create Event | MUST | 1 | 3 |
| 04 | List Events | MUST | 1 | 5 |
| 05 | Event Detail | MUST | 1 | 2 |
| 06 | Update/Delete Event | MUST | 1 | 2 |
| 07 | Cultural Preferences | MUST | 2 | 5 |
| 08 | Kafka Ingestion | MUST | 1 | 8 |
| 09 | Matching | MUST | 2 | 8 |
| 10 | Notifications | MUST | 2 | 5 |
| 11 | Accept/Reject Match | MUST | 2 | 5 |
| 12 | Group Outings | SHOULD | 3+ | 8 |
| 13 | Chat | SHOULD | 3+ | 8 |
| 14 | Outing History | SHOULD | 3+ | 3 |
| 15 | Feedback | COULD | 3+ | 3 |
| 16 | Admin Dashboard | COULD | 3+ | 5 |
| | **MVP Total** | | | **49** |
| | **Overall Total** | | | **76** |
