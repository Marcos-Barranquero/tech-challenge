import type { SupportedLocale } from "@tech-challenge/shared";

export const messages: Record<SupportedLocale, Record<string, unknown>> = {
  en: {
    common: {
      languageSelector: "Language selector",
      shellColorSelector: "Shell color selector",
      theme: {
        purple: "Purple shell",
        red: "Red shell",
        yellow: "Yellow shell",
        blue: "Blue shell",
      },
    },
    search: {
      label: "Search Pokemon and evolutions",
      placeholder: "Search (e.g. pikachu)...",
    },
    filters: {
      typeLabel: "Type",
      generationLabel: "Generation",
      typeAll: "Type: All",
      generationAll: "Generation: All",
      clear: "Clear",
    },
    empty: {
      title: "No results found",
      subtitle: "Try another name or adjust your filters.",
    },
    detail: {
      back: "Back",
      funFact: "Fun Fact",
      loadingFunFact: "Loading AI fun fact...",
      unavailableFunFact: "AI fun fact unavailable right now.",
      generating: "Generating...",
      another: "Another",
      stats: "Stats",
      evolutions: "Evolutions",
      generationShort: "Gen",
    },
  },
  es: {
    common: {
      languageSelector: "Selector de idioma",
      shellColorSelector: "Selector de color de carcasa",
      theme: {
        purple: "Carcasa morada",
        red: "Carcasa roja",
        yellow: "Carcasa amarilla",
        blue: "Carcasa azul",
      },
    },
    search: {
      label: "Buscar Pokemon y evoluciones",
      placeholder: "Buscar (ej. pikachu)...",
    },
    filters: {
      typeLabel: "Tipo",
      generationLabel: "Generacion",
      typeAll: "Tipo: Todos",
      generationAll: "Generacion: Todas",
      clear: "Limpiar",
    },
    empty: {
      title: "Sin resultados",
      subtitle: "Prueba otro nombre o ajusta los filtros.",
    },
    detail: {
      back: "Volver",
      funFact: "Dato Curioso",
      loadingFunFact: "Cargando dato curioso con IA...",
      unavailableFunFact: "Dato curioso no disponible ahora.",
      generating: "Generando...",
      another: "Otro",
      stats: "Estadisticas",
      evolutions: "Evoluciones",
      generationShort: "Gen",
    },
  },
  it: {
    common: {
      languageSelector: "Selettore lingua",
      shellColorSelector: "Selettore colore scocca",
      theme: {
        purple: "Scocca viola",
        red: "Scocca rossa",
        yellow: "Scocca gialla",
        blue: "Scocca blu",
      },
    },
    search: {
      label: "Cerca Pokemon ed evoluzioni",
      placeholder: "Cerca (es. pikachu)...",
    },
    filters: {
      typeLabel: "Tipo",
      generationLabel: "Generazione",
      typeAll: "Tipo: Tutti",
      generationAll: "Generazione: Tutte",
      clear: "Pulisci",
    },
    empty: {
      title: "Nessun risultato",
      subtitle: "Prova un altro nome o modifica i filtri.",
    },
    detail: {
      back: "Indietro",
      funFact: "Curiosita",
      loadingFunFact: "Caricamento curiosita IA...",
      unavailableFunFact: "Curiosita non disponibile ora.",
      generating: "Generazione...",
      another: "Un altro",
      stats: "Statistiche",
      evolutions: "Evoluzioni",
      generationShort: "Gen",
    },
  },
  pt: {
    common: {
      languageSelector: "Seletor de idioma",
      shellColorSelector: "Seletor de cor da carcaça",
      theme: {
        purple: "Carcaça roxa",
        red: "Carcaça vermelha",
        yellow: "Carcaça amarela",
        blue: "Carcaça azul",
      },
    },
    search: {
      label: "Buscar Pokemon e evolucoes",
      placeholder: "Buscar (ex. pikachu)...",
    },
    filters: {
      typeLabel: "Tipo",
      generationLabel: "Geracao",
      typeAll: "Tipo: Todos",
      generationAll: "Geracao: Todas",
      clear: "Limpar",
    },
    empty: {
      title: "Sem resultados",
      subtitle: "Tente outro nome ou ajuste os filtros.",
    },
    detail: {
      back: "Voltar",
      funFact: "Curiosidade",
      loadingFunFact: "Carregando curiosidade com IA...",
      unavailableFunFact: "Curiosidade indisponivel agora.",
      generating: "Gerando...",
      another: "Outra",
      stats: "Estatisticas",
      evolutions: "Evolucoes",
      generationShort: "Gen",
    },
  },
  de: {
    common: {
      languageSelector: "Sprachauswahl",
      shellColorSelector: "Gehausefarbwahl",
      theme: {
        purple: "Lila Gehause",
        red: "Rotes Gehause",
        yellow: "Gelbes Gehause",
        blue: "Blaues Gehause",
      },
    },
    search: {
      label: "Pokemon und Entwicklungen suchen",
      placeholder: "Suchen (z. B. pikachu)...",
    },
    filters: {
      typeLabel: "Typ",
      generationLabel: "Generation",
      typeAll: "Typ: Alle",
      generationAll: "Generation: Alle",
      clear: "Leeren",
    },
    empty: {
      title: "Keine Ergebnisse",
      subtitle: "Versuche einen anderen Namen oder passe die Filter an.",
    },
    detail: {
      back: "Zuruck",
      funFact: "Fun Fact",
      loadingFunFact: "KI-Fun-Fact wird geladen...",
      unavailableFunFact: "Fun Fact ist gerade nicht verfugbar.",
      generating: "Wird erzeugt...",
      another: "Noch einer",
      stats: "Stats",
      evolutions: "Entwicklungen",
      generationShort: "Gen",
    },
  },
};
