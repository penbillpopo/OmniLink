import { int, str } from '@ay/env';
import { Module } from '@nestjs/common';
import { RabbitMqModule } from './rabbit-mq.module';

@Module({
  imports: [
    RabbitMqModule.forRoot({
      hostname: str('TEST_RBMQ_HOSTNAME', 'rabbitmq'),
      username: str('TEST_RBMQ_USERNAME', 'test'),
      password: str('TEST_RBMQ_PASSWORD', 'test'),
      vhost: str('TEST_RBMQ_VHOST', '/'),
      port: int('TEST_RBMQ_PORT', 5672),
    }),
  ],
})
export class AppModule {}

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });
});
