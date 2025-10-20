import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  AsyncJobDefaultEmptyDirective,
  AsyncJobDefaultErrorDirective,
  AsyncJobDefaultLoadingDirective,
  AsyncJobDirective,
  AsyncJobEmptyDirective,
  AsyncJobErrorDirective,
  AsyncJobLoadingDirective,
  AsyncJobSuccessDirective,
} from './async-job.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    AsyncJobDirective,
    AsyncJobErrorDirective,
    AsyncJobLoadingDirective,
    AsyncJobEmptyDirective,
    AsyncJobSuccessDirective,
    AsyncJobDefaultEmptyDirective,
    AsyncJobDefaultErrorDirective,
    AsyncJobDefaultLoadingDirective,
  ],
  exports: [
    AsyncJobDirective,
    AsyncJobErrorDirective,
    AsyncJobLoadingDirective,
    AsyncJobEmptyDirective,
    AsyncJobSuccessDirective,
    AsyncJobDefaultEmptyDirective,
    AsyncJobDefaultErrorDirective,
    AsyncJobDefaultLoadingDirective,
  ],
})
export class AsyncJobModule {}
