export function overflowText(text: string, max: number, suffix = '...') {
  if (text.length > max) {
    if (max <= suffix.length) {
      return text.slice(0, max) as any;
    } else {
      return `${text.slice(0, max - suffix.length)}${suffix}` as any;
    }
  }

  return text;
}
