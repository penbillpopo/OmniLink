import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  AuditLogDto,
  AuditLogFilterDto,
} from '@ay-gosu/server-shared';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsDatePickerComponent,
  CsEmptyStateComponent,
  CsFormComponent,
  CsSearchInputComponent,
  CsSelectComponent,
  CsSpinnerComponent,
} from '../component';
import { AuditDataService } from './audit-data.service';

@Component({
  selector: 'cs-access-audit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsFormComponent,
    CsSearchInputComponent,
    CsSelectComponent,
    CsDatePickerComponent,
    CsSpinnerComponent,
    CsAlertComponent,
    CsEmptyStateComponent,
  ],
  templateUrl: './access-audit.component.html',
  styleUrl: './access-audit.component.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessAuditComponent implements OnInit {
  public readonly filterForm = this._formBuilder.group({
    search: this._formBuilder.control<string>(''),
    module: this._formBuilder.control<string>(''),
    category: this._formBuilder.control<string>(''),
    from: this._formBuilder.control<string | null>(null),
    to: this._formBuilder.control<string | null>(null),
  });

  public logs: AuditLogDto[] = [];
  public total = 0;

  public readonly pageSizeOptions = [20, 50, 100];
  public pageSize = this.pageSizeOptions[0];
  public pageIndex = 1;

  public recentLogs: AuditLogDto[] = [];

  public loading = false;
  public recentLoading = false;
  public exporting = false;

  public error: string | null = null;
  public recentError: string | null = null;
  public exportError: string | null = null;
  public dateRangeError: string | null = null;

  public filtersVisible = false;

  public moduleOptions: { label: string; value: string }[] = [
    { label: '全部模組', value: '' },
  ];
  public categoryOptions: { label: string; value: string }[] = [
    { label: '全部類別', value: '' },
  ];

  private readonly _modules = new Set<string>();
  private readonly _categories = new Set<string>();

  public constructor(
    private readonly _auditDataService: AuditDataService,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _datePipe: DatePipe,
  ) {}

  public ngOnInit(): void {
    void this.reloadAll();
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  public toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
    this._cdr.markForCheck();
  }

  public async applyFilters(): Promise<void> {
    this.pageIndex = 1;
    if (!this._validateDateRange()) {
      this._cdr.markForCheck();
      return;
    }
    await this.reloadAll();
  }

  public async resetFilters(): Promise<void> {
    this.filterForm.reset({
      search: '',
      module: '',
      category: '',
      from: null,
      to: null,
    });
    this.dateRangeError = null;
    this.pageIndex = 1;
    await this.reloadAll();
  }

  public async changePageSize(size: number): Promise<void> {
    if (this.pageSize === size) {
      return;
    }
    this.pageSize = size;
    this.pageIndex = 1;
    await this.loadAuditLogs();
  }

  public async onPageSizeChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement | null;
    if (!select) {
      return;
    }
    const nextSize = Number(select.value);
    if (Number.isNaN(nextSize) || nextSize <= 0) {
      return;
    }
    await this.changePageSize(nextSize);
  }

  public async goToPage(page: number): Promise<void> {
    const safePage = Math.max(1, Math.min(page, this.totalPages));
    if (safePage === this.pageIndex) {
      return;
    }
    this.pageIndex = safePage;
    await this.loadAuditLogs();
  }

  public async prevPage(): Promise<void> {
    if (this.pageIndex <= 1) {
      return;
    }
    await this.goToPage(this.pageIndex - 1);
  }

  public async nextPage(): Promise<void> {
    if (this.pageIndex >= this.totalPages) {
      return;
    }
    await this.goToPage(this.pageIndex + 1);
  }

  public trackByLog = (_: number, log: AuditLogDto) => log.id ?? log.createdAt;

  public formatDateTime(value?: Date | string | null): string {
    if (!value) {
      return '-';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return this._datePipe.transform(date, 'yyyy/MM/dd HH:mm') ?? '-';
  }

  public formatMetadata(metadata?: Record<string, unknown>): string {
    if (!metadata || typeof metadata !== 'object') {
      return '';
    }
    try {
      return JSON.stringify(metadata);
    } catch {
      return '';
    }
  }

  public async exportLogs(): Promise<void> {
    if (this.exporting) {
      return;
    }

    if (!this.logs.length) {
      this.exportError = '目前沒有可匯出的日誌資料';
      this._cdr.markForCheck();
      return;
    }

    this.exporting = true;
    this.exportError = null;
    this._cdr.markForCheck();

    try {
      const logs = await this._auditDataService.exportAuditLogs({
        search: this._buildSearchTerm(),
        filter: this._buildFilter(),
        orderBy: 'DESC',
        orderByColumn: 'createdAt',
      });

      if (!logs.length) {
        this.exportError = '找不到符合條件的日誌資料';
        return;
      }

      this._downloadCsv(logs);
    } catch (error) {
      console.error('Failed to export audit logs', error);
      this.exportError = this._resolveError(error);
    } finally {
      this.exporting = false;
      this._cdr.markForCheck();
    }
  }

  private async reloadAll(): Promise<void> {
    await Promise.all([this.loadAuditLogs(), this.loadRecentLogs()]);
  }

  private async loadAuditLogs(): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      const { data, total } = await this._auditDataService.getAuditList({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this._buildSearchTerm(),
        filter: this._buildFilter(),
      });

      this.logs = data;
      this.total = total;
      this._collectFilterOptions(data);
    } catch (error) {
      console.error('Failed to load audit logs', error);
      this.logs = [];
      this.total = 0;
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  private async loadRecentLogs(): Promise<void> {
    this.recentLoading = true;
    this.recentError = null;
    this._cdr.markForCheck();

    try {
      const logs = await this._auditDataService.getRecent({
        limit: 6,
        filter: this._buildFilter(),
      });
      this.recentLogs = logs;
      this._collectFilterOptions(logs);
    } catch (error) {
      console.error('Failed to load recent audit logs', error);
      this.recentLogs = [];
      this.recentError = this._resolveError(error);
    } finally {
      this.recentLoading = false;
      this._cdr.markForCheck();
    }
  }

  private _buildSearchTerm(): string | undefined {
    const value = this.filterForm.getRawValue().search ?? '';
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private _buildFilter(): Partial<AuditLogFilterDto> | undefined {
    const { module, category, from, to } = this.filterForm.getRawValue();

    const filter: Partial<AuditLogFilterDto> = {};

    if (module?.trim()) {
      filter.module = module.trim();
    }

    if (category?.trim()) {
      filter.category = category.trim();
    }

    if (from) {
      filter.from = from;
    }

    if (to) {
      filter.to = to;
    }

    return Object.keys(filter).length ? filter : undefined;
  }

  private _collectFilterOptions(logs: AuditLogDto[]): void {
    logs.forEach((log) => {
      if (log.module) {
        this._modules.add(log.module);
      }
      if (log.category) {
        this._categories.add(log.category);
      }
    });

    this.moduleOptions = [
      { label: '全部模組', value: '' },
      ...Array.from(this._modules)
        .sort((a, b) => a.localeCompare(b, 'zh-Hant', { sensitivity: 'base' }))
        .map((value) => ({ label: value, value })),
    ];

    this.categoryOptions = [
      { label: '全部類別', value: '' },
      ...Array.from(this._categories)
        .sort((a, b) => a.localeCompare(b, 'zh-Hant', { sensitivity: 'base' }))
        .map((value) => ({ label: value, value })),
    ];
  }

  private _validateDateRange(): boolean {
    const { from, to } = this.filterForm.getRawValue();
    this.dateRangeError = null;

    if (!from || !to) {
      return true;
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return true;
    }

    if (fromDate.getTime() > toDate.getTime()) {
      this.dateRangeError = '起始日期不得晚於結束日期';
      return false;
    }

    return true;
  }

  private _downloadCsv(logs: AuditLogDto[]): void {
    const header = [
      '建立時間',
      '操作',
      '模組',
      '類別',
      '操作者',
      '帳號',
      '角色',
      'IP 位址',
      '詳細內容',
      'Metadata',
    ];

    const rows = logs.map((log) => [
      this.formatDateTime(log.createdAt),
      log.action ?? '',
      log.module ?? '',
      log.category ?? '',
      log.operatorDisplay ?? log.operatorName ?? '',
      log.operatorAccount ?? '',
      log.operatorRole ?? '',
      log.ipAddress ?? '',
      log.detail ?? '',
      this.formatMetadata(log.metadata),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = value ?? '';
            if (text.includes('"') || text.includes(',') || text.includes('\n')) {
              return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${this._datePipe.transform(
      new Date(),
      'yyyyMMddHHmmss',
    )}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private _resolveError(error: unknown): string {
    if (!error) {
      return '發生未知錯誤';
    }

    const message =
      (error as any)?.message ??
      (error as any)?.error?.message ??
      (error as any)?.error ??
      (error as any)?.toString();

    if (typeof message === 'string' && message.trim().length) {
      return message.trim();
    }

    return '發生未知錯誤，請稍後再試';
  }
}
