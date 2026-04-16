# HabitLog: Low-Fi CLI Habit Tracker

## Project Overview
HabitLog is a minimalist habit tracking utility designed with a terminal-centric aesthetic. It rejects modern gamification in favor of a high-density, text-based interface inspired by classic IDEs and command-line environments. The system provides a distraction-free workspace for logging routines and monitoring consistency through ASCII-inspired visualizations. This project is developed for the Web Development course at KBTU (Spring 2026).

---

## Tech Stack
- **Front-End:** Angular 17+ (TypeScript, HTML, CSS)
- **Back-End:** Django + Django REST Framework (Python)
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** SQLite / PostgreSQL

---

## Core Features
- **User Authentication:** Secure session management via JWT.
- **Habit Management:** CRUD operations handled through a command-style interface.
- **Progress Tracking:** Consistency monitoring using status indicators and heatmaps.
- **Terminal Stats:** Data-driven metrics presented in a plain-text, low-overhead format.

---

## Requirements Coverage
- **Models:** User, Habit, HabitLog, and Category linked via ForeignKey relationships.
- **Angular Logic:** Implementation of `@for` blocks for list rendering and `@if` for conditional status displays.
- **Forms:** Reactive and Template-driven forms for habit entry and system configuration.
- **Navigation:** Routed architecture including Dashboard, Statistics, and Profile views.

---

## Group Members (Practice Lesson: Wednesday 10:00–12:00)

1. [Aldiyar Yeskenov](https://github.com/sawayaka143)
2. [Nurali Zharylgassyn](https://github.com/zharylgassyn)
3. [Damir Sagindykov](https://github.com/DamirSagingykov)

---

## Project Structure
- `frontend/` — Terminal-style Angular interface.
- `backend/` — RESTful Django API.
- `postman/` — API documentation and request collections.