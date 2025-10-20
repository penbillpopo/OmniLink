/* eslint-disable prefer-const */
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { AppModule } from './app.module.spec';
import { RabbitMqService } from './rabbit-mq.service';

describe('RabbitMqModule', () => {
  let module: TestingModule;
  let rabbitMqService: RabbitMqService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    rabbitMqService = module.get(RabbitMqService);
  });

  it(
    'support close connection',
    async () => {
      await rabbitMqService.close();

      expect(() =>
        firstValueFrom(rabbitMqService.queue('QUEUE').consume()),
      ).toThrowError(/RabbitMq closing/);

      await expect(
        rabbitMqService.queue('QUEUE').send([1, 2, 3, 4]),
      ).rejects.toThrowError(/RabbitMq closing/);

      expect('OK').toBe('OK');
    },
    10 * 1000,
  );

  afterAll(async function () {
    await module.close().catch((error) => {
      if (error.message.includes('Channel closed')) return;
      console.error(error);
    });
  });
});
