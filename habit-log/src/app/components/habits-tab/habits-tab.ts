import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-habits-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="habits-container">

      <div class="file-comment">// habits.h — Weekly habit tracker</div>

      <div class="grid-header">
        <div class="header-cell empty-cell"></div>
        <div class="header-cell name-cell">// function</div>
        @for (day of days; track day; let i = $index) {
          <div class="header-cell day-cell" [class.today]="i === todayIndex">
            {{ day }}
          </div>
        }
        <div class="header-cell streak-cell">streak</div>
      </div>

      <div class="habits-list">
        @for (habit of state.habits(); track habit.id; let rowIdx = $index) {
          <div class="habit-row">
            <div class="cell line-num">{{ (rowIdx + 1).toString().padStart(2, '0') }}</div>
            <div class="cell name-cell">
              <span class="fn-blue">{{ habit.name }}</span><span class="fn-paren">() &#123;</span>
            </div>

            @for (completed of habit.days; track $index; let colIdx = $index) {
              <div class="cell day-cell" [class.today]="colIdx === todayIndex">
                <div
                  class="toggle-box"
                  [class.on]="completed"
                  (click)="state.toggleHabitDay(habit.id, colIdx)"
                >{{ completed ? '█' : '·' }}</div>
              </div>
            }

            <div class="cell streak-cell" [class.active-streak]="getStreak(habit.days) > 0">
              <span class="fn-blue">&#125;</span>
              @if (getStreak(habit.days) > 0) {
                <span class="badge">{{ getStreak(habit.days) }}d 🔥</span>
              }
            </div>
          </div>
        }
        @if (state.habits().length === 0) {
          <div class="empty-state">// No habits defined. Add one below.</div>
        }
      </div>

      <div class="input-row">
        <span class="prompt-sym">›</span>
        <span class="fn-blue">def</span>
        <input
          type="text"
          [(ngModel)]="newHabitName"
          (keyup.enter)="addHabit()"
          placeholder="habit_name"
          class="habit-input"
        />
        <span class="fn-paren">():</span>
        <button (click)="addHabit()" class="btn-create">+ ADD HABIT</button>
      </div>
    </div>
  `,
  styles: [`
    .habits-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
    }

    .file-comment {
      color: var(--text-muted);
      font-style: italic;
      font-size: 12px;
      padding-bottom: 8px;
      border-bottom: 1px dashed var(--border-color);
    }

    .grid-header {
      display: flex;
      color: var(--text-muted);
      font-size: 12px;
      padding-bottom: 6px;
      border-bottom: 1px dashed var(--border-color);
    }

    .habit-row {
      display: flex;
      align-items: center;
      padding: 3px 0;
      border-radius: 2px;
      transition: background 0.1s;
    }
    .habit-row:hover { background: var(--bg-secondary); }

    .cell, .header-cell {
      display: flex;
      align-items: center;
    }

    .empty-cell { width: 32px; }
    .line-num {
      width: 32px;
      color: var(--text-muted);
      font-size: 12px;
      justify-content: flex-end;
      padding-right: 10px;
    }
    .name-cell { flex: 1; min-width: 160px; }
    .day-cell  { width: 42px; justify-content: center; }
    .day-cell.today { color: var(--accent-amber); font-weight: bold; }
    .streak-cell { width: 90px; padding-left: 10px; gap: 6px; }

    .fn-blue  { color: var(--accent-blue); }
    .fn-paren { color: var(--text-secondary); }

    .toggle-box {
      cursor: pointer;
      color: var(--text-muted);
      user-select: none;
      font-size: 14px;
      transition: color 0.15s, transform 0.1s;
    }
    .toggle-box.on { color: var(--accent-green); }
    .toggle-box:hover { color: var(--text-primary); transform: scale(1.2); }

    .badge {
      background: rgba(255, 179, 71, 0.15);
      color: var(--accent-amber);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid rgba(255,179,71,0.4);
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      border-top: 1px dashed var(--border-color);
      padding-top: 12px;
    }
    .prompt-sym { color: var(--accent-green); font-weight: bold; }

    .habit-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-color);
      color: var(--accent-amber);
      width: 160px;
      padding: 2px 4px;
      font-size: 13px;
    }
    .habit-input:focus {
      outline: none;
      border-color: var(--accent-green);
    }

    .btn-create {
      margin-left: auto;
      color: var(--accent-blue);
      border-color: var(--accent-blue);
      font-size: 12px;
    }
    .btn-create:hover { background: rgba(88,166,255,0.1); }

    .empty-state {
      color: var(--text-muted);
      font-style: italic;
      padding: 12px 32px;
      font-size: 13px;
    }
  `]
})
export class HabitsTabComponent {
  state = inject(IdeStateService);

  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  todayIndex = new Date().getDay();
  newHabitName = '';

  getStreak(days: boolean[]): number {
    let streak = 0;
    for (let i = this.todayIndex; i >= 0; i--) {
      if (days[i]) streak++; else break;
    }
    return streak;
  }

  addHabit() {
    const cleanName = this.newHabitName.replace(/\W/g, '_').toLowerCase();
    if (cleanName) {
      this.state.addHabit(cleanName);
      this.newHabitName = '';
    }
  }
}
