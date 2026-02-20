import { beforeEach, describe, expect, it } from "vitest";
import { useLocaleStore } from "./locale.store";

describe("locale store", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en" });
  });

  it("defaults to english", () => {
    expect(useLocaleStore.getState().locale).toBe("en");
  });

  it("sets selected locale", () => {
    useLocaleStore.getState().setLocale("de");
    expect(useLocaleStore.getState().locale).toBe("de");
  });
});
