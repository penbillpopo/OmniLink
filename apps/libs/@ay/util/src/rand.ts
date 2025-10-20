let randomBytes: typeof import('crypto').randomBytes | undefined;
export class RandomGenerator {
  private static isNode: boolean =
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

  public static random(): number {
    let r = 0;

    if (this.isNode) {
      r = randomBytes(4).readUInt32LE() / 0x100000000; // 生成随机数并归一化
    } else {
      const crypto =
        window.crypto ||
        window['webkitCrypto'] ||
        window['mozCrypto'] ||
        window['oCrypto'] ||
        window['msCrypto'];
      const randomBuffer: Uint32Array = new Uint32Array(1);

      crypto.getRandomValues(randomBuffer); // 填充随机值
      r = randomBuffer[0] / (0xffffffff + 1); // 归一化
    }

    return r;
  }

  public static randomInt(max: number): number;
  public static randomInt(min: number, max: number): number;
  public static randomInt(arg1: number, arg2?: number): number {
    let min: number;
    let max: number;

    if (arg2 !== undefined) {
      min = arg1;
      max = arg2;
    } else {
      min = 0;
      max = arg1;
    }

    const r = Math.floor(this.random() * (max - min) + min); // 计算随机整数
    return r;
  }
}
