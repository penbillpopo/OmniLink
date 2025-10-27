import {
  PageComponent,
  PageComponentField,
} from '@ay-gosu/sequelize-models';
import { Errors } from '@ay-gosu/util/errors';
import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { AuditService } from '../audit/audit.service';
import { ResponseListDto } from '../_common/dto/response-list.dto';
import { SessionDto } from '../_module/session.dto';
import { CreatePageComponentDto } from './dto/create-page-component.dto';
import { PageComponentDetailDto } from './dto/page-component-detail.dto';
import { PageComponentDto } from './dto/page-component.dto';
import {
  PageComponentFieldDto,
  PageComponentFieldType,
} from './dto/page-component-field.dto';
import { UpdatePageComponentDto } from './dto/update-page-component.dto';

const PAGE_COMPONENT_FIELD_TYPES: PageComponentFieldType[] = [
  'text',
  'textarea',
  'image',
  'button',
  'link',
  'richtext',
  'property',
];

type NormalizedField = {
  key: string;
  type: PageComponentFieldType;
  property?: string | null;
  order: number;
};

@Injectable()
export class PageComponentService {
  public constructor(private readonly _auditService: AuditService) {}

  public async getComponentList(): Promise<
    ResponseListDto<PageComponentDetailDto[]>
  > {
    const components = await PageComponent.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    if (!components.length) {
      return {
        data: [],
        total: 0,
      };
    }

    const componentIds = components.map((component) => component.id);

    const fields = await PageComponentField.findAll({
      where: {
        componentId: {
          [Op.in]: componentIds,
        },
      },
      order: [
        ['componentId', 'ASC'],
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    const groupedFields = fields.reduce(
      (acc, field) => {
        const list = acc.get(field.componentId) ?? [];
        list.push(field);
        acc.set(field.componentId, list);
        return acc;
      },
      new Map<number, PageComponentField[]>(),
    );

    const data = components.map((component) =>
      this._toComponentDetailDto(
        component,
        groupedFields.get(component.id) ?? [],
      ),
    );

    return {
      data,
      total: data.length,
    };
  }

  public async getComponentDetail(id: number): Promise<PageComponentDetailDto> {
    const component = await PageComponent.findByPk(id);
    if (!component) {
      throw new Errors.PAGE_COMPONENT_NOT_FOUND();
    }

    const fields = await PageComponentField.findAll({
      where: { componentId: id },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return this._toComponentDetailDto(component, fields);
  }

  public async createComponent(
    payload: CreatePageComponentDto,
    session?: SessionDto,
  ): Promise<PageComponentDetailDto> {
    const sequelize = PageComponent.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const name = this._normalizeName(payload?.name);
    if (!name) {
      throw new Errors.UPDATE_FAILED('請提供組件名稱');
    }

    const description = this._normalizeDescription(payload?.description);
    const fields = this._normalizeFields(payload?.fields);

    const component = await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, undefined, transaction);

      const slug = await this._generateSlug(name, transaction);
      const order = await this._getNextOrder(transaction);

      const created = await PageComponent.create(
        {
          name,
          slug,
          description,
          order,
        },
        { transaction },
      );

      for (const field of fields) {
        await PageComponentField.create(
          {
            componentId: created.id,
            key: field.key,
            type: field.type,
            property: field.property ?? null,
            order: field.order,
          },
          { transaction },
        );
      }

      return created;
    });

    const detail = await this.getComponentDetail(component.id);

    await this._auditService.recordAction(
      {
        module: 'page-component',
        category: 'create',
        action: '新增頁面組件',
        detail: `新增頁面組件 ${detail.name}`,
        metadata: {
          componentId: detail.id,
          slug: detail.slug,
        },
      },
      session,
    );

    return detail;
  }

  public async updateComponent(
    payload: UpdatePageComponentDto,
    session?: SessionDto,
  ): Promise<PageComponentDetailDto> {
    const sequelize = PageComponent.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const component = await PageComponent.findByPk(payload?.id ?? 0);
    if (!component) {
      throw new Errors.PAGE_COMPONENT_NOT_FOUND();
    }

    const name = this._normalizeName(payload?.name);
    if (!name) {
      throw new Errors.UPDATE_FAILED('請提供組件名稱');
    }

    const description = this._normalizeDescription(payload?.description);
    const fields = this._normalizeFields(payload?.fields);

    await sequelize.transaction(async (transaction) => {
      await this._ensureUniqueName(name, component.id, transaction);

      await component.update(
        {
          name,
          description,
        },
        { transaction },
      );

      await PageComponentField.destroy({
        where: { componentId: component.id },
        transaction,
      });

      for (const field of fields) {
        await PageComponentField.create(
          {
            componentId: component.id,
            key: field.key,
            type: field.type,
            property: field.property ?? null,
            order: field.order,
          },
          { transaction },
        );
      }
    });

    const detail = await this.getComponentDetail(component.id);

    await this._auditService.recordAction(
      {
        module: 'page-component',
        category: 'update',
        action: '更新頁面組件',
        detail: `更新頁面組件 ${detail.name}`,
        metadata: {
          componentId: detail.id,
          slug: detail.slug,
        },
      },
      session,
    );

    return detail;
  }

  private _toComponentDto(model: PageComponent): PageComponentDto {
    const plain = model.get({ plain: true }) as any;
    return new PageComponentDto({
      id: plain.id,
      name: plain.name,
      slug: plain.slug,
      description: plain.description ?? null,
      order: plain.order ?? 0,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  private _toFieldDto(model: PageComponentField): PageComponentFieldDto {
    const plain = model.get({ plain: true }) as any;
    return new PageComponentFieldDto({
      id: plain.id,
      componentId: plain.componentId,
      key: plain.key,
      type: this._normalizeFieldType(plain.type),
      property: plain.property ?? null,
      order: plain.order ?? 0,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    });
  }

  private _toComponentDetailDto(
    component: PageComponent,
    fields: PageComponentField[],
  ): PageComponentDetailDto {
    const dto = new PageComponentDetailDto(this._toComponentDto(component));
    dto.fields = fields.map((field) => this._toFieldDto(field));
    return dto;
  }

  private _normalizeName(name?: string | null): string {
    if (!name) {
      return '';
    }
    return name.trim();
  }

  private _normalizeDescription(description?: string | null): string | null {
    if (!description) {
      return null;
    }
    const trimmed = description.trim();
    return trimmed.length ? trimmed : null;
  }

  private _normalizeFieldKey(key?: string | null): string {
    if (!key) {
      return '';
    }
    const trimmed = key.trim();
    if (!trimmed.length) {
      return '';
    }

    const isValid = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(trimmed);
    if (!isValid) {
      throw new Errors.UPDATE_FAILED(
        '欄位 key 僅能使用英數、底線或連字號，且需以英文字母開頭',
      );
    }

    return trimmed;
  }

  private _normalizeFieldType(type?: string | null): PageComponentFieldType {
    const normalized = (type ?? '').toLowerCase().trim();
    if (PAGE_COMPONENT_FIELD_TYPES.includes(normalized as PageComponentFieldType)) {
      return normalized as PageComponentFieldType;
    }
    throw new Errors.UPDATE_FAILED('不支援的欄位類型');
  }

  private _normalizePropertyList(property?: string | null): string {
    if (!property) {
      return '';
    }

    const tokens = property
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    const uniqueTokens = Array.from(new Set(tokens));
    return uniqueTokens.join(',');
  }

  private _normalizeFields(
    input?: { key?: string; type?: string; property?: string }[],
  ): NormalizedField[] {
    const fields = Array.isArray(input) ? input : [];
    if (!fields.length) {
      throw new Errors.UPDATE_FAILED('請至少新增一個欄位');
    }

    const seenKeys = new Set<string>();
    return fields.map((field, index) => {
      const key = this._normalizeFieldKey(field?.key);
      if (!key) {
        throw new Errors.UPDATE_FAILED('請輸入欄位 key');
      }

      if (seenKeys.has(key)) {
        throw new Errors.UPDATE_FAILED('欄位 key 不可重複');
      }

      seenKeys.add(key);

      const type = this._normalizeFieldType(field?.type);

      let property: string | null = null;
      if (type === 'property') {
        const normalizedProperty = this._normalizePropertyList(field?.property);
        if (!normalizedProperty) {
          throw new Errors.UPDATE_FAILED('請輸入屬性清單');
        }
        property = normalizedProperty;
      }

      return {
        key,
        type,
        property,
        order: index,
      };
    });
  }

  private async _getNextOrder(transaction?: Transaction): Promise<number> {
    const maxOrder = await PageComponent.max<number, PageComponent>('order', {
      transaction,
    });
    if (typeof maxOrder === 'number' && !Number.isNaN(maxOrder)) {
      return maxOrder + 1;
    }
    return 0;
  }

  private async _generateSlug(
    input: string,
    transaction?: Transaction,
  ): Promise<string> {
    let base = this._sanitizeSlug(input);
    if (!base) {
      base = `component-${Date.now()}`;
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
    const count = await PageComponent.count({
      where: { slug },
      transaction,
    });
    return count > 0;
  }

  private async _ensureUniqueName(
    name: string,
    excludeId?: number,
    transaction?: Transaction,
  ): Promise<void> {
    const where: any = { name };
    if (excludeId !== undefined) {
      where.id = { [Op.ne]: excludeId };
    }

    const exists = await PageComponent.count({ where, transaction });
    if (exists > 0) {
      throw new Errors.PAGE_COMPONENT_EXIST();
    }
  }
}
