import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, UpperCasePipe],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class NavBar {
  auth = inject(AuthService);
  isDropdownOpen = signal(false);

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  logout() {
    this.closeDropdown();
    this.auth.logout();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdown();
  }
}
