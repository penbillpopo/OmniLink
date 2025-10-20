import { Options } from 'amqplib';

export interface RabbitMqOption extends Options.Connect {
  reconnectInterval?: number;
}
