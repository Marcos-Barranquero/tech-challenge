import {
  GenerationSchema,
  ListPokemonOutputSchema,
  PokemonTypeSchema,
  type ListPokemonInfiniteInput,
  type ListPokemonInfiniteOutput,
  type PokemonType,
} from "@tech-challenge/shared";
import { PokemonExplorer } from "@/features/pokemon/components/pokemon-explorer";

function resolveApiBaseUrl() {
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (internal) {
    return internal;
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl) {
    if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
      return publicUrl;
    }
    return `https://${publicUrl}`;
  }

  return "http://localhost:4000";
}

type HomePageSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === "string" ? value : undefined;
}

function parseSelectedTypes(searchParams: HomePageSearchParams): PokemonType[] {
  const rawTypes = firstParam(searchParams.types);
  const rawLegacyType = firstParam(searchParams.type);

  const fromCsv =
    rawTypes
      ?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

  const candidates = rawLegacyType ? [rawLegacyType, ...fromCsv] : fromCsv;
  const unique = new Set<PokemonType>();

  for (const candidate of candidates) {
    const parsed = PokemonTypeSchema.safeParse(candidate);
    if (parsed.success) {
      unique.add(parsed.data);
    }
  }

  return Array.from(unique);
}

function buildInitialListInput(searchParams: HomePageSearchParams): Pick<
  ListPokemonInfiniteInput,
  "search" | "types" | "type" | "generation" | "limit" | "sort"
> | null {
  const rawSearch = firstParam(searchParams.search)?.trim() ?? "";
  if (rawSearch.length > 0) {
    // Search mode uses a different query path in the client; skip SSR list hydration.
    return null;
  }

  const selectedTypes = parseSelectedTypes(searchParams);
  const maybeGeneration = firstParam(searchParams.generation);
  const generationParsed = maybeGeneration
    ? GenerationSchema.safeParse(maybeGeneration)
    : { success: false as const };

  return {
    search: "",
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    type: selectedTypes[0],
    generation: generationParsed.success ? generationParsed.data : undefined,
    limit: 60,
    sort: "id-asc",
  };
}

async function getInitialListPage(
  input: Pick<ListPokemonInfiniteInput, "search" | "types" | "type" | "generation" | "limit" | "sort">,
): Promise<ListPokemonInfiniteOutput | null> {
  const apiBaseUrl = resolveApiBaseUrl();
  const url = new URL("/api/v1/pokemon", apiBaseUrl);
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", String(input.limit));
  url.searchParams.set("sort", input.sort);

  if (input.generation) {
    url.searchParams.set("generation", input.generation);
  }

  if (input.types && input.types.length > 0) {
    url.searchParams.set("types", input.types.join(","));
    // legacy compatibility
    url.searchParams.set("type", input.types[0] ?? "");
  } else if (input.type) {
    url.searchParams.set("type", input.type);
  }

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = ListPokemonOutputSchema.parse(await response.json());
    return {
      ...payload,
      nextCursor: payload.hasNextPage ? payload.page + 1 : null,
    };
  } catch {
    return null;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomePageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialListInput = buildInitialListInput(resolvedSearchParams);
  const initialListPage = initialListInput
    ? await getInitialListPage(initialListInput)
    : null;

  return <PokemonExplorer initialListPage={initialListPage} initialListInput={initialListInput} />;
}
