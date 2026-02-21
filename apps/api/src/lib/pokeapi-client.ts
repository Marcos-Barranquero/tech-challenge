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

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function getRequestTimeoutMs(): number {
  return Math.max(250, Number(process.env.POKEAPI_REQUEST_TIMEOUT_MS ?? 8000));
}

function getMaxRetries(): number {
  return Math.max(0, Number(process.env.POKEAPI_MAX_RETRIES ?? 2));
}

function getRetryBaseDelayMs(): number {
  return Math.max(0, Number(process.env.POKEAPI_RETRY_BASE_DELAY_MS ?? 250));
}

function calculateBackoffDelay(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** attempt;
  const jitter = Math.random() * baseDelayMs;
  return Math.round(exponential + jitter);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pokeApiGet<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const maxRetries = getMaxRetries();
  const timeoutMs = getRequestTimeoutMs();
  const baseDelayMs = getRetryBaseDelayMs();

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (attempt < maxRetries && shouldRetryStatus(response.status)) {
          await sleep(calculateBackoffDelay(attempt, baseDelayMs));
          continue;
        }

        throw new PokeApiError(
          `PokeAPI request failed: ${response.status}`,
          response.status,
          endpoint,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      const canRetry = attempt < maxRetries;

      if (error instanceof PokeApiError) {
        if (canRetry && shouldRetryStatus(error.status ?? 500)) {
          await sleep(calculateBackoffDelay(attempt, baseDelayMs));
          continue;
        }
        throw error;
      }

      if (isAbortError(error)) {
        if (canRetry) {
          await sleep(calculateBackoffDelay(attempt, baseDelayMs));
          continue;
        }
        throw new PokeApiError("PokeAPI request timeout", 408, endpoint);
      }

      if (canRetry) {
        await sleep(calculateBackoffDelay(attempt, baseDelayMs));
        continue;
      }

      throw new PokeApiError("Unexpected PokeAPI error", 500, endpoint);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new PokeApiError("Unexpected PokeAPI error", 500, endpoint);
}
