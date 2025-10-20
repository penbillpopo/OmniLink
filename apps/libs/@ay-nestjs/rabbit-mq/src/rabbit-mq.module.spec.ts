/* eslint-disable prefer-const */
import { Test, TestingModule } from '@nestjs/testing';
import Bluebird, { delay } from 'bluebird';
import { Observable, firstValueFrom } from 'rxjs';
import { take, timeout } from 'rxjs/operators';
import { AppModule } from './app.module.spec';
import { ConsumeDto } from './consume.dto';
import { RabbitMqModule } from './rabbit-mq.module';
import { RabbitMqService } from './rabbit-mq.service';

describe('RabbitMqModule', () => {
  let module: TestingModule;
  let rabbitMqService: RabbitMqService;
  let rabbitMqModule: RabbitMqModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();
    rabbitMqModule = module.get(RabbitMqModule);
    rabbitMqService = module.get(RabbitMqService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(rabbitMqService).toBeDefined();
    expect(rabbitMqService).toBeDefined();
    expect(rabbitMqModule).toBeDefined();
  });

  it('Different cases same instance', () => {
    expect(rabbitMqService === rabbitMqService).toBeTruthy();
  });

  it('queue should support send & consume', async () => {
    const queue = rabbitMqService.queue('QUEUE');
    const consume = queue.consume();
    await purge(consume);

    const receivePromise = firstValueFrom(consume);
    rabbitMqService.queue('QUEUE').send([1, 2, 3, 4]);
    const { channel, message, body } = await receivePromise;
    expect(body).toEqual([1, 2, 3, 4]);
    channel.ack(message);
  });

  it('exchange should support publish & consume', async () => {
    const exchanger = rabbitMqService.exchange(
      'EXCHANGE',
      'fanout',
      { durable: false },
      undefined,
      { exclusive: true },
    );
    const consume = exchanger.consume();
    await purge(consume);

    const receivePromise = firstValueFrom(consume);
    await exchanger.publish([1, 2, 3, 4]);
    const { channel, message, body } = await receivePromise;
    expect(body).toEqual([1, 2, 3, 4]);
    channel.ack(message);
  });

  it('exchange should support publish type: string, number, null, object, boolean', async () => {
    const exchanger = rabbitMqService.exchange(
      'TEST_DATA_TYPE_EXCHANGE',
      'fanout',
      { autoDelete: true, durable: true },
      null,
      { exclusive: true },
      { noAck: true },
    );
    const consume = exchanger.consume();
    await purge(consume);

    // string
    const data1 = `${Date.now()}`;
    const receivePromise1 = firstValueFrom(consume);
    await exchanger.publish(data1);
    const receive1 = await receivePromise1;
    expect(receive1.body).toEqual(data1);

    // number
    const data2 = Date.now() / 1000;
    const receivePromise2 = firstValueFrom(consume);
    await exchanger.publish(data2);
    const receive2 = await receivePromise2;
    expect(receive2.body).toEqual(data2);

    // boolean
    const data3 = false;
    const receivePromise3 = firstValueFrom(consume);
    await exchanger.publish(data3);
    const receive3 = await receivePromise3;
    expect(receive3.body).toEqual(data3);

    // null
    const data4 = null;
    const receivePromise4 = firstValueFrom(consume);
    await exchanger.publish(data4);
    const receive4 = await receivePromise4;
    expect(receive4.body).toEqual(data4);

    // object
    const data5 = {};
    const receivePromise5 = firstValueFrom(consume);
    await exchanger.publish(data5);
    const receive5 = await receivePromise5;
    expect(JSON.stringify(receive5.body)).toEqual(JSON.stringify(data5));
  });

  it('queue should support send type: string, number, null, object, boolean', async () => {
    const QueueName = 'TEST_DATA_TYPE';
    const queue = rabbitMqService.queue(QueueName, { autoDelete: true });
    const consume = queue.consume();
    await purge(consume);

    // string
    const data1 = `${Date.now()}`;
    const receivePromise1 = firstValueFrom(consume);
    await queue.send(data1);
    const receive1 = await receivePromise1;
    expect(receive1.body).toEqual(data1);
    receive1.channel.ack(receive1.message);

    // number
    const data2 = Date.now() / 1000;
    const receivePromise2 = firstValueFrom(consume);
    await queue.send(data2);
    const receive2 = await receivePromise2;
    expect(receive2.body).toEqual(data2);
    receive2.channel.ack(receive2.message);

    // boolean
    const data3 = false;
    const receivePromise3 = firstValueFrom(consume);
    await queue.send(data3);
    const receive3 = await receivePromise3;
    expect(receive3.body).toEqual(data3);
    receive3.channel.ack(receive3.message);

    // null
    const data4 = null;
    const receivePromise4 = firstValueFrom(consume);
    await queue.send(data4);
    const receive4 = await receivePromise4;
    expect(receive4.body).toEqual(data4);
    receive4.channel.ack(receive4.message);

    // object
    const data5 = {};
    const receivePromise5 = firstValueFrom(consume);
    await queue.send(data5);
    const receive5 = await receivePromise5;
    expect(JSON.stringify(receive5.body)).toEqual(JSON.stringify(data5));
    receive5.channel.ack(receive5.message);
  });

  it('should able re-consume after cancel', async () => {
    const queue = rabbitMqService.queue('RE-CONSUME');
    const consume = queue.consume();
    await purge(consume);

    const firstReceivePromise = firstValueFrom(consume);
    await queue.send('FIRST_SEND');
    const firstReceive = await firstReceivePromise;
    expect(firstReceive.body).toBe('FIRST_SEND');
    firstReceive.channel.ack(firstReceive.message);

    await queue.cancel();

    const reconsume = queue.consume();
    await purge(consume);

    const secondReceivePromise = firstValueFrom(reconsume);
    await queue.send('SECOND_SEND');
    const secondReceive = await secondReceivePromise;
    expect(secondReceive.body).toBe('SECOND_SEND');
    secondReceive.channel.ack(secondReceive.message);
  });

  it('should not receive after cancel', async () => {
    const queue = rabbitMqService.queue(
      'RE-CONSUME-NOT-RECEIVE',
      undefined,
      undefined,
      { noAck: true },
    );

    const consume = queue.consume();
    await purge(consume);
    await queue.cancel();

    const receive = firstValueFrom(
      queue.consume().pipe(take(1), timeout(3000)),
    );
    await queue.cancel();
    await queue.send('DATA');

    expect(await receive.then(() => false).catch(() => true)).toBeTruthy();
  });

  // it('ack after reconnection', async () => {
  //   const queue = rabbitMqService.queue(
  //     'ACK-AFTER-RECONNECTION',
  //     undefined,
  //     undefined,
  //     { noAck: false },
  //   );
  //   const consume = queue.consume();
  //   await purge(consume);

  //   const receivePromise = takeJob(queue);
  //   queue.send('DATA');
  //   const receive1 = await receivePromise;

  //   const rabbitMq = await firstValueFrom(rabbitMqService.rabbitMq$);
  //   await rabbitMq.forceReconnect();

  //   receive1.channel.ack(receive1.message);

  //   queue.send('DATA2');
  //   const receive2 = await takeJob(queue);
  //   expect(receive2.body).toBe('DATA2');
  //   expect(() => {
  //     receive2.channel.ack(receive2.message);
  //   }).toThrowError();

  //   expect(receive1.channel).not.toBe(receive2.channel);
  // });

  // it(
  //   'consumer ack timeout',
  //   async () => {
  //     const queue = rabbitMqService.queue(
  //       'CONSUMER-ACK-TIMEOUT',
  //       undefined,
  //       undefined,
  //       { noAck: false },
  //     );
  //     const consume = queue.consume();
  //     await purge(consume);

  //     const jobPromise = takeJob(queue);
  //     queue.send('DATA');
  //     const job = await jobPromise;

  //     await Bluebird.delay(60 * 1000);

  //     expect(() => job.channel.ack(job.message)).toThrowError();

  //     queue.send('DATA');
  //     const job2 = await takeJob(queue);
  //     expect(job2.channel).not.toBe(job.channel);
  //   },
  //   120 * 1000,
  // );

  it('pool should be empty after all job done', async () => {
    const queue = rabbitMqService.queue('POOL-EMPTY');
    const consume = queue.consume();
    await purge(consume);
    consume.subscribe((event) => event.channel.ack(event.message));
    await queue.send('DATA');

    await Bluebird.delay(1000); // waiting channel assert queue
    expect(rabbitMqService.isEmptyPool()).toBe(true);
  });

  it('test prefetch is 1', async () => {
    const queue = rabbitMqService.queue('PREFETCH-1', {}, 'default', {}, 1);
    const consume = queue.consume();
    await purge(consume);
    const logs = [];

    consume.subscribe(async ({ channel, message, body }) => {
      logs.push(`start job ${body}`);
      await Bluebird.delay(100);
      logs.push(`end job ${body}`);
      channel.ack(message);
    });

    await queue.send('DATA1');
    await queue.send('DATA2');
    await Bluebird.delay(200 * 1.1);

    expect(logs).toEqual([
      'start job DATA1',
      'end job DATA1',
      'start job DATA2',
      'end job DATA2',
    ]);

    expect(rabbitMqService.isEmptyPool()).toBe(true);
  });

  afterAll(async () => {
    await module.close().catch((error) => console.error(error));
  });

  async function purge(consume: Observable<ConsumeDto<any>>) {
    const subscription = consume.subscribe(({ channel, message, body }) =>
      channel.ack(message),
    );

    await delay(1000);
    subscription.unsubscribe();
  }
});
