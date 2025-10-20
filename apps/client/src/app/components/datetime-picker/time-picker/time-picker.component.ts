import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import moment, { Moment } from 'moment';
import { BehaviorSubject, Subject, fromEvent } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gosu-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatCard,
    MatFormField,
    MatLabel,
    MatSelect,
    FormsModule,
    NgFor,
    MatOption,
  ],
})
export class TimePickerComponent implements OnInit, OnDestroy {
  @ViewChild('background')
  public background: ElementRef;

  @Input()
  public min: Moment;

  @Input()
  public max: Moment;

  @Input()
  public color: 'primary' | 'accent' | 'warn' | undefined = 'primary';

  @Input()
  public value: Moment;

  @Output()
  public valueChange = new EventEmitter();

  public isOpened = new BehaviorSubject(false);

  public get hour() {
    if (!this.value) return 0;
    return moment(this.value).hour();
  }

  public set hour(hour) {
    this.value = moment(this.value).set({ hour });
    this.valueChange.emit(this.value);
  }

  public get minute() {
    if (!this.value) return 0;
    return moment(this.value).minute();
  }

  public set minute(minute) {
    this.value = moment(this.value).set({ minute });
    this.valueChange.emit(this.value);
  }

  public get second() {
    if (!this.value) return 0;
    return moment(this.value).second();
  }

  public set second(second) {
    this.value = moment(this.value).set({ second });
    this.valueChange.emit(this.value);
  }

  private readonly _destroy$ = new Subject<void>();

  public constructor(private readonly _elementRef: ElementRef) {}

  public ngOnInit() {
    this.isOpened.pipe(takeUntil(this._destroy$)).subscribe((isOpened) => {
      if (isOpened && !this.value) {
        this.valueChange.emit(moment('00:00:00', 'HH:mm:ss'));
      }
      let background = this.background?.nativeElement as HTMLElement;
      if (!background) return;

      fromEvent(background, 'click')
        .pipe(take(1))
        .subscribe(() => this.close());

      let element = this._elementRef.nativeElement as HTMLElement;
      if (isOpened) element.parentElement.prepend(background);
      else element.prepend(background);
    });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public numArray(num: number): number[] {
    return new Array(num).fill(0).map((n, i) => i);
  }

  public isDisabled(val: number, unit: 'hour' | 'minute' | 'second') {
    let option = moment(this.value).set({ [unit]: val });
    if (this.max && this.min)
      return (
        option.isAfter(moment(this.max)) || option.isBefore(moment(this.min))
      );
    if (this.max) return option.isAfter(moment(this.max));
    if (this.min) return option.isBefore(moment(this.min));
    return false;
  }

  public open() {
    this.isOpened.next(true);
  }

  public close() {
    this.isOpened.next(false);
  }
}
