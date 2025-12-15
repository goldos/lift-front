import { Component, inject, type OnInit, type Signal } from '@angular/core';
import { Header } from '../header/header';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Footer } from '../footer/footer';
import { MatCard } from '@angular/material/card';
import { Sidenav } from '../sidenav/sidenav';
import { LayoutStore } from './stores/layout.store';
import { filter } from 'rxjs';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-layout',
  imports: [Header, RouterOutlet, Footer, MatCard, Sidenav, NgxSkeletonLoaderComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  private router = inject(Router);
  private layoutStore = inject(LayoutStore);
  public routerLoading: Signal<boolean> = this.layoutStore.isLoading;

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          this.layoutStore.setRouterLoading(true);
        } else {
          this.layoutStore.setRouterLoading(false);
        }
      });
  }
}
