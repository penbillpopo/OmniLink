import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsConfirmDialogComponent,
  CsDrawerComponent,
  CsFormComponent,
  CsInputComponent,
  CsSelectComponent,
  CsSpinnerComponent,
} from '../component';
import { AccountDataService, AccountStatus } from './account-data.service';
import { RoleDataService } from './role-data.service';
import { GetAccountListDto, GetRoleListDto } from '@ay-gosu/server-shared';

@Component({
  selector: 'cs-access-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsAlertComponent,
    CsDrawerComponent,
    CsInputComponent,
    CsSelectComponent,
    CsFormComponent,
    CsSpinnerComponent,
    CsConfirmDialogComponent,
  ],
  providers: [DatePipe],
  templateUrl: './access-users.component.html',
  styleUrl: './access-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessUsersComponent implements OnInit {
  public readonly statusOptions: {
    value: AccountStatus;
    label: string;
    class: string;
  }[] = [
    { value: 'active', label: '啟用', class: 'status-tag--success' },
    { value: 'inactive', label: '停用', class: 'status-tag--warning' },
    { value: 'suspended', label: '已鎖定', class: 'status-tag--danger' },
  ];

  public accounts: GetAccountListDto[] = [];
  public roles: GetRoleListDto[] = [];
  public loading = false;
  public error: string | null = null;
  public feedback: { type: 'success' | 'error'; message: string } | null = null;

  public drawerOpen = false;
  public drawerMode: 'create' | 'edit' = 'edit';
  public submitting = false;
  public selectedAccount: GetAccountListDto | null = null;

  public confirmDeleteOpen = false;
  private _deleteTarget: GetAccountListDto | null = null;

  public readonly accountForm = this._fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    email: ['', [Validators.required, Validators.email]],
    roleId: [''],
    status: ['active' as AccountStatus, Validators.required],
  });

  public constructor(
    private readonly _accountService: AccountDataService,
    private readonly _roleDataService: RoleDataService,
    private readonly _fb: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _datePipe: DatePipe,
  ) {}

  public ngOnInit(): void {
    void this.loadReferenceData();
  }

  public roleSelectOptions: { label: string; value: string }[] = [
    { label: '未指定', value: '' },
  ];

  public readonly statusSelectOptions = this.statusOptions.map((status) => ({
    label: status.label,
    value: status.value,
  }));

  public async loadReferenceData(): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      const [accounts, roles] = await Promise.all([
        this._accountService.getAccounts(),
        this._roleDataService.getRoleList(),
      ]);
      this.accounts = accounts.data ?? [];
      this.roles = roles.data ?? [];
      this._buildRoleSelectOptions();
      this._reapplySelectedRole();
    } catch (error) {
      console.error('Failed to load accounts', error);
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  public openEditDrawer(account: GetAccountListDto): void {
    this.drawerMode = 'edit';
    this.drawerOpen = true;
    this.selectedAccount = account;
    const roleId = account.roleId != null ? String(account.roleId) : '';
    this.accountForm.reset({
      name: account.name ?? '',
      email: account.account ?? '',
      roleId,
      status: (account.status as AccountStatus) ?? 'active',
    });
    this._cdr.markForCheck();
  }

  public closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedAccount = null;
    this.accountForm.reset({
      name: '',
      email: '',
      roleId: '',
      status: 'active',
    });
    this._cdr.markForCheck();
  }

  public async submit(): Promise<void> {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.invalid || this.submitting) {
      return;
    }

    const { name, email, roleId, status } = this.accountForm.getRawValue();
    const roleIdNumber = roleId ? Number(roleId) : undefined;
    this.submitting = true;
    this.feedback = null;
    this._cdr.markForCheck();

    try {
      if (this.selectedAccount) {
        await this._accountService.updateAccount({
          id: this.selectedAccount.id,
          name,
          account: email,
          roleId: roleIdNumber ?? null,
          status,
        });
      }

      await this.loadReferenceData();
      this.feedback = { type: 'success', message: '變更已儲存' };
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to submit account', error);
      this.feedback = { type: 'error', message: this._resolveError(error) };
    } finally {
      this.submitting = false;
      this._cdr.markForCheck();
    }
  }

  public confirmDelete(account: GetAccountListDto): void {
    this._deleteTarget = account;
    this.confirmDeleteOpen = true;
    this._cdr.markForCheck();
  }

  public cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this._deleteTarget = null;
    this._cdr.markForCheck();
  }

  public async performDelete(): Promise<void> {
    if (!this._deleteTarget) {
      return;
    }

    this.submitting = true;
    this.confirmDeleteOpen = false;
    this.feedback = null;
    this._cdr.markForCheck();

    try {
      await this._accountService.deleteAccount(this._deleteTarget.id);
      await this.loadReferenceData();
      this.feedback = { type: 'success', message: '已刪除帳號' };
    } catch (error) {
      console.error('Failed to delete account', error);
      this.feedback = { type: 'error', message: this._resolveError(error) };
    } finally {
      this.submitting = false;
      this._deleteTarget = null;
      this._cdr.markForCheck();
    }
  }

  public exportAccounts(): void {
    if (!this.accounts.length) {
      return;
    }

    const header = ['姓名', 'Email', '角色', '最後登入', '狀態'];
    const rows = this.accounts.map((account) => [
      account.name ?? '',
      account.account ?? '',
      account.roleName ?? '未指定',
      this.formatDate(account.lastLoginAt),
      this.getStatusLabel(account.status),
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${(value ?? '').replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  public getStatusLabel(status?: string): string {
    const match = this.statusOptions.find((option) => option.value === status);
    return match?.label ?? '未知';
  }

  public getStatusClass(status?: string): string {
    const match = this.statusOptions.find((option) => option.value === status);
    return match?.class ?? 'status-tag--neutral';
  }

  public formatDate(input?: Date | string | null): string {
    if (!input) {
      return '—';
    }

    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return this._datePipe.transform(date, 'yyyy/MM/dd HH:mm') ?? '—';
  }

  public trackByAccount(_: number, item: GetAccountListDto): number {
    return item.id;
  }

  public handleDrawerClosed(): void {
    this.closeDrawer();
  }

  private _buildRoleSelectOptions(): void {
    const options: { label: string; value: string }[] = [];

    this.roles
      .filter((role) => role && role.id != null)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((role) => {
        options.push({
          label: role.name ?? `角色 #${role.id}`,
          value: String(role.id),
        });
      });

    if (!options.length) {
      const fallback = new Map<number, string>();
      this.accounts.forEach((account) => {
        if (account.roleId != null) {
          fallback.set(
            account.roleId,
            account.roleName ?? `角色 #${account.roleId}`,
          );
        }
      });

      fallback.forEach((name, id) => {
        options.push({
          label: name,
          value: String(id),
        });
      });
    }

    this.roleSelectOptions = [{ label: '未指定', value: '' }, ...options];
  }

  private _reapplySelectedRole(): void {
    if (!this.drawerOpen) {
      return;
    }

    const current = this.selectedAccount;
    const roleValue = current?.roleId != null ? String(current.roleId) : '';
    this.accountForm.controls.roleId.setValue(roleValue, {
      emitEvent: false,
    });
  }

  private _resolveError(error: unknown): string {
    if (!error) {
      return '發生未知錯誤，請稍後再試';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message ?? '發生未知錯誤，請稍後再試';
    }

    const maybeMessage = (error as { message?: string })?.message;
    if (maybeMessage) {
      return maybeMessage;
    }

    return '發生未知錯誤，請稍後再試';
  }
}
