export class NotFoundError extends Error {}

export function removeInArray<T>(array: T[], element: T) {
  const index = array.indexOf(element);
  if (index === -1) return;
  array.splice(index, 1);
}
