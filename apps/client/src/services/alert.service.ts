import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  public success(title: string, text?: string, callback?: () => void) {
    Swal.fire({
      icon: 'success',
      title,
      text,
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  }

  public error(title: string, text?: string, callback?: () => void) {
    Swal.fire({
      icon: 'error',
      title,
      text,
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  }

  public warning(title: string, text?: string, callback?: () => void) {
    Swal.fire({
      icon: 'warning',
      title,
      text,
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  }

  public delete(title: string, text?: string, callback?: () => void) {
    Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    }).then((result) => {
      if (result.isConfirmed) {
        if (callback) {
          callback();
        }
      }
    });
  }
}
