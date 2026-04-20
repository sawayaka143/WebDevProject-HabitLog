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
  templateUrl: './terminal.html',
  styleUrl: './terminal.css'
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
