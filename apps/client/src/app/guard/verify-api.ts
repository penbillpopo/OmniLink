import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import Swal from 'sweetalert2';
import { AccountModel } from '../../../../libs/@ay-gosu/server-shared/src';

@Injectable({
  providedIn: 'root',
})
export class VerifyApi implements CanActivate {
  public constructor(protected readonly _router: Router) {}

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const isvalid = await AccountModel.checkApiKeyValid();
    if (!isvalid) {
      Swal.fire({
        icon: 'info',
        title: '需要綁定幣安API才能使用',
        text: '請先綁定幣安API,並確認API是否有效',
      }).then(() => {
        this._router.navigateByUrl('/setting/binding');
      });
      return false;
    }
  }
}
