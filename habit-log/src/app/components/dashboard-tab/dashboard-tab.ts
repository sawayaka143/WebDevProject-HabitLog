import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-dashboard-tab',
  imports: [CommonModule],
  templateUrl: './dashboard-tab.html',
  styleUrl: './dashboard-tab.css'
})
export class DashboardTabComponent {
  state = inject(IdeStateService);

  completionPercentage = computed(() => {
    const total = this.state.totalTodos();
    if (total === 0) return 0;
    return Math.round((this.state.completedTodos() / total) * 100);
  });

  totalHabitChecks = computed(() => {
    return this.state.habits().reduce((acc, h) => acc + h.days.filter(d => d).length, 0);
  });

  bestGlobalStreak = computed(() => {
    const today = new Date().getDay();
    let maxStreak = 0;
    this.state.habits().forEach(h => {
      let s = 0;
      for (let i = today; i >= 0; i--) {
        if (h.days[i]) { s++; if (s > maxStreak) maxStreak = s; }
        else break;
      }
    });
    return maxStreak;
  });

  tagStats = computed(() => {
    const counts: Record<string, number> = { work: 0, personal: 0, health: 0 };
    this.state.tasks().forEach(t => counts[t.tag]++);
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  });

  displayedLogs = computed(() => this.state.logs().slice(0, 10));
}
