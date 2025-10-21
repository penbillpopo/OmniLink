// 透過 @ay-nestjs/share 產生
/* eslint-disable */
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { wsc } from '../wsc';
import { GetRoleListDto } from './dto/get-role-list.dto';
import { RoleDetailDto } from './dto/role-detail.dto';

export class RoleModel {
  static getRoleList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetRoleListDto[]>> {
    return wsc.execute('/ws/role/getRoleList', searchDto) as any;
  }

  static getRoleDetail(id: number): Promise<RoleDetailDto> {
    return wsc.execute('/ws/role/getRoleDetail', id) as any;
  }

  static createRole(
    name: string,
    permissions: string[],
    description?: string,
  ): Promise<RoleDetailDto> {
    return wsc.execute(
      '/ws/role/createRole',
      name,
      permissions,
      description,
    ) as any;
  }

  static updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    order?: number,
  ): Promise<RoleDetailDto> {
    return wsc.execute(
      '/ws/role/updateRole',
      id,
      name,
      permissions,
      description,
      order,
    ) as any;
  }

  static reorderRoles(
    orders: { id: number; order: number }[],
  ): Promise<boolean> {
    return wsc.execute('/ws/role/reorderRoles', orders) as any;
  }

  static deleteRole(id: number): Promise<boolean> {
    return wsc.execute('/ws/role/deleteRole', id) as any;
  }
}
// 4c7d651078d32b8b507ee1aafd62fd79c46eb8bfed68a7f1f354f2ca2b0087a3
