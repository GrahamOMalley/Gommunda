import { Component, HostListener, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Gang, GangService } from '../../services/gang.service';

@Component({
  selector: 'app-gideon-nav',
  templateUrl: './gideon-nav.component.html',
  styleUrls: ['./gideon-nav.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatTooltipModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    CommonModule,
    RouterOutlet,
    RouterModule,
  ],
})
export class GideonNavComponent {
  user$: Observable<User | null>;
  gangs$: Observable<Gang[] | null>;
  viewportWidth: number = window.innerWidth; // Initialize with the current width
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private authService: AuthService, private gangService: GangService) {
    this.user$ = this.authService.user$; // Assuming `user$` is an observable in your AuthService

    // Fetch gangs based on the logged-in user
    this.gangs$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.gangService.getUserGangs().pipe(
            catchError(err => {
              console.error('Failed to fetch gangs', err);
              return of(null); // Return null in case of an error
            })
          );
        } else {
          return of(null); // No user logged in, return null
        }
      })
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.viewportWidth = document.documentElement.clientWidth; // Exclude scrollbar width
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => console.log('User logged out successfully'),
      error: (err) => console.error('Logout failed', err),
    });
  }
}
