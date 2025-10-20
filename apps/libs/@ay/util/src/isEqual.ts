/**
 * 檢查A與B是否相同
 * @param {Object} A
 * @param {Object} B
 * @param {boolean} deep 深度檢測
 */
export function isEqual(A: Object, B: Object, deep: boolean) {
  if (Object.keys(A).length !== Object.keys(B).length) return false;
  for (const i in A) {
    if (deep && typeof A[i] == 'object') {
      // 不能合併，會有 !isSame 如果是 false 就會跑到 A[i] != B[i], 由於物件位置不一樣所以就會產生錯誤結果 false
      if (!isEqual(A[i], B[i], true)) return false;
    } else if (A[i] != B[i]) return false;
  }
  return true;
}
