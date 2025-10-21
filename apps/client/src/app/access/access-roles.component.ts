import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { GetRoleListDto, RoleDetailDto } from '@ay-gosu/server-shared';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsConfirmDialogComponent,
  CsDialogComponent,
  CsDrawerComponent,
  CsIconButtonComponent,
  CsInputComponent,
  CsSpinnerComponent,
  CsTextareaComponent,
} from '../component';
import { RoleDataService } from './role-data.service';

type DrawerMode = 'view' | 'form' | null;
type FormMode = 'create' | 'edit';
type FeedbackVariant = 'success' | 'error';

@Component({
  selector: 'cs-access-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatCheckboxModule,
    CsButtonComponent,
    CsDialogComponent,
    CsDrawerComponent,
    CsSpinnerComponent,
    CsInputComponent,
    CsTextareaComponent,
    CsAlertComponent,
    CsIconButtonComponent,
    CsConfirmDialogComponent,
  ],
  templateUrl: './access-roles.component.html',
  styleUrl: './access-roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessRolesComponent implements OnInit {
  public roles: GetRoleListDto[] = [];
  public rolesLoading = false;
  public rolesError: string | null = null;

  public feedback: { variant: FeedbackVariant; message: string } | null = null;

  public drawerOpen = false;
  public drawerMode: DrawerMode = null;
  public drawerTitle = '';

  public detailLoading = false;
  public selectedRole: RoleDetailDto | null = null;

  public confirmDeleteOpen = false;

  public formMode: FormMode = 'create';
  public isSubmitting = false;
  public editingRoleId: number | null = null;

  public permissions: string[] = [];
  public reordering = false;

  public readonly permissionOptions = [
    {
      key: 'role.view',
      label: '檢視角色與權限',
    },
    {
      key: 'role.create',
      label: '新增角色',
    },
    {
      key: 'role.update',
      label: '編輯角色',
    },
    {
      key: 'role.delete',
      label: '刪除角色',
    },
  ];
  private readonly _permissionOptionMap = new Map(
    this.permissionOptions.map((option) => [option.key, option]),
  );

  public permissionDialogOpen = false;
  private _pendingPermissionSelection = new Set<string>();

  public readonly roleForm = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    description: ['', [Validators.maxLength(255)]],
  });

  public constructor(
    private readonly _roleDataService: RoleDataService,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    void this.loadRoles();
  }

  public async loadRoles(): Promise<void> {
    this.rolesLoading = true;
    this.rolesError = null;
    this._cdr.markForCheck();

    try {
      const { data } = await this._roleDataService.getRoleList();
      this.roles = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
      console.error('Failed to load roles', error);
      this.rolesError = this._resolveError(error);
    } finally {
      this.rolesLoading = false;
      this._cdr.markForCheck();
    }
  }

  public async handleRoleDrop(
    event: CdkDragDrop<GetRoleListDto[]>,
  ): Promise<void> {
    if (event.previousIndex === event.currentIndex || this.rolesLoading) {
      return;
    }

    const originalRoles = this.roles.map((role) => new GetRoleListDto(role));
    const reordered = [...this.roles];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);

    const updates = reordered.map((role, index) => ({
      id: role.id,
      order: index,
    }));

    this.roles = reordered.map(
      (role, index) =>
        new GetRoleListDto({
          ...role,
          order: index,
        }),
    );
    this.reordering = true;
    this._cdr.markForCheck();

    try {
      await this._roleDataService.reorderRoles(updates);
      if (this.selectedRole) {
        const match = this.roles.find(
          (role) => role.id === this.selectedRole?.id,
        );
        if (match) {
          this.selectedRole.order = match.order ?? 0;
        }
      }
      this.feedback = {
        variant: 'success',
        message: '角色排序已更新',
      };
    } catch (error) {
      console.error('Failed to reorder roles', error);
      this.roles = originalRoles;
      this.feedback = {
        variant: 'error',
        message: this._resolveError(error),
      };
    } finally {
      this.reordering = false;
      this._cdr.markForCheck();
    }
  }

  public openCreateDrawer(): void {
    this.formMode = 'create';
    this.editingRoleId = null;
    this.drawerMode = 'form';
    this.drawerOpen = true;
    this.drawerTitle = '新增角色';
    this.permissions = [];
    this.isSubmitting = false;
    this.roleForm.reset({
      name: '',
      description: '',
    });
    this._cdr.markForCheck();
  }

  public async openRoleDetail(
    roleId: number,
    prefetched?: RoleDetailDto,
  ): Promise<void> {
    this.drawerMode = 'view';
    this.drawerOpen = true;
    this.drawerTitle = '角色詳情';
    this.detailLoading = prefetched ? false : true;
    this.selectedRole = prefetched ?? null;
    this._cdr.markForCheck();

    if (prefetched) {
      this.drawerTitle = prefetched.name;
      return;
    }

    try {
      const detail = await this._roleDataService.getRoleDetail(roleId);
      this.selectedRole = detail;
      this.drawerTitle = detail.name;
    } catch (error) {
      console.error('Failed to load role detail', error);
      this.feedback = {
        variant: 'error',
        message: this._resolveError(error),
      };
      this.closeDrawer();
    } finally {
      this.detailLoading = false;
      this._cdr.markForCheck();
    }
  }

  public startEdit(): void {
    if (!this.selectedRole) {
      return;
    }

    this.formMode = 'edit';
    this.editingRoleId = this.selectedRole.id;
    this.drawerMode = 'form';
    this.drawerTitle = `編輯角色 - ${this.selectedRole.name}`;
    this.roleForm.reset({
      name: this.selectedRole.name ?? '',
      description: this.selectedRole.description ?? '',
    });
    this.permissions = [...(this.selectedRole.permissions ?? [])];
    this._cdr.markForCheck();
  }

  public removePermission(permission: string): void {
    this.permissions = this.permissions.filter((item) => item !== permission);
    this._cdr.markForCheck();
  }

  public openPermissionDialog(): void {
    this._pendingPermissionSelection = new Set(
      this.permissions.filter((permission) =>
        this._permissionOptionMap.has(permission),
      ),
    );
    this.permissionDialogOpen = true;
    this._cdr.markForCheck();
  }

  public closePermissionDialog(): void {
    this.permissionDialogOpen = false;
    this._cdr.markForCheck();
  }

  public togglePermissionSelection(permission: string, checked: boolean): void {
    const next = new Set(this._pendingPermissionSelection);
    if (checked) {
      next.add(permission);
    } else {
      next.delete(permission);
    }
    this._pendingPermissionSelection = next;
    this._cdr.markForCheck();
  }

  public confirmPermissionDialog(): void {
    const selectedKeys = this.permissionOptions
      .map((option) => option.key)
      .filter((key) => this._pendingPermissionSelection.has(key));

    const unknownPermissions = this.permissions.filter(
      (permission) => !this._permissionOptionMap.has(permission),
    );

    this.permissions = [...unknownPermissions, ...selectedKeys];
    this.permissionDialogOpen = false;
    this._cdr.markForCheck();
  }

  public isPermissionSelected(permission: string): boolean {
    return this._pendingPermissionSelection.has(permission);
  }

  public async submitForm(): Promise<void> {
    this.roleForm.markAllAsTouched();
    const name = this.roleForm.controls.name.value.trim();
    const description = this.roleForm.controls.description.value?.trim();

    if (!name) {
      this.roleForm.controls.name.setErrors({ required: true });
      this._cdr.markForCheck();
      return;
    }

    if (this.roleForm.controls.name.invalid) {
      this._cdr.markForCheck();
      return;
    }

    const permissions = this.permissions;

    this.isSubmitting = true;
    this._cdr.markForCheck();

    try {
      if (this.formMode === 'create') {
        const detail = await this._roleDataService.createRole({
          name,
          description,
          permissions,
        });

        this.feedback = {
          variant: 'success',
          message: `角色「${detail.name}」已建立`,
        };

        await this.loadRoles();
        await this.openRoleDetail(detail.id, detail);
      } else if (this.formMode === 'edit' && this.editingRoleId !== null) {
        const currentOrder =
          this.selectedRole?.order ??
          this.roles.find((role) => role.id === this.editingRoleId)?.order ??
          0;

        const detail = await this._roleDataService.updateRole(
          this.editingRoleId,
          {
            name,
            description,
            permissions,
            order: currentOrder,
          },
        );

        this.feedback = {
          variant: 'success',
          message: `角色「${detail.name}」已更新`,
        };

        await this.loadRoles();
        await this.openRoleDetail(detail.id, detail);
      }
    } catch (error) {
      console.error('Failed to submit role form', error);
      this.feedback = {
        variant: 'error',
        message: this._resolveError(error),
      };
    } finally {
      this.isSubmitting = false;
      this._cdr.markForCheck();
    }
  }

  public requestDelete(): void {
    this.confirmDeleteOpen = true;
    this._cdr.markForCheck();
  }

  public cancelDelete(): void {
    this.confirmDeleteOpen = false;
    this._cdr.markForCheck();
  }

  public async confirmDelete(): Promise<void> {
    if (!this.selectedRole) {
      return;
    }

    try {
      await this._roleDataService.deleteRole(this.selectedRole.id);
      this.feedback = {
        variant: 'success',
        message: `角色「${this.selectedRole.name}」已刪除`,
      };
      this.confirmDeleteOpen = false;
      this.closeDrawer();
      await this.loadRoles();
    } catch (error) {
      console.error('Failed to delete role', error);
      this.feedback = {
        variant: 'error',
        message: this._resolveError(error),
      };
    }
    this._cdr.markForCheck();
  }

  public closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerMode = null;
    this.drawerTitle = '';
    this.selectedRole = null;
    this.editingRoleId = null;
    this.detailLoading = false;
    this.isSubmitting = false;
    this.permissions = [];
    this.roleForm.reset({
      name: '',
      description: '',
    });
    this._cdr.markForCheck();
  }

  public trackRole(_: number, item: GetRoleListDto): number {
    return item.id;
  }

  public trackPermission(_: number, permission: string): string {
    return permission;
  }

  public trackPermissionOption(
    _: number,
    option: { key: string },
  ): string {
    return option.key;
  }

  public formatUpdatedAt(value: Date | string | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      const date = value instanceof Date ? value : new Date(value as string);
      if (Number.isNaN(date.getTime())) {
        return '-';
      }

      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  }

  public permissionLabel(permission: string): string {
    const option = this._permissionOptionMap.get(permission);
    return option?.label ?? permission;
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
