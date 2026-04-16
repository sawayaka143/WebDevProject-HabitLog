import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">

      <div class="file-comment">// dashboard.log — System overview &amp; activity log</div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">TASKS_DONE</div>
          <div class="stat-val text-green">{{ state.completedTodos() }}</div>
          <div class="stat-sub">of {{ state.totalTodos() }} total</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">COMPLETION_%</div>
          <div class="stat-val text-amber">{{ completionPercentage() }}<span class="pct">%</span></div>
          <div class="stat-sub">completion rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">HABIT_CHECKS</div>
          <div class="stat-val text-blue">{{ totalHabitChecks() }}</div>
          <div class="stat-sub">this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">BEST_STREAK</div>
          <div class="stat-val text-danger">{{ bestGlobalStreak() }}<span class="pct">d</span></div>
          <div class="stat-sub">longest streak</div>
        </div>
      </div>

      <!-- Tag breakdown -->
      <div class="tag-row">
        @for (tag of tagStats(); track tag.name) {
          <div class="tag-chip" [ngClass]="'tag-' + tag.name">
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">{{ tag.count }}</span>
          </div>
        }
      </div>

      <div class="log-section">
        <div class="log-header">~/workspace/system.log</div>
        <div class="log-window">
          @for (log of displayedLogs(); track log.id) {
            <div class="log-row fade-in">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-arrow">&gt;</span>
              <span class="log-msg">{{ log.action }}</span>
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
      gap: 16px;
      height: 100%;
    }

    .file-comment {
      color: var(--text-muted);
      font-style: italic;
      font-size: 12px;
      padding-bottom: 8px;
      border-bottom: 1px dashed var(--border-color);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 12px;
    }

    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: border-color 0.2s;
    }
    .stat-card:hover { border-color: var(--text-muted); }

    .stat-label {
      color: var(--text-muted);
      font-size: 10px;
      letter-spacing: 1.2px;
    }
    .stat-val {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }
    .pct { font-size: 16px; font-weight: 400; opacity: 0.7; margin-left: 2px; }
    .stat-sub { font-size: 11px; color: var(--text-muted); }

    .text-green  { color: var(--accent-green); text-shadow: 0 0 8px rgba(57,255,20,0.3); }
    .text-amber  { color: var(--accent-amber); text-shadow: 0 0 8px rgba(255,179,71,0.3); }
    .text-blue   { color: var(--accent-blue);  text-shadow: 0 0 8px rgba(88,166,255,0.3); }
    .text-danger { color: var(--accent-red);   text-shadow: 0 0 8px rgba(255,85,85,0.3); }
    .text-muted  { color: var(--text-muted); }

    /* Tag breakdown */
    .tag-row {
      display: flex;
      gap: 10px;
    }
    .tag-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      border: 1px solid;
    }
    .tag-work     { color: var(--accent-blue);  border-color: rgba(88,166,255,0.4);  background: rgba(88,166,255,0.08); }
    .tag-personal { color: #db61a2;              border-color: rgba(219,97,162,0.4);  background: rgba(219,97,162,0.08); }
    .tag-health   { color: #3fb950;              border-color: rgba(63,185,80,0.4);   background: rgba(63,185,80,0.08); }
    .tag-name { font-weight: 600; letter-spacing: 0.3px; }
    .tag-count { opacity: 0.8; }

    .log-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      overflow: hidden;
      min-height: 0;
    }
    .log-header {
      background: var(--bg-tertiary);
      padding: 5px 12px;
      font-size: 11.5px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .log-window {
      padding: 10px 12px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .log-row {
      display: flex;
      gap: 8px;
      font-size: 12.5px;
    }
    .log-time  { color: var(--text-muted); flex-shrink: 0; }
    .log-arrow { color: var(--accent-green); flex-shrink: 0; }
    .log-msg   { color: var(--text-primary); }
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
