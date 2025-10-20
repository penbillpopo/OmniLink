export function toggleInArray<T = any>(array: T[], item: T) {
  const index = array.indexOf(item);
  if (index === -1) {
    array.push(item);
  } else {
    array.splice(index, 1);
  }
}
