import { Component, computed, inject } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TabBarComponent } from '../../components/tab-bar/tab-bar';
import { TaskEditorComponent } from '../../components/task-editor/task-editor';
import { HabitsTabComponent } from '../../components/habits-tab/habits-tab';
import { DashboardTabComponent } from '../../components/dashboard-tab/dashboard-tab';
import { TerminalComponent } from '../../components/terminal/terminal';
import { MenubarComponent } from '../../components/menubar/menubar';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    TabBarComponent,
    TaskEditorComponent,
    HabitsTabComponent,
    DashboardTabComponent,
    TerminalComponent,
    MenubarComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  state = inject(IdeStateService);

  activeTabType = computed(() => {
    const active = this.state.openTabs().find(
      tab => tab.id === this.state.activeTabId()
    );
    return active?.type ?? null;
  });
}