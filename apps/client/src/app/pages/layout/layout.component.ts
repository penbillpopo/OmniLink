import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { NavBarComponent } from 'src/app/components/nav-bar/nav-bar.component';
import { TokenService } from 'src/services/token.service';
import { pages } from '../pages';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatFormFieldModule,
    MatButtonModule,
    NavBarComponent,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor(
    private readonly _tokenService: TokenService,
    private _router: Router,
  ) {}

  private readonly _destroy$ = new Subject<void>();

  public ngOnDestroy() {
    this._tokenService.destroy$.complete();
    this._destroy$.next();
    this._destroy$.complete();
  }

  @ViewChild('drawer', { static: false })
  public drawer: MatDrawer;

  public pages = pages.map((page) => ({ ...page, active: false }));

  public closeDrawerWhenLogout = this._tokenService.account$
    .pipe(
      filter((token) => token === null),
      takeUntil(this._destroy$),
    )
    .subscribe((token) => {
      if (!this.drawer) return;
      this.drawer.close();
    });

  public menuParentClick(page: { active: boolean }) {
    page.active = !page.active;
  }

  public menuClick(path: string) {
    this._router.navigateByUrl(path);
    if (!this.drawer) return;
    this.drawer.close();
  }
}
