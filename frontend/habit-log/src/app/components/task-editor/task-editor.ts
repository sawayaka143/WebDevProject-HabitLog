import { Component, inject, computed, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService, Task, TagType } from '../../services/ide-state.service';

interface StructLine {
  lineNo: number;
  type: 'comment' | 'typedef' | 'field' | 'brace' | 'blank';
  raw?: string;
  field?: string;
  value?: string;
  comment?: string;
  editable?: boolean;
  fieldKey?: keyof Task;
}

@Component({
  selector: 'app-task-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  preserveWhitespaces: true,
  templateUrl: './task-editor.html',
  styleUrl: './task-editor.css'
})
export class TaskEditorComponent {
  state = inject(IdeStateService);

  editingField = signal<string | null>(null);
  editValue = signal<string>('');
  savedField = signal<string | null>(null);

  task = computed<Task | null>(() => {
    const id = this.state.activeTabId();
    if (!id || !id.endsWith('.task')) return null;
    return this.state.getTaskByFilename(id) ?? null;
  });

  descriptionSegments = computed<string[]>(() => {
    const t = this.task();
    if (!t) return [];
    if (!t.description) return [''];
    return t.description.split('\n');
  });

  lastLineNo = computed<number>(() => {
    const segs = this.descriptionSegments();
    return 8 + Math.max(0, segs.length - 1);
  });

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      const t = this.task();
      if (t) this.forceSave(t);
    }
  }

  focusEditor() { }

  startEdit(field: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.editingField() === field) return;
    const t = this.task();
    if (!t) return;
    this.cancelEdit();
    this.editingField.set(field);
    this.editValue.set((t as any)[field] ?? '');
  }

  startEditTag(event: MouseEvent) {
    event.stopPropagation();
    const t = this.task();
    if (!t) return;
    this.cancelEdit();
    this.editingField.set('tag');
    this.editValue.set(t.tag);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.editValue.set(target.value);
    const t = this.task();
    if (t) this.state.markDirty(t.filename);
  }

  onSelectChange(event: Event) {
    this.editValue.set((event.target as HTMLSelectElement).value);
    const t = this.task();
    if (t) this.state.markDirty(t.filename);
  }

  saveEdit() {
    const t = this.task();
    const field = this.editingField();
    if (!t || !field) return;

    const val = this.editValue().trim();
    const patch: Partial<Task> = {};

    if (field === 'status') {
      if (val !== 'pending' && val !== 'done') {
        this.state.addTerminalLine('error', `> error: invalid value "${val}" for field 'status'`);
        this.state.addTerminalLine('error', `> expected: "pending" | "done"`);
        this.state.addTerminalLine('error', `> change discarded`);
        this.state.ensureTerminalOpen();
        this.cancelEdit();
        return;
      }
      patch.status = (val === 'done' ? 'done' : 'pending');
    } else if (field === 'description') {
      patch.description = this.editValue().replace(/\r\n/g, '\n');
    } else if (field === 'tag') {
      patch.tag = this.editValue() as TagType;
    }

    this.state.updateTask(t.id, patch);
    this.state.markClean(t.filename);

    const saved = field;
    this.savedField.set(saved);
    setTimeout(() => this.savedField.set(null), 2500);

    this.editingField.set(null);
    this.editValue.set('');
  }

  cancelEdit() {
    this.editingField.set(null);
    this.editValue.set('');
  }

  toggleStatus(t: Task) {
    this.state.updateTask(t.id, { status: t.status === 'done' ? 'pending' : 'done' });
  }

  forceSave(t: Task) {
    if (this.editingField()) {
      this.saveEdit();
    } else {
      this.state.markClean(t.filename);
    }
  }

  deleteTask(filename: string) {
    if (confirm('Delete this task?')) {
      this.state.deleteTask(filename);
    }
  }
}
