"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Trophy } from "lucide-react";
import { type GetGamesQuery } from "@/lib/apollo/generated/graphql";
import { GameCard } from "@/components/cards/game-card";
import { LocalSearchInput } from "@/components/ui/local-search-input";
import { cn } from "@/lib/utils/helpers";
import { buttonVariants } from "@/components/ui/button";

type GameNode = NonNullable<GetGamesQuery["games"]["nodes"][number]>;

export type GameListItem = GameNode & {
  leagueCount: number;
  playerCount: number;
  tourneyCount: number;
  postCount: number;
};

export type GamesListingTranslations = {
  searchPlaceholder: string;
  sortPopular: string;
  sortAlphabetical: string;
  cardFallbackDescription: string;
  pendingBadge: string;
  noGamesFound: string;
  noGamesTitle: string;
  noGamesFoundDescription: string;
  noGamesDescription: string;
  clearSearch: string;
};

type GamesListingProps = {
  games: GameListItem[];
  translations: GamesListingTranslations;
  initialSearch?: string;
  header: ReactNode;
};

function matchesSearch(game: GameListItem, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    game.name.toLowerCase().includes(normalized) ||
    game.slug.toLowerCase().includes(normalized)
  );
}

export function GamesListing({
  games,
  translations,
  initialSearch = "",
  header,
}: GamesListingProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<"popular" | "name">("popular");

  const filteredGames = useMemo(() => {
    let list = games.filter((game) => matchesSearch(game, search));
    if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [games, search, sort]);

  const showEmptySearch =
    filteredGames.length === 0 && search.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6">{header}</div>

        <div className="flex w-full flex-col gap-4 lg:max-w-md lg:items-end">
          <LocalSearchInput
            value={search}
            onChange={setSearch}
            placeholder={translations.searchPlaceholder}
            className="w-full"
          />

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => setSort("popular")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
                sort === "popular"
                  ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_color-mix(in_srgb,var(--gold)_15%,transparent)]"
                  : "border-border text-muted hover:border-gold/30 hover:text-foreground",
              )}
            >
              <Trophy className="size-4" />
              {translations.sortPopular}
            </button>
            <button
              type="button"
              onClick={() => setSort("name")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200",
                sort === "name"
                  ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_color-mix(in_srgb,var(--gold)_15%,transparent)]"
                  : "border-border text-muted hover:border-gold/30 hover:text-foreground",
              )}
            >
              {translations.sortAlphabetical}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-white/5" />

      {filteredGames.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              fallbackDescription={translations.cardFallbackDescription}
              pendingLabel={translations.pendingBadge}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="glass-panel mb-6 flex size-20 items-center justify-center rounded-2xl">
            <Trophy className="text-muted size-10" />
          </div>
          <h3 className="text-xl font-semibold">
            {showEmptySearch
              ? translations.noGamesFound
              : translations.noGamesTitle}
          </h3>
          <p className="text-muted mt-2 max-w-sm">
            {showEmptySearch
              ? translations.noGamesFoundDescription
              : translations.noGamesDescription}
          </p>
          {showEmptySearch && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className={cn(
                buttonVariants({ intent: "secondary", size: "sm" }),
                "mt-6",
              )}
            >
              {translations.clearSearch}
            </button>
          )}
        </div>
      )}
    </>
  );
}
