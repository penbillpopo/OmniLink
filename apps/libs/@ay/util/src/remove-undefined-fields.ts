export function removeUndefinedFields(object: { [key: string]: any }) {
  for (const key in object) {
    if (object[key] === undefined) {
      delete object[key];
    }
  }
  return object;
}
