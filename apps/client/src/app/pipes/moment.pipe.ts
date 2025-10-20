import { Pipe } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'moment',
  standalone: true,
})
export class MomentPipe {
  public transform(datetime: Date): string {
    if (!datetime) {
      return '';
    }
    return moment(datetime).format('YYYY-MM-DD HH:mm:ss');
  }
}
