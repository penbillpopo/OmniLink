export function ensurePropertyIsArray(
  object: { [key: string]: any },
  key: string,
) {
  if (object[key] == null || object[key] == undefined) {
    object[key] = [];
  } else if (!(object[key] instanceof Array)) {
    object[key] = [object[key]];
  }
}
