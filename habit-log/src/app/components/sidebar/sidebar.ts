import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService, Task } from '../../services/ide-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
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
