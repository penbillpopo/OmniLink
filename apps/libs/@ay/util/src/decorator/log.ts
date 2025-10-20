/**
 * 顯示函示執行過程、結果、時間
 * @export
 * @param {any} target
 * @param {any} key
 * @param {any} descriptor
 */
export function log(
  target: any,
  key: PropertyKey,
  descriptor: PropertyDescriptor,
) {
  const func = descriptor.value;
  descriptor.value = (...params: any) => {
    const start = Date.now();
    const result = func.apply(this, [...params]);
    const end = Date.now();
    const spend = end - start;
    console.log(
      `${target.name}.${key.toString()}(${params}) = ${result} (${spend}ms)`,
    );
    return result;
  };
  return descriptor;
}
