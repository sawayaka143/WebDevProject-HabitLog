import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  router = inject(Router);

  openTask(task: Task) {
    this.state.openTaskFile(task);
  }

  openHabits() {
    this.state.openTab({ id: 'habits.h', label: 'habits.h', type: 'habits' });
  }

  openReminders() {
    this.state.openTab({ id: 'reminders.r', label: 'reminders.r', type: 'reminders' });
  }

  openDashboard() {
    this.state.openTab({ id: 'dashboard.log', label: 'dashboard.log', type: 'dashboard' });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  createNewTask() {
    const title = prompt('Enter task title:');
    if (title && title.trim()) {
      const task = this.state.createTask(title.trim());
      this.state.openTaskFile(task);
    }
  }
}
