import {
  Directive,
  EmbeddedViewRef,
  Host,
  Input,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { AsyncJob, AsyncJobStatusEnum } from './async-job';

/**
 * 在開發過程中很容易遇非同步的任務，需要處理載入中、載入完成、載入失敗、或者資料是空的狀態， AsyncJob 的就是用來解決此問題的一個解決方案。
 *
 * 收先需要在 TypeScript 中透過 RxJS 的 pipe 機制建立 AsyncJob 的物件，例如:
 * ```typescript
 *  public params$ = new BehaviorSubject("params..")
 *  public data$ = this.params$.pipe(asyncJob((params) => this.executeAsyncFunction(params)));
 *  public async executeAsyncFunction(params: string) {
 *    // await some async function
 *    return "data";
 *  }
 * ```
 *
 * 然後再 Template 中，使用 asyncJob 指令，例如:
 * ```html
 * <div *asyncJob="data$">
 *   <div *loading="let loading"> 資料載入中 </div>
 *   <div *success="let data as data$">
 *     資料載入完成 {{ data }}
 *   </div>
 *   <div *error="let error"> 資料載入異常: {{ error }} </div>
 *   <div *empty> 資料載入失敗 </div>
 * </div>
 * ```
 *
 * 你也可以在最外層定義預設的 loading / error / empty 的狀態，例如:
 * ```html
 * <div *asyncJobDefaultLoading class="loading">資料讀取中...</div>
 * <div *asyncJobDefaultEmpty class="empty">資料是空的...</div>
 * <div *asyncJobDefaultError="let error" class="error">資料載入異常</div>
 * ```
 */

const { LOADING, SUCCESS, EMPTY, ERROR } = AsyncJobStatusEnum;

@Directive({
  selector: '[asyncJob]',
})
export class AsyncJobDirective<T> implements OnDestroy {
  public success: AsyncJobSuccessDirective<T>;
  public loading: AsyncJobLoadingDirective;
  public empty: AsyncJobEmptyDirective;
  public error: AsyncJobErrorDirective;

  public static instances: AsyncJobDirective<any>[] = [];
  public static defaultLoading: AsyncJobDefaultLoadingDirective;
  public static defaultEmpty: AsyncJobDefaultEmptyDirective;
  public static defaultError: AsyncJobDefaultErrorDirective;

  private _latestEmbeddedViewRef: EmbeddedViewRef<any>;

  private _latestAsyncJob = new AsyncJob<T>(LOADING);

  private readonly _status$ = new Subject<Observable<AsyncJob<T>>>();

  private readonly _destroy$ = new Subject<void>();

  private readonly _subscription = this._status$
    .pipe(
      takeUntil(this._destroy$),
      switchMap((status$) => status$), // convert Observable<T> to T
    )
    .subscribe((status) => this._onAsyncJobStatusChange(status));

  public constructor(private readonly _viewContainerRef: ViewContainerRef) {
    AsyncJobDirective.instances.push(this);
  }

  @Input()
  public set asyncJob(status$: Observable<AsyncJob<T>>) {
    this._status$.next(status$);
  }

  public ngOnDestroy(): void {
    this._destroyLatestEmbeddedViewRef();
    this._destroy$.complete();
    const index = AsyncJobDirective.instances.indexOf(this);
    if (index > -1) {
      AsyncJobDirective.instances.splice(index, 1);
    }
  }

  private async _onAsyncJobStatusChange(
    asyncJob: AsyncJob<T>,
    force: boolean = false,
  ): Promise<void> {
    if (
      !force &&
      this._latestAsyncJob.status === asyncJob.status &&
      this._latestEmbeddedViewRef
    ) {
      this._latestEmbeddedViewRef.context.$implicit = asyncJob.value;
      return;
    }

    this._latestAsyncJob = asyncJob;

    this._destroyLatestEmbeddedViewRef();

    switch (asyncJob.status) {
      case LOADING: {
        this._createEmbeddedViewRef(
          this.loading || AsyncJobDirective.defaultLoading,
        );
        break;
      }

      case SUCCESS: {
        this._createEmbeddedViewRef(this.success, asyncJob.value);
        break;
      }

      case EMPTY: {
        this._createEmbeddedViewRef(
          this.empty || AsyncJobDirective.defaultEmpty,
        );
        break;
      }

      case ERROR: {
        this._createEmbeddedViewRef(
          this.error || AsyncJobDirective.defaultError,
          asyncJob.value,
        );
        break;
      }
    }
  }

  private _createEmbeddedViewRef<T>(
    directive: AsyncJobStatusDirective<any>,
    context: T = null,
  ): EmbeddedViewRef<{ $implicit: T }> {
    if (!directive) {
      return;
    }

    this._latestEmbeddedViewRef = this._viewContainerRef.createEmbeddedView(
      directive.templateRef,
      {
        $implicit: context,
      },
    );
  }

  private _destroyLatestEmbeddedViewRef() {
    if (!this._latestEmbeddedViewRef) {
      return;
    }

    this._latestEmbeddedViewRef.destroy();
    this._latestEmbeddedViewRef = null;
  }

  public updateTemplateRef(status: AsyncJobStatusEnum): void {
    if (status !== this._latestAsyncJob.status) return;
    this._onAsyncJobStatusChange(this._latestAsyncJob, true);
  }

  public static updateTemplateRef(status: AsyncJobStatusEnum): void {
    AsyncJobDirective.instances.forEach((instance) =>
      instance.updateTemplateRef(status),
    );
  }
}

export class AsyncJobStatusDirective<T> {
  public readonly templateRef: TemplateRef<T>;
}

@Directive({ selector: '[loading]' })
export class AsyncJobLoadingDirective extends AsyncJobStatusDirective<null> {
  public constructor(
    public readonly templateRef: TemplateRef<null>,
    @Optional() @Host() host: AsyncJobDirective<any>,
  ) {
    super();
    if (!host) throwAsyncJobNotFoundError('loading');
    host.loading = this;
    host.updateTemplateRef(LOADING);
  }
}

@Directive({ selector: '[success]' })
export class AsyncJobSuccessDirective<T> extends AsyncJobStatusDirective<T> {
  // 為了讓 Angular 可以識別 TemplateRef 的型別，必須要加上這個參數，
  // 但實際上不會使用到這個參數。
  @Input()
  public successAs: Observable<AsyncJob<T>>;

  public constructor(
    public readonly templateRef: TemplateRef<null>,
    @Optional() @Host() host: AsyncJobDirective<T>,
  ) {
    super();
    if (!host) throwAsyncJobNotFoundError('success');
    host.success = this;
    host.updateTemplateRef(SUCCESS);
  }

  // https://angular.io/guide/structural-directives#typing-the-directives-context
  public static ngTemplateContextGuard<T>(
    directive: AsyncJobSuccessDirective<T>,
    context: unknown,
  ): context is AsyncJobContext<T> {
    return true;
  }
}

@Directive({ selector: '[empty]' })
export class AsyncJobEmptyDirective extends AsyncJobStatusDirective<null> {
  public constructor(
    public readonly templateRef: TemplateRef<null>,
    @Optional() @Host() host: AsyncJobDirective<any>,
  ) {
    super();
    if (!host) throwAsyncJobNotFoundError('empty');
    host.empty = this;
    host.updateTemplateRef(EMPTY);
  }
}

@Directive({ selector: '[error]' })
export class AsyncJobErrorDirective extends AsyncJobStatusDirective<any> {
  public constructor(
    public readonly templateRef: TemplateRef<null>,
    @Optional() @Host() host: AsyncJobDirective<any>,
  ) {
    super();
    if (!host) throwAsyncJobNotFoundError('error');
    host.error = this;
    host.updateTemplateRef(ERROR);
  }
}

@Directive({ selector: '[asyncJobDefaultLoading]' })
export class AsyncJobDefaultLoadingDirective extends AsyncJobStatusDirective<null> {
  public constructor(public readonly templateRef: TemplateRef<null>) {
    super();
    AsyncJobDirective.defaultLoading = this;
    AsyncJobDirective.updateTemplateRef(LOADING);
  }
}

@Directive({ selector: '[asyncJobDefaultEmpty]' })
export class AsyncJobDefaultEmptyDirective extends AsyncJobStatusDirective<null> {
  public constructor(public readonly templateRef: TemplateRef<null>) {
    super();
    AsyncJobDirective.defaultEmpty = this;
    AsyncJobDirective.updateTemplateRef(EMPTY);
  }
}

@Directive({ selector: '[asyncJobDefaultError]' })
export class AsyncJobDefaultErrorDirective extends AsyncJobStatusDirective<any> {
  public constructor(public readonly templateRef: TemplateRef<null>) {
    super();
    AsyncJobDirective.defaultError = this;
    AsyncJobDirective.updateTemplateRef(ERROR);
  }
}

export class AsyncJobContext<T> {
  public constructor(public $implicit: T) {}
}

function throwAsyncJobNotFoundError(attrName: string): never {
  throw new Error(
    `An element with the "${attrName}" attribute ` +
      `(matching the "${attrName}" directive) must be located inside an element with the "asyncJob" attribute ` +
      `(matching "asyncJob" directive)`,
  );
}
