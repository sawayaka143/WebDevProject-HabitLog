# HabitLog API Contract

This document outlines the REST API endpoints the Django/DRF backend must implement to support the existing HabitLog Angular frontend.

## Global Notes

- **Base URL:** `/api/v1/`
- **Authentication:** All API endpoints (except Login) require authentication. Use **JWT (JSON Web Tokens)**.
  - The frontend expects to send requests with the `Authorization: Bearer <token>` header.
- **CORS:** Ensure `django-cors-headers` is configured to allow requests from the Angular dev server (typically `http://localhost:4200`).
- **Data Formats:** All request and response bodies must be `application/json`.
- **Pagination:** Not currently required by the frontend, return flat arrays for lists.
- **Backend Side Effects:** Any action that mutates state (creating/updating tasks, habits) should automatically yield a corresponding `LogEntry` in the backend so it can be returned or fetched, keeping the audit log consistent.

---

## Data Models

The Django backend should implement the following models (or equivalent):

### 1. User
- `id` (Primary Key: Auto-field)
- `username` (CharField, unique)
- `email` (EmailField, unique)
- `password` (CharField: Django standard hashed password)

### 2. Task
- `id` (UUIDField, primary key)
- `user` (ForeignKey -> User)
- `filename` (CharField: e.g. `initialize_repository.task`)
- `title` (CharField)
- `status` (CharField choices: `pending`, `done`)
- `tag` (CharField choices: `work`, `personal`, `health`)
- `description` (TextField, allow blank/null)
- `created_at` (DateField or DateTimeField: mapped to `YYYY-MM-DD` string in the frontend)

### 3. Habit
- `id` (UUIDField or Auto-field)
- `user` (ForeignKey -> User)
- `name` (CharField)
- `days` (JSONField or ArrayField of booleans, representing `[Sun, Mon, Tue, Wed, Thu, Fri, Sat]`)

### 4. LogEntry
- `id` (Primary Key: Auto-field)
- `user` (ForeignKey -> User)
- `time` (TimeField or DateTimeField: represented as a time string in frontend e.g., `10:30:00 AM`)
- `action` (CharField: e.g. `[TASK] CREATE: initialize_repository.task`)

---

## Auth Endpoints

### Login
- **Method:** `POST /api/v1/auth/login/`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "mysecretpassword"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbG...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "johndoe@example.com"
    }
  }
  ```
- **Errors:** `401 Unauthorized` for invalid credentials.

### Current User Profile (Read)
- **Method:** `GET /api/v1/auth/profile/`
- **Auth Required:** Yes
- **Response (200 OK):** *(same user object shape as login)*

### Update Profile
- **Method:** `PUT /api/v1/auth/profile/` (or `PATCH`)
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "username": "johndoe_new",
    "email": "newemail@example.com"
  }
  ```
- **Response (200 OK):** Updated user object.

---

## Tasks Endpoints

### List Tasks
- **Method:** `GET /api/v1/tasks/`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "id": "1",
      "filename": "initialize_repository.task",
      "title": "Initialize repository",
      "status": "done",
      "tag": "work",
      "created_at": "2026-04-14",
      "description": "Set up the base repo."
    }
  ]
  ```

### Create Task
- **Method:** `POST /api/v1/tasks/`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "Drink water",
    "filename": "drink_water.task",
    "tag": "work",
    "status": "pending",
    "created_at": "2026-04-15"
  }
  ```
- **Response (201 Created):** Created task object.
- **Side effect:** The backend should log `[TASK] CREATE: <filename>`.

### Update Task
- **Method:** `PATCH /api/v1/tasks/<id>/` 
  *(Note: Frontend state tracks `id` and also searches by `filename`. Use `id` for RESTful precision.)*
- **Auth Required:** Yes
- **Request Body (Partial):**
  ```json
  {
    "status": "done",
    "description": "Multi-line\\ndescription here"
  }
  ```
- **Response (200 OK):** Updated task object.
- **Side effect:** The backend should log `[TASK] UPDATE: <filename>` or `[TASK] DONE: <filename>`.

### Delete Task
- **Method:** `DELETE /api/v1/tasks/<filename>/` (or by `<id>`)
- **Auth Required:** Yes
- **Response (204 No Content)**
- **Side effect:** The backend should log `[TASK] DELETE: <filename>`.

---

## Habits Endpoints

### List Habits
- **Method:** `GET /api/v1/habits/`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "id": "1",
      "name": "deep_work",
      "days": [false, true, true, false, false, false, false]
    }
  ]
  ```

### Create Habit
- **Method:** `POST /api/v1/habits/`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "gym_session"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "2",
    "name": "gym_session",
    "days": [false, false, false, false, false, false, false]
  }
  ```
- **Side effect:** The backend should log `[HABIT] ADD: <name>()`.

### Update Habit Days
- **Method:** `PATCH /api/v1/habits/<id>/`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "days": [false, true, true, true, false, false, false]
  }
  ```
- **Response (200 OK):** Updated habit object.
- **Side effect:** The backend should log `[HABIT] TOGGLED: <name>() day <index>`.

---

## Logs Endpoints

### List Logs
- **Method:** `GET /api/v1/logs/`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "time": "10:30:00",
      "action": "SYSTEM_BOOT"
    },
    {
      "id": 2,
      "time": "10:30:05",
      "action": "LOADED workspace/main.pro"
    }
  ]
  ```
*(Note: The frontend limits logs to the most recent 50 entries. The backend can enforce this limit organically when querying or pruning.)*

---

## What we do NOT need (Dead & Unused Code)

Please ignore the following when building the backend, as they are not used or represent duplicated/dead code on the frontend:

1. **Gamification features (XP, Levels, Streaks fields):** There are no XP or Level fields in the `User` model, and streak logic in `habits-tab.ts` is calculated entirely client-side based on the `days` boolean array. Do not add gamified data models.
2. `src/app/interfaces/struct-line.ts`: This entire interface file represents dead/duplicate code. The `TaskEditorComponent` has an inline version of the `StructLine` interface that it uses privately.
3. **Terminal State / IDE Tab State:** Things like `terminalHeight`, `terminalHistory`, `openTabs`, `activeTabId`, and `dirtyFiles` in `IdeStateService` are completely transient UI states. Do **not** build endpoints to persist the state of the user's IDE layout.
4. `logout()` **Payloads:** The frontend's logout mechanism simply clears the LocalStorage. There is no payload passed, so standard DRF token expiration or blacklist approaches are sufficient.
