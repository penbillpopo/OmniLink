import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  PageBlockDto,
  PageComponentDetailDto,
  PageComponentFieldDto,
  PageDetailDto,
  PageDto,
} from '@ay-gosu/server-shared';
import {
  CsAlertComponent,
  CsButtonComponent,
  CsFormComponent,
  CsInputComponent,
  CsImageUploadComponent,
  CsToastComponent,
  CsSelectComponent,
  CsSpinnerComponent,
  CsTextareaComponent,
  CsDialogComponent,
} from '../component';
import { PageContentFormComponent, ComponentFieldConfig } from './page-content-form.component';
import { PageDataService } from './page-data.service';
import { PageComponentDataService } from './page-component-data.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { UploadService } from '../shared/upload.service';

type ExtendedBlockType = PageBlockDto['type'] | 'component';

@Component({
  selector: 'cs-page-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CsButtonComponent,
    CsFormComponent,
    CsInputComponent,
    CsImageUploadComponent,
    CsToastComponent,
    CsSelectComponent,
    CsTextareaComponent,
    CsSpinnerComponent,
    CsAlertComponent,
    CsDialogComponent,
    PageContentFormComponent,
  ],
  templateUrl: './page-detail.component.html',
  styleUrl: './page-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDetailComponent implements OnInit, OnDestroy {
  public page: PageDetailDto | null = null;
  public loading = false;
  public error: string | null = null;

  public creatingBlock = false;
  public createBlockError: string | null = null;
  public apiEndpoint = '';
  public toast: { type: 'success' | 'error'; message: string } | null = null;
  public showCreateDialog = false;
  public detailDialogOpen = false;
  public detailBlock: PageBlockDto | null = null;

  public pageComponents: PageComponentDetailDto[] = [];
  public componentFieldConfigs: ComponentFieldConfig[] = [];
  public componentLoading = false;
  public componentError: string | null = null;
  private readonly _imageTextLayoutSubs = new Map<FormGroup, Subscription>();
  public readonly blockTypeOptions = [
    { label: '輪播圖', value: 'carousel' },
    { label: 'Banner 圖', value: 'banner' },
    { label: '圖文組', value: 'image_text' },
    { label: '頁面組件', value: 'component' },
  ];
  public readonly imageTextLayoutOptions = [
    { label: '僅圖片', value: 'image_only' },
    { label: '僅文字', value: 'text_only' },
    { label: '圖片與文字', value: 'image_text' },
  ];


  public readonly blockForm = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    type: ['carousel', Validators.required],
    carouselItems: this._formBuilder.nonNullable.array([
      this._createCarouselGroup(),
    ]),
    banner: this._createBannerGroup(),
    imageTextItems: this._formBuilder.nonNullable.array([
      this._createImageTextGroup(),
    ]),
    componentId: this._formBuilder.control<string | null>(null),
    componentValues: this._formBuilder.nonNullable.group({}),
  });

  private readonly _routeSub = this._route.paramMap.subscribe((params) => {
    const id = Number(params.get('id'));
    if (!Number.isNaN(id)) {
      void this.loadPage(id);
    }
  });

  private _typeSub?: Subscription;
  private _componentIdSub?: Subscription;
  private readonly _apiBase = PageDetailComponent._normalizeServerUrl(
    environment.serverUrl?.[0],
  );

  public constructor(
    private readonly _pageDataService: PageDataService,
    private readonly _pageComponentDataService: PageComponentDataService,
    private readonly _route: ActivatedRoute,
    private readonly _formBuilder: FormBuilder,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _uploadService: UploadService,
  ) {}

  public ngOnInit(): void {
    this._typeSub = this.blockForm
      .get('type')
      ?.valueChanges.subscribe((value) => {
        this._resetDynamicGroups((value as ExtendedBlockType) ?? 'carousel');
        this.createBlockError = null;
        this._cdr.markForCheck();
      });

    this._resetDynamicGroups(
      (this.blockForm.get('type')?.value as ExtendedBlockType) ?? 'component',
    );

    void this._ensureComponentsLoaded();
  }

  public ngOnDestroy(): void {
    this._routeSub.unsubscribe();
    this._typeSub?.unsubscribe();
    this._componentIdSub?.unsubscribe();
    this._disposeAllImageTextGroups();
  }

  public async loadPage(id: number): Promise<void> {
    this.loading = true;
    this.error = null;
    this._cdr.markForCheck();

    try {
      const detail = await this._pageDataService.getPageDetail(id);
      const sortedBlocks = [...(detail.blocks ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      this.page = new PageDetailDto({ ...detail, blocks: sortedBlocks });
      this.apiEndpoint = this._buildApiEndpoint(detail);
    } catch (error) {
      console.error('Failed to load page detail', error);
      this.error = this._resolveError(error);
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }

  public get blocks(): PageBlockDto[] {
    return this.page?.blocks ?? [];
  }

  public async submitBlock(): Promise<void> {
    this.blockForm.markAllAsTouched();
    if (!this.page || this.creatingBlock) {
      return;
    }

    if (this.blockForm.invalid) {
      this.createBlockError = this._resolveFormValidationError();
      this._cdr.markForCheck();
      return;
    }

    const rawValue = this.blockForm.getRawValue();
    const type = (rawValue.type as ExtendedBlockType) ?? 'carousel';
    const name = rawValue.name.trim();

    let content: Record<string, unknown> | null = null;

    if (type === 'component') {
      if (this.componentLoading) {
        this.createBlockError = '頁面組件載入中，請稍候再試';
        this._cdr.markForCheck();
        return;
      }

      if (!this.pageComponents.length) {
        this.createBlockError = '尚未建立任何頁面組件，無法新增區塊';
        this._cdr.markForCheck();
        return;
      }

      content = this._buildComponentContent();
      if (!content) {
        this._cdr.markForCheck();
        return;
      }
    } else {
      content = this._buildContent(type);
    }

    this.creatingBlock = true;
    this.createBlockError = null;
    this._cdr.markForCheck();

    try {
      const payload: any = {
        pageId: this.page.id,
        name,
        type,
        content,
      } as const;

      const block = await this._pageDataService.createPageBlock(payload);
      const sortedBlocks = [...(this.page?.blocks ?? []), block].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      this.page = new PageDetailDto({
        ...this.page,
        blocks: sortedBlocks,
      });
      this.apiEndpoint = this._buildApiEndpoint(this.page);
      this.toast = { type: 'success', message: '區塊已新增' };
      this.showCreateDialog = false;
      this._resetCreateFormState(type);
    } catch (error) {
      console.error('Failed to create block', error);
      this.createBlockError = this._resolveError(error);
      this.toast = { type: 'error', message: this.createBlockError };
    } finally {
      this.creatingBlock = false;
      this._cdr.markForCheck();
    }
  }

  public openCreateDialog(): void {
    void this._ensureComponentsLoaded();
    this._resetCreateFormState();
    this.showCreateDialog = true;
    this._cdr.markForCheck();
  }

  public handleDialogOpenChange(open: boolean): void {
    this.showCreateDialog = open;
    if (!open) {
      this._resetCreateFormState();
    }
    this._cdr.markForCheck();
  }

  public cancelCreateBlock(): void {
    if (this.creatingBlock) {
      return;
    }
    this.showCreateDialog = false;
    this._resetCreateFormState();
    this._cdr.markForCheck();
  }

  public openBlockDetail(block: PageBlockDto): void {
    this.detailBlock = block;
    this.detailDialogOpen = true;
    this.createBlockError = null;
    this._cdr.markForCheck();
  }

  public handleDetailDialogOpenChange(open: boolean): void {
    this.detailDialogOpen = open;
    if (!open) {
      this.detailBlock = null;
    }
    this._cdr.markForCheck();
  }

  public closeBlockDetail(): void {
    this.detailDialogOpen = false;
    this.detailBlock = null;
    this._cdr.markForCheck();
  }

  public async removeBlock(block: PageBlockDto): Promise<void> {
    if (this.creatingBlock) {
      return;
    }

    try {
      await this._pageDataService.deletePageBlock(block.id);
      this.page = new PageDetailDto({
        ...this.page,
        blocks: (this.page?.blocks ?? []).filter((item) => item.id !== block.id),
      });
      if (this.detailBlock?.id === block.id) {
        this.closeBlockDetail();
      }
      this.toast = { type: 'success', message: '區塊已刪除' };
    } catch (error) {
      console.error('Failed to delete block', error);
      this.toast = { type: 'error', message: this._resolveError(error) };
    } finally {
      this._cdr.markForCheck();
    }
  }

  public trackByBlock = (_: number, block: PageBlockDto) => block.id;

  public formatContent(block: PageBlockDto): string {
    if (!block.content) {
      return '—';
    }

    try {
      return JSON.stringify(block.content, null, 2);
    } catch {
      return block.content.toString();
    }
  }

  public blockTypeLabel(type: PageBlockDto['type']): string {
    switch (type as ExtendedBlockType) {
      case 'carousel':
        return '輪播圖';
      case 'banner':
        return 'Banner 圖';
      case 'image_text':
        return '圖片與文字';
      case 'component':
        return '頁面組件';
      default:
        return type;
    }
  }

  public blockSummary(block: PageBlockDto): string {
    const content = block.content as any;
    switch (block.type as ExtendedBlockType) {
      case 'component': {
        const componentId = Number((content?.componentId as string | number | null) ?? NaN);
        const component = this.pageComponents.find((item) => item.id === componentId);
        const fieldCount = Array.isArray(component?.fields)
          ? component!.fields.length
          : Object.keys((content?.values as Record<string, unknown> | undefined) ?? {}).length;
        const label = component?.name ?? (Number.isNaN(componentId) ? '未指定組件' : `組件 #${componentId}`);
        return `${label} · ${fieldCount} 個欄位`;
      }

      case 'carousel': {
        const items = content?.items ?? [];
        const count = Array.isArray(items) ? items.length : 0;
        if (!count) {
          return '尚未設定輪播項目';
        }
        return `包含 ${count} 張輪播圖`;
      }

      case 'banner': {
        const imageUrl = content?.imageUrl;
        if (!imageUrl) {
          return '尚未設定 Banner 圖片';
        }
        return content?.caption?.trim()
          ? `Banner：${content.caption.trim()}`
          : '已設定 Banner 圖片';
      }

      case 'image_text': {
        const items = content?.items ?? [];
        const count = Array.isArray(items) ? items.length : 0;
        if (!count) {
          return '尚未設定圖文項目';
        }
        const firstTitle = items.find((item: any) => item?.title)?.title;
        if (firstTitle) {
          return `共 ${count} 組圖文 · 首項：${firstTitle}`;
        }
        return `共 ${count} 組圖文`;
      }

      default:
        return '尚未設定內容';
    }
  }

  public blockPreviewUrl(block: PageBlockDto): string | null {
    const content = block.content as any;
    if (!content) {
      return null;
    }

    if (block.type === 'carousel') {
      const item = content.items?.find((entry: any) => entry?.imageUrl);
      return this._uploadService.resolveUrl(item?.imageUrl ?? null);
    }

    if (block.type === 'banner') {
      return this._uploadService.resolveUrl(content.imageUrl ?? null);
    }

    if (block.type === 'image_text') {
      const item = content.items?.find((entry: any) => entry?.imageUrl);
      return this._uploadService.resolveUrl(item?.imageUrl ?? null);
    }

    if ((block.type as ExtendedBlockType) === 'component') {
      const componentId = Number(content?.componentId ?? NaN);
      const component = this.pageComponents.find((item) => item.id === componentId);
      const values = (content?.values as Record<string, unknown> | undefined) ?? {};

      if (component) {
        const imageField = component.fields?.find((field) => field.type === 'image');
        if (imageField) {
          const imageValue = values[imageField.key];
          if (typeof imageValue === 'string' && imageValue.trim().length) {
            return this._uploadService.resolveUrl(imageValue);
          }
        }

        const propertyField = component.fields?.find((field) =>
          field.type === 'property' &&
          this._parsePropertyList(field).some((attribute) =>
            attribute.toLowerCase().includes('image'),
          ),
        );

        if (propertyField) {
          const entries = values[propertyField.key];
          const attributes = this._parsePropertyList(propertyField);
          const imageAttr = attributes.find((attribute) =>
            attribute.toLowerCase().includes('image'),
          );

          if (
            Array.isArray(entries) &&
            entries.length &&
            imageAttr &&
            typeof entries[0]?.[imageAttr] === 'string'
          ) {
            return this._uploadService.resolveUrl(entries[0][imageAttr]);
          }
        }
      }
    }

    return null;
  }

  private _buildContent(type: PageBlockDto['type']): Record<string, unknown> | null {
    switch (type) {
      case 'carousel': {
        const items = this.carouselItems.controls
          .map((group) => group.getRawValue())
          .map(({ imageUrl, link, caption }) => ({
            imageUrl: imageUrl?.trim() || null,
            link: link?.trim() || null,
            caption: caption?.trim() || null,
          }))
          .filter((item) => item.imageUrl);
        return { items };
      }

      case 'banner': {
        const raw = this.banner.value;
        return {
          imageUrl: raw.imageUrl?.trim() || null,
          link: raw.link?.trim() || null,
          caption: raw.caption?.trim() || null,
        };
      }

      case 'image_text': {
        const rawItems = this.imageTextItems.controls.map((group) =>
          group.getRawValue() as {
            layout: string;
            imageUrl: string | null;
            title: string | null;
            description: string | null;
            text: string | null;
          },
        );

        let invalid = false;
        rawItems.forEach((item, index) => {
          if (this._isImageTextItemInvalid(item.layout, item.imageUrl, item.text)) {
            invalid = true;
            const group = this.imageTextItems.at(index) as FormGroup;
            if (item.layout !== 'text_only') {
              group.get('imageUrl')?.markAsTouched();
            }
            if (item.layout !== 'image_only') {
              group.get('text')?.markAsTouched();
            }
          }
        });

        if (invalid) {
          this.createBlockError = '請依版型完成圖文欄位';
          this._cdr.markForCheck();
          return null;
        }

        const items = rawItems.map(({ layout, imageUrl, title, description, text }) => ({
          layout,
          imageUrl: imageUrl?.trim() || null,
          title: title?.trim() || null,
          description: description?.trim() || null,
          text: text?.trim() || null,
          }));
        return { items };
      }

      default:
        return null;
    }
  }

  private _buildComponentContent(): Record<string, unknown> | null {
    const component = this.currentSelectedComponent;
    if (!component) {
      this.createBlockError = '請先選擇頁面組件';
      this.blockForm.get('componentId')?.markAsTouched();
      return null;
    }

    const valuesGroup = this.componentValues;
    const values: Record<string, unknown> = {};

    for (const config of this.componentFieldConfigs) {
      if (config.type === 'property') {
        const array = valuesGroup.get(config.key) as FormArray<FormGroup> | null;
        if (!array || array.length === 0) {
          this.createBlockError = `${config.label} 請新增至少一組資料`;
          return null;
        }

        const entries: Record<string, string>[] = [];
        const attributes = config.propertyList.length
          ? config.propertyList
          : ['value'];

        for (let index = 0; index < array.length; index += 1) {
          const group = array.at(index) as FormGroup;
          const raw = group.getRawValue() as Record<string, unknown>;
          const normalized: Record<string, string> = {};
          let invalid = false;

          attributes.forEach((attribute) => {
            const control = group.get(attribute);
            const rawValue = raw[attribute] ?? '';
            const trimmed = typeof rawValue === 'string' ? rawValue.trim() : '';
            if (!trimmed.length) {
              control?.markAsTouched();
              invalid = true;
            }
            normalized[attribute] = trimmed;
          });

          if (invalid) {
            this.createBlockError = `${config.label} 的屬性請完整填寫`;
            return null;
          }

          entries.push(normalized);
        }

        values[config.key] = entries;
        continue;
      }

      const control = valuesGroup.get(config.key);
      const sanitized = this._sanitizeComponentValue(config.type, control?.value);
      values[config.key] = sanitized;
    }

    return {
      componentId: component.id,
      values,
    };
  }

  private _isImageTextItemInvalid(
    layout: string,
    imageUrl?: string | null,
    text?: string | null,
  ): boolean {
    switch (layout) {
      case 'image_only':
        return !(imageUrl && imageUrl.trim().length);

      case 'text_only':
        return !(text && text.trim().length);

      default:
        return !(
          imageUrl && imageUrl.trim().length && text && text.trim().length
        );
    }
  }

  private async _ensureComponentsLoaded(force = false): Promise<void> {
    if (!force && (this.pageComponents.length || this.componentLoading)) {
      return;
    }

    this.componentLoading = true;
    this.componentError = null;
    this._cdr.markForCheck();

    try {
      this.pageComponents = await this._pageComponentDataService.getComponentList();

      if (this._isComponentType()) {
        this._resetDynamicGroups('component');
      }
    } catch (error) {
      console.error('Failed to load page components', error);
      this.componentError = this._resolveError(error);
    } finally {
      this.componentLoading = false;
      this._cdr.markForCheck();
    }
  }

  private _resetDynamicGroups(
    type: ExtendedBlockType = (this.blockForm.get('type')?.value as ExtendedBlockType) ?? 'component',
  ): void {
    this.carouselItems.clear();
    this._disposeAllImageTextGroups();
    this.imageTextItems.clear();
    this.blockForm.setControl('banner', this._createBannerGroup());

    const componentValuesGroup = this._formBuilder.nonNullable.group({});
    this.blockForm.setControl('componentValues', componentValuesGroup);
    this.componentFieldConfigs = [];

    const componentIdControl = this.blockForm.get('componentId');
    componentIdControl?.setValue(null, { emitEvent: false });
    componentIdControl?.clearValidators();
    componentIdControl?.updateValueAndValidity({ emitEvent: false });

    this._componentIdSub?.unsubscribe();

    if (type === 'carousel') {
      this.carouselItems.push(this._createCarouselGroup());
    }

    if (type === 'image_text') {
      this.imageTextItems.push(this._createImageTextGroup());
    }

    if (type === 'component') {
      componentIdControl?.addValidators([Validators.required]);
      componentIdControl?.updateValueAndValidity({ emitEvent: false });

      const initial = this.pageComponents[0] ?? null;
      if (initial) {
        componentIdControl?.setValue(initial.id.toString(), { emitEvent: false });
      }

      void this._handleComponentSelection(componentIdControl?.value ?? initial?.id ?? null);

      this._componentIdSub = componentIdControl?.valueChanges.subscribe((value) => {
        void this._handleComponentSelection(value);
      });
    } else {
      this._configureComponentFields(null);
    }

    componentIdControl?.markAsPristine();
    componentIdControl?.markAsUntouched();
  }

  public get carouselItems(): FormArray<FormGroup> {
    return this.blockForm.get('carouselItems') as FormArray<FormGroup>;
  }

  public get banner(): FormGroup {
    return this.blockForm.get('banner') as FormGroup;
  }

  public get imageTextItems(): FormArray<FormGroup> {
    return this.blockForm.get('imageTextItems') as FormArray<FormGroup>;
  }

  public get componentValues(): FormGroup {
    return this.blockForm.get('componentValues') as FormGroup;
  }

  public get currentSelectedComponent(): PageComponentDetailDto | null {
    const controlValue = this.blockForm.get('componentId')?.value;
    if (controlValue === null || controlValue === undefined || controlValue === '') {
      return null;
    }

    const parsed = Number(controlValue);
    if (Number.isNaN(parsed)) {
      return null;
    }

    return this.pageComponents.find((item) => item.id === parsed) ?? null;
  }

  public get componentSelectOptions(): { label: string; value: string }[] {
    return this.pageComponents.map((item) => ({
      label: item.name,
      value: item.id.toString(),
    }));
  }

  public addCarouselItem(): void {
    this.carouselItems.push(this._createCarouselGroup());
    this._cdr.markForCheck();
  }

  public removeCarouselItem(index: number): void {
    if (this.carouselItems.length <= 1) return;
    this.carouselItems.removeAt(index);
    this._cdr.markForCheck();
  }

  public addImageTextItem(): void {
    this.imageTextItems.push(this._createImageTextGroup());
    this._cdr.markForCheck();
  }

  public removeImageTextItem(index: number): void {
    if (this.imageTextItems.length <= 1 || index < 0 || index >= this.imageTextItems.length) {
      return;
    }

    const group = this.imageTextItems.at(index) as FormGroup | null;
    if (group) {
      this._disposeImageTextGroup(group);
    }

    this.imageTextItems.removeAt(index);
    this._cdr.markForCheck();
  }

  public addComponentPropertyEntry(fieldKey: string): void {
    const config = this.componentFieldConfigs.find((item) => item.key === fieldKey);
    if (!config) {
      return;
    }

    const array = this.componentValues.get(fieldKey) as FormArray<FormGroup> | null;
    if (!array) {
      return;
    }

    array.push(this._createComponentPropertyGroup(config));
    this.componentValues.markAsDirty();
    this._cdr.markForCheck();
  }

  public removeComponentPropertyEntry(fieldKey: string, index: number): void {
    const array = this.componentValues.get(fieldKey) as FormArray<FormGroup> | null;
    if (!array || array.length <= 1 || index < 0 || index >= array.length) {
      return;
    }

    array.removeAt(index);
    this.componentValues.markAsDirty();
    this._cdr.markForCheck();
  }

  public async refreshComponents(): Promise<void> {
    await this._ensureComponentsLoaded(true);
    this._resetDynamicGroups('component');
  }

  private _createCarouselGroup(): FormGroup {
    return this._formBuilder.nonNullable.group({
      imageUrl: ['', Validators.required],
      link: [''],
      caption: [''],
    });
  }

  private _createBannerGroup(): FormGroup {
    return this._formBuilder.nonNullable.group({
      imageUrl: [''],
      link: [''],
      caption: [''],
    });
  }

  private _createImageTextGroup(): FormGroup {
    const group = this._formBuilder.nonNullable.group({
      layout: ['image_only', Validators.required],
      imageUrl: [''],
      title: [''],
      description: [''],
      text: [''],
    });

    this._registerImageTextLayoutHandler(group);
    return group;
  }

  private _registerImageTextLayoutHandler(group: FormGroup): void {
    const layoutControl = group.get('layout');
    if (!layoutControl) {
      return;
    }

    this._updateImageTextValidators(group);

    this._imageTextLayoutSubs.get(group)?.unsubscribe();
    const subscription = layoutControl.valueChanges.subscribe(() => {
      this._updateImageTextValidators(group);
      this._cdr.markForCheck();
    });

    this._imageTextLayoutSubs.set(group, subscription);
  }

  private _disposeImageTextGroup(group: FormGroup): void {
    const subscription = this._imageTextLayoutSubs.get(group);
    if (subscription) {
      subscription.unsubscribe();
      this._imageTextLayoutSubs.delete(group);
    }
  }

  private _disposeAllImageTextGroups(): void {
    this.imageTextItems.controls.forEach((control) => {
      if (control instanceof FormGroup) {
        this._disposeImageTextGroup(control);
      }
    });
  }

  private _updateImageTextValidators(group: FormGroup): void {
    const layout = (group.get('layout')?.value as string) ?? 'image_only';
    const imageControl = group.get('imageUrl');
    const textControl = group.get('text');

    if (imageControl) {
      imageControl.clearValidators();
      if (layout !== 'text_only') {
        imageControl.addValidators([Validators.required]);
      }
      imageControl.updateValueAndValidity({ emitEvent: false });
    }

    if (textControl) {
      textControl.clearValidators();
      if (layout !== 'image_only') {
        textControl.addValidators([Validators.required]);
      }
      textControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  public showImageField(group: FormGroup): boolean {
    const layout = (group.get('layout')?.value as string) ?? 'image_only';
    return layout !== 'text_only';
  }

  public showTextField(group: FormGroup): boolean {
    const layout = (group.get('layout')?.value as string) ?? 'image_only';
    return layout !== 'image_only';
  }

  public isTextRequired(group: FormGroup): boolean {
    const layout = (group.get('layout')?.value as string) ?? 'image_only';
    return layout !== 'image_only';
  }

  public imageTextLayoutHint(group: FormGroup): string {
    const layout = (group.get('layout')?.value as string) ?? 'image_only';
    switch (layout) {
      case 'text_only':
        return '此版型僅顯示文字，請輸入內文。';
      case 'image_text':
        return '此版型顯示圖片與文字，請完整填寫。';
      default:
        return '此版型僅顯示圖片，請提供圖片網址。';
    }
  }

  private _configureComponentFields(
    component: PageComponentDetailDto | null,
  ): void {
    const valuesGroup = this.componentValues;
    Object.keys(valuesGroup.controls).forEach((key) => {
      valuesGroup.removeControl(key);
    });

    if (!component) {
      this.componentFieldConfigs = [];
      this._cdr.markForCheck();
      return;
    }

    const configs: ComponentFieldConfig[] = (component.fields ?? []).map((field) => ({
      key: field.key,
      type: field.type,
      label: this._formatFieldLabel(field.key),
      propertyList: this._parsePropertyList(field),
    }));

    this.componentFieldConfigs = configs;

    configs.forEach((config) => {
      if (config.type === 'property') {
        const array = this._formBuilder.array<FormGroup>([]);
        array.push(this._createComponentPropertyGroup(config));
        valuesGroup.addControl(config.key, array);
      } else {
        valuesGroup.addControl(config.key, this._formBuilder.control(''));
      }
    });

    valuesGroup.markAsPristine();
    valuesGroup.markAsUntouched();
    this._cdr.markForCheck();
  }

  private async _handleComponentSelection(value: unknown): Promise<void> {
    const component = await this._resolveComponentWithDetail(value);
    this._configureComponentFields(component);
    this._cdr.markForCheck();
  }

  private async _resolveComponentWithDetail(
    value: unknown,
  ): Promise<PageComponentDetailDto | null> {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return null;
    }

    let component = this.pageComponents.find((item) => item.id === parsed) ?? null;

    if (!component || !component.fields?.length) {
      try {
        const detail = await this._pageComponentDataService.getComponentDetail(parsed);
        this.pageComponents = this.pageComponents.map((item) =>
          item.id === detail.id ? detail : item,
        );
        component = detail;
      } catch (error) {
        console.error('Failed to load component detail', error);
        this.componentError = this._resolveError(error);
      }
    }

    return component;
  }

  private _parsePropertyList(field: PageComponentFieldDto | null | undefined): string[] {
    if (!field?.property) {
      return ['value'];
    }

    const attributes = field.property
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length);

    return attributes.length ? attributes : ['value'];
  }

  private _createComponentPropertyGroup(config: ComponentFieldConfig): FormGroup {
    const attributes = config.propertyList.length ? config.propertyList : ['value'];
    const group = this._formBuilder.nonNullable.group({});

    attributes.forEach((attribute) => {
      group.addControl(attribute, this._formBuilder.control(''));
    });

    return group;
  }

  private _sanitizeComponentValue(
    type: ComponentFieldConfig['type'],
    value: unknown,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const stringValue = String(value);
    if (type === 'richtext') {
      return stringValue.length ? stringValue : null;
    }

    const trimmed = stringValue.trim();
    return trimmed.length ? trimmed : null;
  }

  private _formatFieldLabel(key: string): string {
    if (!key) {
      return key;
    }

    return key
      .split('_')
      .filter((segment) => segment.length)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
      .join(' ');
  }

  private _isComponentType(): boolean {
    return (this.blockForm.get('type')?.value as ExtendedBlockType) === 'component';
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

  private _resolveFormValidationError(): string {
    const nameCtrl = this.blockForm.get('name');
    if (nameCtrl?.hasError('required')) {
      return '請輸入區塊名稱';
    }
    if (nameCtrl?.hasError('maxlength')) {
      return '區塊名稱請勿超過 64 個字';
    }

    const typeCtrl = this.blockForm.get('type');
    if (typeCtrl?.hasError('required')) {
      return '請選擇區塊類型';
    }

    return '請確認必填欄位已完整填寫';
  }

  private _buildApiEndpoint(page: PageDto | null): string {
    const slug = page?.slug ?? '';
    if (!slug) {
      return `${this._apiBase}/api/{slug}`;
    }
    return `${this._apiBase}/api/${slug}`;
  }

  private _resetCreateFormState(
    type: ExtendedBlockType = 'carousel',
  ): void {
    this.blockForm.reset({
      name: '',
      type,
      componentId: null,
    });
    this._resetDynamicGroups(type);
    this.blockForm.markAsPristine();
    this.blockForm.markAsUntouched();
    this.createBlockError = null;
  }

  private static _normalizeServerUrl(url?: string): string {
    if (!url || !url.trim().length) {
      return '';
    }
    return url.replace(/\/$/, '');
  }
}
