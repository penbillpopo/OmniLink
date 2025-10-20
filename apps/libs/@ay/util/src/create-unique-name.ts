export function createUniqueName(oriName: string, list: string[]) {
  let name = oriName;
  if (list.indexOf(name) === -1) {
    return name;
  }
  let i = 1;

  do {
    name = oriName + ' ' + i;
    i++;
  } while (list.indexOf(name) !== -1);
  return name;
}
