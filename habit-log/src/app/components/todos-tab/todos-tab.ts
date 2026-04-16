import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService, TagType, FilterType, Todo } from '../../services/ide-state.service';

@Component({
  selector: 'app-todos-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todos-container">
      <div class="input-row">
        <span class="prompt">$</span>
        <input 
          type="text" 
          [(ngModel)]="newTodoText" 
          (keyup.enter)="addTodo()"
          placeholder="Enter new task..." 
          class="todo-input"
        >
        <select [(ngModel)]="newTodoTag" class="todo-tag-select">
          <option value="work">work</option>
          <option value="personal">personal</option>
          <option value="health">health</option>
        </select>
        <button (click)="addTodo()" class="btn-insert">+ INSERT</button>
      </div>

      <div class="local-filters">
        <button [class.active]="state.activeFilter() === 'all_tasks'" (click)="state.setFilter('all_tasks')">ALL</button>
        <button [class.active]="state.activeFilter() === 'pending'" (click)="state.setFilter('pending')">PENDING</button>
        <button [class.active]="state.activeFilter() === 'completed'" (click)="state.setFilter('completed')">DONE</button>
      </div>

      <div class="todo-list">
        @for (todo of filteredTodos(); track todo.id; let i = $index) {
          <div class="todo-row" [class.done]="todo.done" [class.editing]="editingTodoId === todo.id">
            <span class="line-num">{{i + 1 | number:'2.0-0'}}</span>
            
            <div class="checkbox" (click)="state.toggleTodo(todo.id)">
              {{todo.done ? '✓' : ' '}}
            </div>
            
            @if (editingTodoId === todo.id) {
              <input 
                class="inline-edit-input" 
                [(ngModel)]="editingTodoText"
                (blur)="confirmEdit()"
                (keyup.enter)="confirmEdit()"
                (keydown.escape)="cancelEdit()"
                autoFocus
              >
            } @else {
              <span class="todo-text" (dblclick)="startEdit(todo)">{{todo.text}}</span>
            }
            
            <span class="tag-badge" [ngClass]="todo.tag">{{todo.tag}}</span>
            
            @if (editingTodoId !== todo.id) {
              <button class="btn-delete" (click)="state.deleteTodo(todo.id)">✕</button>
            }
          </div>
        }
        @if (filteredTodos().length === 0) {
          <div class="empty-state">// No tasks found matching filter.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .todos-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .prompt {
      color: var(--accent-green);
      font-weight: bold;
    }
    .todo-input {
      flex: 1;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-primary);
      padding: 6px;
    }
    .todo-tag-select {
      background: transparent;
      color: var(--accent-amber);
      border: 1px solid var(--border-color);
      padding: 6px;
    }
    .btn-insert {
      color: var(--accent-green);
      border-color: var(--accent-green);
    }
    .btn-insert:hover {
      background: var(--accent-green);
      color: var(--bg-primary);
    }
    
    .local-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .local-filters button {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    .local-filters button.active {
      color: var(--accent-amber);
      border-color: var(--accent-amber);
    }
    
    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .todo-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 8px;
      border: 1px solid transparent;
    }
    .todo-row:hover {
      background-color: var(--bg-secondary);
      border-color: var(--border-color);
    }
    .todo-row:hover .btn-delete {
      opacity: 1;
    }
    
    .line-num {
      color: var(--text-muted);
      width: 24px;
      text-align: right;
    }
    .todo-row.editing .line-num {
      color: var(--accent-amber);
      font-weight: bold;
    }
    
    .checkbox {
      width: 18px;
      height: 18px;
      border: 1px solid var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--bg-primary);
      font-weight: bold;
    }
    .todo-row.done .checkbox {
      background-color: var(--accent-green);
    }
    
    .todo-text {
      flex: 1;
      cursor: text;
    }
    .todo-row.done .todo-text {
      text-decoration: line-through;
      color: var(--text-muted);
    }
    
    .inline-edit-input {
      flex: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--accent-green);
      color: var(--text-primary);
      font-family: inherit;
      font-size: inherit;
      outline: none;
      caret-color: var(--accent-green);
      padding: 0;
    }
    
    .tag-badge {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid;
    }
    .tag-badge.work { color: #58a6ff; border-color: #58a6ff; }
    .tag-badge.health { color: #3fb950; border-color: #3fb950; }
    .tag-badge.personal { color: #db61a2; border-color: #db61a2; }
    
    .btn-delete {
      opacity: 0;
      color: var(--danger);
      background: transparent;
      border: none;
      padding: 2px 6px;
      cursor: pointer;
    }
    .btn-delete:hover {
      background: var(--danger);
      color: white;
    }
    
    .empty-state {
      color: var(--text-muted);
      font-style: italic;
      padding: 8px 36px;
    }
  `]
})
export class TodosTabComponent {
  state = inject(IdeStateService);
  
  newTodoText = '';
  newTodoTag: TagType = 'work';
  
  editingTodoId: string | null = null;
  editingTodoText = '';

  filteredTodos = computed(() => {
    const todos = this.state.todos();
    const filter = this.state.activeFilter();
    
    switch(filter) {
      case 'all_tasks': return todos;
      case 'pending': return todos.filter(t => !t.done);
      case 'completed': return todos.filter(t => t.done);
      case 'work': return todos.filter(t => t.tag === 'work');
      case 'personal': return todos.filter(t => t.tag === 'personal');
      case 'health': return todos.filter(t => t.tag === 'health');
      default: return todos;
    }
  });

  addTodo() {
    if (this.newTodoText.trim()) {
      this.state.addTodo(this.newTodoText.trim(), this.newTodoTag);
      this.newTodoText = '';
    }
  }

  startEdit(todo: Todo) {
    if (this.editingTodoId && this.editingTodoId !== todo.id) {
      this.confirmEdit();
    }
    this.editingTodoId = todo.id;
    this.editingTodoText = todo.text;
    
    // Slight delay to allow Angular to render the input before focusing.
    // In a real app a custom directive 'appAutoFocus' is cleaner, but this works well.
    setTimeout(() => {
      const inputs = document.querySelectorAll('.inline-edit-input');
      if (inputs.length) {
        (inputs[0] as HTMLInputElement).focus();
      }
    });
  }

  confirmEdit() {
    if (this.editingTodoId) {
      const trimmed = this.editingTodoText.trim();
      if (trimmed) {
        this.state.editTodoText(this.editingTodoId, trimmed);
      }
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingTodoId = null;
    this.editingTodoText = '';
  }
}
