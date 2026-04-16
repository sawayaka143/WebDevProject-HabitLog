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
      <div class="grid-header">
        <div class="header-cell empty-cell"></div>
        <div class="header-cell name-cell">// function</div>
        @for (day of days; track day; let i = $index) {
          <div class="header-cell day-cell" [class.today]="i === todayIndex">
            {{day}}
          </div>
        }
        <div class="header-cell streak-cell">streak</div>
      </div>

      <div class="habits-list">
        @for (habit of state.habits(); track habit.id; let rowIdx = $index) {
          <div class="habit-row">
            <div class="cell line-num">{{rowIdx + 1 | number:'2.0-0'}}</div>
            <div class="cell name-cell text-blue">{{habit.name}}() {{'{'}}</div>
            
            @for (completed of habit.days; track $index; let colIdx = $index) {
              <div class="cell day-cell" [class.today]="colIdx === todayIndex">
                <div 
                  class="toggle-box" 
                  [class.on]="completed"
                  (click)="state.toggleHabitDay(habit.id, colIdx)"
                >
                  {{completed ? '█' : '·'}}
                </div>
              </div>
            }
            
            <div class="cell streak-cell" [class.active-streak]="getStreak(habit.days) > 0">
              <span class="text-blue">&#125;</span>
              @if (getStreak(habit.days) > 0) {
                <span class="badge">{{getStreak(habit.days)}}d 🔥</span>
              }
            </div>
          </div>
        }
      </div>

      <div class="input-row">
        <span class="prompt">></span>
        <span class="text-blue">def</span>
        <input 
          type="text" 
          [(ngModel)]="newHabitName" 
          (keyup.enter)="addHabit()"
          placeholder="habit_name" 
          class="habit-input"
        >
        <span>():</span>
        <button (click)="addHabit()" class="btn-create">CREATE</button>
      </div>
    </div>
  `,
  styles: [`
    .habits-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .grid-header {
      display: flex;
      color: var(--text-muted);
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    
    .habit-row {
      display: flex;
      align-items: center;
      padding: 4px 0;
    }
    .habit-row:hover {
      background: var(--bg-secondary);
    }
    
    .cell, .header-cell {
      display: flex;
      align-items: center;
    }
    
    .empty-cell { width: 24px; }
    .line-num { width: 24px; color: var(--text-muted); justify-content: flex-end; padding-right: 8px; }
    
    .name-cell { flex: 1; min-width: 150px; }
    
    .day-cell { width: 40px; justify-content: center; }
    .day-cell.today { color: var(--accent-amber); font-weight: bold; }
    
    .streak-cell { width: 80px; padding-left: 8px; justify-content: space-between; }
    
    .text-blue { color: #58a6ff; }
    
    .toggle-box {
      cursor: pointer;
      color: var(--text-muted);
      user-select: none;
    }
    .toggle-box.on {
      color: var(--accent-green);
    }
    .toggle-box:hover {
      color: var(--text-primary);
    }
    
    .badge {
      background: rgba(255, 176, 0, 0.2);
      color: var(--accent-amber);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid var(--accent-amber);
      margin-left: 8px;
    }
    
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      border-top: 1px dashed var(--border-color);
      padding-top: 16px;
    }
    .prompt { color: var(--accent-green); font-weight: bold; }
    
    .habit-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-color);
      color: var(--accent-amber);
      width: 150px;
    }
    .habit-input:focus {
      outline: none;
      border-color: var(--accent-green);
    }
    
    .btn-create {
      margin-left: auto;
      color: var(--blue);
      border-color: var(--blue);
    }
    .btn-create:hover {
      background: var(--blue);
      color: var(--bg-primary);
    }
  `]
})
export class HabitsTabComponent {
  state = inject(IdeStateService);
  
  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  todayIndex = new Date().getDay();
  
  newHabitName = '';

  getStreak(days: boolean[]): number {
    // Current streak logic: from today backwards, how many consecutive days are true?
    let streak = 0;
    for (let i = this.todayIndex; i >= 0; i--) {
      if (days[i]) streak++;
      else break;
    }
    return streak;
  }

  addHabit() {
    // Replace non-word chars to mimic function name restriction
    const cleanName = this.newHabitName.replace(/\W/g, '_');
    if (cleanName) {
      this.state.addHabit(cleanName);
      this.newHabitName = '';
    }
  }
}
