export function getIdFromResourceUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Could not parse id from URL: ${url}`);
  }

  return Number(match[1]);
}

export function officialArtwork(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
