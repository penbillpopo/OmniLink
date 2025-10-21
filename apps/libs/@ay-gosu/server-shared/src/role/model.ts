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
    accountIds: number[] = [],
  ): Promise<RoleDetailDto> {
    return wsc.execute(
      '/ws/role/createRole',
      name,
      permissions,
      description,
      accountIds,
    ) as any;
  }

  static updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    accountIds?: number[],
  ): Promise<RoleDetailDto> {
    return wsc.execute(
      '/ws/role/updateRole',
      id,
      name,
      permissions,
      description,
      accountIds,
    ) as any;
  }

  static deleteRole(id: number): Promise<boolean> {
    return wsc.execute('/ws/role/deleteRole', id) as any;
  }
}
// a555c48519d9b82de39b8215443b448fc94a4b457691bf823adf967670757bfd
