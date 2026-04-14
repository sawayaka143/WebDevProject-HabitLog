import { Component, computed, inject } from '@angular/core';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  template: `
    <div class="container mt-4 mb-4">
      <h2 class="mb-4">Your Progress Statistics</h2>
      
      <div class="d-flex gap-4 mb-4 flex-wrap">
        <div class="glass-card text-center" style="flex: 1; min-width: 250px;">
          <h3 class="text-accent" style="font-size: 3.5rem;">{{ habitService.totalXp() }}</h3>
          <p class="text-muted">Total XP Earned</p>
        </div>
        
        <div class="glass-card text-center" style="flex: 1; min-width: 250px;">
          <h3 class="text-accent" style="font-size: 3.5rem;">{{ completionRate() }}%</h3>
          <p class="text-muted">Daily Completion Rate</p>
        </div>

        <div class="glass-card text-center" style="flex: 1; min-width: 250px;">
          <h3 class="text-accent" style="font-size: 3.5rem;">{{ highestStreak() }}</h3>
          <p class="text-muted">Highest Streak (Days)</p>
        </div>
      </div>
      
      <div class="glass-card">
        <h3 class="mb-4">Level Progress (Level {{ currentLevel() }})</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="levelProgress()"></div>
        </div>
        <div class="d-flex justify-between mt-2">
          <span class="text-muted">XP to next level: {{ xpToNextLevel() }}</span>
          <span class="text-muted">{{ levelProgress() }}% Complete</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .progress-bar-container {
      width: 100%;
      height: 24px;
      background: var(--bg-secondary);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--glass-border);
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary));
      transition: width 1s ease-in-out;
      border-radius: 12px;
    }
    .flex-wrap {
      flex-wrap: wrap;
    }
  `
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
