# HabitLog: Gamified Habit Tracker

## Project Overview
HabitLog is a web application designed to help users build and maintain positive routines through gamification. The system allows users to track daily habits, visualize their progress, and earn experience points (XP) for consistency. [cite_start]This project is built as part of the Web Development course at KBTU (Spring 2026)[cite: 2].

## Tech Stack
* [cite_start]**Front-End**: Angular 17+ (TypeScript, HTML, CSS) [cite: 12]
* [cite_start]**Back-End**: Django + Django REST Framework (Python) 
* [cite_start]**Authentication**: JWT (JSON Web Tokens) [cite: 19, 32]
* **Database**: SQLite/PostgreSQL

## Core Features
* [cite_start]**User Authentication**: Secure login and logout with JWT-protected routes[cite: 19, 32].
* [cite_start]**Habit Management**: Full CRUD operations for creating and tracking personal habits[cite: 33].
* [cite_start]**Progress Tracking**: Categorized habits with visual indicators of completion status[cite: 18, 21].
* [cite_start]**Gamified Stats**: Automatic XP calculation based on habit completion logs[cite: 13, 20].

## Requirements Coverage
* [cite_start]**Models**: User, Habit, HabitLog, and Category with ForeignKey relationships[cite: 23, 25].
* [cite_start]**Angular Logic**: Use of `@for` loops for habit lists, `@if` for status alerts, and `HttpClient` for API requests[cite: 18, 20].
* [cite_start]**Forms**: Reactive and Template-driven forms for habit creation and profile updates[cite: 15].
* [cite_start]**Navigation**: At least 3 named routes including Dashboard, Statistics, and Profile[cite: 17].

## [cite_start]Group Members (Practice Lesson [Insert Your Lesson Number]) [cite: 5]
1. [Student Name 1] - [GitHub Username]
2. [Student Name 2] - [GitHub Username]
3. [Student Name 3] - [GitHub Username]

## Project Structure
* [cite_start]`frontend/`: Angular project files 
* [cite_start]`backend/`: Django project and API logic 
* [cite_start]`postman/`: Collection of API requests [cite: 36]
