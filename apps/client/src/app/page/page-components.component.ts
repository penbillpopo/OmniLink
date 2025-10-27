import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreatePageComponentDto,
  CreatePageComponentFieldDto,
  PageComponentDetailDto,
  PageComponentFieldDto,
  PageComponentFieldType,
  UpdatePageComponentDto,
} from '@ay-gosu/server-shared';
import { Subscription } from 'rxjs';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsDialogComponent,
  CsEmptyStateComponent,
  CsFormComponent,
  CsInputComponent,
  CsSelectComponent,
  CsSpinnerComponent,
} from '../component';
import { PageComponentDataService } from './page-component-data.service';

@Component({
  selector: 'cs-page-components',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsAlertComponent,
    CsButtonComponent,
    CsDialogComponent,
    CsEmptyStateComponent,
    CsFormComponent,
    CsInputComponent,
    CsSelectComponent,
    CsSpinnerComponent,
  ],
  templateUrl: './page-components.component.html',
  styleUrl: './page-components.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponentsComponent implements OnInit, OnDestroy {
  public components: PageComponentDetailDto[] = [];
  public loading = false;
  public error: string | null = null;
  public dialogOpen = false;
  public creating = false;
  public createError: string | null = null;
  public editingComponent: PageComponentDetailDto | null = null;

  public readonly componentForm = this._formBuilder.group({
    name: this._formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(64),
    ]),
    description: this._formBuilder.control<string | null>(null, [
      Validators.maxLength(255),
    ]),
    fields: this._formBuilder.array<FormGroup>([]),
  });

  public readonly fieldTypeOptions: Array<{
    label: string;
    value: PageComponentFieldType;
  }> = [
    { label: '文字', value: 'text' },
    { label: '多行文字', value: 'textarea' },
    { label: '圖片', value: 'image' },
    { label: '按鈕', value: 'button' },
    { label: '連結', value: 'link' },
    { label: '富文本', value: 'richtext' },
    { label: '屬性組', value: 'property' },
  ];

  private readonly _fieldSubscriptions = new Map<FormGroup, Subscription>();

  public constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _pageComponentDataService: PageComponentDataService,
  ) {
    this._initializeForm();
  }

  public async ngOnInit(): Promise<void> {
    await this.loadComponents();
  }

  public ngOnDestroy(): void {
    this._teardownFieldSubscriptions();
  }

  public get fields(): FormArray<FormGroup> {
    return this.componentForm.get('fields') as FormArray<FormGroup>;
  }

  public trackByComponent = (_: number, item: PageComponentDetailDto) =>
    item.id;

  public trackByField = (_: number, control: AbstractControl) => control;

  public async loadComponents(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      this.components = await this._pageComponentDataService.getComponentList();
    } catch (error) {
      console.error('Failed to load page components', error);
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  public openCreateDialog(): void {
    if (this.creating) {
      return;
    }

    this.editingComponent = null;
    this._resetForm();
    this.createError = null;
    this.dialogOpen = true;
    this._cdr.markForCheck();
  }

  public openEditDialog(component: PageComponentDetailDto): void {
    if (this.creating) {
      return;
    }

    this.editingComponent = component;
    this._patchForm(component);
    this.createError = null;
    this.dialogOpen = true;
    this._cdr.markForCheck();
  }

  public handleDialogOpenChange(open: boolean): void {
    if (!open) {
      this.closeDialog();
    }
  }

  public closeDialog(): void {
    if (this.creating) {
      return;
    }

    this.dialogOpen = false;
    this.createError = null;
    this.editingComponent = null;
    this._resetForm();
    this._cdr.markForCheck();
  }

  public addField(): void {
    const group = this._formBuilder.group({
      key: this._formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(64),
      ]),
      type: this._formBuilder.nonNullable.control<PageComponentFieldType>(
        'text',
        [Validators.required],
      ),
      property: this._formBuilder.control(''),
    });

    const typeControl = group.get('type');
    const subscription = typeControl?.valueChanges.subscribe((value) => {
      this._handleFieldTypeChange(group, value as PageComponentFieldType | null);
    });

    if (subscription) {
      this._fieldSubscriptions.set(group, subscription);
    }

    this.fields.push(group);
    this._handleFieldTypeChange(
      group,
      typeControl?.value as PageComponentFieldType | null,
    );
    this._cdr.markForCheck();
  }

  public removeField(index: number): void {
    if (this.fields.length <= 1) {
      return;
    }

    const control = this.fields.at(index) as FormGroup;
    this.fields.removeAt(index);
    this._cleanupFieldSubscription(control);
    this._cdr.markForCheck();
  }

  public async submitComponent(): Promise<void> {
    this.componentForm.markAllAsTouched();
    this.fields.controls.forEach((control) => control.markAllAsTouched());
    this._normalizeFormValues();

    if (this.componentForm.invalid || this.creating) {
      this._cdr.markForCheck();
      return;
    }

    const value = this.componentForm.getRawValue();
    const fields = this.fields.controls.map((control) => {
      const type = control.get('type')?.value as PageComponentFieldType;
      return new CreatePageComponentFieldDto({
        key: control.get('key')?.value ?? '',
        type,
        property:
          type === 'property'
            ? control.get('property')?.value ?? ''
            : undefined,
      });
    });
    const payload = new CreatePageComponentDto({
      name: value.name ?? '',
      description: value.description ?? undefined,
      fields,
    });

    this.creating = true;
    this.createError = null;
    this._cdr.markForCheck();

    try {
      if (this.editingComponent) {
        await this._pageComponentDataService.updateComponent(
          new UpdatePageComponentDto({
            id: this.editingComponent.id,
            name: payload.name,
            description: payload.description,
            fields,
          }),
        );
      } else {
        await this._pageComponentDataService.createComponent(payload);
      }
      this.components = await this._pageComponentDataService.getComponentList();
      this.dialogOpen = false;
      this.creating = false;
      this._resetForm();
      this.editingComponent = null;
    } catch (error) {
      console.error('Failed to save page component', error);
      this.createError = this._resolveError(error);
      this.creating = false;
    } finally {
      this._cdr.markForCheck();
    }
  }

  public fieldTypeLabel(type: PageComponentFieldDto['type']): string {
    switch (type) {
      case 'text':
        return '文字';
      case 'textarea':
        return '多行文字';
      case 'image':
        return '圖片';
      case 'button':
        return '按鈕';
      case 'link':
        return '連結';
      case 'richtext':
        return '富文本';
      case 'property':
        return '屬性組';
      default:
        return type;
    }
  }

  private _initializeForm(): void {
    this._resetForm();
  }

  private _resetForm(): void {
    this.componentForm.reset({
      name: '',
      description: '',
    });

    while (this.fields.length) {
      const control = this.fields.at(0) as FormGroup;
      this.fields.removeAt(0);
      this._cleanupFieldSubscription(control);
    }

    this.addField();
  }

  private _patchForm(component: PageComponentDetailDto): void {
    this.componentForm.patchValue({
      name: component.name ?? '',
      description: component.description ?? '',
    });

    while (this.fields.length) {
      const control = this.fields.at(0) as FormGroup;
      this.fields.removeAt(0);
      this._cleanupFieldSubscription(control);
    }

    component.fields.forEach((field) => {
      const group = this._formBuilder.group({
        key: this._formBuilder.nonNullable.control(field.key ?? '', [
          Validators.required,
          Validators.maxLength(64),
        ]),
        type: this._formBuilder.nonNullable.control<PageComponentFieldType>(
          field.type,
          [Validators.required],
        ),
        property: this._formBuilder.control(field.property ?? ''),
      });

      const typeControl = group.get('type');
      const subscription = typeControl?.valueChanges.subscribe((value) => {
        this._handleFieldTypeChange(
          group,
          value as PageComponentFieldType | null,
        );
      });

      if (subscription) {
        this._fieldSubscriptions.set(group, subscription);
      }

      this.fields.push(group);
      this._handleFieldTypeChange(
        group,
        typeControl?.value as PageComponentFieldType | null,
      );
    });

    if (!component.fields.length) {
      this.addField();
    }
  }

  private _handleFieldTypeChange(
    group: FormGroup,
    type: PageComponentFieldType | null,
  ): void {
    const propertyControl = group.get('property');
    if (!propertyControl) {
      return;
    }

    if (type === 'property') {
      propertyControl.addValidators([Validators.required]);
    } else {
      propertyControl.clearValidators();
      propertyControl.setValue('', { emitEvent: false });
    }

    propertyControl.updateValueAndValidity({ emitEvent: false });
    this._cdr.markForCheck();
  }

  private _cleanupFieldSubscription(group: FormGroup): void {
    const subscription = this._fieldSubscriptions.get(group);
    if (subscription) {
      subscription.unsubscribe();
      this._fieldSubscriptions.delete(group);
    }
  }

  private _teardownFieldSubscriptions(): void {
    Array.from(this._fieldSubscriptions.values()).forEach((subscription) =>
      subscription.unsubscribe(),
    );
    this._fieldSubscriptions.clear();
  }

  private _normalizeFormValues(): void {
    const nameControl = this.componentForm.get('name');
    if (nameControl) {
      const rawName = nameControl.value?.toString() ?? '';
      const trimmedName = rawName.trim();
      if (trimmedName !== rawName) {
        nameControl.setValue(trimmedName, { emitEvent: false });
      }
      nameControl.updateValueAndValidity({ emitEvent: false });
    }

    const descriptionControl = this.componentForm.get('description');
    if (descriptionControl) {
      const rawDescription = descriptionControl.value?.toString() ?? '';
      const trimmedDescription = rawDescription.trim();
      if (trimmedDescription !== rawDescription) {
        descriptionControl.setValue(trimmedDescription, { emitEvent: false });
      }
      descriptionControl.updateValueAndValidity({ emitEvent: false });
    }

    this.fields.controls.forEach((control) => {
      const keyControl = control.get('key');
      if (keyControl) {
        const rawKey = keyControl.value?.toString() ?? '';
        const trimmedKey = rawKey.trim();
        if (trimmedKey !== rawKey) {
          keyControl.setValue(trimmedKey, { emitEvent: false });
        }
        keyControl.updateValueAndValidity({ emitEvent: false });
      }

      const type = control.get('type')?.value as PageComponentFieldType | null;
      const propertyControl = control.get('property');
      if (propertyControl) {
        const rawProperty = propertyControl.value?.toString() ?? '';
        const trimmedProperty = rawProperty.trim();
        if (trimmedProperty !== rawProperty) {
          propertyControl.setValue(trimmedProperty, { emitEvent: false });
        }

        if (type !== 'property' && trimmedProperty) {
          propertyControl.setValue('', { emitEvent: false });
        }

        propertyControl.updateValueAndValidity({ emitEvent: false });
      }
    });

    this.componentForm.updateValueAndValidity({ emitEvent: false });
  }

  private _resolveError(error: unknown): string {
    if (!error) {
      return '發生未知錯誤';
    }

    const message =
      (error as any)?.message ??
      (error as any)?.error?.message ??
      (error as any)?.error ??
      (typeof (error as any)?.toString === 'function'
        ? (error as any).toString()
        : null);

    if (typeof message === 'string' && message.trim().length) {
      return message.trim();
    }

    return '發生未知錯誤，請稍後再試';
  }
}
