import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService, Task } from '../../services/ide-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">EXPLORER</span>
      </div>

      <!-- WORKSPACE root -->
      <div class="tree-root">
        <span class="root-label">HABITLOG</span>
      </div>

      <!-- todos/ folder -->
      <div class="folder-row" (click)="state.todosExpanded.update(v => !v)">
        <span class="arrow">{{ state.todosExpanded() ? '▾' : '▸' }}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">todos</span>
        <span class="file-count">{{ state.tasks().length }}</span>
      </div>

      @if (state.todosExpanded()) {
        @for (task of state.tasks(); track task.id) {
          <div
            class="file-row"
            [class.active]="state.activeTabId() === task.filename"
            [class.open]="state.isTabOpen(task.filename)"
            (click)="openTask(task)"
          >
            <span class="file-indent"></span>
            <span class="file-type-icon c-icon">C</span>
            <span class="file-name" [class.done-file]="task.status === 'done'">{{ task.filename }}</span>
            @if (state.isDirty(task.filename)) {
              <span class="dirty-dot" title="Unsaved changes">●</span>
            }
          </div>
        }
        @if (state.tasks().length === 0) {
          <div class="empty-folder">// empty</div>
        }
      }

      <!-- habits/ folder -->
      <div class="folder-row" (click)="state.habitsExpanded.update(v => !v)">
        <span class="arrow">{{ state.habitsExpanded() ? '▾' : '▸' }}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">habits</span>
      </div>

      @if (state.habitsExpanded()) {
        <div
          class="file-row"
          [class.active]="state.activeTabId() === 'habits.h'"
          [class.open]="state.isTabOpen('habits.h')"
          (click)="openHabits()"
        >
          <span class="file-indent"></span>
          <span class="file-type-icon h-icon">H</span>
          <span class="file-name">habits.h</span>
        </div>
      }

      <!-- dashboard/ folder -->
      <div class="folder-row" (click)="state.dashboardExpanded.update(v => !v)">
        <span class="arrow">{{ state.dashboardExpanded() ? '▾' : '▸' }}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">dashboard</span>
      </div>

      @if (state.dashboardExpanded()) {
        <div
          class="file-row"
          [class.active]="state.activeTabId() === 'dashboard.log'"
          [class.open]="state.isTabOpen('dashboard.log')"
          (click)="openDashboard()"
        >
          <span class="file-indent"></span>
          <span class="file-type-icon log-icon">LOG</span>
          <span class="file-name">dashboard.log</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .sidebar {
      height: 100%;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }

    .sidebar-header {
      padding: 10px 16px 6px;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .sidebar-title {
      font-size: 10px;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .tree-root {
      padding: 8px 16px 4px;
    }
    .root-label {
      font-size: 11px;
      color: var(--text-secondary);
      letter-spacing: 0.5px;
    }

    .folder-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px 3px 12px;
      cursor: pointer;
      color: var(--text-primary);
      font-size: 13px;
      transition: background 0.1s;
    }
    .folder-row:hover {
      background: var(--bg-hover);
    }

    .arrow {
      font-size: 10px;
      color: var(--text-muted);
      width: 10px;
      flex-shrink: 0;
    }
    .folder-icon { font-size: 12px; }
    .folder-name { flex: 1; color: var(--text-primary); font-size: 13px; }
    .file-count {
      font-size: 10px;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      padding: 0 5px;
      border-radius: 8px;
    }

    .file-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px 2px 22px;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 12.5px;
      transition: background 0.1s, color 0.1s;
      position: relative;
    }
    .file-row:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .file-row.open {
      color: var(--text-primary);
    }
    .file-row.active {
      background: var(--bg-primary);
      color: var(--text-primary);
    }
    .file-row.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--accent-blue);
    }

    .file-indent { width: 12px; flex-shrink: 0; }

    .file-type-icon {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 3px;
      border-radius: 2px;
      flex-shrink: 0;
      letter-spacing: 0;
    }
    .c-icon   { background: #1c4a6e; color: var(--accent-blue); }
    .h-icon   { background: #3a2f1a; color: var(--accent-amber); }
    .log-icon { background: #1e301e; color: var(--accent-green); font-size: 7px; }

    .file-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .file-name.done-file {
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .dirty-dot {
      color: #3fb950;
      font-size: 10px;
      flex-shrink: 0;
    }

    .empty-folder {
      padding: 3px 8px 3px 38px;
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
    }
  `]
})
export class SidebarComponent {
  state = inject(IdeStateService);

  openTask(task: Task) {
    this.state.openTaskFile(task);
  }

  openHabits() {
    this.state.openTab({ id: 'habits.h', label: 'habits.h', type: 'habits' });
  }

  openDashboard() {
    this.state.openTab({ id: 'dashboard.log', label: 'dashboard.log', type: 'dashboard' });
  }
}
