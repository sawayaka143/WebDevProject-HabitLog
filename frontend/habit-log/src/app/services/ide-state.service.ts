import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export type TagType = 'work' | 'personal' | 'health';
export type FilterType = 'all_tasks' | 'work' | 'personal' | 'health' | 'pending' | 'completed';

export interface Task {
  id: string;
  filename: string;       // e.g. fix_auth_leak.task
  title: string;          // e.g. Fix auth leak
  status: 'pending' | 'done';
  tag: TagType;
  created_at: string;     // ISO date string
  description: string;
}

export interface Habit {
  id: string;
  name: string;
  days: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

export interface Reminder {
  id: string;
  habit: string; // habit id
  message: string;
  reminder_time: string; // ISO datetime string
}

export interface LogEntry {
  time: string;
  action: string;
  id: number;
}

export interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'success';
  text: string;
}

export interface OpenTab {
  id: string;       // unique key: filename for tasks, 'habits.h', 'dashboard.log', 'reminders.r'
  label: string;    // display name
  type: 'task' | 'habits' | 'dashboard' | 'reminders';
}

function toSnakeCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_');
}

@Injectable({
  providedIn: 'root'
})
export class IdeStateService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  // ───────── TASKS ─────────
  tasks = signal<Task[]>([
    {
      id: '1',
      filename: 'initialize_repository.task',
      title: 'Initialize repository',
      status: 'done',
      tag: 'work',
      created_at: '2026-04-14',
      description: 'Set up the base repo with Angular 17 and configure CI.'
    },
    {
      id: '2',
      filename: 'drink_water.task',
      title: 'Drink water',
      status: 'pending',
      tag: 'health',
      created_at: '2026-04-15',
      description: ''
    },
    {
      id: '3',
      filename: 'read_documentation.task',
      title: 'Read documentation',
      status: 'pending',
      tag: 'personal',
      created_at: '2026-04-16',
      description: 'Go through Angular signals docs and RxJS interop guide.'
    },
  ]);

  // ───────── HABITS ─────────
  habits = signal<Habit[]>([
    { id: '1', name: 'deep_work', days: [false, true, true, false, false, false, false] },
    { id: '2', name: 'gym_session', days: [false, false, true, false, false, false, false] },
  ]);

  // ───────── REMINDERS ─────────
  reminders = signal<Reminder[]>([]);

  // ───────── LOGS ─────────
  logs = signal<LogEntry[]>([
    { id: 1, time: new Date().toLocaleTimeString(), action: 'SYSTEM_BOOT' },
    { id: 2, time: new Date().toLocaleTimeString(), action: 'LOADED workspace/main.pro' }
  ]);
  private logIdCounter = 3;

  // ───────── TABS ─────────
  openTabs = signal<OpenTab[]>([
    { id: 'dashboard.log', label: 'dashboard.log', type: 'dashboard' }
  ]);
  activeTabId = signal<string>('dashboard.log');

  // ───────── DIRTY / UNSAVED FILES ─────────
  // Set of tab IDs that have unsaved changes
  dirtyFiles = signal<Set<string>>(new Set());

  // ───────── TERMINAL ─────────
  terminalHistory = signal<TerminalLine[]>([
    { type: 'output', text: 'HabitLog IDE v2.1.0 — type "help" for commands' },
    { type: 'output', text: '──────────────────────────────────────────────' },
  ]);
  terminalCollapsed = signal<boolean>(false);

  // ───────── SIDEBAR ─────────
  todosExpanded = signal<boolean>(true);
  habitsExpanded = signal<boolean>(true);
  dashboardExpanded = signal<boolean>(true);

  // ───────── COMPUTED ─────────
  totalTodos = computed(() => this.tasks().length);
  completedTodos = computed(() => this.tasks().filter(t => t.status === 'done').length);
  totalHabits = computed(() => this.habits().length);
  totalReminders = computed(() => this.reminders().length);

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined' && this.hasToken()) {
      this.loadTasks();
      this.loadHabits();
      this.loadReminders();
      this.loadLogs();
    }
  }

  initializeAfterLogin() {
    this.loadTasks();
    this.loadHabits();
    this.loadReminders();
    this.loadLogs();
  }

  private getHeaders(): HttpHeaders {
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('token') || ''
        : '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage.getItem('token');
  }

  private loadTasks() {
    this.http.get<Task[]>(`${this.apiUrl}/tasks/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.tasks.set(data),
      error: (err) => console.error('Load tasks error', err)
    });
  }

  private loadHabits() {
    this.http.get<Habit[]>(`${this.apiUrl}/habits/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.habits.set(data.map(h => ({
        ...h,
        id: String(h.id)
      }))),
      error: (err) => console.error('Load habits error', err)
    });
  }

  private loadReminders() {
    this.http.get<Reminder[]>(`${this.apiUrl}/reminders/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.reminders.set(data.map(r => ({
        ...r,
        id: String(r.id),
        habit: String(r.habit)
      }))),
      error: (err) => console.error('Load reminders error', err)
    });
  }

  private loadLogs() {
    this.http.get<LogEntry[]>(`${this.apiUrl}/logs/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.logs.set(data),
      error: (err) => console.error('Load logs error', err)
    });
  }

  // ───────── TAB ACTIONS ─────────
  openTab(tab: OpenTab) {
    const existing = this.openTabs().find(t => t.id === tab.id);
    if (!existing) {
      this.openTabs.update(tabs => [...tabs, tab]);
    }
    this.activeTabId.set(tab.id);
  }

  closeTab(tabId: string) {
    this.openTabs.update(tabs => tabs.filter(t => t.id !== tabId));
    this.dirtyFiles.update(s => { s.delete(tabId); return new Set(s); });

    const remaining = this.openTabs();
    if (this.activeTabId() === tabId) {
      this.activeTabId.set(remaining.length > 0 ? remaining[remaining.length - 1].id : '');
    }
  }

  isTabOpen(tabId: string): boolean {
    return this.openTabs().some(t => t.id === tabId);
  }

  isDirty(tabId: string): boolean {
    return this.dirtyFiles().has(tabId);
  }

  markDirty(tabId: string) {
    this.dirtyFiles.update(s => new Set(s).add(tabId));
  }

  markClean(tabId: string) {
    this.dirtyFiles.update(s => { const n = new Set(s); n.delete(tabId); return n; });
  }

  openTaskFile(task: Task) {
    this.openTab({ id: task.filename, label: task.filename, type: 'task' });
    this.addLog(`Opened ${task.filename}`);
  }

  // ───────── TASK ACTIONS ─────────
  createTask(title: string): Task {
    const filename = toSnakeCase(title) + '.task';
    const today = new Date().toISOString().split('T')[0];
    const newTaskPayload = {
      filename,
      title,
      status: 'pending' as const,
      tag: 'work' as const,
      created_at: today,
      description: ''
    };

    const optimisticTask: Task = {
      id: Date.now().toString(),
      ...newTaskPayload
    };

    this.tasks.update(t => [...t, optimisticTask]);

    this.http.post<Task>(`${this.apiUrl}/tasks/`, newTaskPayload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (createdTask) => {
        this.tasks.update(t =>
          t.map(task => task.id === optimisticTask.id ? createdTask : task)
        );
        this.loadLogs();
      },
      error: (err) => console.error('Create task error', err)
    });

    return optimisticTask;
  }

  updateTask(id: string, patch: Partial<Task>) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, ...patch } : t)
    );

    this.http.patch<Task>(`${this.apiUrl}/tasks/${id}/`, patch, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedTask) => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === id ? updatedTask : t)
        );
        this.loadLogs();
      },
      error: (err) => console.error('Update task error', err)
    });
  }

  deleteTask(filename: string): boolean {
    const task = this.tasks().find(t => t.filename === filename);
    if (!task) return false;

    this.tasks.update(t => t.filter(x => x.filename !== filename));
    this.closeTab(filename);

    this.http.delete(`${this.apiUrl}/tasks/${task.id}/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Delete task error', err)
    });

    return true;
  }

  markTaskDone(filename: string): boolean {
    const task = this.tasks().find(t => t.filename === filename);
    if (!task) return false;

    this.tasks.update(tasks =>
      tasks.map(t => t.filename === filename ? { ...t, status: 'done' } : t)
    );

    this.http.patch<Task>(`${this.apiUrl}/tasks/${task.id}/`, {
      status: 'done'
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedTask) => {
        this.tasks.update(tasks =>
          tasks.map(t => t.filename === filename ? updatedTask : t)
        );
        this.loadLogs();
      },
      error: (err) => console.error('Mark task done error', err)
    });

    return true;
  }

  getTaskByFilename(filename: string): Task | undefined {
    return this.tasks().find(t => t.filename === filename);
  }

  // ───────── HABIT ACTIONS ─────────
  addHabit(name: string) {
    const optimisticHabit: Habit = {
      id: Date.now().toString(),
      name,
      days: [false, false, false, false, false, false, false]
    };

    this.habits.update(h => [...h, optimisticHabit]);

    this.http.post<Habit>(`${this.apiUrl}/habits/`, { name }, {
      headers: this.getHeaders()
    }).subscribe({
      next: (newHabit) => {
        this.habits.update(h =>
          h.map(habit => habit.id === optimisticHabit.id ? { ...newHabit, id: String(newHabit.id) } : habit)
        );
        this.loadLogs();
      },
      error: (err) => console.error('Add habit error', err)
    });
  }

  deleteHabit(habitId: string) {
    this.habits.update(h => h.filter(habit => habit.id !== habitId));

    this.http.delete(`${this.apiUrl}/habits/${habitId}/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Delete habit error', err)
    });
  }

  toggleHabitDay(habitId: string, dayIndex: number) {
    const habit = this.habits().find(h => h.id === habitId);
    if (!habit) return;

    const newDays = [...habit.days];
    newDays[dayIndex] = !newDays[dayIndex];

    this.habits.update(habits =>
      habits.map(h => h.id === habitId ? { ...h, days: newDays } : h)
    );

    this.http.patch<Habit>(`${this.apiUrl}/habits/${habitId}/`, {
      days: newDays
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedHabit) => {
        this.habits.update(habits =>
          habits.map(h => h.id === habitId ? { ...updatedHabit, id: String(updatedHabit.id) } : h)
        );
        this.loadLogs();
      },
      error: (err) => console.error('Toggle habit error', err)
    });
  }

  // ───────── REMINDER ACTIONS ─────────
  addReminder(habitId: string, message: string, reminderTime: string) {
    const optimisticReminder: Reminder = {
      id: `temp-${Date.now()}`,
      habit: habitId,
      message,
      reminder_time: reminderTime
    };

    this.reminders.update(r => [...r, optimisticReminder]);

    this.http.post<Reminder>(`${this.apiUrl}/reminders/`, {
      habit: habitId,
      message,
      reminder_time: reminderTime
    }, {
      headers: this.getHeaders()
    }).subscribe({
      next: (newReminder) => {
        this.reminders.update(r =>
          r.map(reminder => reminder.id === optimisticReminder.id ? { ...newReminder, id: String(newReminder.id), habit: String(newReminder.habit) } : reminder)
        );
        this.loadLogs();
      },
      error: (err) => {
        console.error('Add reminder error', err);
        this.reminders.update(r => r.filter(reminder => reminder.id !== optimisticReminder.id));
      }
    });
  }

  updateReminder(reminderId: string, updates: Partial<Reminder>) {
    const original = this.reminders().find(r => r.id === reminderId);
    if (!original) return;

    this.reminders.update(r =>
      r.map(reminder => reminder.id === reminderId ? { ...reminder, ...updates } : reminder)
    );

    this.http.patch<Reminder>(`${this.apiUrl}/reminders/${reminderId}/`, updates, {
      headers: this.getHeaders()
    }).subscribe({
      next: (updatedReminder) => {
        this.reminders.update(r =>
          r.map(reminder => reminder.id === reminderId ? { ...updatedReminder, id: String(updatedReminder.id), habit: String(updatedReminder.habit) } : reminder)
        );
        this.loadLogs();
      },
      error: (err) => {
        console.error('Update reminder error', err);
        this.reminders.update(r => r.map(reminder => reminder.id === reminderId ? original : reminder));
      }
    });
  }

  deleteReminder(reminderId: string) {
    this.reminders.update(r => r.filter(reminder => reminder.id !== reminderId));

    this.http.delete(`${this.apiUrl}/reminders/${reminderId}/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.loadLogs(),
      error: (err) => console.error('Delete reminder error', err)
    });
  }

  // ───────── TERMINAL ACTIONS ─────────
  executeCommand(input: string) {
    const trimmed = input.trim();
    this.terminalHistory.update(h => [
      ...h,
      { type: 'prompt', text: `workspace/todos $ ${trimmed}` }
    ]);

    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'create': {
        const titleParts = parts.slice(1);
        if (titleParts.length === 0) {
          this.addTerminalLine('error', '> usage: create <task_title>');
          break;
        }
        const title = titleParts.join(' ');
        const task = this.createTask(title);
        this.addTerminalLine('success', `> created ${task.filename}`);
        this.addTerminalLine('output', '> opening file...');
        setTimeout(() => this.openTaskFile(task), 200);
        break;
      }
      case 'ls': {
        const files = this.tasks();
        if (files.length === 0) {
          this.addTerminalLine('output', '> todos/ is empty');
        } else {
          files.forEach(t => {
            const status = t.status === 'done' ? '✓' : '·';
            this.addTerminalLine('output', `  ${status}  ${t.filename}  [${t.tag}]`);
          });
        }
        break;
      }
      case 'done': {
        const filename = parts[1];
        if (!filename) {
          this.addTerminalLine('error', '> usage: done <filename>');
          break;
        }
        const fn = filename.endsWith('.task') ? filename : filename + '.task';
        const ok = this.markTaskDone(fn);
        if (ok) {
          this.addTerminalLine('success', `> marked ${fn} as done`);
        } else {
          this.addTerminalLine('error', `> file not found: ${fn}`);
        }
        break;
      }
      case 'rm': {
        const filename = parts[1];
        if (!filename) {
          this.addTerminalLine('error', '> usage: rm <filename>');
          break;
        }
        const fn = filename.endsWith('.task') ? filename : filename + '.task';
        const ok = this.deleteTask(fn);
        if (ok) {
          this.addTerminalLine('success', `> deleted ${fn}`);
        } else {
          this.addTerminalLine('error', `> file not found: ${fn}`);
        }
        break;
      }
      case 'help': {
        const lines = [
          '> Available commands:',
          '  create <title>    — create a new task file',
          '  ls                — list all task files',
          '  done <filename>   — mark a task as done',
          '  rm <filename>     — delete a task file',
          '  help              — show this message',
          '  clear             — clear terminal output',
        ];
        lines.forEach(l => this.addTerminalLine('output', l));
        break;
      }
      case 'clear': {
        this.terminalHistory.set([]);
        break;
      }
      default: {
        this.addTerminalLine('error', `> command not found: ${trimmed}`);
      }
    }
  }

  addTerminalLine(type: TerminalLine['type'], text: string) {
    this.terminalHistory.update(h => [...h, { type, text }]);
  }

  ensureTerminalOpen() {
    this.terminalCollapsed.set(false);
  }

  toggleTerminal() {
    this.terminalCollapsed.update(v => !v);
  }

  // ───────── LOG ACTIONS ─────────
  private addLog(action: string) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.update(l => {
      const newLogs = [{ id: this.logIdCounter++, time, action }, ...l];
      return newLogs.slice(0, 50);
    });
  }
}