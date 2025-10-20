import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class StatusController {
  private _version: string;

  public constructor() {
    this._version = '1.0.0';
  }

  @Get()
  public getStatus(): string {
    return this._version;
  }
}
