import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService, OpenTab } from '../../services/ide-state.service';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-bar">
      @for (tab of state.openTabs(); track tab.id) {
        <div
          class="tab"
          [class.active]="state.activeTabId() === tab.id"
          [class.dirty]="state.isDirty(tab.id)"
          (click)="state.activeTabId.set(tab.id)"
          (mousedown)="onMiddleClick($event, tab.id)"
        >
          <span class="tab-icon" [ngClass]="getIconClass(tab)">{{ getIconLabel(tab) }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          @if (state.isDirty(tab.id)) {
            <span class="tab-dirty-dot" title="Unsaved changes">●</span>
          }
          <button
            class="tab-close"
            (click)="closeTab($event, tab.id)"
            title="Close"
          >✕</button>
        </div>
      }
      @if (state.openTabs().length === 0) {
        <div class="tab-empty">// No files open — click a file in the Explorer</div>
      }
    </div>
  `,
  styles: [`
    .tab-bar {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
      overflow-y: hidden;
      height: 36px;
      flex-shrink: 0;
    }
    .tab-bar::-webkit-scrollbar { height: 3px; }
    .tab-bar::-webkit-scrollbar-track { background: var(--bg-secondary); }

    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px 0 10px;
      min-width: 120px;
      max-width: 200px;
      border-right: 1px solid var(--border-color);
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 12.5px;
      position: relative;
      flex-shrink: 0;
      transition: background 0.1s, color 0.1s;
      white-space: nowrap;
    }
    .tab:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .tab.active {
      background: var(--bg-primary);
      color: var(--text-primary);
      border-bottom: 2px solid var(--accent-blue);
      margin-bottom: -1px;
    }
    .tab.active.dirty {
      border-bottom-color: var(--accent-green);
    }

    .tab-icon {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 3px;
      border-radius: 2px;
      flex-shrink: 0;
      letter-spacing: 0;
    }
    .icon-c   { background: #1c4a6e; color: var(--accent-blue); }
    .icon-h   { background: #3a2f1a; color: var(--accent-amber); }
    .icon-log { background: #1e301e; color: var(--accent-green); font-size: 7px; }

    .tab-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-dirty-dot {
      color: #3fb950;
      font-size: 9px;
      flex-shrink: 0;
    }

    .tab-close {
      font-size: 11px;
      width: 18px;
      height: 18px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: 3px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s, color 0.15s;
    }
    .tab:hover .tab-close,
    .tab.active .tab-close {
      opacity: 1;
    }
    .tab-close:hover {
      background: rgba(255,85,85,0.2);
      color: var(--accent-red);
      border: none;
    }

    .tab-empty {
      display: flex;
      align-items: center;
      padding: 0 16px;
      color: var(--text-muted);
      font-size: 12px;
      font-style: italic;
    }
  `]
})
export class TabBarComponent {
  state = inject(IdeStateService);

  getIconClass(tab: OpenTab): string {
    if (tab.type === 'task')      return 'icon-c';
    if (tab.type === 'habits')    return 'icon-h';
    if (tab.type === 'dashboard') return 'icon-log';
    return '';
  }

  getIconLabel(tab: OpenTab): string {
    if (tab.type === 'task')      return 'C';
    if (tab.type === 'habits')    return 'H';
    if (tab.type === 'dashboard') return 'LOG';
    return '?';
  }

  closeTab(event: MouseEvent, tabId: string) {
    event.stopPropagation();
    this.state.closeTab(tabId);
  }

  onMiddleClick(event: MouseEvent, tabId: string) {
    if (event.button === 1) {
      event.preventDefault();
      this.state.closeTab(tabId);
    }
  }
}
