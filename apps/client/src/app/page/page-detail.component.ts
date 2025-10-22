import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    imageUrls: [''],
    imageUrl: [''],
    link: [''],
    title: [''],
    description: [''],
    text: [''],
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
        this.blockForm.patchValue(
          {
            imageUrls: '',
            imageUrl: '',
            link: '',
            title: '',
            description: '',
            text: '',
          },
          { emitEvent: false },
        );
        this._cdr.markForCheck();
      });
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
      const images = (content?.['images'] as string[] | undefined) ?? [];
      if (!images.length) {
        this.createBlockError = '請至少輸入一張輪播圖的圖片網址';
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
      const imageUrl = (content?.['imageUrl'] as string | null) ?? '';
      const text = (content?.['text'] as string | null) ?? '';
      if (!imageUrl || !text) {
        this.createBlockError = '圖片與文字區塊需要圖片與內文字內容';
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
        imageUrls: '',
        imageUrl: '',
        link: '',
        title: '',
        description: '',
        text: '',
      });
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
    const raw = this.blockForm.getRawValue();

    switch (type) {
      case 'carousel': {
        const images = raw.imageUrls
          ?.split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        return images?.length ? { images } : null;
      }

      case 'banner': {
        return {
          imageUrl: raw.imageUrl?.trim() || null,
          link: raw.link?.trim() || null,
        };
      }

      case 'image_text': {
        return {
          imageUrl: raw.imageUrl?.trim() || null,
          title: raw.title?.trim() || null,
          description: raw.description?.trim() || null,
          text: raw.text?.trim() || null,
        };
      }

      default:
        return null;
    }
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
