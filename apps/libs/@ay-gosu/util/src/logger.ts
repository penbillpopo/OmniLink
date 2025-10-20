import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { isPlainObject } from '@nestjs/common/utils/shared.utils';

export class NestJsLogger extends ConsoleLogger {
  public constructor() {
    super('', {
      logLevels: [
        'log',
        'error',
        'warn',
        process.env.DEBUG ? 'debug' : null,
      ].filter(Boolean) as LogLevel[],
    });
  }

  private static _previousTimestamp: string;

  protected override getTimestamp() {
    const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });

    if (NestJsLogger._previousTimestamp === timestamp) {
      NestJsLogger._previousTimestamp = timestamp;
      return '';
    } else {
      NestJsLogger._previousTimestamp = timestamp;
      return colors.cyanBright(`> ${timestamp}`) + '\n';
    }
  }

  protected override printMessages(
    messages: string[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    const color = this._getColorByLogLevel(logLevel);
    messages.forEach((message) => {
      const output = isPlainObject(message)
        ? `${color('Object:')}\n${JSON.stringify(
            message,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value,
            2,
          )}\n`
        : color(message);
      const contextMessage = context ? colors.yellow(`[${context}] `) : '';
      const formattedLogLevel = color(logLevel.toUpperCase().padStart(7, ' '));
      const computedMessage = `${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}\n`;
      process[writeStreamType ?? 'stdout'].write(computedMessage);
    });
  }

  private _getColorByLogLevel(level: LogLevel) {
    switch (level) {
      case 'debug':
        return colors.magentaBright;
      case 'warn':
        return colors.yellow;
      case 'error':
        return colors.red;
      case 'verbose':
        return colors.cyanBright;
      default:
        return colors.green;
    }
  }
}

const isColorAllowed = () => !process.env.NO_COLOR;
type ColorFn = (text: string) => string;

const colorIfAllowed = (colorFn: ColorFn) => (text: string) =>
  isColorAllowed() ? colorFn(text) : text;
const colors = {
  green: colorIfAllowed((text) => `\x1B[32m${text}\x1B[39m`),
  yellow: colorIfAllowed((text) => `\x1B[33m${text}\x1B[39m`),
  red: colorIfAllowed((text) => `\x1B[31m${text}\x1B[39m`),
  magentaBright: colorIfAllowed((text) => `\x1B[95m${text}\x1B[39m`),
  cyanBright: colorIfAllowed((text) => `\x1B[96m${text}\x1B[39m`),
};
