import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PokeApiError, pokeApiGet } from "./pokeapi-client.js";

describe("pokeApiGet", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.POKEAPI_MAX_RETRIES = "2";
    process.env.POKEAPI_RETRY_BASE_DELAY_MS = "1";
    process.env.POKEAPI_REQUEST_TIMEOUT_MS = "500";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.POKEAPI_MAX_RETRIES;
    delete process.env.POKEAPI_RETRY_BASE_DELAY_MS;
    delete process.env.POKEAPI_REQUEST_TIMEOUT_MS;
  });

  it("returns parsed payload when request succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ name: "bulbasaur" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const result = await pokeApiGet<{ name: string }>("/pokemon/1");

    expect(result).toEqual({ name: "bulbasaur" });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("retries transient status codes and eventually succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<() => Promise<Response>>()
        .mockResolvedValueOnce(new Response("error", { status: 503 }))
        .mockResolvedValueOnce(new Response("error", { status: 429 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ name: "pikachu" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
    );

    const result = await pokeApiGet<{ name: string }>("/pokemon/25");

    expect(result).toEqual({ name: "pikachu" });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
  });

  it("throws PokeApiError when retries are exhausted", async () => {
    process.env.POKEAPI_MAX_RETRIES = "1";

    vi.stubGlobal(
      "fetch",
      vi
        .fn<() => Promise<Response>>()
        .mockResolvedValueOnce(new Response("error", { status: 503 }))
        .mockResolvedValueOnce(new Response("error", { status: 503 })),
    );

    await expect(pokeApiGet("/pokemon/1")).rejects.toBeInstanceOf(PokeApiError);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });
});
