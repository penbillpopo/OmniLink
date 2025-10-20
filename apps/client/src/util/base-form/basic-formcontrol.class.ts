import { BasicFormVaildate } from './basic-form-validate';

export class BasicFormControl<T> {
  public value: T;

  public validators: BasicFormVaildate[];

  public constructor(value: T, validators?: BasicFormVaildate[]) {
    this.value = value;
    this.validators = validators;
  }

  public error = null;

  public get valid(): boolean {
    let valid = true;
    if (this.validators) {
      this.validators.forEach((validator) => {
        let error = '';
        switch (validator) {
          case BasicFormVaildate.required:
            if (!this.value) {
              error = '必填';
              valid = false;
            }
            break;
        }
        if (!valid) {
          this.error = error;
        }
      });
    }
    return valid;
  }
}
