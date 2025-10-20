import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cs-account-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountManagementComponent {}
