import { describe, expect, it } from "vitest";
import { parseTypeList } from "./query-parsers.js";

describe("parseTypeList", () => {
  it("returns undefined for non-string and non-array values", () => {
    expect(parseTypeList(undefined)).toBeUndefined();
    expect(parseTypeList(null)).toBeUndefined();
    expect(parseTypeList(123)).toBeUndefined();
    expect(parseTypeList({})).toBeUndefined();
  });

  it("parses CSV string values", () => {
    expect(parseTypeList("water,fire")).toEqual(["water", "fire"]);
  });

  it("trims whitespace and removes empty entries from CSV string", () => {
    expect(parseTypeList(" water, , fire ,,  ")).toEqual(["water", "fire"]);
  });

  it("parses arrays with plain values and CSV values", () => {
    expect(parseTypeList(["water", "fire,electric"])).toEqual(["water", "fire", "electric"]);
  });

  it("ignores non-string values in arrays", () => {
    expect(parseTypeList(["water", 42, "", " fire "] as unknown[])).toEqual(["water", "fire"]);
  });

  it("returns undefined for empty parsed results", () => {
    expect(parseTypeList(" , , ")).toBeUndefined();
    expect(parseTypeList([])).toBeUndefined();
    expect(parseTypeList(["", "  "])).toBeUndefined();
  });
});
