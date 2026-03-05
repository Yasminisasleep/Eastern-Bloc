# Kulto: Sprint Planning

## Timeline

| Sprint | Dates | Goal | Milestone |
|--------|-------|------|-----------|
| S0 | Feb 19 to Feb 26 | DevOps setup + conception | M1 |
| S1 | Feb 26 to Mar 12 | Event CRUD + Kafka | |
| S2 | Mar 12 to Mar 27 | Profiles, matching, notifications | M2 (MVP) |
| S3 | Mar 27 to Apr 15 | Testing, stabilization, CI/CD | |
| S4 | Apr 15 to Apr 24 | Release 1.0 + demo | Presentation |

---

## Sprint 0: DevOps Setup and Conception (Feb 19 to Feb 26)

| Task |
|------|
| Create GitHub repo + project structure |
| Initialize Spring Boot project (Maven, Java 21) |
| Initialize React project (Vite + React 18) |
| Write docker-compose (backend, frontend, PostgreSQL, Kafka, Zookeeper) |
| Set up GitHub Actions (CI: build + test) |
| Configure GitHub Projects (Kanban) + initial issues |
| Kafka POC: basic producer/consumer |
| Write conception document + user stories |
| Create architecture diagrams |

Deliverable: structured repo, working CI, docker-compose running the full stack, conception document.

---

## Sprint 1: Event CRUD and Kafka Ingestion (Feb 26 to Mar 12)

20 story points.

### User Stories

| US | Title | Points |
|----|-------|--------|
| 03 | Create Event (admin) | 3 |
| 04 | List Events with Filtering | 5 |
| 05 | Event Detail View | 2 |
| 06 | Update / Delete Event | 2 |
| 08 | Kafka Event Ingestion | 8 |

### Technical Tasks

| Task |
|------|
| Data model (JPA entities: Event, Category, Tag) |
| Seed data |
| Spring Data JPA + PostgreSQL config |
| Spring Kafka config (producer + consumer) |
| Frontend pages: event list + detail |
| JaCoCo config in Maven build |
| Unit tests for CRUD endpoints |
| springdoc-openapi setup (Swagger UI) |

Deliverable: working event CRUD API, Kafka consumer on events.ingestion, frontend list and detail pages.

---

## Sprint 2: Profiles, Matching and Notifications (Mar 12 to Mar 27)

29 story points.

### User Stories

| US | Title | Points |
|----|-------|--------|
| 01 | User Registration | 3 |
| 02 | Login / JWT Auth | 3 |
| 07 | Cultural Preferences | 5 |
| 09 | User Matching | 8 |
| 10 | Match Notifications (daily quota) | 5 |
| 11 | Accept / Reject Match | 5 |

### Technical Tasks

| Task |
|------|
| Entities: User, Preference, Match, Notification |
| Spring Security + JWT |
| Matching engine (shared-tag algorithm) |
| user.preferences.updated topic (producer + consumer) |
| match.notifications topic (producer + consumer) |
| Frontend: registration, login, preferences |
| Frontend: notifications, match detail, accept/reject |
| Kafka integration tests (Testcontainers) |
| Cross-team code review |

Deliverable: functional MVP, all 3 Kafka topics operational.

---

## Sprint 3: Testing and Stabilization (Mar 27 to Apr 15)

| Task |
|------|
| Reach 70% coverage (JaCoCo) |
| Unit tests for all business services |
| API integration tests (MockMvc) |
| Kafka integration tests (Testcontainers) |
| Full CI/CD pipeline (Docker build + push to GHCR) |
| Staging environment (docker-compose.prod.yml) |
| Input validation, error handling, CORS |
| API documentation (Swagger/OpenAPI) |
| Security audit |

Deliverable: 70% coverage, complete CI/CD pipeline, Swagger UI, staging environment.

---

## Sprint 4: Release (Apr 15 to Apr 24)

| Task |
|------|
| Code freeze Apr 20 |
| Tag release v1.0.0 |
| End-to-end docker-compose up verification |
| Demo scenario (full user journey) |
| Demo dataset |
| Presentation slides |
| Dry run |
| Final hotfixes |
| Finalize documentation |

Deliverable: v1.0.0 tagged, Docker images on GHCR, working demo, slides.

---

## Organization

| Ceremony | Frequency | Duration | Format |
|----------|-----------|----------|--------|
| Daily standup | Daily | 10 min | Async on Discord |
| Sprint planning | Start of sprint | 30 min | In person |
| Sprint review | End of sprint | 30 min | In person + demo |
| Retrospective | End of sprint | 15 min | In person |
