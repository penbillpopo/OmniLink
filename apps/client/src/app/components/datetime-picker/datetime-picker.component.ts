import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  ThemePalette,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import {
  MatFormField,
  MatFormFieldControl,
  MatHint,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import moment, { Moment } from 'moment';
import { Subject } from 'rxjs';
import { TimePickerComponent } from './time-picker/time-picker.component';

export type DateTimePickerType = 'datetime' | 'date' | 'time';

@Component({
  selector: 'gosu-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: DatetimePickerComponent },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'YYYY-MM-DD',
        },
        display: {
          dateInput: 'YYYY-MM-DD',
          monthYearLabel: 'YYYY MMM',
          dateA11yLabel: 'YYYY-MM-DD',
          monthYearA11yLabel: 'YYYY MMMM',
        },
      },
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimePickerComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatHint,
    MatButton,
    MatDatepickerInput,
    MatDatepicker,
    TimePickerComponent,
  ],
})
export class DatetimePickerComponent
  implements OnChanges, ControlValueAccessor
{
  public stateChanges = new Subject();

  @Input()
  public type: DateTimePickerType = 'datetime';

  @Input()
  public placeholder = '';

  @Input()
  public disabled = false;

  @Input()
  public color: ThemePalette = 'primary';

  @Input()
  public max: Moment;

  @Input()
  public min: Moment;

  @Input()
  public hint: string;

  @Input()
  public error = false;

  @Input()
  public buttonOnly = false;

  @Input()
  public buttonText = `請選擇時間`;

  @Input()
  public inputFormat = 'YYYY-MM-DD HH:mm:ss';

  @Input()
  public outputFormat: string;

  @Input()
  public value: string | Date;

  @Output()
  public valueChange = new EventEmitter();

  public get displayValue(): string | Date {
    if (!this.value) return;
    if (moment(this.value).isValid())
      return moment(this.value).format(this.inputFormat);
    return this.value;
  }

  public get time() {
    if (!this.value) return;
    if (moment(this.value).isValid()) return moment(this.value);
    return moment(this.value, this.inputFormat);
  }

  public set time(time: Moment) {
    this.change(time, 'time');
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.type || changes.inputFormat || changes.outputFormat) {
      if (this.value) this.change(moment(this.value, this.inputFormat));
    }
  }

  public change(value: Moment, type?: 'date' | 'time') {
    let format = this.inputFormat;
    let time = '00:00:00';
    let date = moment().format('YYYY-MM-DD');

    if (this.value && moment(this.value, format).isValid()) {
      time = moment(this.value, format).format('HH:mm:ss');
      date = moment(this.value, format).format('YYYY-MM-DD');
    }

    if (!value.isValid()) return;

    switch (type) {
      case 'date':
        date = value.format('YYYY-MM-DD');
        break;
      case 'time':
        time = value.format('HH:mm:ss');
        break;
      default:
        date = value.format('YYYY-MM-DD');
        time = value.format('HH:mm:ss');
    }

    this.value = moment(`${date} ${time}`).format(format);

    let outputFormat = this.outputFormat || format;
    let output = moment(this.value, format).format(outputFormat);
    this.valueChange.emit(output);
  }

  public writeValue(value: string | Date) {
    this.value = value;
  }

  public registerOnChange(fn: any) {
    this.valueChange.subscribe(fn);
  }

  public registerOnTouched() {}
}
