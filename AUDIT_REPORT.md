# CODEBASE AUDIT REPORT

Comprehensive technical audit of the **Slack Travel Disruption Recovery Engine** across the Next.js frontend (`slack-web/`), FastAPI backend (`slack-api/`), and live PostgreSQL database.

---

## 1. FILE TREE WITH LINE COUNTS

Exact line counts for every file in `slack-web/` and `slack-api/` (excluding build artifacts and dependency packages such as `.git`, `node_modules`, `.next`, `__pycache__`).

### `slack-web/` (Frontend)

```
slack-web/
├── .gitignore (41 lines)
├── AGENTS.md (9 lines)
├── CLAUDE.md (1 lines)
├── README.md (36 lines)
├── eslint.config.mjs (28 lines)
├── next-env.d.ts (7 lines)
├── next.config.ts (7 lines)
├── package-lock.json (7,664 lines)
├── package.json (30 lines)
├── postcss.config.mjs (7 lines)
├── tsconfig.json (34 lines)
├── app/
│   ├── favicon.ico (31 lines)
│   ├── globals.css (236 lines)
│   ├── layout.tsx (38 lines)
│   ├── page.tsx (308 lines)
│   ├── dashboard/
│   │   └── page.tsx (404 lines)
│   ├── login/
│   │   └── page.tsx (404 lines)
│   ├── profile/
│   │   └── page.tsx (41 lines)
│   ├── signup/
│   │   └── page.tsx (233 lines)
│   └── trips/
│       └── [tripId]/
│           ├── page.tsx (357 lines)
│           └── settings/
│               └── page.tsx (467 lines)
├── components/
│   ├── ActivityFeedDrawer.tsx (167 lines)
│   ├── AuthGuard.tsx (33 lines)
│   ├── BookingModal.tsx (387 lines)
│   ├── DemoControlBar.tsx (168 lines)
│   ├── DependencyModal.tsx (198 lines)
│   ├── EmptyTripState.tsx (80 lines)
│   ├── ErrorBoundary.tsx (88 lines)
│   ├── GraphSkeleton.tsx (71 lines)
│   ├── GraphView.tsx (368 lines)
│   ├── HelpModal.tsx (26 lines)
│   ├── ImpactSummaryPanel.tsx (597 lines)
│   ├── ListView.tsx (219 lines)
│   ├── NodeDetailPanel.tsx (476 lines)
│   ├── NotificationCenter.tsx (28 lines)
│   ├── PresenceAvatars.tsx (78 lines)
│   ├── ResilienceRing.tsx (108 lines)
│   ├── ShareModal.tsx (310 lines)
│   ├── SuggestedDependenciesBanner.tsx (80 lines)
│   ├── ToastNotification.tsx (61 lines)
│   ├── TriggerDisruptionModal.tsx (329 lines)
│   ├── TripCreateModal.tsx (105 lines)
│   ├── TripDashboardModal.tsx (280 lines)
│   └── TripHeader.tsx (381 lines)
├── hooks/
│   ├── useD3Graph.ts (859 lines)
│   ├── useDisruptionFlow.ts (117 lines)
│   ├── usePresence.ts (103 lines)
│   ├── useRippleAnimation.ts (26 lines)
│   ├── useTripState.ts (259 lines)
│   └── useZoom.ts (92 lines)
├── lib/
│   ├── api.ts (364 lines)
│   ├── auth.ts (56 lines)
│   └── types.ts (382 lines)
└── public/
    ├── file.svg (1 lines)
    ├── globe.svg (1 lines)
    ├── next.svg (1 lines)
    ├── vercel.svg (1 lines)
    └── window.svg (1 lines)
```

### `slack-api/` (Backend)

```
slack-api/
├── .env (6 lines)
├── .env.example (8 lines)
├── Dockerfile (20 lines)
├── README.md (9 lines)
├── pyproject.toml (29 lines)
├── requirements.txt (11 lines)
└── app/
    ├── __init__.py (1 lines)
    ├── auth.py (125 lines)
    ├── config.py (19 lines)
    ├── database.py (5 lines)
    ├── demo.py (447 lines)
    ├── events.py (85 lines)
    ├── graph.py (122 lines)
    ├── heuristics.py (115 lines)
    ├── main.py (50 lines)
    ├── models.py (321 lines)
    ├── recovery.py (462 lines)
    ├── ripple.py (204 lines)
    ├── db/
    │   ├── __init__.py (6 lines)
    │   ├── bookings.py (110 lines)
    │   ├── core.py (206 lines)
    │   ├── disruptions.py (162 lines)
    │   ├── members.py (77 lines)
    │   └── trips.py (78 lines)
    └── routers/
        ├── bookings.py (113 lines)
        ├── core.py (121 lines)
        ├── disruptions.py (175 lines)
        ├── members.py (75 lines)
        └── trips.py (196 lines)
```

---

## 2. API ENDPOINT MAP

Every registered backend route in `slack-api/app/main.py`, its database reads/writes, calling frontend components, and enforced authorization checks.

| Method | Path | DB Reads | DB Writes | Frontend Callers (file:line) | Auth / Role Check & File:Line |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | `users` | `users` | `slack-web/app/signup/page.tsx:32` (via `signupUser`) | None (public registration) |
| **POST** | `/auth/login` | `users` | None | `slack-web/app/login/page.tsx:68,81` (via `loginUser`) | None (verifies bcrypt hash) |
| **GET** | `/auth/me` | `users` | None | None (`lib/api.ts:108` defined, unused by UI) | Authenticated (`Depends(get_current_user)` at `routers/core.py:52`) |
| **POST** | `/auth/logout` | None | None | None (`lib/api.ts:104` clears localStorage only) | Authenticated (`Depends(get_current_user)` at `routers/core.py:57`) |
| **POST** | `/demo/seed` | `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` | `trips`, `trip_members`, `bookings`, `dependencies`, `activity_feed` (on creation) | `app/dashboard/page.tsx:122`, `hooks/useTripState.ts:218`, `app/page.tsx:39` | Optional Auth (`Depends(get_current_user_optional)` at `routers/core.py:80`). No role restriction. |
| **POST** | `/demo/seed-stress` | None | `trips`, `trip_members`, `bookings`, `dependencies`, `activity_feed` | `hooks/useTripState.ts:234` (triggered from `DemoControlBar.tsx:143`) | None (public endpoint) |
| **GET** | `/weather/airports` | None (Open-Meteo external REST) | None | `components/TriggerDisruptionModal.tsx:54` (via `fetchAirportWeather`) | None (public endpoint) |
| **GET** | `/trips` | `trips`, `trip_members` | None | `app/dashboard/page.tsx:78`, `hooks/useTripState.ts:89` (via `listTrips`) | Optional Auth (`Depends(get_current_user_optional)` at `routers/trips.py:52`) |
| **POST** | `/trips` | None | `trips`, `trip_members`, `activity_feed` | `app/dashboard/page.tsx:108`, `hooks/useTripState.ts:102` (via `createTrip`) | Authenticated (`Depends(get_current_user)` at `routers/trips.py:46`). Sets creator as `owner_id`. |
| **GET** | `/trips/{trip_id}` | `trips` | None | `app/trips/[tripId]/settings/page.tsx:81`, `hooks/useTripState.ts:120` (via `getTrip`) | None (public endpoint) |
| **PATCH** | `/trips/{trip_id}` | `trips`, `trip_members` | `trips` | `app/trips/[tripId]/settings/page.tsx:108` (via `updateTrip`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/trips.py:67`) |
| **DELETE** | `/trips/{trip_id}` | `trips` | `recovery_candidates`, `applied_recoveries`, `disruptions`, `dependencies`, `bookings`, `trip_members`, `activity_feed`, `trips` | `app/dashboard/page.tsx:140`, `app/trips/[tripId]/settings/page.tsx:147` (via `deleteTrip`) | Authenticated + DB Owner Check (`if trip.owner_id != current_user['user_id']` at `routers/trips.py:79`) |
| **GET** | `/trips/{trip_id}/graph` | `trips`, `bookings`, `dependencies`, `disruptions` | None | `hooks/useTripState.ts:125` (via `getTripGraph`) | None (public endpoint) |
| **GET** | `/trips/{trip_id}/suggestions` | `trips`, `bookings`, `dependencies` | None | None (`lib/api.ts:195` defined, graph endpoint provides suggestions directly) | None (public endpoint) |
| **GET** | `/trips/{trip_id}/resilience` | `trips`, `bookings`, `dependencies`, `disruptions` | None | `app/dashboard/page.tsx:88`, `hooks/useTripState.ts:133`, `components/TripDashboardModal.tsx:46` | None (public endpoint) |
| **GET** | `/trips/{trip_id}/events` | `trips` | None | `hooks/usePresence.ts:53` (via `new EventSource(...)`) | Authenticated (`Depends(get_current_user)` at `routers/trips.py:148`). Supports query param `?token=`. |
| **POST** | `/trips/{trip_id}/presence` | `trips` | None (in-memory event bus update) | `hooks/usePresence.ts:37` (via `sendPresenceHeartbeat`) | None (public presence tracker) |
| **GET** | `/trips/{trip_id}/presence` | `trips` | None | None (`lib/api.ts:261` defined, active users synced via heartbeat and SSE) | None (public endpoint) |
| **GET** | `/trips/{trip_id}/activity` | `trips`, `activity_feed` | None | `components/ActivityFeedDrawer.tsx:39` (via `getTripActivity`) | None (public endpoint) |
| **POST** | `/trips/{trip_id}/bookings` | `trips`, `trip_members` | `bookings`, `activity_feed` | `hooks/useTripState.ts:155` (via `addBooking`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:22`) |
| **PUT** | `/bookings/{booking_id}` | `bookings`, `trips`, `trip_members` | `bookings`, `activity_feed` | `hooks/useTripState.ts:166` (via `updateBooking`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:41`) |
| **DELETE** | `/bookings/{booking_id}` | `bookings`, `trips`, `trip_members` | `dependencies`, `bookings`, `activity_feed` | `hooks/useTripState.ts:177` (via `deleteBooking`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:56`) |
| **POST** | `/trips/{trip_id}/dependencies` | `trips`, `trip_members`, `bookings`, `dependencies` | `dependencies`, `activity_feed` | `hooks/useTripState.ts:188` (via `createDependency`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:69`) |
| **PUT** | `/dependencies/{dependency_id}` | `dependencies`, `trips`, `trip_members` | `dependencies`, `activity_feed` | None (`lib/api.ts:179` defined, unused by UI) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:91`) |
| **DELETE** | `/dependencies/{dependency_id}` | `dependencies`, `trips`, `trip_members` | `dependencies`, `activity_feed` | `hooks/useTripState.ts:198` (via `deleteDependency`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/bookings.py:104`) |
| **POST** | `/trips/{trip_id}/disruptions` | `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` | `disruptions`, `activity_feed` | `hooks/useDisruptionFlow.ts:46` (via `triggerDisruption`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/disruptions.py:23`) |
| **GET** | `/trips/{trip_id}/disruptions` | `trips`, `disruptions` | None | `hooks/useTripState.ts:130` (via `listActiveDisruptions`) | None (public endpoint) |
| **POST** | `/disruptions/{disruption_id}/resolve` | `disruptions`, `trips`, `trip_members`, `bookings`, `dependencies` | `disruptions`, `activity_feed` | `hooks/useDisruptionFlow.ts:97` (via `resolveDisruption`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/disruptions.py:54`) |
| **POST** | `/trips/{trip_id}/disruptions/{disruption_id}/recovery-options` | `trips`, `disruptions`, `recovery_candidates`, `bookings`, `dependencies` | `recovery_candidates` (only if not pre-cached) | `components/ImpactSummaryPanel.tsx:89` (via `getRecoveryOptions`) | None (public evaluation endpoint) |
| **POST** | `/recovery-options/{candidate_id}/apply` | `recovery_candidates`, `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` | `bookings`, `disruptions`, `applied_recoveries`, `activity_feed` | `hooks/useDisruptionFlow.ts:72` (via `applyRecoveryOption`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/disruptions.py:107`) |
| **POST** | `/demo/sample-disruption` | `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` | `disruptions`, `activity_feed` | `hooks/useDisruptionFlow.ts:53` (via `triggerSampleDisruption`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/disruptions.py:139`) |
| **POST** | `/trips/{trip_id}/disruptions/live-weather` | `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` | `disruptions`, `activity_feed` | None (`lib/api.ts:340` defined, UI uses `/trips/{trip_id}/disruptions`) | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/disruptions.py:153`) |
| **GET** | `/trips/{trip_id}/disruptions/resolved` | `trips`, `disruptions` | None | `app/trips/[tripId]/settings/page.tsx:83` (via `listResolvedDisruptions`) | None (public endpoint) |
| **POST** | `/trips/{trip_id}/members/invite` | `trips`, `trip_members` | `trip_members`, `activity_feed` | `app/trips/[tripId]/settings/page.tsx:129`, `components/ShareModal.tsx:66` | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/members.py:22`) |
| **GET** | `/trips/{trip_id}/members` | `trips`, `trip_members` | None | `app/trips/[tripId]/settings/page.tsx:82`, `components/ShareModal.tsx:40` | None (public endpoint) |
| **DELETE** | `/trips/{trip_id}/members/{member_id}` | `trips`, `trip_members` | `trip_members`, `activity_feed` | `app/trips/[tripId]/settings/page.tsx:170`, `components/ShareModal.tsx:92` | Authenticated + DB Mutation Check (`verify_trip_mutation_permission` at `routers/members.py:44`) |
| **GET** | `/invites/{invite_token}` | `trip_members`, `trips` | None | `app/trips/[tripId]/page.tsx:74` (via `previewTripInvite`) | None (public token-based preview) |
| **POST** | `/invites/{invite_token}/accept` | `trip_members`, `trips` | `trip_members`, `activity_feed` | `app/trips/[tripId]/page.tsx:76` (via `acceptTripInvite`) | None (token-based collaborator joining) |
| **GET** | `/health` | None | None | External / Docker probe | None (public healthcheck) |

---

## 3. DEMO AND SEED DATA AUDIT

Every entry point across frontend and backend that creates demo, seed, or sample records.

### 1. Database Startup Seed: Demo Accounts
- **File & Function**: `slack-api/app/db/core.py` -> `db_seed_demo_users(hash_fn)` (invoked by lifespan in `slack-api/app/main.py:20`)
- **Trigger**: FastAPI application startup lifecycle.
- **Idempotency**: Queries `db_get_user_by_email(email)` for each of the 3 accounts (`owner@demo.com`, `editor@demo.com`, `viewer@demo.com`). Inserts only if the user record does not exist.
- **Verdict**: **IDEMPOTENT**

### 2. Standard Demo Trip: Authenticated with `reuse=True`
- **File & Function**: `slack-api/app/routers/core.py` -> `seed_demo_endpoint(reuse=True)`
- **Trigger**: "Load Alpine Demo" button in `slack-web/app/dashboard/page.tsx:170` and empty state button in `slack-web/app/dashboard/page.tsx:251`.
- **Idempotency**: Queries `db_list_trips_for_user(owner_id)` for trips matching `'Alpine Odyssey' in t.name`. If found, immediately returns existing trip with its bookings and dependencies without inserting anything.
- **Verdict**: **IDEMPOTENT**

### 3. Standard Demo Trip: Authenticated with `reuse=False`
- **File & Function**: `slack-api/app/routers/core.py` -> `seed_demo_endpoint(reuse=False)` calling `slack-api/app/demo.py:seed_standard_demo_trip`
- **Trigger**: "Load Demo Trip" button in `slack-web/components/DemoControlBar.tsx:93` (via `hooks/useTripState.ts:218`) and "Seed Multi-City Demo" in `slack-web/components/EmptyTripState.tsx:70`.
- **Idempotency**: Appends sequential suffix (`#2`, `#3`, etc.) and unconditionally executes `db_create_trip(...)` inserting 1 trip, 7 bookings, 5 dependencies, 1 member, and 1 activity feed item every time.
- **Verdict**: **NOT IDEMPOTENT**

### 4. Standard Demo Trip: Unauthenticated Request
- **File & Function**: `slack-api/app/routers/core.py` -> `seed_demo_endpoint()` calling `slack-api/app/demo.py:seed_standard_demo_trip`
- **Trigger**: Direct HTTP POST call to `/demo/seed` without `Authorization` header, or `app/page.tsx:36` (if called).
- **Idempotency**: When `current_user` is None, skips `existing_trips` check completely and always executes `seed_standard_demo_trip()` with a random UUID, creating orphaned trips every time.
- **Verdict**: **NOT IDEMPOTENT**

### 5. 16-Booking Stress Test Trip
- **File & Function**: `slack-api/app/routers/core.py` -> `seed_stress_endpoint()` calling `slack-api/app/demo.py:seed_stress_test_trip`
- **Trigger**: "16-Booking Stress Test (5 Days)" button in `slack-web/components/DemoControlBar.tsx:143` (via `hooks/useTripState.ts:234`).
- **Idempotency**: Does not check for existing trips. Always generates a random UUID owner, inserts a new trip named `"Grand European Tour (16 Bookings Stress Test)"`, creates 16 bookings, 14 dependencies, and 1 activity feed log.
- **Verdict**: **NOT IDEMPOTENT**

### 6. Guided Sample Disruption (Flight LX 354 +60m delay)
- **File & Function**: `slack-api/app/routers/disruptions.py` -> `trigger_sample_disruption_endpoint`
- **Trigger**: "Trigger Sample Disruption" button in `slack-web/components/DemoControlBar.tsx:104` (via `hooks/useDisruptionFlow.ts:53`).
- **Idempotency**: Finds first flight in trip, unconditionally inserts a new record into `disruptions` (`delay_minutes=60`), and writes a new row to `activity_feed`. Multiple clicks stack multiple active disruptions on the same booking.
- **Verdict**: **NOT IDEMPOTENT**

### 7. Real-time Weather Disruption Injection
- **File & Function**: `slack-api/app/routers/disruptions.py` -> `trigger_live_weather_disruption_endpoint` (and `trigger_disruption`)
- **Trigger**: "Trigger Disruption" button in `slack-web/components/TriggerDisruptionModal.tsx:100`.
- **Idempotency**: Fetches live airport telemetry and unconditionally inserts a new disruption row and activity feed item on every submission.
- **Verdict**: **NOT IDEMPOTENT**

### 8. AI / Heuristic Recovery Candidates Generation
- **File & Function**: `slack-api/app/routers/disruptions.py` -> `get_recovery_options` calling `db_save_recovery_candidates`
- **Trigger**: Disrupted state opening `slack-web/components/ImpactSummaryPanel.tsx:89`.
- **Idempotency**: Queries `db_get_recovery_candidates_by_disruption(disruption_id)`. If 2 or more candidates exist, immediately returns them. In addition, `db_save_recovery_candidates` uses `ON CONFLICT (id) DO UPDATE SET...`.
- **Verdict**: **IDEMPOTENT**

---

## 4. LIVE DATABASE ROW COUNTS

Queried directly from the live PostgreSQL instance (`slack_db` on `localhost:5432`) on September 10, 2026.

| Table Name | Row Count |
| :--- | :--- |
| **`activity_feed`** | 368 |
| **`applied_recoveries`** | 8 |
| **`bookings`** | 387 |
| **`dependencies`** | 259 |
| **`disruptions`** | 28 |
| **`recovery_candidates`** | 27 |
| **`trip_members`** | 203 |
| **`trips`** | 122 |
| **`users`** | 10 |

### Top 15 Most Common Trip Name Patterns in `trips` Table

Because non-idempotent seed triggers and test suites were run repeatedly against the live database, `trips` has accumulated 122 rows. Below are the 15 most frequent trip names:

| Trip Name Pattern | Occurrence Count |
| :--- | :--- |
| `Alpine Odyssey (Zurich → Geneva → Chamonix)` | 21 |
| `Invite Flow Trip` | 7 |
| `Recovery Lifecycle Trip` | 7 |
| `Editor Permitted Trip` | 7 |
| `Thin Layover Trip` | 7 |
| `Presence Trip` | 7 |
| `Remove Member Trip` | 7 |
| `Grand European Tour (16 Bookings Stress Test)` | 7 |
| `Violated Trip` | 7 |
| `Collaboration Test Trip` | 7 |
| `Disruption Demo Trip` | 7 |
| `Safe Resilience Trip` | 7 |
| `Viewer Security Trip` | 7 |
| `European Tour 2026` | 7 |
| `Tokyo Spring 2026` | 3 |

---

## 5. USER IDENTITY TRACE

Tracing from JWT issuance at login/signup to frontend presentation components.

### Token Issuance and Storage
- **Issuance**: `slack-api/app/routers/core.py:36` (signup) and `slack-api/app/routers/core.py:50` (login) call `create_jwt(user_id, email, display_name)`.
- **Frontend Storage**: `slack-web/lib/api.ts:80,99` calls `setAuth(data)` in `slack-web/lib/auth.ts:13-24`. Stores JWT string in `localStorage.auth_token` and JSON `{ user_id, email, display_name }` in `localStorage.auth_user`.

### Frontend Identity Presentation Audit

| Location / Component | Display Name / Email Rendered | Source: Real Session or Hardcoded? | File & Line Number |
| :--- | :--- | :--- | :--- |
| **Top Navigation Header** | `{currentUser.display_name}` and `{isViewer ? "Viewer" : "Active"}` | **REAL AUTHENTICATED SESSION** (reads `localStorage.auth_user` via `getAuthUser()` in `usePresence.ts:19` and passes to `TripHeader.tsx`) | `slack-web/components/TripHeader.tsx:360` |
| **Dashboard Top Bar** | `{currentUser.display_name}` | **REAL AUTHENTICATED SESSION** (reads `localStorage.auth_user` via `getAuthUser()` on mount) | `slack-web/app/dashboard/page.tsx:156` |
| **Presence Avatars (Top Right)** | `{user.client_name}` and initials from `{user.client_name}` (with `(You)` tag for self) | **REAL AUTHENTICATED SESSION** (reads `user.display_name` from session; falls back to `"U"` / empty string if unauthenticated) | `slack-web/components/PresenceAvatars.tsx:26,40,66` |
| **Share Modal Collaborator List** | `{m.name}` and `{m.email}` | **REAL DB RECORDS** (reads from `trip_members` table). **CAVEAT**: When any trip is created, `db_create_trip` in `app/db/trips.py:23` hardcodes the creator entry as `'owner@slacktravel.demo'` and `'Trip Owner'` regardless of the real authenticated user. | `slack-web/components/ShareModal.tsx:277,290` |
| **Trip Settings Page (Collaborators)** | `{member.name}` and `{member.email}` | **REAL DB RECORDS** (reads from `trip_members` table; subject to initial hardcoded creator caveat noted above) | `slack-web/app/trips/[tripId]/settings/page.tsx:298,299` |
| **Activity Feed Drawer** | `{item.actor_name}` and `{item.actor_email}` | **MIXED**: Real session for user mutations, hardcoded placeholders for system seeds: | `slack-web/components/ActivityFeedDrawer.tsx:147,152` |
| ↳ *User Bookings / Disruptions / Invites* | User's real name & email | **REAL AUTHENTICATED SESSION** (pulled directly from verified JWT payload `current_user` in routers) | `app/routers/bookings.py:29`, `app/routers/disruptions.py:31`, `app/routers/members.py:27` |
| ↳ *Trip Initial Creation* | `"Trip Owner"` / `"owner@slacktravel.demo"` | **HARDCODED PLACEHOLDER** | `slack-api/app/db/trips.py:24` |
| ↳ *Demo Standard Seed* | `"Demo Engine"` / `"demo@slacktravel.demo"` | **HARDCODED PLACEHOLDER** | `slack-api/app/demo.py:271` |
| ↳ *Demo Stress Test Seed* | `"System Stress Tester"` / `"system@slacktravel.demo"` | **HARDCODED PLACEHOLDER** | `slack-api/app/demo.py:373` |

---

## 6. RBAC ENFORCEMENT MAP

Exhaustive audit of role-based authorization checks across frontend and backend.

### Backend Verification: Real Database Check vs Client Trust
The backend **strictly verifies RBAC against the PostgreSQL database** using the verified JWT sub claim (`user_id`). It completely ignores client-supplied headers (e.g., `X-User-Role`).

- **Central Guard Function**: `verify_trip_mutation_permission(trip_id: UUID, current_user: dict)` in `slack-api/app/routers/trips.py:18-45`.
- **Database Query**: Queries `trips.owner_id` and executes `SELECT role FROM trip_members WHERE trip_id = %s AND user_id = %s`.
- **Enforcement Rules**:
  - `owner_id == user_id`: Allowed.
  - `role == 'owner'` or `role == 'editor'`: Allowed.
  - `role == 'viewer'`: Returns `HTTP 403 Forbidden ("Forbidden: Viewer role has read-only access.")`.
  - Not a member: Returns `HTTP 403 Forbidden ("Forbidden: You are not a member of this trip.")`.

### Backend Protected Routes

| Route | Guard / Check | File & Line Number | Enforced Against DB? |
| :--- | :--- | :--- | :--- |
| `PATCH /trips/{trip_id}` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/trips.py:67` | **YES** (queries `trips` & `trip_members`) |
| `DELETE /trips/{trip_id}` | `if trip.owner_id and str(trip.owner_id) != current_user['user_id']` | `app/routers/trips.py:79` | **YES** (queries `trips.owner_id`) |
| `POST /trips/{trip_id}/bookings` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/bookings.py:22` | **YES** (queries `trips` & `trip_members`) |
| `PUT /bookings/{booking_id}` | `verify_trip_mutation_permission(existing.trip_id, current_user)` | `app/routers/bookings.py:41` | **YES** (queries `trips` & `trip_members`) |
| `DELETE /bookings/{booking_id}` | `verify_trip_mutation_permission(booking.trip_id, current_user)` | `app/routers/bookings.py:56` | **YES** (queries `trips` & `trip_members`) |
| `POST /trips/{trip_id}/dependencies` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/bookings.py:69` | **YES** (queries `trips` & `trip_members`) |
| `PUT /dependencies/{dependency_id}` | `verify_trip_mutation_permission(dep.trip_id, current_user)` | `app/routers/bookings.py:91` | **YES** (queries `trips` & `trip_members`) |
| `DELETE /dependencies/{dependency_id}` | `verify_trip_mutation_permission(dep.trip_id, current_user)` | `app/routers/bookings.py:104` | **YES** (queries `trips` & `trip_members`) |
| `POST /trips/{trip_id}/disruptions` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/disruptions.py:23` | **YES** (queries `trips` & `trip_members`) |
| `POST /disruptions/{disruption_id}/resolve` | `verify_trip_mutation_permission(disruption.trip_id, current_user)` | `app/routers/disruptions.py:54` | **YES** (queries `trips` & `trip_members`) |
| `POST /recovery-options/{candidate_id}/apply` | `verify_trip_mutation_permission(candidate.trip_id, current_user)` | `app/routers/disruptions.py:107` | **YES** (queries `trips` & `trip_members`) |
| `POST /demo/sample-disruption` | `verify_trip_mutation_permission(req.trip_id, current_user)` | `app/routers/disruptions.py:139` | **YES** (queries `trips` & `trip_members`) |
| `POST /trips/{trip_id}/disruptions/live-weather` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/disruptions.py:153` | **YES** (queries `trips` & `trip_members`) |
| `POST /trips/{trip_id}/members/invite` | `verify_trip_mutation_permission(trip_id, current_user)` | `app/routers/members.py:22` | **YES** (queries `trips` & `trip_members`) |
| `DELETE /trips/{trip_id}/members/{member_id}` | `verify_trip_mutation_permission(trip_id, current_user)` + `AND role != 'owner'` | `app/routers/members.py:44` & `app/db/members.py:44` | **YES** (queries `trips` & `trip_members`) |

### Frontend Role Checks & Discrepancy
- **Critical Frontend Gap**: In `slack-web/app/trips/[tripId]/page.tsx:87`:
  ```typescript
  const isViewer = false;
  ```
  `isViewer` is **hardcoded to `false`** in the main trip workspace page. The frontend does not fetch the user's role for the trip, so the UI buttons ("Add Booking", "Trigger Disruption", "Share") remain clickable even when Bob (`viewer@demo.com`) is logged in. However, when clicked, the backend rejects the mutation with `403 Forbidden`.
- **TripHeader Role Awareness**: `TripHeader.tsx:201,212,228,262` accepts `isViewer` prop and disables buttons if `true`, but because `page.tsx:87` hardcodes it to `false`, this check is dormant in the trip workspace.
- **Settings Page Role Guards**: `slack-web/app/trips/[tripId]/settings/page.tsx:315` hides the collaborator deletion button for members with `role === "owner"`.

---

## 7. GRAPH RENDERING — LABEL AND EDGE COLLISION LOGIC

Inspection of `slack-web/components/GraphView.tsx` and `slack-web/hooks/useD3Graph.ts`.

### 1. Edge-Routing-Around-Nodes Logic
- **Exists in Code?**: **YES**.
- **Location**: `slack-web/hooks/useD3Graph.ts:360-435` in function `computeEdgeGeometry(link: D3Link)`.
- **How it Works**:
  1. Computes unit normal vector `(nx, ny)` between source and target nodes.
  2. Sets baseline curvature `h = -Math.max(28, Math.min(65, dist * 0.18))`.
  3. Iterates through all other nodes `other` in the graph. Projects each node along the edge vector.
  4. If an intermediate node lies horizontally between source and target (`proj > NODE_RADIUS && proj < dist - NODE_RADIUS`), it tests perpendicular separation against `requiredClearance = NODE_RADIUS + 34px`.
  5. If an obstacle is detected, deflects the Bézier control point outward away from the intermediate node (`h = maxDeflectionNeeded`).
  6. Snaps the curve endpoints to circle perimeters facing the deflected control point.

### 2. Label & Badge Collision Avoidance Logic
- **Exists in Code?**: **YES**.
- **Location**: `slack-web/hooks/useD3Graph.ts:481-580`.
- **How it Works**:
  1. Calculates exact badge dimensions dynamically (`width = Math.max(94, Math.round(text.length * 8 + 26))`, `height = 24px`).
  2. Runs a **5-pass iterative relaxation algorithm**:
     - **Pass A (Badge-to-Node & Badge-to-Label)**: Checks bounding box overlap of badge against `node.x` and `(node.y + 15)` (the node circle plus its title/location label). If overlapping, pushes badge vertically or horizontally along the normal vector.
     - **Pass B (Badge-to-Badge)**: Detects pairwise badge overlap (`dx < reqX && dy < reqY`). Shifts overlapping badges in opposing vertical directions (`shiftY = (reqY - dy) / 2 + 6`).
  3. If relaxation pushes a badge farther than `18px` from its anchor point on the edge, it automatically draws a leader line connecting the badge back to the anchor (`lines 572-592`).

### 3. Lifecycle Trigger & Potential Execution Blockers

- **Trigger Event**: The collision and edge-routing code runs inside the primary D3 `useEffect` hook in `slack-web/hooks/useD3Graph.ts:134-859`.
- **Dependency Array**: Triggered when any of `[nodes, effectiveEdges, selectedNodeId, onSelectNode, suggestedDependencies, disruptedBookingId, ripplePath, revealedRippleIndex, impactMap, suggestedNodeIds, containerDimensions, dayBuckets, fitToContent, pulsingNodeId, atRiskTargetNodeIds]` changes.
- **Critical Failure Modes & Edge Cases**:
  1. **Empty Nodes Guard Prevents SVG Cleanup**:
     At `useD3Graph.ts:135`:
     ```typescript
     if (!svgRef.current || !containerRef.current || nodes.length === 0) return;
     ```
     `svg.selectAll("*").remove()` is located on **line 180**, *after* this early return. If a user switches from a loaded trip to an empty trip (`nodes.length === 0`), the effect returns immediately without clearing the SVG. The previous trip's graph remains visibly frozen on screen.
  2. **Drag Event Bypass**:
     During interactive node dragging (`useD3Graph.ts:817-829`), `linkElements.attr("d", ...)` recalculates edge paths, but **badge collision relaxation does not run during drag**. Badges remain pinned at pre-drag coordinates until drag ends and a state re-render occurs.
  3. **Node Position Cache Across Trips**:
     `nodePositionsRef = useRef<Map<string, { x, y }>>(new Map())` in `GraphView.tsx:82` is never cleared when switching trips. While keyed by node ID, re-fetching an existing trip retains user-dragged coordinates rather than resetting to deterministic timeline coordinates.

---

## 8. DEAD CODE AND DUPLICATION

Inventory of components, routes, and utilities that are uncalled, duplicated, or superseded.

### Dead / Unused Components (Frontend)
1. **`slack-web/components/TripDashboardModal.tsx`** (280 lines)
   - Completely uncalled. 0 import references across `slack-web/`.
   - Superseded by the dedicated page route `slack-web/app/trips/[tripId]/settings/page.tsx` and inline dashboard metrics.
2. **`slack-web/components/SuggestedDependenciesBanner.tsx`** (80 lines)
   - Completely uncalled. 0 import references across `slack-web/`.
   - Superseded by inline suggested dependency banner embedded directly in `slack-web/app/trips/[tripId]/page.tsx:183-200`.
3. **`slack-web/components/ToastNotification.tsx`** (61 lines)
   - Only exports `ToastMessage` type. The actual components `ToastContainer` and `ToastItem` are never mounted anywhere.
   - `TripHeader.tsx` mounts `NotificationCenter.tsx`, and `dashboard/page.tsx` renders custom toast markup.
4. **`slack-web/app/profile/page.tsx`** (41 lines)
   - Orphaned route. No link to `/profile` exists in any navigation, menu, or button in the frontend.
5. **`slack-web/CLAUDE.md`** (1 line)
   - Leftover scratch file containing only `"clauede rules"`.

### Dead / Unused Backend Endpoints & Client Functions
1. **`GET /auth/me`** (`slack-api/app/routers/core.py:52-55`)
   - Client wrapper `getMe()` in `lib/api.ts:108` is never called by any component or page.
2. **`POST /auth/logout`** (`slack-api/app/routers/core.py:57-60`)
   - `logoutUser()` in `slack-web/lib/api.ts:103` only calls `clearAuth()` on localStorage; it never makes a network request to this endpoint.
3. **`PUT /dependencies/{dependency_id}`** (`slack-api/app/routers/bookings.py:86-97`)
   - Client wrapper `updateDependency()` in `lib/api.ts:179` is never invoked by any UI action.
4. **`GET /trips/{trip_id}/suggestions`** (`slack-api/app/routers/trips.py:95-108`)
   - Client wrapper `getTripSuggestions()` in `lib/api.ts:195` is never invoked. The graph endpoint `/trips/{trip_id}/graph` already embeds suggestions.
5. **`GET /trips/{trip_id}/presence`** (`slack-api/app/routers/trips.py:182-188`)
   - Client wrapper `getTripPresence()` in `lib/api.ts:261` is never invoked. Presence data is returned directly by heartbeat POST responses and SSE events.
6. **`POST /trips/{trip_id}/disruptions/live-weather`** (`slack-api/app/routers/disruptions.py:148-167`)
   - Client wrapper `triggerLiveWeatherDisruption()` in `lib/api.ts:340` is never called. `TriggerDisruptionModal.tsx` fetches weather telemetry via `/weather/airports` and posts directly to `/trips/{trip_id}/disruptions`.
7. **`handleLoadDemo` in `slack-web/app/page.tsx:36`**
   - Function is defined and imports `seedDemoTrip`, but is not bound to any button or event in `app/page.tsx`.

### Code Duplication
1. **Trip Resilience Scoring Calculation**:
   - Implemented in Python backend: `slack-api/app/routers/trips.py:110-145` (`get_trip_resilience`).
   - Duplicated in Python heuristics/recovery: `slack-api/app/recovery.py:200-245`.
   - Duplicated in TypeScript frontend: `slack-web/components/ResilienceRing.tsx` and `slack-web/hooks/useTripState.ts`.
2. **Date & Time Formatting Helpers**:
   - `formatRelativeTime` duplicated between `ActivityFeedDrawer.tsx:56` and `NotificationCenter.tsx`.
   - ISO string manipulation duplicated in `BookingModal.tsx`, `NodeDetailPanel.tsx`, and `ListView.tsx`.

---

## 9. DATA FLOW SUMMARY

End-to-end data flow tracing user journeys across the UI, API endpoints, and database tables.

```mermaid
flowchart TD
    subgraph S1["1. User Authentication"]
        UI_Login["Login Page (app/login/page.tsx)"] -->|POST /auth/login| API_Login["POST /auth/login (routers/core.py)"]
        API_Login -->|Read user & password_hash| DB_Users[(Table: users)]
        API_Login -->|Returns JWT + AuthUser| UI_Login
        UI_Login -->|Store token & user in localStorage| LocalStorage[localStorage: auth_token, auth_user]
    end

    subgraph S2["2. Dashboard Initialization"]
        LocalStorage --> UI_Dash["Dashboard (app/dashboard/page.tsx)"]
        UI_Dash -->|GET /trips| API_ListTrips["GET /trips (routers/trips.py)"]
        API_ListTrips -->|Read trips for user| DB_Trips[(Table: trips)]
        API_ListTrips -->|Read memberships| DB_Members[(Table: trip_members)]
        UI_Dash -->|GET /trips/{id}/resilience| API_Resilience["GET /trips/{id}/resilience"]
        API_Resilience -->|Read edge slack| DB_Bookings[(Table: bookings)]
        API_Resilience --> DB_Deps[(Table: dependencies)]
    end

    subgraph S3["3. Trip Workspace View"]
        UI_Dash -->|Select Trip| UI_Trip["Trip View (app/trips/[tripId]/page.tsx)"]
        UI_Trip -->|GET /trips/{id}/graph| API_Graph["GET /trips/{id}/graph (routers/trips.py)"]
        API_Graph --> DB_Trips
        API_Graph --> DB_Bookings
        API_Graph --> DB_Deps
        API_Graph --> DB_Disruptions[(Table: disruptions)]
        UI_Trip -->|POST /trips/{id}/presence| API_Presence["POST /trips/{id}/presence"]
        UI_Trip -->|GET /trips/{id}/events| SSE["SSE Stream (/events)"]
    end

    subgraph S4["4. Graph & List Rendering"]
        UI_Trip --> UI_GraphView["GraphView (D3 Timeline & Curved Edges)"]
        UI_Trip --> UI_ListView["ListView (Grouped Cards & Alerts)"]
    end

    subgraph S5["5. Trigger Disruption"]
        UI_GraphView -->|Click Trigger Disruption| UI_DisruptModal["TriggerDisruptionModal / DemoControlBar"]
        UI_DisruptModal -->|POST /trips/{id}/disruptions| API_TriggerDisrupt["POST /trips/{id}/disruptions"]
        API_TriggerDisrupt -->|Verify role| DB_Members
        API_TriggerDisrupt -->|Insert disruption row| DB_Disruptions
        API_TriggerDisrupt -->|Insert audit log| DB_Activity[(Table: activity_feed)]
        API_TriggerDisrupt -->|Broadcast live event| SSE
        API_TriggerDisrupt -->|Return ripple impact graph| UI_Trip
    end

    subgraph S6["6. Autonomous Recovery Options"]
        UI_Trip -->|Open Panel| UI_Impact["ImpactSummaryPanel.tsx"]
        UI_Impact -->|POST /trips/{id}/disruptions/{id}/recovery-options| API_Options["POST /recovery-options"]
        API_Options -->|Check cached options| DB_Candidates[(Table: recovery_candidates)]
        API_Options -->|Generate & save candidates| DB_Candidates
        UI_Impact -->|Click Apply Option| API_Apply["POST /recovery-options/{id}/apply"]
        API_Apply -->|Verify mutation role| DB_Members
        API_Apply -->|Update/Delete target booking| DB_Bookings
        API_Apply -->|Mark disruption resolved| DB_Disruptions
        API_Apply -->|Record audit trail| DB_Applied[(Table: applied_recoveries)]
        API_Apply -->|Insert activity item| DB_Activity
        API_Apply -->|Broadcast RECOVERY_APPLIED| SSE
        API_Apply -->|Return updated graph| UI_Trip
    end
```

### Flow Step Touchpoint Matrix

| User Action | Frontend Component | Backend Endpoint | Database Tables Touched | State Change |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | `app/login/page.tsx` | `POST /auth/login` | `users` (Read) | JWT stored in localStorage |
| **Load Dashboard** | `app/dashboard/page.tsx` | `GET /trips` + `GET /trips/{id}/resilience` | `trips`, `trip_members`, `bookings`, `dependencies`, `disruptions` (Read) | Displays user trips and resilience health score |
| **Open Trip** | `app/trips/[tripId]/page.tsx` | `GET /trips/{id}/graph` + `GET /trips/{id}/disruptions` | `trips`, `bookings`, `dependencies`, `disruptions` (Read) | Ingests DAG nodes & edges |
| **Render Visuals** | `components/GraphView.tsx` | Local State / D3 Layout Engine | None (Client render) | Computes non-colliding Bézier arcs & slack badges |
| **Trigger Disruption** | `components/TriggerDisruptionModal.tsx` | `POST /trips/{id}/disruptions` | `trip_members` (Read), `disruptions` (Write), `activity_feed` (Write) | Creates active disruption row; broadcasts SSE event |
| **Request Recovery** | `components/ImpactSummaryPanel.tsx` | `POST /trips/{id}/disruptions/{id}/recovery-options` | `disruptions`, `bookings`, `dependencies` (Read), `recovery_candidates` (Read/Write) | Returns ranked candidates (retime / shift / drop) |
| **Apply Recovery** | `components/ImpactSummaryPanel.tsx` | `POST /recovery-options/{candidate_id}/apply` | `bookings` (Write), `disruptions` (Write), `applied_recoveries` (Write), `activity_feed` (Write) | Heals itinerary; updates DAG; records audit log |
