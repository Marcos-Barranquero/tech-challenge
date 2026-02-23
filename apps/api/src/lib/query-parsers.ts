export function parseTypeList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const fromArray = value
      .flatMap((entry) => (typeof entry === "string" ? entry.split(",") : []))
      .map((entry) => entry.trim())
      .filter(Boolean);
    return fromArray.length > 0 ? fromArray : undefined;
  }
  if (typeof value === "string") {
    const fromCsv = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    return fromCsv.length > 0 ? fromCsv : undefined;
  }
  return undefined;
}
