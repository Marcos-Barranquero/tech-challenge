import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { useLocaleStore } from "./locale.store";

describe("locale store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useLocaleStore.persist.clearStorage();
    useLocaleStore.setState(useLocaleStore.getInitialState(), true);
  });

  it("defaults to english", () => {
    expect(useLocaleStore.getState().locale).toBe(DEFAULT_LOCALE);
  });

  it("sets selected locale", () => {
    useLocaleStore.getState().setLocale("de");
    expect(useLocaleStore.getState().locale).toBe("de");
  });
});
