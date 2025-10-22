import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LoginLogDto,
  LoginLogFilterDto,
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
import { LoginLogDataService, LoginLogStatus } from './login-log-data.service';

@Component({
  selector: 'cs-access-logins',
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
  templateUrl: './access-logins.component.html',
  styleUrl: './access-logins.component.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessLoginsComponent implements OnInit, OnDestroy {
  public readonly filtersForm = this._formBuilder.group({
    search: this._formBuilder.control<string>(''),
    status: this._formBuilder.control<LoginLogStatus | ''>(''),
    from: this._formBuilder.control<string | null>(null),
    to: this._formBuilder.control<string | null>(null),
  });

  public readonly statusOptions: { value: LoginLogStatus | ''; label: string }[] =
    [
      { value: '', label: '全部狀態' },
      { value: 'success', label: '成功' },
      { value: 'failed', label: '失敗' },
      { value: 'locked', label: '已鎖定' },
    ];

  public logs: LoginLogDto[] = [];
  public total = 0;
  public pageIndex = 1;
  public pageSize = 20;
  public readonly pageSizeOptions = [20, 50, 100];

  public recentLogs: LoginLogDto[] = [];

  public loading = false;
  public recentLoading = false;
  public exporting = false;

  public error: string | null = null;
  public recentError: string | null = null;
  public exportError: string | null = null;
  public dateRangeError: string | null = null;

  public filtersVisible = false;

  private readonly _exportAbortController = new AbortController();

  public constructor(
    private readonly _loginLogService: LoginLogDataService,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _datePipe: DatePipe,
  ) {}

  public ngOnInit(): void {
    void this.reloadAll();
  }

  public ngOnDestroy(): void {
    this._exportAbortController.abort();
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
    if (!this._validateRange()) {
      this._cdr.markForCheck();
      return;
    }
    await this.reloadAll();
  }

  public async resetFilters(): Promise<void> {
    this.filtersForm.reset({
      search: '',
      status: '',
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
    await this.loadLogs();
  }

  public async onPageSizeChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement | null;
    if (!select) return;
    const next = Number(select.value);
    if (Number.isNaN(next) || next <= 0) {
      return;
    }
    await this.changePageSize(next);
  }

  public async goToPage(page: number): Promise<void> {
    const safe = Math.max(1, Math.min(page, this.totalPages));
    if (safe === this.pageIndex) {
      return;
    }
    this.pageIndex = safe;
    await this.loadLogs();
  }

  public async prevPage(): Promise<void> {
    if (this.pageIndex <= 1) return;
    await this.goToPage(this.pageIndex - 1);
  }

  public async nextPage(): Promise<void> {
    if (this.pageIndex >= this.totalPages) return;
    await this.goToPage(this.pageIndex + 1);
  }

  public trackByLog = (_: number, log: LoginLogDto) => log.id ?? log.createdAt;

  public formatStatus(status: LoginLogStatus): string {
    switch (status) {
      case 'success':
        return '成功';
      case 'locked':
        return '已鎖定';
      case 'failed':
      default:
        return '失敗';
    }
  }

  public statusClass(status: LoginLogStatus): string {
    switch (status) {
      case 'success':
        return 'badge--success';
      case 'locked':
        return 'badge--danger';
      case 'failed':
      default:
        return 'badge--warning';
    }
  }

  public formatDateTime(value?: Date | string | null): string {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return this._datePipe.transform(date, 'yyyy/MM/dd HH:mm') ?? '-';
  }

  public async exportCsv(): Promise<void> {
    if (this.exporting) {
      return;
    }

    if (!this.logs.length) {
      this.exportError = '目前沒有可匯出的資料';
      this._cdr.markForCheck();
      return;
    }

    this.exporting = true;
    this.exportError = null;
    this._cdr.markForCheck();

    try {
      const { data } = await this._loginLogService.getLoginLogs({
        ...this._buildQueryOptions(),
        pageSize: 200,
        pageIndex: 1,
      });
      if (!data.length) {
        this.exportError = '找不到符合條件的登入紀錄';
        return;
      }
      this._downloadCsv(data);
    } catch (error) {
      console.error('Failed to export login logs', error);
      this.exportError = this._resolveError(error);
    } finally {
      this.exporting = false;
      this._cdr.markForCheck();
    }
  }

  private async reloadAll(): Promise<void> {
    await Promise.all([this.loadLogs(), this.loadRecentLogs()]);
  }

  private async loadLogs(): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      const { data, total } = await this._loginLogService.getLoginLogs(
        this._buildQueryOptions(),
      );
      this.logs = data;
      this.total = total;
    } catch (error) {
      console.error('Failed to load login logs', error);
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
      const logs = await this._loginLogService.getRecentLoginLogs(6, {
        status: this._buildFilter().status ?? undefined,
      });
      this.recentLogs = logs;
    } catch (error) {
      console.error('Failed to load recent login logs', error);
      this.recentLogs = [];
      this.recentError = this._resolveError(error);
    } finally {
      this.recentLoading = false;
      this._cdr.markForCheck();
    }
  }

  private _buildQueryOptions() {
    const { search, status, from, to } = this.filtersForm.getRawValue();
    return {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: search ?? '',
      status: status ?? '',
      from,
      to,
    };
  }

  private _buildFilter(): Partial<LoginLogFilterDto> {
    const { status, from, to } = this.filtersForm.getRawValue();
    const filter: Partial<LoginLogFilterDto> = {};

    if (status && status.trim().length) {
      filter.status = status as LoginLogStatus;
    }
    if (from) {
      filter.from = from;
    }
    if (to) {
      filter.to = to;
    }

    return filter;
  }

  private _validateRange(): boolean {
    const { from, to } = this.filtersForm.getRawValue();
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

  private _downloadCsv(logs: LoginLogDto[]): void {
    const header = [
      '時間',
      '帳號',
      '姓名',
      '狀態',
      'IP 位址',
      '位置',
      'User Agent',
      '訊息',
    ];

    const rows = logs.map((log) => [
      this.formatDateTime(log.createdAt),
      log.account ?? '-',
      log.name ?? '-',
      this.formatStatus(log.status as LoginLogStatus),
      log.ipAddress ?? '-',
      log.location ?? '-',
      log.userAgent ?? '-',
      log.message ?? '-',
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = value ?? '';
            if (
              text.includes('"') ||
              text.includes(',') ||
              text.includes('\n')
            ) {
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
    link.download = `login-logs-${this._datePipe.transform(
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
      (typeof (error as any)?.toString === 'function'
        ? (error as any).toString()
        : null);

    if (typeof message === 'string' && message.trim().length) {
      return message.trim();
    }

    return '發生未知錯誤，請稍後再試';
  }
}
