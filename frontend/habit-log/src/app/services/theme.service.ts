import { Injectable, signal } from '@angular/core';

export type ThemeId = 'retrowave' | 'borland' | 'amber' | 'phosphor' | 'norton';

export interface ThemeOption {
  id: ThemeId;
  name: string;
}

const STORAGE_KEY = 'habitlog.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ThemeOption[] = [
    { id: 'retrowave', name: 'Retrowave' },
    { id: 'borland',   name: 'Borland Blue' },
    { id: 'amber',     name: 'Amber Mono' },
    { id: 'phosphor',  name: 'Phosphor Green' },
    { id: 'norton',    name: 'Norton Grey' },
  ];

  current = signal<ThemeId>(this.readStored());

  constructor() {
    this.apply(this.current());
  }

  set(id: ThemeId) {
    this.current.set(id);
    this.apply(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  private apply(id: ThemeId) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (id === 'retrowave') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', id);
    }
  }

  private readStored(): ThemeId {
    if (typeof localStorage === 'undefined') return 'retrowave';
    const v = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const valid: ThemeId[] = ['retrowave', 'borland', 'amber', 'phosphor', 'norton'];
    return v && valid.includes(v) ? v : 'retrowave';
  }
}
