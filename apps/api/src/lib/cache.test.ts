import { beforeEach, describe, expect, it, vi } from "vitest";
import { appCache, getOrSetCache } from "./cache.js";

describe("getOrSetCache", () => {
  beforeEach(() => {
    appCache.clear();
    vi.useRealTimers();
  });

  it("returns cached value on subsequent calls", async () => {
    const producer = vi.fn(async () => ({ value: 42 }));

    const first = await getOrSetCache("k1", producer);
    const second = await getOrSetCache("k1", producer);

    expect(first).toEqual({ value: 42 });
    expect(second).toEqual({ value: 42 });
    expect(producer).toHaveBeenCalledTimes(1);
  });

  it("respects ttl expiration", async () => {
    const producer = vi
      .fn<() => Promise<{ version: number }>>()
      .mockResolvedValueOnce({ version: 1 })
      .mockResolvedValueOnce({ version: 2 });

    const first = await getOrSetCache("k2", producer, 1);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await getOrSetCache("k2", producer, 100);

    expect(first).toEqual({ version: 1 });
    expect(second).toEqual({ version: 2 });
    expect(producer).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent requests for the same key", async () => {
    const producer = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { ok: true };
    });

    const [first, second, third] = await Promise.all([
      getOrSetCache("k3", producer),
      getOrSetCache("k3", producer),
      getOrSetCache("k3", producer),
    ]);

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(third).toEqual({ ok: true });
    expect(producer).toHaveBeenCalledTimes(1);
  });
});
