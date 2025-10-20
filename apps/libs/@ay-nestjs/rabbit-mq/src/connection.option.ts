import { Options } from 'amqplib';

export interface ConnectionOption extends Options.Connect {
  // 當連線發生錯誤時，重新連線的間隔時間（秒）
  reconnectInterval?: number;
}
