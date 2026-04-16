import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">TASKS_DONE</div>
          <div class="stat-val text-green">{{state.completedTodos()}}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">COMPLETION_%</div>
          <div class="stat-val text-amber">{{completionPercentage()}}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">HABIT_CHECKS</div>
          <div class="stat-val text-blue">{{totalHabitChecks()}}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">BEST_STREAK</div>
          <div class="stat-val text-danger">{{bestGlobalStreak()}}d</div>
        </div>
      </div>

      <div class="log-section">
        <div class="log-header">~/workspace/system.log</div>
        <div class="log-window">
          @for (log of displayedLogs(); track log.id; let i = $index) {
             <div class="log-row">
               <span class="log-line">[{{log.time}}]</span>
               <span class="log-prompt">></span>
               <span class="log-msg">{{log.action}}</span>
             </div>
          }
          @if (displayedLogs().length === 0) {
            <div class="log-row text-muted">// No recent activity</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 16px;
    }
    
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .stat-label {
      color: var(--text-secondary);
      font-size: 11px;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .stat-val {
      font-size: 32px;
      font-weight: bold;
    }
    
    .text-green { color: var(--accent-green); }
    .text-amber { color: var(--accent-amber); }
    .text-blue { color: #58a6ff; }
    .text-danger { color: var(--danger); }
    
    .log-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      overflow: hidden;
    }
    
    .log-header {
      background: var(--bg-tertiary);
      padding: 4px 12px;
      font-size: 12px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
    }
    
    .log-window {
      padding: 12px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .log-row {
      display: flex;
      gap: 8px;
      font-size: 13px;
    }
    .log-line { color: var(--text-muted); }
    .log-prompt { color: var(--accent-green); }
    .log-msg { color: var(--text-primary); }
  `]
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
      let currentStreak = 0;
      for (let i = today; i >= 0; i--) {
        if (h.days[i]) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          break;
        }
      }
    });
    return maxStreak;
  });

  displayedLogs = computed(() => {
    // Show only the last 8 actions as requested.
    return this.state.logs().slice(0, 8);
  });
}
