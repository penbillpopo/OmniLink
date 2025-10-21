import { Injectable } from '@angular/core';
import {
  GetRoleListDto,
  RoleDetailDto,
  RoleModel,
  SearchDto,
} from '@ay-gosu/server-shared';

type RoleListResponse = {
  data: GetRoleListDto[];
  total: number;
};

@Injectable({
  providedIn: 'root',
})
export class RoleDataService {
  public async getRoleList(
    search: Partial<SearchDto> = {},
  ): Promise<RoleListResponse> {
    const fallback: SearchDto = {
      pageIndex: 1,
      pageSize: 200,
      orderBy: 'DESC',
      orderByColumn: 'updatedAt',
    };

    const response = await RoleModel.getRoleList({
      ...fallback,
      ...search,
    });

    const list = (response?.data ?? [])
      .map((item) => new GetRoleListDto(item))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      data: list,
      total: response?.total ?? list.length,
    };
  }

  public async getRoleDetail(id: number): Promise<RoleDetailDto> {
    const detail = await RoleModel.getRoleDetail(id);
    return new RoleDetailDto(detail);
  }

  public async createRole(options: {
    name: string;
    permissions: string[];
    description?: string;
  }): Promise<RoleDetailDto> {
    const detail = await RoleModel.createRole(
      options.name,
      options.permissions,
      options.description ?? null,
    );

    return new RoleDetailDto(detail);
  }

  public async updateRole(
    id: number,
    options: {
      name: string;
      permissions: string[];
      description?: string;
      order?: number;
    },
  ): Promise<RoleDetailDto> {
    const detail = await RoleModel.updateRole(
      id,
      options.name,
      options.permissions,
      options.description ?? null,
      options.order,
    );

    return new RoleDetailDto(detail);
  }

  public async deleteRole(id: number): Promise<boolean> {
    return RoleModel.deleteRole(id);
  }
  public async reorderRoles(
    orders: { id: number; order: number }[],
  ): Promise<boolean> {
    if (!orders?.length) {
      return true;
    }

    return RoleModel.reorderRoles(orders);
  }
}
