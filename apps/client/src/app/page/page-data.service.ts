import { Injectable } from '@angular/core';
import {
  CreatePageBlockDto,
  CreatePageDto,
  PageBlockDto,
  PageDetailDto,
  PageDto,
  PageModel,
  ResponseListDto,
} from '@ay-gosu/server-shared';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageDataService {
  private readonly _pages$ = new BehaviorSubject<PageDto[]>([]);
  public readonly pages$ = this._pages$.asObservable();

  public async refreshPages(): Promise<PageDto[]> {
    const response = (await PageModel.getPageList()) as ResponseListDto<PageDto[]>;
    const pages = (response?.data ?? []).map((page) => new PageDto(page));
    this._pages$.next(pages);
    return pages;
  }

  public getCachedPages(): PageDto[] {
    return this._pages$.value;
  }

  public async createPage(payload: CreatePageDto): Promise<PageDetailDto> {
    const detail = await PageModel.createPage(payload);
    const mapped = new PageDetailDto({
      ...detail,
      blocks: (detail?.blocks ?? []).map((block) => new PageBlockDto(block)),
    });
    await this.refreshPages();
    return mapped;
  }

  public async getPageDetail(id: number): Promise<PageDetailDto> {
    const detail = await PageModel.getPageDetail(id);
    return new PageDetailDto({
      ...detail,
      blocks: (detail?.blocks ?? []).map((block) => new PageBlockDto(block)),
    });
  }

  public async createPageBlock(
    payload: CreatePageBlockDto,
  ): Promise<PageBlockDto> {
    const block = await PageModel.createPageBlock(payload);
    return new PageBlockDto(block);
  }
}
