import {
  RabbitMqModule as RabbitMqModuleBase,
  RabbitMqOption,
} from '@ay-nestjs/rabbit-mq';
import { int, str } from '@ay/env';
import { DynamicModule } from '@nestjs/common';

export class RabbitMqModule {
  private static _store: { [key: string]: DynamicModule } = {};

  public static forRoot(prefix = '', localOption: RabbitMqOption = {}) {
    prefix = RabbitMqModule._processPrefix(prefix);
    if (!RabbitMqModule._store[prefix]) {
      const envOption = RabbitMqModule._readEnvOption(prefix);
      const option = Object.assign(envOption, localOption);
      RabbitMqModule._store[prefix] = RabbitMqModuleBase.forRoot(option);
    }
    return RabbitMqModule._store[prefix];
  }

  private static _processPrefix(prefix: string) {
    if (prefix !== '') {
      prefix += '_';
    }

    prefix += 'RBMQ_';
    return prefix;
  }

  private static _readEnvOption(prefix: string): RabbitMqOption {
    return {
      protocol: str(prefix + 'PROTOCOL', 'amqp'),
      hostname: str(prefix + 'HOSTNAME'),
      port: int(prefix + 'PORT', 5672),
      username: str(prefix + 'USERNAME'),
      password: str(prefix + 'PASSWORD'),
      frameMax: int(prefix + 'FRAME_MAX', 0x1000),
      heartbeat: int(prefix + 'HEARTBEAT', 0),
      vhost: str(prefix + 'VHOST', '/'),
      reconnectInterval: int(prefix + 'RECONNECT_INTERVAL', 5),
    };
  }
}
