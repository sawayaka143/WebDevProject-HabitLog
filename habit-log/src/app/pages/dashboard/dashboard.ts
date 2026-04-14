import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  template: `
    <div class="container mt-4 mb-4">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h2>Your Habits</h2>
          <p class="text-muted">{{ today | date:'fullDate' }}</p>
        </div>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Habit' }}
        </button>
      </div>

      @if (showForm) {
        <div class="glass-card mb-4" style="border-left: 4px solid var(--accent-primary);">
          <h3 class="mb-2">Create New Habit</h3>
          <form [formGroup]="habitForm" (ngSubmit)="addHabit()">
            <div class="d-flex gap-4">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" formControlName="title" placeholder="e.g., Drink Water">
              </div>
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Description</label>
                <input type="text" class="form-control" formControlName="description" placeholder="Brief description">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Category</label>
                <select class="form-control" formControlName="categoryId">
                  @for (cat of habitService.categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="habitForm.invalid">Save Habit</button>
          </form>
        </div>
      }

      <div class="d-flex flex-column gap-2">
        @for (habit of habitService.habits(); track habit.id) {
          <div class="glass-card d-flex justify-between align-center" [ngClass]="{'completed-card': habit.completedToday}">
            <div class="d-flex align-center gap-3">
              <button 
                class="complete-toggle" 
                [ngClass]="{'active': habit.completedToday}"
                (click)="toggleHabit(habit.id)">
                @if (habit.completedToday) {
                  <span>✔</span>
                }
              </button>
              <div>
                <h3 [ngClass]="{'text-strike': habit.completedToday}" style="margin-bottom: 0.2rem;">{{ habit.title }}</h3>
                <p class="text-muted m-0">{{ habit.description }}</p>
              </div>
            </div>
            <div class="d-flex flex-column align-center">
              <span class="status-badge" [ngClass]="habit.completedToday ? 'status-completed' : 'status-pending'">
                {{ habit.completedToday ? 'Completed' : 'Pending' }}
              </span>
              <span class="text-accent mt-2" style="font-size: 0.9rem; font-weight: bold;">🔥 Streak: {{ habit.streak }}</span>
            </div>
          </div>
        } @empty {
          <div class="glass-card text-center p-4">
            <h3 class="text-muted mb-2">No habits tracked yet!</h3>
            <p class="text-muted">Click "Add Habit" to start building your routine.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .complete-toggle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
      background: transparent;
      color: var(--bg-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all var(--transition-fast);
    }
    .complete-toggle.active {
      background: var(--accent-primary);
    }
    .completed-card {
      opacity: 0.7;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .text-strike {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
  `
})
export class Dashboard {
  habitService = inject(HabitService);
  fb = inject(FormBuilder);
  
  today = new Date();
  showForm = false;

  habitForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    categoryId: [1, Validators.required]
  });

  addHabit() {
    if (this.habitForm.valid) {
      this.habitService.addHabit({
        title: this.habitForm.value.title!,
        description: this.habitForm.value.description || '',
        categoryId: Number(this.habitForm.value.categoryId)
      });
      this.habitForm.reset({ categoryId: 1 });
      this.showForm = false;
    }
  }

  toggleHabit(id: number) {
    this.habitService.toggleCompletion(id);
  }
}
