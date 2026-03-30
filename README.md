# HabitLog: Gamified Habit Tracker

## Project Overview
HabitLog is a web application designed to help users build and maintain positive routines through gamification. The system allows users to track daily habits, visualize their progress, and earn experience points (XP) for consistency.This project is built as part of the Web Development course at KBTU (Spring 2026).

## Tech Stack
***Front-End**: Angular 17+ (TypeScript, HTML, CSS)
***Back-End**: Django + Django REST Framework (Python) 
***Authentication**: JWT (JSON Web Tokens) 
* **Database**: SQLite/PostgreSQL

## Core Features
***User Authentication**: Secure login and logout with JWT-protected routes.
***Habit Management**: Full CRUD operations for creating and tracking personal habits.
***Progress Tracking**: Categorized habits with visual indicators of completion status.
***Gamified Stats**: Automatic XP calculation based on habit completion logs.

## Requirements Coverage
***Models**: User, Habit, HabitLog, and Category with ForeignKey relationships.
***Angular Logic**: Use of `@for` loops for habit lists, `@if` for status alerts, and `HttpClient` for API requests.
***Forms**: Reactive and Template-driven forms for habit creation and profile updates.
***Navigation**: At least 3 named routes including Dashboard, Statistics, and Profile.

##Group Members (Practice Lesson, Wednesday: 10:00-12:00) 
1. Yeskenov Aldiyar - sawayaka143(https://github.com/sawayaka143)
2. Zharylgassyn Nurali - zharylgassyn(https://github.com/zharylgassyn)
3. Sagindykov Damir - damir
## Project Structure
*`frontend/`: Angular project files 
*`backend/`: Django project and API logic 
*`postman/`: Collection of API requests 