import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CsButtonComponent } from '../component';

@Component({
  selector: 'cs-terms-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, CsButtonComponent],
  templateUrl: './terms-privacy.component.html',
  styleUrl: './terms-privacy.component.scss'
})
export class TermsPrivacyComponent {
  readonly updatedAt = new Date('2025-01-01');
}
