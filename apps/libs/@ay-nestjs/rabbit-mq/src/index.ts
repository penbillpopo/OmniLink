import { Options } from 'amqplib';

export * from './connection.option';
export * from './consume.dto';
export * from './exchange';
export * from './queue';
export * from './rabbit-mq.module';
export * from './rabbit-mq.option';
export * from './rabbit-mq.service';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssertExchangeOption extends Options.AssertExchange {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssertQueueOption extends Options.AssertQueue {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ConnectOption extends Options.Connect {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ConsumeOption extends Options.Consume {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteExchangeOption extends Options.DeleteExchange {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteQueueOption extends Options.DeleteQueue {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetOption extends Options.Get {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PublishOption extends Options.Publish {}
