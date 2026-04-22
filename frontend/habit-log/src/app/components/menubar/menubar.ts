import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeId } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { IdeStateService } from '../../services/ide-state.service';

type MenuKey = 'FILE' | 'EDIT' | 'VIEW' | 'OPT' | 'HELP';

@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css'
})
export class MenubarComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  state = inject(IdeStateService);
  private router = inject(Router);

  openMenu = signal<MenuKey | null>(null);
  aboutOpen = signal(false);

  toggle(key: MenuKey, event: Event) {
    event.stopPropagation();
    this.openMenu.update(m => m === key ? null : key);
  }
  hover(key: MenuKey) {
    if (this.openMenu()) this.openMenu.set(key);
  }
  close() { this.openMenu.set(null); }

  @HostListener('document:click')
  onDocClick() { this.close(); }

  @HostListener('window:keydown.escape')
  onEsc() { this.close(); this.aboutOpen.set(false); }

  // ── Actions ──
  newTask() {
    this.close();
    const title = prompt('New task title:');
    if (!title || !title.trim()) return;
    const t = this.state.createTask(title.trim());
    this.state.openTaskFile(t);
  }
  goto(path: string) {
    this.close();
    this.router.navigateByUrl(path);
  }
  setTheme(id: ThemeId) {
    this.theme.set(id);
    this.close();
  }
  markDone() {
    this.close();
    const id = this.state.activeTabId();
    if (!id) return;
    const t = this.state.getTaskByFilename(id);
    if (!t) return;
    this.state.updateTask(t.id, { status: t.status === 'done' ? 'pending' : 'done' });
  }
  deleteCurrent() {
    this.close();
    const id = this.state.activeTabId();
    if (!id) return;
    if (confirm(`Delete ${id}?`)) this.state.deleteTask(id);
  }
  showAbout() {
    this.close();
    this.aboutOpen.set(true);
  }
  doLogout() {
    this.close();
    this.auth.logout();
  }
}
