import { bool, int, json, str } from '@ay/env';
import SequelizeHierarchy from '@ay/sequelize-hierarchy';
import { DynamicModule, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  ConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  DatabaseError,
  Dialect,
  InvalidConnectionError,
  TimeoutError,
} from 'sequelize';
import { ModelCtor, Sequelize, SequelizeOptions } from 'sequelize-typescript';

export class SequelizeModule implements OnModuleDestroy {
  private static readonly _logger = new Logger(SequelizeModule.name);

  private static _store: {
    [key: string]: {
      instance: Promise<Sequelize>;
      refCount: number;
    };
  } = {};

  public constructor(
    @Inject('SEQUELIZE_PREFIX')
    private readonly _sequelizePrefix: string,
  ) {}

  public static forRoot(
    prefix = '',
    models: Array<ModelCtor>,
    option: Partial<SequelizeOptions> = null,
  ): DynamicModule {
    return {
      module: SequelizeModule,
      providers: [
        { provide: 'SEQUELIZE_PREFIX', useValue: prefix },
        {
          provide: `SEQUELIZE_${prefix}`,
          useFactory: async () => {
            if (!SequelizeModule._store[prefix]) {
              SequelizeModule._logger.log(`建立 ${prefix} Sequelize 連線`);

              SequelizeModule._store[prefix] = {
                instance: SequelizeModule._init(prefix, option, models),
                refCount: 0,
              };
              SequelizeModule._store[prefix].instance.catch((error) => {
                delete SequelizeModule._store[prefix];
                SequelizeModule._logger.error(
                  '連線到 Sequelize 發生錯誤',
                  error,
                );
              });
            }

            const item = SequelizeModule._store[prefix];
            item.refCount++;
            return SequelizeModule._store[prefix].instance;
          },
        },
        {
          provide: Sequelize,
          useExisting: `SEQUELIZE_${prefix}`,
        },
      ],
      exports: [Sequelize],
    };
  }

  private static _init(
    prefix: string,
    option: Partial<SequelizeOptions>,
    models: Array<ModelCtor<any>>,
  ) {
    prefix = SequelizeModule._processPrefix(prefix);
    return SequelizeModule._factory(prefix, option, models);
  }

  private static _processPrefix(prefix: string) {
    if (prefix !== '') {
      prefix += '_';
    }

    prefix += 'DB_';
    return prefix;
  }

  private static async _factory(
    prefix: string,
    localOption: Partial<SequelizeOptions> = null,
    models: Array<ModelCtor<any>>,
  ) {
    const envOption = SequelizeModule._readEnvOption(prefix);
    const option = Object.assign(envOption, localOption);

    if (option.database === null) {
      delete option.database;
    }

    SequelizeHierarchy(Sequelize);
    const sequelize = new Sequelize(option);
    sequelize.addModels(models);
    await sequelize.authenticate();
    if (bool(prefix + 'SYNC_TABLE', false)) {
      await sequelize
        .sync({
          force: bool(prefix + 'SYNC_FORCE', false),
          alter: bool(prefix + 'SYNC_ALTER', false),
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    }
    return sequelize;
  }

  private static _readEnvOption(prefix: string): SequelizeOptions {
    const config: SequelizeOptions = {
      dialect: str(prefix + 'DIALECT', 'mysql') as Dialect,
      host: str(prefix + 'HOST', '127.0.0.1'),
      port: int(prefix + 'PORT', 3306),
      username: str(prefix + 'USERNAME'),
      password: str(prefix + 'PASSWORD'),
      database: str(prefix + 'DATABASE'),
      pool: bool(prefix + 'POOL', false)
        ? {
            min: int(prefix + 'POOL_MIN', 0),
            max: int(prefix + 'POOL_MAX', 5),
            acquire: int(prefix + 'POOL_ACQUIRE', 60000),
            idle: int(prefix + 'POOL_IDLE', 10000),
            evict: int(prefix + 'POOL_EVICT', 1000),
          }
        : null,
      dialectOptions: json(prefix + 'DIALECT_OPTIONS', {}),
      logging: bool(prefix + 'LOGGING', false),
      retry: bool(prefix + 'RETRY', false)
        ? {
            match: [
              ConnectionError,
              ConnectionRefusedError,
              ConnectionTimedOutError,
              DatabaseError,
              InvalidConnectionError,
              TimeoutError,
            ],
            max: int(prefix + 'RETRY_MAX', 3),
          }
        : null,
    };

    const timezone = str(prefix + 'TIMEZONE', '');
    if (timezone !== '') {
      config.timezone = timezone;
    }

    return config;
  }

  public async onModuleDestroy() {
    const item = SequelizeModule._store[this._sequelizePrefix];
    if (!item) return;
    item.refCount--;

    setTimeout(async () => {
      if (item.refCount < 0) {
        SequelizeModule._logger.log(
          `關閉 ${this._sequelizePrefix} Sequelize 連線`,
        );

        delete SequelizeModule._store[this._sequelizePrefix];
        (await item.instance).close();
      }
    }, 5000);
  }
}
