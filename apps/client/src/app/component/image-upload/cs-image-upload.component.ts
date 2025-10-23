import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadService } from '../../shared/upload.service';

@Component({
  selector: 'cs-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cs-image-upload.component.html',
  styleUrl: './cs-image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CsImageUploadComponent),
      multi: true,
    },
  ],
})
export class CsImageUploadComponent implements ControlValueAccessor {
  @Input() label = '圖片上傳';
  @Input() hint?: string;
  @Input() accept = 'image/*';
  @Input() disabled = false;

  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadCompleted = new EventEmitter<string>();
  @Output() uploadFailed = new EventEmitter<unknown>();

  public value: string | null = null;
  public previewUrl: string | null = null;
  public uploading = false;
  public error: string | null = null;

  private _onChange: (value: string | null) => void = () => {};
  private _onTouched: () => void = () => {};

  public constructor(
    private readonly _uploadService: UploadService,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  public writeValue(value: string | null): void {
    this.value = value ?? null;
    this.previewUrl = this._uploadService.resolveUrl(this.value);
    this._cdr.markForCheck();
  }

  public registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public async handleFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    this.uploading = true;
    this.error = null;
    this.uploadStarted.emit();

    try {
      const { url, path } = await this._uploadService.uploadImage(file);
      this.value = path ?? url;
      this.previewUrl = this._uploadService.resolveUrl(url ?? path);
      this._onChange(this.value);
      this.uploadCompleted.emit(this.value ?? url);
      this._cdr.markForCheck();
    } catch (error) {
      console.error('Image upload failed', error);
      this.error = '圖片上傳失敗，請稍後再試';
      this.uploadFailed.emit(error);
      this.value = null;
      this.previewUrl = null;
      this._onChange(null);
      this._cdr.markForCheck();
    } finally {
      this.uploading = false;
      input.value = '';
      this._cdr.markForCheck();
    }
  }

  public clear(): void {
    if (this.disabled) {
      return;
    }

    this.value = null;
    this.previewUrl = null;
    this._onChange(null);
    this.error = null;
    this._cdr.markForCheck();
  }
}
