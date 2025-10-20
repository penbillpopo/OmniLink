import _ from 'lodash';
import { RandomGenerator } from './rand';

export function weightSample<T>(
  candidates: { weight: number; item: T }[],
  count = 1,
  invert = false,
  takeOut = false,
): T[] {
  if (count > candidates.length && takeOut === true) {
    throw new Error('Insufficient number');
  }

  const elements: T[] = [];

  for (let n = 0; n < count; n++) {
    candidates = _.shuffle(candidates);
    const total = candidates.reduce(
      (prev, candidate) => prev + candidate.weight,
      0,
    );
    let random = RandomGenerator.randomInt(total);
    let candidate = candidates[0];

    for (let i = 0; i < candidates.length; i++) {
      candidate = candidates[i];

      if (invert) {
        random -= total - candidate.weight;
      } else {
        random -= candidate.weight;
      }

      if (random <= 0) {
        if (takeOut) {
          candidates.splice(i, 1);
        }
        break;
      }
    }

    elements.push(candidate.item);
  }

  return elements;
}
