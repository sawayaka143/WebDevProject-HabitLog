import { Component, computed, inject } from '@angular/core';
import { IdeStateService } from '../../services/ide-state.service';
import { CommonModule } from '@angular/common';
import { NavBar } from '../../components/nav-bar/nav-bar';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NavBar],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics {
  state = inject(IdeStateService);

  totalTasks = computed(() => this.state.tasks().length);
  completedTasks = computed(() => this.state.tasks().filter(t => t.status === 'done').length);
  pendingTasks = computed(() => this.state.tasks().filter(t => t.status === 'pending').length);
  completionPercentage = computed(() => this.totalTasks() > 0 ? Math.round((this.completedTasks() / this.totalTasks()) * 100) : 0);

  totalHabits = computed(() => this.state.habits().length);
  totalHabitChecks = computed(() => {
    return this.state.habits().reduce((sum, habit) => sum + habit.days.filter(d => d).length, 0);
  });

  tasksByTag = computed(() => {
    const tags = ['work', 'personal', 'health'];
    return tags.map(tag => ({
      tag,
      count: this.state.tasks().filter(t => t.tag === tag).length,
      completed: this.state.tasks().filter(t => t.tag === tag && t.status === 'done').length
    }));
  });
}
