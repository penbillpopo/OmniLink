import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { TokenService } from '../../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class VerifyToken implements CanActivate {
  public constructor(
    protected readonly _tokenService: TokenService,
    protected readonly _router: Router,
  ) {}

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const isLogged = await this._tokenService.isLoggedIn();

    if (!isLogged) {
      this._router.navigate(['form/login']);
      return false;
    }

    return true;
  }
}
