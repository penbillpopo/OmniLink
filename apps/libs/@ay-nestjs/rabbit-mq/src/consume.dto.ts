import { Channel, Message } from 'amqplib';

export interface ConsumeDto<T = any> {
  channel: Channel;
  message: Message;
  body: T;
}
