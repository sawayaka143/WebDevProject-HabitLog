import {
  Component, inject, signal, ViewChild, ElementRef,
  AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeStateService } from '../../services/ide-state.service';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="terminal-shell" 
      [class.collapsed]="state.terminalCollapsed()"
      [style.height.px]="state.terminalCollapsed() ? 32 : terminalHeight()">

      <!-- Resize Handle -->
      @if (!state.terminalCollapsed()) {
        <div class="resize-handle" (mousedown)="startResizing($event)"></div>
      }

      <!-- Terminal header bar -->
      <div class="term-header" (click)="state.toggleTerminal()">
        <div class="term-tabs">
          <span class="term-tab active">TERMINAL</span>
        </div>
        <div class="term-header-actions">
          <button class="term-btn" (click)="clearTerminal($event)" title="Clear terminal">✕ Clear</button>
          <button class="term-btn collapse-btn" title="Toggle terminal">
            {{ state.terminalCollapsed() ? '▲' : '▼' }}
          </button>
        </div>
      </div>

      @if (!state.terminalCollapsed()) {
        <!-- Output area -->
        <div class="term-output" #termOutput>
          @for (line of state.terminalHistory(); track $index) {
            <div class="term-line" [ngClass]="'line-' + line.type">
              @if (line.type === 'prompt') {
                <span class="prompt-text">{{ line.text }}</span>
              } @else {
                <span class="output-text">{{ line.text }}</span>
              }
            </div>
          }
        </div>

        <!-- Input row -->
        <div class="term-input-row">
          <span class="prompt-label">workspace/todos&nbsp;<span class="prompt-dollar">$</span></span>
          <input
            #termInput
            class="term-input"
            type="text"
            [(ngModel)]="currentInput"
            (keydown.enter)="submitCommand()"
            (keydown.ArrowUp)="historyUp($event)"
            (keydown.ArrowDown)="historyDown($event)"
            [placeholder]="'type a command...'"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .terminal-shell {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      border-top: 1px solid var(--border-color);
      flex-shrink: 0;
      transition: height 0.05s linear;
    }
    .terminal-shell.collapsed {
      height: 32px !important;
    }

    .resize-handle {
      position: absolute;
      top: -3px;
      left: 0;
      right: 0;
      height: 6px;
      cursor: ns-resize;
      z-index: 10;
      background: transparent;
      transition: background 0.2s;
    }
    .resize-handle:hover {
      background: rgba(57, 255, 20, 0.1);
    }

    /* Header */
    .term-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      height: 32px;
      flex-shrink: 0;
      cursor: pointer;
      user-select: none;
    }
    .term-tabs {
      display: flex;
      align-items: stretch;
      height: 100%;
    }
    .term-tab {
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-size: 11.5px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }
    .term-tab.active {
      color: var(--text-primary);
      background: var(--bg-primary);
      border-top: 1px solid var(--accent-green);
    }

    .term-header-actions {
      display: flex;
      gap: 4px;
      padding: 0 8px;
    }
    .term-btn {
      font-size: 11px;
      padding: 2px 8px;
      border: none;
      color: var(--text-muted);
    }
    .term-btn:hover { color: var(--text-primary); }
    .collapse-btn {
      font-size: 12px;
    }

    /* Output */
    .term-output {
      flex: 1;
      overflow-y: auto;
      padding: 8px 16px 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .term-line {
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .line-prompt .prompt-text  { color: var(--text-secondary); }
    .line-output .output-text  { color: var(--text-primary); }
    .line-success .output-text { color: var(--accent-green); }
    .line-error .output-text   { color: var(--accent-red); }

    /* Input row */
    .term-input-row {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 4px 16px 8px;
      flex-shrink: 0;
    }
    .prompt-label {
      color: var(--accent-blue);
      white-space: nowrap;
      font-size: 13px;
      flex-shrink: 0;
    }
    .prompt-dollar {
      color: var(--accent-green);
      font-weight: bold;
      margin-left: 2px;
    }
    .term-input {
      flex: 1;
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 13px;
      padding: 2px 8px;
      outline: none;
      caret-color: var(--accent-green);
    }
    .term-input:focus {
      border-bottom-color: transparent;
      box-shadow: none;
    }
    .term-input::placeholder { color: var(--text-muted); }
  `]
})
export class TerminalComponent implements AfterViewChecked {
  state = inject(IdeStateService);
  cdr   = inject(ChangeDetectorRef);

  @ViewChild('termOutput') termOutput!: ElementRef<HTMLElement>;
  @ViewChild('termInput')  termInput!: ElementRef<HTMLInputElement>;

  terminalHeight = signal<number>(220);
  isResizing = false;
  currentInput = '';
  cmdHistory: string[] = [];
  historyIndex = -1;
  private shouldScroll = false;

  startResizing(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing) return;
    
    // Calculate new height: window height - current Y - status bar height (22px)
    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - event.clientY - 22;

    // Clamp between 80px and 50vh
    const minHeight = 80;
    const maxHeight = window.innerHeight * 0.5;
    const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);

    this.terminalHeight.set(clampedHeight);
  };

  onMouseUp = () => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  submitCommand() {
    const input = this.currentInput;
    if (input.trim()) {
      this.cmdHistory.unshift(input);
      if (this.cmdHistory.length > 50) this.cmdHistory.pop();
    }
    this.historyIndex = -1;
    this.state.executeCommand(input);
    this.currentInput = '';
    this.shouldScroll = true;
  }

  historyUp(event: Event) {
    event.preventDefault();
    if (this.historyIndex < this.cmdHistory.length - 1) {
      this.historyIndex++;
      this.currentInput = this.cmdHistory[this.historyIndex];
    }
  }

  historyDown(event: Event) {
    event.preventDefault();
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentInput = this.cmdHistory[this.historyIndex];
    } else {
      this.historyIndex = -1;
      this.currentInput = '';
    }
  }

  clearTerminal(event: MouseEvent) {
    event.stopPropagation();
    this.state.terminalHistory.set([]);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.termOutput) {
      const el = this.termOutput.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
