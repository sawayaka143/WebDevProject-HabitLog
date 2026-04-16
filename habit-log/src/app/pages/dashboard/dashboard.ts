import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitService, TargetDate } from '../../services/habit.service';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  template: `
    <div class="container mt-4 mb-4" style="max-width: 800px;">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h2>Today</h2>
          <p class="text-muted">{{ today | date:'fullDate' }}</p>
        </div>
      </div>

      <!-- Quick Add Task Input -->
      <div class="glass-card mb-4 add-task-container">
        <form [formGroup]="habitForm" (ngSubmit)="addHabit()">
          <input type="text" class="task-input" formControlName="title" placeholder="Adding a Task">
          
          <div class="task-actions d-flex justify-between align-center mt-3">
            <div class="date-selector d-flex gap-1 flex-wrap">
              <button type="button" class="date-btn" [ngClass]="{'active': selectedDate === 'Today'}" (click)="setDate('Today')">
                <span class="icon">☀️</span> Today
              </button>
              <button type="button" class="date-btn" [ngClass]="{'active': selectedDate === 'Tomorrow'}" (click)="setDate('Tomorrow')">
                <span class="icon">🌅</span> Tomorrow
              </button>
              <button type="button" class="date-btn" [ngClass]="{'active': selectedDate === 'Next Week'}" (click)="setDate('Next Week')">
                <span class="icon">📅</span> Next Week
              </button>
              <button type="button" class="date-btn" [ngClass]="{'active': selectedDate === 'Next Month'}" (click)="setDate('Next Month')">
                <span class="icon">🌙</span> Next Month
              </button>
            </div>
            
            <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem;" [disabled]="!habitForm.value.title">Save</button>
          </div>
        </form>
      </div>

      <div class="d-flex flex-column gap-2">
        @for (habit of filteredHabits(); track habit.id) {
          <div class="glass-card task-card d-flex justify-between align-center" [ngClass]="{'completed-card': habit.completedToday}">
            <div class="d-flex align-center gap-3 w-100">
              <button 
                class="complete-toggle" 
                [ngClass]="{'active': habit.completedToday}"
                (click)="toggleHabit(habit.id)">
                @if (habit.completedToday) {
                  <span>✔</span>
                }
              </button>
              <div class="w-100">
                <h3 [ngClass]="{'text-strike': habit.completedToday}" style="margin-bottom: 0; font-size: 1.1rem; font-weight: 500;">
                  {{ habit.title }}
                </h3>
              </div>
              <span class="date-badge">{{ habit.targetDate }}</span>
            </div>
          </div>
        } @empty {
          <div class="empty-state text-center p-4 mt-4">
            <div class="empty-illustration mb-2">🌜</div>
            <h3 class="mb-1 text-primary">No tasks today</h3>
            <p class="text-muted">Enjoy your evening</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .add-task-container {
      padding: 1rem 1.5rem;
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      background: var(--bg-secondary);
    }
    .task-input {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-family: inherit;
      outline: none;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--glass-border);
    }
    .task-input::placeholder {
      color: var(--text-secondary);
    }
    .date-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: all var(--transition-fast);
    }
    .date-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .date-btn.active {
      background: rgba(64, 115, 251, 0.15); /* Soft blue tint */
      color: var(--accent-primary);
      border: 1px solid rgba(64, 115, 251, 0.3);
    }
    .icon {
      font-size: 1rem;
    }
    
    .task-card {
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      background: var(--bg-secondary);
      transition: all var(--transition-fast);
    }
    .task-card:hover {
      background: var(--bg-tertiary);
    }
    
    .complete-toggle {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 2px solid var(--text-secondary);
      background: transparent;
      color: var(--bg-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .complete-toggle.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .completed-card {
      opacity: 0.5;
    }
    .text-strike {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
    .date-badge {
      font-size: 0.8rem;
      color: var(--accent-primary);
      background: rgba(64, 115, 251, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      white-space: nowrap;
    }
    
    .empty-state {
      padding-top: 4rem;
    }
    .empty-illustration {
      font-size: 4rem;
      opacity: 0.8;
      filter: grayscale(100%);
    }
    .flex-wrap {
      flex-wrap: wrap;
    }
  `
})
export class Dashboard {
  habitService = inject(HabitService);
  fb = inject(FormBuilder);
  
  today = new Date();
  selectedDate: TargetDate = 'Today';

  habitForm = this.fb.group({
    title: ['', Validators.required]
  });

  filteredHabits = computed(() => {
    // Show only 'Today' tasks in this view
    return this.habitService.habits().filter(h => h.targetDate === 'Today');
  });

  setDate(date: TargetDate) {
    this.selectedDate = date;
  }

  addHabit() {
    if (this.habitForm.value.title) {
      this.habitService.addHabit({
        title: this.habitForm.value.title,
        description: '',
        categoryId: 1, // Defaulting for simple design
        targetDate: this.selectedDate
      });
      this.habitForm.reset();
      this.selectedDate = 'Today';
    }
  }

  toggleHabit(id: number) {
    this.habitService.toggleCompletion(id);
  }
}
