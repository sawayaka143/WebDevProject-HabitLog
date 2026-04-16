import { Injectable, signal } from '@angular/core';

export interface Category {
  id: number;
  name: string;
}

export type TargetDate = 'Today' | 'Tomorrow' | 'Next Week' | 'Next Month';

export interface Habit {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  completedToday: boolean;
  streak: number;
  targetDate: TargetDate;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  categories = signal<Category[]>([
    { id: 1, name: 'Health' },
    { id: 2, name: 'Productivity' },
    { id: 3, name: 'Learning' }
  ]);

  habits = signal<Habit[]>([
    { id: 1, title: 'Morning Jog', description: 'Run for 30 mins', categoryId: 1, completedToday: false, streak: 5, targetDate: 'Today' },
    { id: 2, title: 'Read a Book', description: 'Read 20 pages', categoryId: 3, completedToday: true, streak: 12, targetDate: 'Today' },
    { id: 3, title: 'Code Practice', description: 'Solve 2 LeetCode problems', categoryId: 2, completedToday: false, streak: 1, targetDate: 'Tomorrow' },
    { id: 4, title: 'Grocery Shopping', description: 'Buy fruits and vegetables', categoryId: 1, completedToday: false, streak: 0, targetDate: 'Next Week' }
  ]);

  totalXp = signal<number>(1540);

  constructor() {}

  addHabit(habit: Omit<Habit, 'id' | 'completedToday' | 'streak'>) {
    const newHabit: Habit = {
      ...habit,
      id: Math.max(...this.habits().map(h => h.id), 0) + 1,
      completedToday: false,
      streak: 0
    };
    this.habits.update(h => [...h, newHabit]);
  }

  toggleCompletion(habitId: number) {
    this.habits.update(habits => {
      return habits.map(h => {
        if (h.id === habitId) {
          const newStatus = !h.completedToday;
          this.totalXp.update(xp => newStatus ? xp + 50 : xp - 50);
          return { ...h, completedToday: newStatus, streak: newStatus ? h.streak + 1 : Math.max(0, h.streak - 1) };
        }
        return h;
      });
    });
  }

  deleteHabit(habitId: number) {
    this.habits.update(habits => habits.filter(h => h.id !== habitId));
  }
}
