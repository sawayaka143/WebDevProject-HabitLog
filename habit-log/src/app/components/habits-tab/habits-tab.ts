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
