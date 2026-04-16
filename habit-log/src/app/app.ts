import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeStateService, TabType, FilterType } from './services/ide-state.service';
import { TodosTabComponent } from './components/todos-tab/todos-tab';
import { HabitsTabComponent } from './components/habits-tab/habits-tab';
import { DashboardTabComponent } from './components/dashboard-tab/dashboard-tab';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TodosTabComponent, HabitsTabComponent, DashboardTabComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  tabs: TabType[] = ['todos.c', 'habits.h', 'dashboard.log'];
  filters: FilterType[] = ['all_tasks', 'work', 'personal', 'health', 'pending', 'completed'];

  constructor(public state: IdeStateService) {}
}
