const RGBA_REGEXP =
  /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/;

export class Color {
  public static isRGBA(str: string) {
    return RGBA_REGEXP.test(str);
  }

  public static resolveRGBAString(rgbaString: string) {
    const [, red, green, blue, alpha] = RGBA_REGEXP.exec(rgbaString);
    return {
      red: parseInt(red, 10),
      green: parseInt(green, 10),
      blue: parseInt(blue, 10),
      alpha: parseFloat(alpha) * 100,
    };
  }

  public static RGBtoHEX(red: number, green: number, blue: number) {
    red = Math.round(red);
    green = Math.round(green);
    blue = Math.round(blue);
    return (
      '#' +
      red.toString(16).padStart(2, '0') +
      green.toString(16).padStart(2, '0') +
      blue.toString(16).padStart(2, '0')
    ).toUpperCase();
  }

  public static HEXtoRGB(hex: string) {
    if (!hex) {
      return { red: 0, green: 0, blue: 0 };
    }

    if (hex.match(/^\#[A-Z0-9]{6}$/gi)) {
      return {
        red: parseInt(hex.substr(1, 2), 16),
        green: parseInt(hex.substr(3, 2), 16),
        blue: parseInt(hex.substr(5, 2), 16),
      };
    } else if (hex.match(/^\#[A-Z0-9]{3}$/gi)) {
      return {
        red: parseInt(hex.substr(1, 1).repeat(2), 16),
        green: parseInt(hex.substr(2, 1).repeat(2), 16),
        blue: parseInt(hex.substr(3, 1).repeat(2), 16),
      };
    } else {
      return { red: 0, green: 0, blue: 0 };
    }
  }

  public static HSBtoRGB(hue: number, saturation: number, brightness: number) {
    saturation /= 100;
    brightness /= 100;

    hue = (hue % 360) / 60;
    const c = brightness * saturation;
    const x = c * (1 - Math.abs((hue % 2) - 1));
    let r = brightness - c;
    let g = r;
    let b = r;

    hue = ~~hue;
    r += [c, x, 0, 0, x, c][hue];
    g += [x, c, c, x, 0, 0][hue];
    b += [0, 0, x, c, c, x][hue];

    return {
      red: Math.round(r * 255),
      green: Math.round(g * 255),
      blue: Math.round(b * 255),
    };
  }

  public static RGBtoHSB(red: number, green: number, blue: number) {
    red /= 255;
    green /= 255;
    blue /= 255;

    let brightness = Math.max(red, green, blue);
    const C = brightness - Math.min(red, green, blue);
    let hue =
      C === 0
        ? null
        : brightness === red
        ? (green - blue) / C
        : brightness === green
        ? (blue - red) / C + 2
        : (red - green) / C + 4;
    hue = ((hue + 360) % 6) * 60;
    let saturation = C === 0 ? 0 : C / brightness;

    saturation *= 100;
    brightness *= 100;
    return { hue: hue, saturation, brightness };
  }

  public static HEXtoHSB(hex: string) {
    const { red, green, blue } = Color.HEXtoRGB(hex);
    return Color.RGBtoHSB(red, green, blue);
  }

  public static HSBtoHEX(hue: number, saturation: number, brightness: number) {
    const { red, green, blue } = Color.HSBtoRGB(hue, saturation, brightness);
    return Color.RGBtoHEX(red, green, blue);
  }

  public static setBrightness(
    red: number,
    green: number,
    blue: number,
    Z: number,
  ) {
    if (Z < 0) {
      red = red - (red / 100) * -Z;
      green = green - (green / 100) * -Z;
      blue = blue - (blue / 100) * -Z;
    } else {
      red = ((255 - red) / 100) * Z + red;
      green = ((255 - green) / 100) * Z + green;
      blue = ((255 - blue) / 100) * Z + blue;
    }
    return { red, green, blue };
  }

  public static isLight(
    red: number,
    green: number,
    blue: number,
    threshold = 160,
  ) {
    return (
      Math.round((299 * red + 587 * green + 114 * blue) / 1000) > threshold
    );
  }

  public static adjustColorLevel(hex: string, level: number) {
    const numberOfRows = 20;
    const step = 100 / Math.ceil(numberOfRows / 2);
    const startVal = step * Math.floor(numberOfRows / 2);
    const { red, green, blue } = Color.HEXtoRGB(hex);
    level += 10;
    const E = Color.setBrightness(red, green, blue, startVal - level * step);
    return Color.RGBtoHEX(E.red, E.green, E.blue);
  }

  public static HSBtoHSL(hex: number, saturation: number, brightness: number) {
    saturation /= 100;
    brightness /= 100;

    let light = ((2 - saturation) * brightness) / 2;
    if (light && light < 1) {
      saturation =
        (saturation * brightness) / (light < 0.5 ? light * 2 : 2 - light * 2);
    }

    saturation *= 100;
    light *= 100;

    return { hex, saturation, light };
  }
}
