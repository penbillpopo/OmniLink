import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private readonly _tokenService: TokenService,
    private readonly _router: Router,
  ) {}

  public ngOnDestroy() {
    this._tokenService.destroy$.complete();
  }

  public formData = new FormGroup({
    account: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  public async login() {
    if (!this.formData.valid) return;
    const { account, password } = this.formData.value;
    try {
      const isLoggedIn = await this._tokenService.login(account, password);
      if (isLoggedIn) {
        this._router.navigateByUrl('/');
      } else {
        Swal.fire({
          icon: 'error',
          title: '登入失敗',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: error?.message,
      });
    }
  }
}
