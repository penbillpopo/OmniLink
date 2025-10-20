import { bool, int, str } from '@ay/env';
import { RedisConnection } from '@ay/redis';
import { DynamicModule, Logger } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export class RedisModule {
  private static readonly _logger = new Logger(RedisModule.name);

  private static readonly _store: { [key: string]: Promise<RedisConnection> } =
    {};

  public static forRoot(
    prefix = '',
    option: RedisOptions = null,
  ): DynamicModule {
    const provider = {
      provide: RedisConnection,
      useFactory: async () => {
        if (RedisModule._store[prefix] === undefined) {
          RedisModule._store[prefix] = RedisModule._initRedis(prefix, option);
        }

        return RedisModule._store[prefix];
      },
    };

    return {
      module: RedisModule,
      exports: [provider],
      providers: [provider],
    };
  }

  private static _initRedis(prefix: string, option: RedisOptions) {
    prefix = RedisModule._processPrefix(prefix);
    return RedisModule._factory(prefix, option);
  }

  private static _processPrefix(prefix: string) {
    if (prefix !== '') {
      prefix += '_';
    }

    prefix += 'REDIS_';
    return prefix;
  }

  private static async _factory(
    prefix: string,
    localOption: RedisOptions = null,
  ) {
    const envOption = RedisModule._readEnvOption(prefix);
    const option = Object.assign(envOption, localOption);
    const redis = new RedisConnection(option);
    const timer = global.setTimeout(
      () => this._logger.error('連線到 Redis 超時'),
      10 * 1000,
    );
    await redis.ready();
    global.clearTimeout(timer);
    return redis;
  }

  private static _readEnvOption(prefix: string) {
    let option = {};

    if (bool(prefix + 'SENTINEL_ENABLE', false)) {
      const sentinels = [];
      let i = 1;
      while (str(prefix + 'SENTINEL_HOST_' + i, null)) {
        sentinels.push({
          host: str(prefix + 'SENTINEL_HOST_' + i),
          port: int(prefix + 'SENTINEL_PORT_' + i, 26379),
        });
        i++;
      }

      option = {
        sentinels,
      };

      const name = str(prefix + 'SENTINEL_NAME', null);
      if (name) {
        option['name'] = name;
      }

      const password = str(prefix + 'PASSWORD', null);
      if (password) {
        option['password'] = password;
      }

      const sentinelPassword = str(prefix + 'SENTINEL_PASSWORD', null);
      if (sentinelPassword) {
        option['sentinelPassword'] = sentinelPassword;
      }

      const role = str(prefix + 'SENTINEL_ROLE', null);
      if (role) {
        option['role'] = role;
      }

      const sentinelRetryStrategy = int(
        prefix + 'SENTINEL_RETRY_STRATEGY',
        null,
      );
      if (sentinelRetryStrategy) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        option['sentinelRetryStrategy'] = (options) => sentinelRetryStrategy;
      }
    } else {
      option = {
        host: str(prefix + 'HOST', '127.0.0.1'),
        port: int(prefix + 'PORT', 6379),
        db: str(prefix + 'DB', '0'),
        password: str(prefix + 'PASSWORD', null),
        tls: bool(prefix + 'TLS', false)
          ? {
              servername: str(prefix + 'TLS_SERVERNAME'),
            }
          : null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        retryStrategy: (options) => int(prefix + 'RETRY_STRATEGY', 1000),
        commandTimeout: int(prefix + 'COMMAND_TIMEOUT', 120 * 1000),
      };
    }

    option['enableReadyCheck'] = true;

    return option;
  }
}
