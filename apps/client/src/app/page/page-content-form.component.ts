import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CsButtonComponent,
  CsImageUploadComponent,
  CsInputComponent,
  CsSelectComponent,
  CsTextareaComponent,
} from '../component';

type BlockType = 'carousel' | 'banner' | 'image_text';
type LayoutType =
  | 'image_only'
  | 'text_only'
  | 'image_top_text_bottom'
  | 'text_top_image_bottom'
  | 'image_left_text_right'
  | 'text_left_image_right';

@Component({
  selector: 'cs-page-content-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsImageUploadComponent,
    CsInputComponent,
    CsSelectComponent,
    CsTextareaComponent,
  ],
  templateUrl: './page-content-form.component.html',
  styleUrl: './page-content-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContentFormComponent {
  @Input({ required: true }) form!: FormGroup<{
    type: FormGroup['controls']['type'];
    carouselItems: FormArray<FormGroup>;
    banner: FormGroup;
    imageTextItems: FormArray<FormGroup>;
  }>;

  @Input({ required: true }) blockType: BlockType = 'carousel';

  @Output() addCarousel = new EventEmitter<void>();
  @Output() removeCarousel = new EventEmitter<number>();
  @Output() addImageText = new EventEmitter<void>();
  @Output() removeImageText = new EventEmitter<number>();

  public readonly layoutOptions: { value: LayoutType; label: string }[] = [
    { value: 'image_only', label: '只有圖片' },
    { value: 'text_only', label: '只有文字' },
    { value: 'image_top_text_bottom', label: '圖上字下' },
    { value: 'text_top_image_bottom', label: '字上圖下' },
    { value: 'image_left_text_right', label: '圖左字右' },
    { value: 'text_left_image_right', label: '字左圖右' },
  ];

  public get carouselItems(): FormArray<FormGroup> {
    return this.form.get('carouselItems') as FormArray<FormGroup>;
  }

  public get banner(): FormGroup {
    return this.form.get('banner') as FormGroup;
  }

  public get imageTextItems(): FormArray<FormGroup> {
    return this.form.get('imageTextItems') as FormArray<FormGroup>;
  }

  public needsImage(layout: LayoutType): boolean {
    return layout !== 'text_only';
  }

  public needsText(layout: LayoutType): boolean {
    return layout !== 'image_only';
  }
}
