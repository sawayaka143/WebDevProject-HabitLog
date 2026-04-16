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
  template: `
    @if (task(); as t) {
      <div class="editor-wrap" (click)="focusEditor()">

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span class="bc-folder">todos</span>
          <span class="bc-sep"> > </span>
          <span class="bc-file">{{ t.filename }}</span>
          @if (state.isDirty(t.filename)) {
            <span class="bc-dirty"> ● unsaved</span>
          }
        </div>

        <!-- Code area -->
        <div class="code-area" #codeArea>
          <!-- Line 1: comment -->
          <div class="code-line">
            <span class="ln">1</span>
            <span class="comment">// {{ t.filename }}</span>
          </div>
          <!-- Line 2: blank -->
          <div class="code-line"><span class="ln">2</span></div>
          <!-- Line 3: typedef -->
          <div class="code-line">
            <span class="ln">3</span>
            <span class="kw">typedef</span>
            <span class="txt"> </span>
            <span class="kw">struct</span>
            <span class="txt"> &#123;</span>
          </div>

          <!-- title -->
          <div class="code-line">
            <span class="ln">4</span>
            <span class="indent">    </span>
            <span class="type">char*&nbsp;</span>
            <span class="txt">   </span>
            <span class="field">title</span>
            <span class="txt">       = </span>
            <span class="str">"{{ t.title }}"</span>
            <span class="punct">;</span>
          </div>

          <!-- status — editable -->
          <div class="code-line editable-line" (click)="startEdit('status', $event)">
            <span class="ln">5</span>
            <span class="indent">    </span>
            <span class="type">char*&nbsp;</span>
            <span class="txt">   </span>
            <span class="field">status</span>
            <span class="txt">      = </span>
            @if (editingField() === 'status') {
              <span class="str edit-wrap">"<input
                class="inline-input"
                [value]="editValue()"
                (input)="onInput($event)"
                (keydown.enter)="saveEdit()"
                (keydown.escape)="cancelEdit()"
                (blur)="saveEdit()"
                autoFocus
              />"</span>
            } @else {
              <span class="str" [class.done-val]="t.status === 'done'">"{{ t.status }}"</span>
            }
            <span class="punct">;</span>
            <span class="comment">        // pending | done</span>
            @if (savedField() === 'status') {
              <span class="saved-flash"> // saved</span>
            }
          </div>

          <!-- tag -->
          <div class="code-line editable-line" (click)="startEditTag($event)">
            <span class="ln">6</span>
            <span class="indent">    </span>
            <span class="type">char*&nbsp;</span>
            <span class="txt">   </span>
            <span class="field">tag</span>
            <span class="txt">         = </span>
            @if (editingField() === 'tag') {
              <span class="str edit-wrap">"<select
                class="inline-select"
                [value]="editValue()"
                (change)="onSelectChange($event)"
                (blur)="saveEdit()"
                (keydown.escape)="cancelEdit()"
                autoFocus
              >
                <option value="work">work</option>
                <option value="personal">personal</option>
                <option value="health">health</option>
              </select>"</span>
            } @else {
              <span class="str tag-val" [ngClass]="'tag-' + t.tag">"{{ t.tag }}"</span>
            }
            <span class="punct">;</span>
            <span class="comment">           // work | personal | health</span>
            @if (savedField() === 'tag') {
              <span class="saved-flash"> // saved</span>
            }
          </div>

          <!-- created_at -->
          <div class="code-line">
            <span class="ln">7</span>
            <span class="indent">    </span>
            <span class="type">char*&nbsp;</span>
            <span class="txt">   </span>
            <span class="field">created_at</span>
            <span class="txt">  = </span>
            <span class="str">"{{ t.created_at }}"</span>
            <span class="punct">;</span>
          </div>

          <!-- description — editable -->
          @if (editingField() === 'description') {
            <div class="code-line editable-line" (click)="startEdit('description', $event)">
              <span class="ln">8</span>
              <span class="indent">    </span>
              <span class="type">char*&nbsp;</span>
              <span class="txt">   </span>
              <span class="field">description</span>
              <span class="txt"> = </span>
              <span class="str edit-wrap">"<textarea
                class="inline-input desc-textarea"
                [value]="editValue()"
                (input)="onInput($event)"
                (keydown.escape)="cancelEdit()"
                (blur)="saveEdit()"
                placeholder="use \\n for new lines"
                autoFocus
              ></textarea>"</span>
              <span class="punct">;</span>
            </div>
          } @else {
            @if (descriptionSegments().length > 0) {
              @for (seg of descriptionSegments(); track $index; let i = $index, last = $last) {
                <div class="code-line editable-line" (click)="startEdit('description', $event)">
                  <span class="ln">{{ 8 + i }}</span>
                  @if (i === 0) {
                    <span class="indent">    </span>
                    <span class="type">char*&nbsp;</span>
                    <span class="txt">   </span>
                    <span class="field">description</span>
                    <span class="txt"> = </span>
                  } @else {
                    <span class="continuation-indent"></span>
                  }
                  <span class="str desc-val">"{{ seg }}{{ !last ? '\\n' : '' }}"</span>
                  @if (last) { <span class="punct">;</span> }
                  @if (i === 0) {
                    <span class="comment">  // editable</span>
                    @if (savedField() === 'description') {
                      <span class="saved-flash"> // saved</span>
                    }
                  }
                </div>
              }
            } @else {
              <div class="code-line editable-line" (click)="startEdit('description', $event)">
                <span class="ln">8</span>
                <span class="indent">    </span>
                <span class="type">char*&nbsp;</span>
                <span class="txt">   </span>
                <span class="field">description</span>
                <span class="txt"> = </span>
                <span class="str desc-val">"[click to edit]"</span>
                <span class="punct">;</span>
                <span class="comment">  // editable</span>
                @if (savedField() === 'description') {
                  <span class="saved-flash"> // saved</span>
                }
              </div>
            }
          }

          <!-- closing brace -->
          <div class="code-line">
            <span class="ln">{{ lastLineNo() + 1 }}</span>
            <span class="txt">&#125; </span>
            <span class="type">Task</span>
            <span class="punct">;</span>
          </div>

          <!-- blank + hint -->
          <div class="code-line"><span class="ln">{{ lastLineNo() + 2 }}</span></div>
          <div class="code-line">
            <span class="ln">{{ lastLineNo() + 3 }}</span>
            <span class="comment">// Click a field value to edit · Press Enter or Ctrl+S to save</span>
          </div>
        </div>

        <!-- Action toolbar -->
        <div class="action-bar">
          <button class="btn-status"
            [class.done]="t.status === 'done'"
            (click)="toggleStatus(t)">
            @if (t.status === 'done') {
              <span>✓ Mark Pending</span>
            } @else {
              <span>✓ Mark Done</span>
            }
          </button>
          <button class="btn-save"
            [class.visible]="state.isDirty(t.filename)"
            (click)="forceSave(t)">
            💾 Save
          </button>
        </div>

      </div>
    } @else {
      <div class="no-file">
        <span class="comment">// Select a file from the Explorer to view it here</span>
      </div>
    }
  `,
  styles: [`
    .editor-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      padding: 6px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .bc-folder { color: var(--text-muted); }
    .bc-sep    { color: var(--text-muted); padding: 0 4px; }
    .bc-file   { color: var(--text-primary); }
    .bc-dirty  { color: #3fb950; margin-left: 8px; font-size: 11px; }

    .code-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .code-line {
      display: flex;
      align-items: center;
      min-height: 22px;
      gap: 0;
      animation: fadeSlideIn 0.15s ease-out;
    }

    .editable-line {
      cursor: text;
      border-radius: 2px;
      transition: background 0.1s;
      padding: 1px 4px;
      margin: 0 -4px;
    }
    .editable-line:hover {
      background: rgba(88, 166, 255, 0.05);
    }

    .ln {
      width: 40px;
      text-align: right;
      padding-right: 24px;
      color: var(--text-muted);
      font-size: 12px;
      flex-shrink: 0;
      user-select: none;
    }
    .code-line:hover .ln {
      color: var(--text-secondary);
    }

    .indent { white-space: pre; }

    /* Syntax colours */
    .kw      { color: var(--accent-purple); }
    .type    { color: var(--accent-blue); }
    .field   { color: var(--accent-amber); }
    .str     { color: #a8d686; }
    .punct   { color: var(--text-secondary); }
    .comment { color: var(--text-muted); font-style: italic; }
    .txt     { color: var(--text-primary); white-space: pre; }

    .done-val     { color: var(--text-muted); text-decoration: line-through; }
    .desc-val     { color: #a8d686; }

    .tag-work     { color: var(--accent-blue); }
    .tag-personal { color: #db61a2; }
    .tag-health   { color: #3fb950; }

    /* Inline edit */
    .edit-wrap {
      display: inline-flex;
      align-items: center;
      color: #a8d686;
    }
    .inline-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--accent-green);
      color: #a8d686;
      font-family: var(--font-mono);
      font-size: 13px;
      outline: none;
      caret-color: var(--accent-green);
      padding: 0;
      min-width: 120px;
      max-width: 400px;
      width: auto;
    }
    .desc-input { min-width: 300px; }
    .desc-textarea {
      min-width: 380px;
      min-height: 48px;
      resize: vertical;
      vertical-align: top;
      margin-top: -2px;
      line-height: 1.5;
      overflow-y: hidden;
    }
    .continuation-indent {
      display: inline-block;
      width: 27ch; /* precisely matches standard struct indent chars */
    }
    .inline-select {
      background: var(--bg-secondary);
      border: 1px solid var(--accent-green);
      color: #a8d686;
      font-family: var(--font-mono);
      font-size: 13px;
      outline: none;
      padding: 0 2px;
    }

    /* Saved flash */
    .saved-flash {
      color: var(--accent-green);
      font-style: italic;
      animation: savedFlash 2.5s ease-out forwards;
      margin-left: 4px;
    }

    /* Action bar */
    .action-bar {
      display: flex;
      gap: 8px;
      padding: 10px 16px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .btn-status {
      color: var(--accent-green);
      border-color: var(--accent-green);
      font-size: 12px;
    }
    .btn-status:hover  { background: rgba(57,255,20,0.1); }
    .btn-status.done   { color: var(--text-muted); border-color: var(--border-color); }
    .btn-save {
      color: var(--text-muted);
      border-color: var(--border-color);
      font-size: 12px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    .btn-save.visible  { opacity: 1; pointer-events: auto; color: var(--accent-amber); border-color: var(--accent-amber); }
    .btn-save:hover    { background: rgba(255,179,71,0.1); }

    .no-file {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-muted);
      font-size: 14px;
      font-style: italic;
    }
  `]
})
export class TaskEditorComponent {
  state = inject(IdeStateService);

  editingField = signal<string | null>(null);
  editValue    = signal<string>('');
  savedField   = signal<string | null>(null);

  task = computed<Task | null>(() => {
    const id = this.state.activeTabId();
    if (!id || !id.endsWith('.c')) return null;
    return this.state.getTaskByFilename(id) ?? null;
  });

  descriptionSegments = computed<string[]>(() => {
    const t = this.task();
    if (!t || !t.description) return [];
    return t.description.split('\\n');
  });

  lastLineNo = computed<number>(() => {
    const segs = this.descriptionSegments();
    // Default 1 line, meaning the field takes 1 line.
    // If it has N segments, it takes N lines.
    const extraLines = Math.max(0, segs.length - 1);
    return 8 + extraLines; // 8 is the line where description starts
  });

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      const t = this.task();
      if (t) this.forceSave(t);
    }
  }

  focusEditor() {}

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
      patch.status = (val === 'done' ? 'done' : 'pending');
    } else if (field === 'description') {
      // Split by literal \n, trim segments, and filter out empties
      const parts = this.editValue()
        .split('\\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      patch.description = parts.join('\\n');
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
}
