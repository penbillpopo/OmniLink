import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { pages } from 'src/app/pages/pages';
import { TokenService } from 'src/services/token.service';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatIconModule, MatIconButton],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
  constructor(
    private _tokenService: TokenService,
    private _router: Router,
    private _activedRoute: ActivatedRoute,
  ) {}

  @Output()
  public menuIconClick = new EventEmitter();

  public currentPage = '';

  public pathNameMap = {};

  public routeChange$ = this._router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => {
      this.currentPage =
        this._activedRoute.snapshot.firstChild.routeConfig.path;
    });

  public ngOnInit() {
    this.currentPage = this._activedRoute.snapshot.firstChild.routeConfig.path;

    this.pathNameMap = pages.reduce((acc, page) => {
      acc[page.path] = page.name;
      return acc;
    });
  }

  public onMenuIconClick() {
    this.menuIconClick.emit();
  }

  public onLogoutClick() {
    this._tokenService.logout();
    this._router.navigateByUrl('form/login');
  }
}
