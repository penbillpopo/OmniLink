import { BasicFormControl } from './basic-formcontrol.class';

type FormGroupData = {
  [key: string]: BasicFormControl<any> | BasicFormControl<any>[];
};

type FormGroupValue = {
  [key: string]: any | any[];
};

export class BasicFormGroup<
  T extends { [key: string]: BasicFormControl<any> | BasicFormControl<any>[] },
> {
  public data: T;

  public constructor(data: T) {
    this.data = data;
  }

  public get value(): FormGroupValue {
    const value: any = {};
    for (const key in this.data) {
      if (Array.isArray(this.data[key])) {
        const controls = this.data[key] as BasicFormControl<any>[];
        value[key] = controls.map((control) => control.value);
      } else {
        const control = this.data[key] as BasicFormControl<any>;
        value[key] = control.value;
      }
    }
    return value;
  }

  public get error(): { [key: string]: string } {
    const error: any = {};
    for (const key in this.data) {
      if (Array.isArray(this.data[key])) {
        const controls = this.data[key] as BasicFormControl<any>[];
        controls.forEach((control) => {
          error[key] = control.error;
        });
      } else {
        const control = this.data[key] as BasicFormControl<any>;
        error[key] = control.error;
      }
    }
    return error;
  }

  public validate(): boolean {
    let valid = true;
    for (const key in this.data) {
      if (Array.isArray(this.data[key])) {
        const controls = this.data[key] as BasicFormControl<any>[];
        controls.forEach((control) => {
          if (!control.valid) {
            valid = false;
          }
        });
      } else {
        const control = this.data[key] as BasicFormControl<any>;
        if (!control.valid) {
          valid = false;
        }
      }
    }
    return valid;
  }
}
