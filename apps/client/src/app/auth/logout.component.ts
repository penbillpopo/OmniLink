import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenService } from 'src/services/token.service';

@Component({
  selector: 'cs-logout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit {
  private readonly _tokenService = inject(TokenService);

  public ngOnInit(): void {
    this._tokenService.logout().catch((error) => console.error('Logout failed', error));
  }
}
