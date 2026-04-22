import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService, OpenTab } from '../../services/ide-state.service';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.css'
})
export class TabBarComponent {
  state = inject(IdeStateService);

  getIconClass(tab: OpenTab): string {
    if (tab.type === 'task')      return 'icon-task';
    if (tab.type === 'habits')    return 'icon-h';
    if (tab.type === 'reminders') return 'icon-r';
    if (tab.type === 'dashboard') return 'icon-log';
    return '';
  }

  getIconLabel(tab: OpenTab): string {
    if (tab.type === 'task')      return 'T';
    if (tab.type === 'habits')    return 'H';
    if (tab.type === 'reminders') return 'R';
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
