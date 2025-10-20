import { DynamicModule, Inject, Module } from '@nestjs/common';
import 'reflect-metadata';
import { RABBIT_MQ_PROVIDER } from './const';
import { RabbitMq } from './rabbit-mq';
import { RabbitMqOption } from './rabbit-mq.option';
import { RabbitMqService } from './rabbit-mq.service';

@Module({})
export class RabbitMqModule {
  private _rabbitMq: RabbitMq;

  public constructor(
    @Inject(RABBIT_MQ_PROVIDER)
    option: RabbitMqOption,
    rabbitMqService: RabbitMqService,
  ) {
    this._rabbitMq = new RabbitMq(option);
    rabbitMqService.setRabbitMq(this._rabbitMq);
  }

  public static forRoot(option: RabbitMqOption): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [
        { provide: RABBIT_MQ_PROVIDER, useValue: option },
        RabbitMqService,
      ],
      exports: [RabbitMqService],
    };
  }
}
