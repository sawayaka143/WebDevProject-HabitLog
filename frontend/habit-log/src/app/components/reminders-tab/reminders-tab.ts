import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService, Reminder, Habit } from '../../services/ide-state.service';

@Component({
  selector: 'app-reminders-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reminders-tab.html',
  styleUrl: './reminders-tab.css'
})
export class RemindersTabComponent {
  state = inject(IdeStateService);

  newReminder = {
    habit: '',
    message: '',
    reminder_time: ''
  };

  getHabitName(habitId: string): string {
    const habit = this.state.habits().find(h => h.id === habitId);
    return habit ? habit.name : 'Unknown Habit';
  }

  addReminder() {
    if (this.newReminder.habit && this.newReminder.message && this.newReminder.reminder_time) {
      this.state.addReminder(
        this.newReminder.habit,
        this.newReminder.message,
        this.newReminder.reminder_time
      );
      this.newReminder = { habit: '', message: '', reminder_time: '' };
    }
  }

  updateReminder(reminder: Reminder, field: keyof Reminder, value: any) {
    this.state.updateReminder(reminder.id, { [field]: value });
  }

  deleteReminder(reminderId: string) {
    if (confirm('Delete this reminder?')) {
      this.state.deleteReminder(reminderId);
    }
  }

  formatDateTime(datetime: string): string {
    return new Date(datetime).toLocaleString();
  }
}