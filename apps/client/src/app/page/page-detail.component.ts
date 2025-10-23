import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  PageBlockDto,
  PageDetailDto,
  PageDto,
} from '@ay-gosu/server-shared';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsFormComponent,
  CsInputComponent,
  CsSelectComponent,
  CsSpinnerComponent,
  CsTextareaComponent,
} from '../component';
import { PageContentFormComponent } from './page-content-form.component';
import { PageDataService } from './page-data.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'cs-page-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsFormComponent,
    CsInputComponent,
    CsSelectComponent,
    CsTextareaComponent,
    CsSpinnerComponent,
    CsAlertComponent,
    PageContentFormComponent,
  ],
  templateUrl: './page-detail.component.html',
  styleUrl: './page-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDetailComponent implements OnInit, OnDestroy {
  public page: PageDetailDto | null = null;
  public loading = false;
  public error: string | null = null;

  public creatingBlock = false;
  public createBlockError: string | null = null;
  public apiEndpoint = '';

  public readonly blockTypes = [
    { value: 'carousel', label: '輪播圖' },
    { value: 'banner', label: 'Banner 圖' },
    { value: 'image_text', label: '圖片與文字' },
  ] as const;


  public readonly blockForm = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    type: ['carousel', Validators.required],
    carouselItems: this._formBuilder.nonNullable.array([
      this._createCarouselGroup(),
    ]),
    banner: this._createBannerGroup(),
    imageTextItems: this._formBuilder.nonNullable.array([
      this._createImageTextGroup(),
    ]),
  });

  private readonly _routeSub = this._route.paramMap.subscribe((params) => {
    const id = Number(params.get('id'));
    if (!Number.isNaN(id)) {
      void this.loadPage(id);
    }
  });

  private _typeSub?: Subscription;
  private readonly _apiBase = PageDetailComponent._normalizeServerUrl(
    environment.serverUrl?.[0],
  );

  public constructor(
    private readonly _pageDataService: PageDataService,
    private readonly _route: ActivatedRoute,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    this._typeSub = this.blockForm
      .get('type')
      ?.valueChanges.subscribe(() => {
        this._resetDynamicGroups();
        this.createBlockError = null;
        this._cdr.markForCheck();
      });

    this._resetDynamicGroups(this.blockForm.get('type')?.value as PageBlockDto['type']);
  }

  public ngOnDestroy(): void {
    this._routeSub.unsubscribe();
    this._typeSub?.unsubscribe();
  }

  public async loadPage(id: number): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      const detail = await this._pageDataService.getPageDetail(id);
      const sortedBlocks = [...(detail.blocks ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      this.page = new PageDetailDto({ ...detail, blocks: sortedBlocks });
      this.apiEndpoint = this._buildApiEndpoint(detail);
    } catch (error) {
      console.error('Failed to load page detail', error);
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  public get blocks(): PageBlockDto[] {
    return this.page?.blocks ?? [];
  }

  public async submitBlock(): Promise<void> {
    this.blockForm.markAllAsTouched();
    if (this.blockForm.invalid || !this.page || this.creatingBlock) {
      return;
    }

    const rawType = this.blockForm.getRawValue().type;
    if (!this.blockTypes.some((option) => option.value === rawType)) {
      this.createBlockError = '請選擇區塊類型';
      this._cdr.markForCheck();
      return;
    }
    const type = rawType as PageBlockDto['type'];
    const name = this.blockForm.getRawValue().name.trim();

    const content = this._buildContent(type);

    if (type === 'carousel') {
      const items = (content?.['items'] as any[]) ?? [];
      if (!items.length) {
        this.createBlockError = '請至少新增一個輪播圖項目';
        this._cdr.markForCheck();
        return;
      }
      const invalid = items.some((item) => !item.imageUrl);
      if (invalid) {
        this.createBlockError = '輪播圖項目需要提供圖片網址';
        this._cdr.markForCheck();
        return;
      }
    }

    if (type === 'banner') {
      const imageUrl = (content?.['imageUrl'] as string | null) ?? '';
      if (!imageUrl) {
        this.createBlockError = '請提供 Banner 的圖片網址';
        this._cdr.markForCheck();
        return;
      }
    }

    if (type === 'image_text') {
      const items = (content?.['items'] as any[]) ?? [];
      if (!items.length) {
        this.createBlockError = '請新增至少一個圖片與文字項目';
        this._cdr.markForCheck();
        return;
      }
      const invalid = items.some((item) =>
        this._isImageTextItemInvalid(item.layout, item.imageUrl, item.text),
      );
      if (invalid) {
        this.createBlockError = '請確認圖片或文字欄位已依版型填寫完整';
        this._cdr.markForCheck();
        return;
      }
    }

    this.creatingBlock = true;
    this.createBlockError = null;
    this._cdr.markForCheck();

    try {
      const payload = {
        pageId: this.page.id,
        name,
        type,
        content,
      } as const;

      const block = await this._pageDataService.createPageBlock(payload);
      const sortedBlocks = [...(this.page?.blocks ?? []), block].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      this.page = new PageDetailDto({
        ...this.page,
        blocks: sortedBlocks,
      });
      this.apiEndpoint = this._buildApiEndpoint(this.page);
      this.blockForm.reset({
        name: '',
        type,
        carouselItems: undefined,
        banner: undefined,
        imageTextItems: undefined,
      });
      this.blockForm.patchValue({ type });
      this._resetDynamicGroups(type);
      this.blockForm.markAsPristine();
      this.blockForm.markAsUntouched();
    } catch (error) {
      console.error('Failed to create block', error);
      this.createBlockError = this._resolveError(error);
    } finally {
      this.creatingBlock = false;
      this._cdr.markForCheck();
    }
  }

  public trackByBlock = (_: number, block: PageBlockDto) => block.id;

  public formatContent(block: PageBlockDto): string {
    if (!block.content) {
      return '—';
    }

    try {
      return JSON.stringify(block.content, null, 2);
    } catch {
      return block.content.toString();
    }
  }

  private _buildContent(type: PageBlockDto['type']): Record<string, unknown> | null {
    switch (type) {
      case 'carousel': {
        const items = this.carouselItems.controls
          .map((group) => group.getRawValue())
          .map(({ imageUrl, link, caption }) => ({
            imageUrl: imageUrl?.trim() || null,
            link: link?.trim() || null,
            caption: caption?.trim() || null,
          }))
          .filter((item) => item.imageUrl);
        return { items };
      }

      case 'banner': {
        const raw = this.banner.value;
        return {
          imageUrl: raw.imageUrl?.trim() || null,
          link: raw.link?.trim() || null,
          caption: raw.caption?.trim() || null,
        };
      }

      case 'image_text': {
        const items = this.imageTextItems.controls
          .map((group) => group.getRawValue())
          .map(({ layout, imageUrl, title, description, text }) => ({
            layout,
            imageUrl: imageUrl?.trim() || null,
            title: title?.trim() || null,
            description: description?.trim() || null,
            text: text?.trim() || null,
          }));
        return { items };
      }

      default:
        return null;
    }
  }

  private _isImageTextItemInvalid(
    layout: string,
    imageUrl?: string | null,
    text?: string | null,
  ): boolean {
    switch (layout) {
      case 'image_only':
        return !(imageUrl && imageUrl.trim().length);

      case 'text_only':
        return !(text && text.trim().length);

      default:
        return !(
          imageUrl && imageUrl.trim().length && text && text.trim().length
        );
    }
  }

  private _resetDynamicGroups(
    type: PageBlockDto['type'] = (this.blockForm.get('type')?.value ?? 'carousel') as PageBlockDto['type'],
  ) {
    this.carouselItems.clear();
    this.imageTextItems.clear();
    this.blockForm.setControl('banner', this._createBannerGroup());

    if (type === 'carousel') {
      this.carouselItems.push(this._createCarouselGroup());
    }

    if (type === 'image_text') {
      this.imageTextItems.push(this._createImageTextGroup());
    }
  }

  public get carouselItems(): FormArray<FormGroup> {
    return this.blockForm.get('carouselItems') as FormArray<FormGroup>;
  }

  public get banner(): FormGroup {
    return this.blockForm.get('banner') as FormGroup;
  }

  public get imageTextItems(): FormArray<FormGroup> {
    return this.blockForm.get('imageTextItems') as FormArray<FormGroup>;
  }

  public addCarouselItem(): void {
    this.carouselItems.push(this._createCarouselGroup());
    this._cdr.markForCheck();
  }

  public removeCarouselItem(index: number): void {
    if (this.carouselItems.length <= 1) return;
    this.carouselItems.removeAt(index);
    this._cdr.markForCheck();
  }

  public addImageTextItem(): void {
    this.imageTextItems.push(this._createImageTextGroup());
    this._cdr.markForCheck();
  }

  public removeImageTextItem(index: number): void {
    if (this.imageTextItems.length <= 1) return;
    this.imageTextItems.removeAt(index);
    this._cdr.markForCheck();
  }

  private _createCarouselGroup(): FormGroup {
    return this._formBuilder.nonNullable.group({
      imageUrl: ['', Validators.required],
      link: [''],
      caption: [''],
    });
  }

  private _createBannerGroup(): FormGroup {
    return this._formBuilder.nonNullable.group({
      imageUrl: ['', Validators.required],
      link: [''],
      caption: [''],
    });
  }

  private _createImageTextGroup(): FormGroup {
    return this._formBuilder.nonNullable.group({
      layout: ['image_only', Validators.required],
      imageUrl: [''],
      title: [''],
      description: [''],
      text: [''],
    });
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

  private _buildApiEndpoint(page: PageDto | null): string {
    const slug = page?.slug ?? '';
    if (!slug) {
      return `${this._apiBase}/api/{slug}`;
    }
    return `${this._apiBase}/api/${slug}`;
  }

  private static _normalizeServerUrl(url?: string): string {
    if (!url || !url.trim().length) {
      return '';
    }
    return url.replace(/\/$/, '');
  }
}
