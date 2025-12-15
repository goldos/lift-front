import {
  Component,
  computed,
  inject,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatListItemIcon } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { AuthStore } from '../../feature/boond/core/auth/auth.store';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatCard,
    MatIcon,
    MatIconButton,
    RouterLink,
    RouterLinkActive,
    MatTooltip,
    MatListItemIcon,
    MatGridList,
    MatButton,
    MatGridTile,
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  private readonly authStore = inject(AuthStore);
  authIsLoading: Signal<boolean> = this.authStore.isLoadingAuthenticated;
  isExpanded: WritableSignal<boolean> = signal(false);
  tooltipExtendText = computed(() => {
    return this.isExpanded() ? 'Réduire le menu' : 'Agrandir le menu';
  });

  toggleSidenav() {
    this.isExpanded.update((value) => !value);
  }
}
