import { Injectable, signal, computed } from '@angular/core';

export type TagType = 'work' | 'personal' | 'health';
export type FilterType = 'all_tasks' | 'work' | 'personal' | 'health' | 'pending' | 'completed';

export interface Task {
  id: string;
  filename: string;       // e.g. fix_auth_leak.c
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
  id: string;       // unique key: filename for tasks, 'habits.h', 'dashboard.log'
  label: string;    // display name
  type: 'task' | 'habits' | 'dashboard';
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

  // ───────── TASKS ─────────
  tasks = signal<Task[]>([
    {
      id: '1',
      filename: 'initialize_repository.c',
      title: 'Initialize repository',
      status: 'done',
      tag: 'work',
      created_at: '2026-04-14',
      description: 'Set up the base repo with Angular 17 and configure CI.'
    },
    {
      id: '2',
      filename: 'drink_water.c',
      title: 'Drink water',
      status: 'pending',
      tag: 'health',
      created_at: '2026-04-15',
      description: ''
    },
    {
      id: '3',
      filename: 'read_documentation.c',
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
  totalActiveStreak = computed(() => {
    const today = new Date().getDay();
    return this.habits().reduce((acc, h) => {
      let s = 0;
      for (let i = today; i >= 0; i--) {
        if (h.days[i]) s++; else break;
      }
      return acc + s;
    }, 0);
  });

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
    const filename = toSnakeCase(title) + '.c';
    const today = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: Date.now().toString(),
      filename,
      title,
      status: 'pending',
      tag: 'work',
      created_at: today,
      description: ''
    };
    this.tasks.update(t => [...t, newTask]);
    this.addLog(`[TASK] CREATE: ${filename}`);
    return newTask;
  }

  updateTask(id: string, patch: Partial<Task>) {
    this.tasks.update(tasks =>
      tasks.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...patch };
          this.addLog(`[TASK] UPDATE: ${t.filename}`);
          return updated;
        }
        return t;
      })
    );
  }

  deleteTask(filename: string): boolean {
    const task = this.tasks().find(t => t.filename === filename);
    if (!task) return false;
    this.tasks.update(t => t.filter(x => x.filename !== filename));
    this.closeTab(filename);
    this.addLog(`[TASK] DELETE: ${filename}`);
    return true;
  }

  markTaskDone(filename: string): boolean {
    const task = this.tasks().find(t => t.filename === filename);
    if (!task) return false;
    this.tasks.update(tasks =>
      tasks.map(t => t.filename === filename ? { ...t, status: 'done' } : t)
    );
    this.addLog(`[TASK] DONE: ${filename}`);
    return true;
  }

  getTaskByFilename(filename: string): Task | undefined {
    return this.tasks().find(t => t.filename === filename);
  }

  // ───────── HABIT ACTIONS ─────────
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
          this.addLog(`[HABIT] TOGGLED: ${h.name}() day ${dayIndex}`);
          return { ...h, days: newDays };
        }
        return h;
      })
    );
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
        const fn = filename.endsWith('.c') ? filename : filename + '.c';
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
        const fn = filename.endsWith('.c') ? filename : filename + '.c';
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

  private addTerminalLine(type: TerminalLine['type'], text: string) {
    this.terminalHistory.update(h => [...h, { type, text }]);
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
