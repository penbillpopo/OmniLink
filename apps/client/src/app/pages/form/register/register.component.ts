import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AccountModel } from '@ay-gosu/server-shared';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { TokenService } from 'src/services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    SweetAlert2Module,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private readonly _router: Router,
    private readonly _tokenService: TokenService,
  ) {}

  public ngOnDestroy() {
    this._tokenService.destroy$.complete();
  }

  public formData = new FormGroup({
    name: new FormControl<string>(''),
    account: new FormControl<string>(''),
    password: new FormControl<string>(''),
  });

  public async submit() {
    try {
      const { name, account, password } = this.formData.value;
      if (!name || !account || !password) {
        return;
      }
      const res = await AccountModel.register(name, account, password);
      Swal.fire({
        icon: res ? 'success' : 'error',
        title: '註冊' + res ? '成功' : '失敗',
      }).then(() => {
        this._router.navigateByUrl('/form/login');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '註冊失敗',
      });
    }
  }

  public back() {
    this._router.navigateByUrl('/form/login');
  }
}
