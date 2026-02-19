const BASE_URL = "https://pokeapi.co/api/v2";

export class PokeApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = "PokeApiError";
  }
}

export async function pokeApiGet<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new PokeApiError(
        `PokeAPI request failed: ${response.status}`,
        response.status,
        endpoint,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof PokeApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new PokeApiError("PokeAPI request timeout", 408, endpoint);
    }

    throw new PokeApiError("Unexpected PokeAPI error", 500, endpoint);
  } finally {
    clearTimeout(timeout);
  }
}
