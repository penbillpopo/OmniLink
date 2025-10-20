export function safeJsonParse(data: string, defaultValue: any = null) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}
