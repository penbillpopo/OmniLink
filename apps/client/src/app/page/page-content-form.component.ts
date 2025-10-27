import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageComponentDetailDto } from '@ay-gosu/server-shared';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsImageUploadComponent,
  CsInputComponent,
  CsSpinnerComponent,
  CsTextareaComponent,
} from '../component';

export interface ComponentFieldConfig {
  key: string;
  type: PageComponentDetailDto['fields'][number]['type'];
  label: string;
  propertyList: string[];
}

@Component({
  selector: 'cs-page-content-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsAlertComponent,
    CsButtonComponent,
    CsImageUploadComponent,
    CsInputComponent,
    CsSpinnerComponent,
    CsTextareaComponent,
  ],
  templateUrl: './page-content-form.component.html',
  styleUrl: './page-content-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContentFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() selectedComponent: PageComponentDetailDto | null = null;
  @Input() componentFieldConfigs: ComponentFieldConfig[] = [];
  @Input() componentValuesGroup: FormGroup | null = null;
  @Input() componentLoading = false;
  @Input() componentError: string | null = null;

  @Output() addComponentProperty = new EventEmitter<string>();
  @Output() removeComponentProperty = new EventEmitter<{
    fieldKey: string;
    index: number;
  }>();

  public get componentValues(): FormGroup | null {
    return this.componentValuesGroup;
  }

  public propertyArray(
    field: ComponentFieldConfig,
  ): FormArray<FormGroup> | null {
    const group = this.componentValues;
    if (!group) {
      return null;
    }

    const control = group.get(field.key);
    return control instanceof FormArray
      ? (control as FormArray<FormGroup>)
      : null;
  }

  public propertyAttributes(field: ComponentFieldConfig): string[] {
    return field.propertyList.length ? field.propertyList : ['value'];
  }

  public handleAddComponentProperty(fieldKey: string): void {
    this.addComponentProperty.emit(fieldKey);
  }

  public handleRemoveComponentProperty(fieldKey: string, index: number): void {
    this.removeComponentProperty.emit({ fieldKey, index });
  }
}
