import { Session, Share } from '@ay-nestjs/share-server';
import { Controller } from '@nestjs/common';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SearchDto } from '../_common/dto/search.dto';
import { SessionDto } from '../_module/session.dto';
import { GetRoleListDto } from './dto/get-role-list.dto';
import { RoleDetailDto } from './dto/role-detail.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  public constructor(private readonly _roleService: RoleService) {}

  @Share()
  public async getRoleList(
    searchDto: SearchDto,
  ): Promise<ResponseListDto<GetRoleListDto[]>> {
    return this._roleService.getRoleList(searchDto);
  }

  @Share()
  public async getRoleDetail(id: number): Promise<RoleDetailDto> {
    return this._roleService.getRoleDetail(id);
  }

  @Share()
  public async createRole(
    name: string,
    permissions: string[],
    description?: string,
    @Session() session?: SessionDto,
  ): Promise<RoleDetailDto> {
    return this._roleService.createRole(
      name,
      permissions ?? [],
      description,
      session,
    );
  }

  @Share()
  public async updateRole(
    id: number,
    name: string,
    permissions: string[],
    description?: string,
    order?: number,
    @Session() session?: SessionDto,
  ): Promise<RoleDetailDto> {
    return this._roleService.updateRole(
      id,
      name,
      permissions ?? [],
      description,
      order,
      session,
    );
  }

  @Share()
  public async reorderRoles(
    orders: { id: number; order: number }[],
    @Session() session?: SessionDto,
  ): Promise<boolean> {
    return this._roleService.reorderRoles(orders ?? [], session);
  }

  @Share()
  public async deleteRole(
    id: number,
    @Session() session?: SessionDto,
  ): Promise<boolean> {
    return this._roleService.deleteRole(id, session);
  }
}
