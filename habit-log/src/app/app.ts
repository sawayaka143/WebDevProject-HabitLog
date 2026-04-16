import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService } from './services/ide-state.service';
import { SidebarComponent }      from './components/sidebar/sidebar';
import { TabBarComponent }       from './components/tab-bar/tab-bar';
import { TaskEditorComponent }   from './components/task-editor/task-editor';
import { HabitsTabComponent }    from './components/habits-tab/habits-tab';
import { DashboardTabComponent } from './components/dashboard-tab/dashboard-tab';
import { TerminalComponent }     from './components/terminal/terminal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TabBarComponent,
    TaskEditorComponent,
    HabitsTabComponent,
    DashboardTabComponent,
    TerminalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  state = inject(IdeStateService);

  /** Derives the type of the currently active tab so the template can switch on it. */
  activeTabType = computed<string>(() => {
    const id = this.state.activeTabId();
    if (!id) return 'none';
    const tab = this.state.openTabs().find(t => t.id === id);
    return tab?.type ?? 'none';
  });
}
