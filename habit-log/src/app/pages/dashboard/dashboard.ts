import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitService, TargetDate } from '../../services/habit.service';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
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
