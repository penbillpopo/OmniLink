import { Pipe } from '@angular/core';

@Pipe({
  name: 'taskType',
  standalone: true,
})
export class TaskTypePipe {
  public constructor() {}

  public transform(type: 'trade' | 'backtest'): string {
    switch (type) {
      case 'trade':
        return '交易';
      case 'backtest':
        return '回测';
      default:
        return '未知類型';
    }
  }
}
