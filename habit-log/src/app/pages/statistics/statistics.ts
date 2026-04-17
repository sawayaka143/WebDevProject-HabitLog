import { Component, computed, inject } from '@angular/core';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics {
  habitService = inject(HabitService);

  completionRate = computed(() => {
    const habits = this.habitService.habits();
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.completedToday).length;
    return Math.round((completed / habits.length) * 100);
  });

  highestStreak = computed(() => {
    const habits = this.habitService.habits();
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.streak));
  });

  currentLevel = computed(() => {
    return Math.floor(this.habitService.totalXp() / 1000) + 1;
  });

  levelProgress = computed(() => {
    const xpInLevel = this.habitService.totalXp() % 1000;
    return Math.round((xpInLevel / 1000) * 100);
  });

  xpToNextLevel = computed(() => {
    return 1000 - (this.habitService.totalXp() % 1000);
  });
}
