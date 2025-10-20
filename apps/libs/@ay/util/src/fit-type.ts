import { toNumber } from 'lodash';

export function fitType(input: string): any {
  input = input.trim();
  try {
    return JSON.parse(input);
  } catch (e) {
    const anyTypes = {
      undefined: undefined,
      NaN: NaN,
      null: null,
      true: true,
      false: false,
      Infinity: Infinity,
      '-Infinity': -Infinity,
    };
    if (input in anyTypes) return anyTypes[input];
    if (input[0] == '0' && input.length > 1) return input;
    const output = toNumber(input);
    return output !== 0 && !output ? input : output;
  }
}
