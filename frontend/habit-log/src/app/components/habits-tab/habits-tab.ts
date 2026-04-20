import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-habits-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habits-tab.html',
  styleUrl: './habits-tab.css'
})
export class HabitsTabComponent {
  state = inject(IdeStateService);

  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  todayIndex = new Date().getDay();
  newHabitName = '';

  getStreak(days: boolean[]): number {
    return days.filter(d => d).length;
  }

  addHabit() {
    const cleanName = this.newHabitName.replace(/\W/g, '_').toLowerCase();
    if (cleanName) {
      this.state.addHabit(cleanName);
      this.newHabitName = '';
    }
  }

  deleteHabit(habitId: string) {
    if (confirm('Delete this habit?')) {
      this.state.deleteHabit(habitId);
    }
  }
}
