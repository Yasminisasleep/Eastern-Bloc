# Kulto: Conception Document

## 1. Project Overview

Kulto is a web platform for discovering cultural events and, progressively, connecting users around shared cultural interests.

The current product direction is:

- let users browse cultural events
- let authenticated users create an account and access personalized features
- ingest partner events through Kafka
- prepare the product for taste-based matching, notifications, and preference management

The project is built as a modular monolith:

- frontend: React + Vite
- backend: Spring Boot + Java 21
- database: PostgreSQL
- messaging: Kafka
- deployment: Docker Compose

## 2. Problem Statement

General event platforms help users find events, but they do not help them find people with compatible interests to attend those events with.

Kulto aims to solve that by combining:

- a cultural event catalog
- user authentication
- future preference-based personalization
- future user matching around concrete events

## 3. Target Users

### 3.1 Visitor

A visitor can browse public event data and view event details without authentication.

### 3.2 Registered User

A registered user can create an account, log in, and access personalized areas of the application.

### 3.3 Partner System

An external system can push event payloads to Kafka so that new cultural events are added automatically to the catalog.

## 4. Functional Scope

### 4.1 Implemented Scope on Current Branch

- user signup with JWT returned on success
- user login with JWT returned on success
- public event listing with filtering by category, city, date range, and text query
- public event detail view
- event creation, update, and delete endpoints
- event ingestion trigger endpoint
- Kafka consumer that persists ingested events
- frontend screens for landing, signup, login, event list, and event detail

### 4.2 Partially Prepared Scope

The frontend already contains screens for:

- preferences
- notifications
- match detail

These screens currently include local fallback behavior when the backend endpoints are unavailable, which means the UX is present but the backend feature set is not yet complete on this branch.

### 4.3 Out of Current Implemented Scope

- persistent user preferences API
- notification API
- matching API
- accept/reject match workflow in backend
- role-based admin restriction for event CRUD

## 5. Main Business Rules

- only future active events should appear in public listings
- signup must reject duplicate email addresses
- login requires valid email and password
- all non-public API endpoints require JWT authentication
- partner event ingestion must accept a raw payload, publish it to Kafka, then persist valid messages through a consumer

## 6. Technical Architecture

### 6.1 Backend

The backend exposes a REST API and uses Spring Security with JWT.

Main implemented modules:

- authentication
- event management
- Kafka event ingestion
- health check

### 6.2 Frontend

The frontend is a single-page application. It currently supports:

- landing page
- authentication flow
- event browsing
- event detail navigation

It also contains early product screens for preferences, notifications, and match detail.

### 6.3 Messaging

Kafka is used for asynchronous event ingestion through the `events.ingestion` topic.

### 6.4 Infrastructure

The project is intended to run with:

- frontend container
- backend container
- PostgreSQL
- Kafka
- Zookeeper

## 7. API Surface Summary

### Public Endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/events`
- `GET /api/events/{id}`

### Authenticated Endpoints

- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`
- `POST /api/events/ingest`

## 8. User Stories

### US-01: Register

As a new user, I want to create an account, so that I can access personalized features.

Acceptance criteria:

- signup form collects email, first name, last name, and password
- backend returns a JWT on successful signup
- duplicate email is rejected

### US-02: Log In

As a registered user, I want to log in, so that I can access my account securely.

Acceptance criteria:

- login requires email and password
- backend returns a JWT on success
- frontend stores the token and uses it for protected requests

### US-03: Browse Events

As a visitor, I want to browse cultural events, so that I can discover interesting outings.

Acceptance criteria:

- event list is public
- list supports category, city, date, and query filtering
- results are paginated and sorted by date

### US-04: View Event Detail

As a visitor, I want to open an event detail page, so that I can evaluate whether the event interests me.

Acceptance criteria:

- event detail shows title, description, category, date, venue, city, price, tags, and source when present
- unknown event id returns not found

### US-05: Manage Events

As a platform operator, I want to create, edit, and remove events, so that the catalog stays relevant.

Acceptance criteria:

- event create endpoint stores a new event
- update endpoint modifies an existing event
- delete endpoint performs a soft delete by changing status

Note:

- the current implementation supports these endpoints
- role-based admin enforcement is still missing

### US-06: Ingest Partner Events

As a partner system, I want to send event payloads through Kafka, so that new events are added automatically.

Acceptance criteria:

- ingestion endpoint publishes the payload to Kafka
- Kafka consumer reads the message from `events.ingestion`
- valid payloads are transformed and persisted
- invalid payloads are logged

### US-07: Save Cultural Preferences

As an authenticated user, I want to define my cultural preferences, so that the platform can personalize future suggestions.

Acceptance criteria:

- frontend provides a preferences screen
- data model includes categories, tags, and radius
- backend persistence is still to be implemented on this branch

### US-08: Receive Match Notifications

As an authenticated user, I want to receive match suggestions, so that I can evaluate compatible outing partners.

Acceptance criteria:

- frontend provides a notifications view
- current branch falls back to mock or local data when backend support is absent
- persistent backend notifications remain to be implemented

### US-09: Accept or Reject a Match

As an authenticated user, I want to review a suggested match and accept or reject it, so that I control whether the outing proceeds.

Acceptance criteria:

- frontend provides a match detail screen
- accept and reject actions exist in the client API layer
- backend endpoints are not yet implemented on this branch

## 9. Roadmap Priorities

### Priority 1

- stabilize current auth and event flows
- enforce role-based authorization for event management
- keep Kafka event ingestion operational

### Priority 2

- implement backend support for user preferences
- implement backend support for notifications
- implement backend support for match detail and match decisions

### Priority 3

- connect the full personalized flow end to end
- remove frontend local fallbacks once APIs exist
- add stronger test coverage and CI hardening

## 10. Success Criteria

The product is considered coherent for the next milestone when:

- a user can sign up and log in successfully
- a visitor can browse and view events
- a partner payload can produce a persisted event through Kafka
- preferences, notifications, and match flows are backed by real APIs instead of local fallback behavior
