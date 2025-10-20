import { RandomGenerator } from './rand';

export function createRandomString(chars: string, length: number) {
  let string = '';

  for (let i = 0; i < length; i++) {
    const index = RandomGenerator.randomInt(chars.length);
    string += chars[index];
  }

  return string;
}
