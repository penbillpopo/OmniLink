import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'cs-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cs-form.component.html',
  styleUrl: './cs-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() novalidate = true;
  @Input() autocomplete: 'on' | 'off' = 'off';

  @Output() submitted = new EventEmitter<Event>();

  handleSubmit(event: Event): void {
    this.submitted.emit(event);
  }
}
