import { Pipe } from '@angular/core';

@Pipe({
  name: 'taskStatus',
  standalone: true,
})
export class TaskStatusPipe {
  public constructor() {}

  public transform(
    status: 'connecting' | 'running' | 'stopped' | 'paused',
  ): string {
    switch (status) {
      case 'connecting':
        return '連線中';
      case 'running':
        return '執行中';
      case 'stopped':
        return '已停止';
      case 'paused':
        return '已暫停';
      default:
        return '未連接';
    }
  }
}
