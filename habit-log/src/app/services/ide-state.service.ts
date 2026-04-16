import { Injectable, signal, computed } from '@angular/core';

export type TabType = 'todos.c' | 'habits.h' | 'dashboard.log';
export type FilterType = 'all_tasks' | 'work' | 'personal' | 'health' | 'pending' | 'completed';
export type TagType = 'work' | 'personal' | 'health';

export interface Todo {
  id: string;
  text: string;
  tag: TagType;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  days: boolean[]; // Array representing 7 days (Sun-Sat)
}

export interface LogEntry {
  time: string;
  action: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class IdeStateService {
  // Navigation State
  activeTab = signal<TabType>('todos.c');
  activeFilter = signal<FilterType>('all_tasks');
  
  // Data State - Preloaded with hardcoded info for demonstration
  todos = signal<Todo[]>([
    { id: '1', text: 'Initialize repository', tag: 'work', done: true },
    { id: '2', text: 'Drink water', tag: 'health', done: false },
    { id: '3', text: 'Read documentation', tag: 'personal', done: false },
  ]);
  
  habits = signal<Habit[]>([
    { id: '1', name: 'deep_work', days: [false, true, true, false, false, false, false] },
    { id: '2', name: 'gym_session', days: [false, false, true, false, false, false, false] },
  ]);
  
  logs = signal<LogEntry[]>([
    { id: 1, time: new Date().toLocaleTimeString(), action: 'SYSTEM_BOOT' },
    { id: 2, time: new Date().toLocaleTimeString(), action: 'LOADED workspace/main.pro' }
  ]);
  
  private logIdCounter = 3;

  // Computed Values
  totalTodos = computed(() => this.todos().length);
  completedTodos = computed(() => this.todos().filter(t => t.done).length);
  totalHabits = computed(() => this.habits().length);
  
  // Gets streak based on current date back for specific habit (Simplified logic: count consecutive true from arbitrary max to 0)
  // For actual logic, we will assume today is the last index (index 6).
  totalActiveStreak = computed(() => {
    // Just a dummy global streak calculation for the status bar
    const sum = this.habits().reduce((acc, h) => acc + h.days.filter(d => d).length, 0);
    return sum;
  });

  // Actions
  setTab(tab: TabType) {
    this.activeTab.set(tab);
    this.addLog(`Switched to tab: ${tab}`);
  }

  setFilter(filter: FilterType) {
    this.activeFilter.set(filter);
    this.addLog(`Applied filter: ${filter}`);
  }

  addTodo(text: string, tag: TagType) {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      tag,
      done: false
    };
    this.todos.update(t => [...t, newTodo]);
    this.addLog(`[TODO] ADD: ${text}`);
  }

  toggleTodo(id: string) {
    this.todos.update(todos => 
      todos.map(t => {
        if (t.id === id) {
          const isDone = !t.done;
          this.addLog(`[TODO] ${isDone ? 'COMPLETE' : 'UNCOMPLETE'}: ${t.text}`);
          return { ...t, done: isDone };
        }
        return t;
      })
    );
  }

  editTodoText(id: string, newText: string) {
    this.todos.update(todos => 
      todos.map(t => {
        if (t.id === id && t.text !== newText) {
          this.addLog(`[TODO] EDITED: ${t.text} -> ${newText}`);
          return { ...t, text: newText };
        }
        return t;
      })
    );
  }

  deleteTodo(id: string) {
    let deletedText = '';
    this.todos.update(todos => {
      const idx = todos.findIndex(t => t.id === id);
      if (idx > -1) deletedText = todos[idx].text;
      return todos.filter(t => t.id !== id);
    });
    if (deletedText) this.addLog(`[TODO] DELETE: ${deletedText}`);
  }

  addHabit(name: string) {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      days: [false, false, false, false, false, false, false]
    };
    this.habits.update(h => [...h, newHabit]);
    this.addLog(`[HABIT] ADD: ${name}()`);
  }

  toggleHabitDay(habitId: string, dayIndex: number) {
    this.habits.update(habits => 
      habits.map(h => {
        if (h.id === habitId) {
          const newDays = [...h.days];
          newDays[dayIndex] = !newDays[dayIndex];
          this.addLog(`[HABIT] TOGGLED: ${h.name}() on day ${dayIndex}`);
          return { ...h, days: newDays };
        }
        return h;
      })
    );
  }

  private addLog(action: string) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.update(l => {
      const newLogs = [{ id: this.logIdCounter++, time, action }, ...l];
      return newLogs.slice(0, 50); // Keep last 50
    });
  }
}
