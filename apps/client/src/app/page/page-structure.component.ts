import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatePageDto, PageDto } from '@ay-gosu/server-shared';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsFormComponent,
  CsInputComponent,
  CsTextareaComponent,
  CsSpinnerComponent,
} from '../component';
import { PageDataService } from './page-data.service';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cs-page-structure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsFormComponent,
    CsInputComponent,
    CsTextareaComponent,
    CsSpinnerComponent,
    CsAlertComponent,
  ],
  templateUrl: './page-structure.component.html',
  styleUrl: './page-structure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStructureComponent implements OnInit, OnDestroy {
  public pages: PageDto[] = [];
  public loading = false;
  public error: string | null = null;
  public creating = false;
  public createError: string | null = null;

  public readonly createPageForm = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    slug: ['', [Validators.maxLength(64)]],
    description: ['', [Validators.maxLength(255)]],
  });

  private readonly _apiBase = PageStructureComponent._normalizeServerUrl(
    environment.serverUrl?.[0],
  );

  private readonly _pagesSub: Subscription;

  public constructor(
    private readonly _pageDataService: PageDataService,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _router: Router,
  ) {
    this._pagesSub = this._pageDataService.pages$.subscribe((pages) => {
      this.pages = pages;
      this._cdr.markForCheck();
    });
  }

  public ngOnInit(): void {
    if (!this._pageDataService.getCachedPages().length) {
      void this.loadPages();
    }
  }

  public ngOnDestroy(): void {
    this._pagesSub.unsubscribe();
  }

  public async loadPages(): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      this.pages = await this._pageDataService.refreshPages();
    } catch (error) {
      console.error('Failed to load pages', error);
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  public async submit(): Promise<void> {
    this.createPageForm.markAllAsTouched();
    if (this.createPageForm.invalid || this.creating) {
      return;
    }

    const payload: CreatePageDto = {
      name: this.createPageForm.getRawValue().name.trim(),
      slug: this.createPageForm.getRawValue().slug?.trim() || undefined,
      description: this.createPageForm.getRawValue().description?.trim() || undefined,
    };

    this.creating = true;
    this.createError = null;
    this._cdr.markForCheck();

    try {
      const detail = await this._pageDataService.createPage(payload);
      this.createPageForm.reset({ name: '', slug: '', description: '' });
      await this.loadPages();
      await this._router.navigate(['/app/pages', detail.id]);
    } catch (error) {
      console.error('Failed to create page', error);
      this.createError = this._resolveError(error);
    } finally {
      this.creating = false;
      this._cdr.markForCheck();
    }
  }

  public trackByPage = (_: number, page: PageDto) => page.id;

  public navigateToPage(page: PageDto): void {
    void this._router.navigate(['/app/pages', page.id]);
  }

  public buildApiEndpoint(page: PageDto): string {
    const slug = page.slug ?? '';
    if (!slug) {
      return `${this._apiBase}/api/{slug}`;
    }
    return `${this._apiBase}/api/${slug}`;
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

  private static _normalizeServerUrl(url?: string): string {
    if (!url || !url.trim().length) {
      return '';
    }
    return url.replace(/\/$/, '');
  }
}
