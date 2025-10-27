import {
  Page,
  PageBlock,
  PageComponent,
  PageComponentField,
} from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { AuditService } from '../audit/audit.service';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SessionDto } from '../_module/session.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreatePageBlockDto } from './dto/create-page-block.dto';
import { PageBlockDto, PageBlockType } from './dto/page-block.dto';
import { PageDetailDto } from './dto/page-detail.dto';
import { PageDto } from './dto/page.dto';

type InternalBlockType = 'carousel' | 'banner' | 'image_text' | 'component';

const PAGE_BLOCK_TYPES: InternalBlockType[] = [
  'carousel',
  'banner',
  'image_text',
  'component',
];

@Injectable()
export class PageService {
  public constructor(private readonly _auditService: AuditService) {}

  public async getPageList(): Promise<ResponseListDto<PageDto[]>> {
    const pages = await Page.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    const data = pages.map((page) => this._toPageDto(page));

    return {
      data,
      total: data.length,
    };
  }

  public async getPageDetail(id: number): Promise<PageDetailDto> {
    const page = await Page.findByPk(id);
    if (!page) {
      throw new Errors.PAGE_NOT_FOUND();
    }

    const blocks = await PageBlock.findAll({
      where: { pageId: id },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return this._toPageDetailDto(page, blocks);
  }

  public async createPage(
    payload: CreatePageDto,
    session?: SessionDto,
  ): Promise<PageDetailDto> {
    const sequelize = Page.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const name = this._normalizeName(payload?.name);
    if (!name) {
      throw new Errors.UPDATE_FAILED('請提供頁面名稱');
    }

    const page = await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, undefined, transaction);

      const slug = await this._generateSlug(payload?.slug ?? name, transaction);
      const order = await this._getNextOrder(transaction);

      const created = await Page.create(
        {
          name,
          slug,
          description: payload?.description?.trim() || null,
          order,
        },
        { transaction },
      );

      return created;
    });

    const detail = await this.getPageDetail(page.id);

    await this._auditService.recordAction(
      {
        module: 'page',
        category: 'create',
        action: '新增頁面',
        detail: `新增頁面 ${detail.name}`,
        metadata: {
          pageId: detail.id,
          slug: detail.slug,
        },
      },
      session,
    );

    return detail;
  }

  public async createPageBlock(
    payload: CreatePageBlockDto,
    session?: SessionDto,
  ): Promise<PageBlockDto> {
    const page = await Page.findByPk(payload?.pageId);
    if (!page) {
      throw new Errors.PAGE_NOT_FOUND();
    }

    const name = this._normalizeBlockName(payload?.name);
    if (!name) {
      throw new Errors.UPDATE_FAILED('請提供區塊名稱');
    }

    const type = this._normalizeBlockType(payload?.type);
    const content = await this._sanitizeBlockContent(type, payload?.content);

    const order = await this._getNextBlockOrder(page.id);

    const block = await PageBlock.create({
      pageId: page.id,
      name,
      type,
      content,
      order,
    });

    const dto = this._toBlockDto(block);

    await this._auditService.recordAction(
      {
        module: 'page',
        category: 'create',
        action: '新增頁面區塊',
        detail: `在頁面 ${page.name} 新增區塊 ${name}`,
        metadata: {
          pageId: page.id,
          blockId: dto.id,
          type: dto.type,
        },
      },
      session,
    );

    return dto;
  }

  public async deletePageBlock(
    id: number,
    session?: SessionDto,
  ): Promise<boolean> {
    const block = await PageBlock.findByPk(id, {
      include: [{ model: Page }],
    });

    if (!block) {
      throw new Errors.PAGE_BLOCK_NOT_FOUND();
    }

    const page = block.page ?? (await Page.findByPk(block.pageId));

    await block.destroy();

    await this._auditService.recordAction(
      {
        module: 'page',
        category: 'delete',
        action: '刪除頁面區塊',
        detail: `刪除頁面 ${page?.name ?? block.pageId} 的區塊 ${block.name}`,
        metadata: {
          pageId: page?.id ?? block.pageId,
          blockId: block.id,
          type: block.type,
        },
      },
      session,
    );

    return true;
  }

  public async getPageDetailBySlug(slug: string): Promise<PageDetailDto> {
    const sanitizedSlug = this._sanitizeSlug(slug);
    if (!sanitizedSlug) {
      throw new Errors.PAGE_NOT_FOUND();
    }

    const page = await Page.findOne({ where: { slug: sanitizedSlug } });
    if (!page) {
      throw new Errors.PAGE_NOT_FOUND();
    }

    const blocks = await PageBlock.findAll({
      where: { pageId: page.id },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return this._toPageDetailDto(page, blocks);
  }

  private _toPageDto(model: Page): PageDto {
    const plain = model.get({ plain: true }) as any;
    return new PageDto({
      id: plain.id,
      name: plain.name,
      slug: plain.slug,
      description: plain.description ?? null,
      order: plain.order ?? 0,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  private _toBlockDto(model: PageBlock): PageBlockDto {
    const plain = model.get({ plain: true }) as any;
    return new PageBlockDto({
      id: plain.id,
      pageId: plain.pageId,
      name: plain.name,
      type: this._normalizeBlockType(plain.type) as unknown as PageBlockDto['type'],
      content:
        plain.content && typeof plain.content === 'object'
          ? plain.content
          : null,
      order: plain.order ?? 0,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  private _toPageDetailDto(page: Page, blocks: PageBlock[]): PageDetailDto {
    const dto = new PageDetailDto(this._toPageDto(page));
    dto.blocks = blocks.map((block) => this._toBlockDto(block));
    return dto;
  }

  private _normalizeName(name?: string | null): string {
    if (!name) {
      return '';
    }
    return name.trim();
  }

  private _normalizeBlockName(name?: string | null): string {
    if (!name) {
      return '';
    }
    return name.trim();
  }

  private _normalizeBlockType(type?: string | null): InternalBlockType {
    const normalized = (type ?? '').toLowerCase().trim();
    if (PAGE_BLOCK_TYPES.includes(normalized as InternalBlockType)) {
      return normalized as InternalBlockType;
    }
    throw new Errors.INVALID_BLOCK_TYPE();
  }

  private async _sanitizeBlockContent(
    type: InternalBlockType,
    content?: Record<string, unknown> | null,
  ): Promise<Record<string, unknown> | null> {
    if (type === 'component') {
      return this._sanitizeComponentContent(content);
    }

    if (!content || typeof content !== 'object') {
      return null;
    }

    return content;
  }

  private async _sanitizeComponentContent(
    content?: Record<string, unknown> | null,
  ): Promise<Record<string, unknown>> {
    if (!content || typeof content !== 'object') {
      throw new Errors.UPDATE_FAILED('請提供頁面組件內容');
    }

    const componentIdRaw = (content as any)?.componentId;
    const componentId = Number(componentIdRaw);
    if (!componentId || Number.isNaN(componentId)) {
      throw new Errors.UPDATE_FAILED('請選擇頁面組件');
    }

    const component = await PageComponent.findByPk(componentId, {
      include: [
        {
          model: PageComponentField,
          as: 'fields',
        },
      ],
      order: [[{ model: PageComponentField, as: 'fields' }, 'order', 'ASC']],
    });

    if (!component) {
      throw new Errors.PAGE_COMPONENT_NOT_FOUND();
    }

    const values = (content as any)?.values;
    if (!values || typeof values !== 'object') {
      throw new Errors.UPDATE_FAILED('請提供組件欄位內容');
    }

    const sanitizedValues: Record<string, unknown> = {};
    const fields = component.fields ?? [];

    for (const field of fields) {
      const rawValue = (values as any)[field.key];
      if (field.type === 'property') {
        sanitizedValues[field.key] = this._sanitizeComponentPropertyValue(
          field,
          rawValue,
        );
      } else {
        sanitizedValues[field.key] = this._sanitizeComponentScalarValue(
          field,
          rawValue,
        );
      }
    }

    return {
      componentId: component.id,
      values: sanitizedValues,
    };
  }

  private _sanitizeComponentScalarValue(
    field: PageComponentField,
    value: unknown,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const stringValue = String(value);

    if (field.type === 'richtext') {
      return stringValue.length ? stringValue : null;
    }

    const trimmed = stringValue.trim();
    return trimmed.length ? trimmed : null;
  }

  private _sanitizeComponentPropertyValue(
    field: PageComponentField,
    value: unknown,
  ): Record<string, string>[] {
    const attributes = this._parseComponentPropertyList(field);

    if (!Array.isArray(value) || !value.length) {
      throw new Errors.UPDATE_FAILED(`${field.key} 請至少新增一組屬性內容`);
    }

    return value.map((entry) => {
      if (!entry || typeof entry !== 'object') {
        throw new Errors.UPDATE_FAILED(`${field.key} 欄位格式錯誤`);
      }

      const sanitized: Record<string, string> = {};

      for (const attribute of attributes) {
        const raw = (entry as any)[attribute];
        const trimmed = raw === null || raw === undefined ? '' : String(raw).trim();
        if (!trimmed.length) {
          throw new Errors.UPDATE_FAILED(`${field.key} 的 ${attribute} 必填`);
        }
        sanitized[attribute] = trimmed;
      }

      return sanitized;
    });
  }

  private _parseComponentPropertyList(field: PageComponentField): string[] {
    if (!field.property) {
      return ['value'];
    }

    const attributes = field.property
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length);

    return attributes.length ? attributes : ['value'];
  }

  private async _getNextOrder(transaction?: Transaction): Promise<number> {
    const maxOrder = await Page.max<number, Page>('order', { transaction });
    if (typeof maxOrder === 'number' && !Number.isNaN(maxOrder)) {
      return maxOrder + 1;
    }
    return 0;
  }

  private async _getNextBlockOrder(pageId: number): Promise<number> {
    const maxOrder = await PageBlock.max<number, PageBlock>('order', {
      where: { pageId },
    });
    if (typeof maxOrder === 'number' && !Number.isNaN(maxOrder)) {
      return maxOrder + 1;
    }
    return 0;
  }

  private async _generateSlug(input: string, transaction?: Transaction) {
    let base = this._sanitizeSlug(input);
    if (!base) {
      base = `page-${Date.now()}`;
    }

    let candidate = base;
    let counter = 1;

    while (await this._slugExists(candidate, transaction)) {
      counter += 1;
      candidate = `${base}-${counter}`;
    }

    return candidate;
  }

  private _sanitizeSlug(slug?: string | null): string {
    if (!slug) {
      return '';
    }

    return slug
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async _slugExists(slug: string, transaction?: Transaction) {
    const count = await Page.count({
      where: { slug },
      transaction,
    });
    return count > 0;
  }

  private async _ensureUniqueName(
    name: string,
    excludeId?: number,
    transaction?: Transaction,
  ) {
    const where: any = { name };
    if (excludeId !== undefined) {
      where.id = { [Op.ne]: excludeId };
    }

    const exists = await Page.count({ where, transaction });
    if (exists > 0) {
      throw new Errors.PAGE_EXIST();
    }
  }
}
