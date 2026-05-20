"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Table } from "lucide-react";
import { type GetLeaguesQuery } from "@/lib/apollo/generated/graphql";
import { LeagueCard } from "@/components/cards/league-card";
import {
  LeagueFilterControls,
  EMPTY_LEAGUE_FILTERS,
  type LeagueFilters,
} from "@/components/templates/leagues/league-filter-controls";
import { type GameOption } from "@/components/ui/game-filter-combobox";

type LeagueNode = GetLeaguesQuery["leagues"]["nodes"][number];

type LeaguesListingTranslations = {
  filterToggle: string;
  clearFilters: string;
  sortLabel: string;
  statusLabel: string;
  systemLabel: string;
  gameLabel: string;
  gamePlaceholder: string;
  noGamesFound: string;
  noLeaguesTitle: string;
  noLeaguesDescription: string;
  sortRecent: string;
  sortAlphabetical: string;
  statusActive: string;
  statusRegistration: string;
  statusDraft: string;
  statusFinished: string;
  statusCancelled: string;
  systemElo: string;
  systemPoints: string;
  searchPlaceholder: string;
};

type LeaguesListingProps = {
  leagues: LeagueNode[];
  games: GameOption[];
  translations: LeaguesListingTranslations;
  initialFilters?: Partial<LeagueFilters>;
  header: ReactNode;
};

function toInitialFilters(initial?: Partial<LeagueFilters>): LeagueFilters {
  return {
    ...EMPTY_LEAGUE_FILTERS,
    search: initial?.search ?? "",
    sort: initial?.sort ?? "",
    game: initial?.game ?? "",
    status: initial?.status ?? "",
    system: initial?.system ?? "",
  };
}

function filterLeagues(leagues: LeagueNode[], filters: LeagueFilters) {
  let result = leagues;

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (league) =>
        league.event?.name?.toLowerCase().includes(query) ||
        league.event?.game?.name?.toLowerCase().includes(query),
    );
  }

  if (filters.game) {
    result = result.filter(
      (league) => league.event?.game?.slug === filters.game,
    );
  }

  if (filters.status) {
    result = result.filter((league) => league.event?.status === filters.status);
  }

  if (filters.system) {
    result = result.filter(
      (league) => league.classificationSystem === filters.system,
    );
  }

  if (filters.sort === "name") {
    result = [...result].sort((a, b) =>
      (a.event?.name ?? "").localeCompare(b.event?.name ?? ""),
    );
  }

  return result;
}

export function LeaguesListing({
  leagues,
  games,
  translations,
  initialFilters,
  header,
}: LeaguesListingProps) {
  const [filters, setFilters] = useState(() =>
    toInitialFilters(initialFilters),
  );

  const filteredLeagues = useMemo(
    () => filterLeagues(leagues, filters),
    [leagues, filters],
  );

  function patchFilters(patch: Partial<LeagueFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  const filterTranslations = {
    filterToggle: translations.filterToggle,
    clearFilters: translations.clearFilters,
    sortLabel: translations.sortLabel,
    statusLabel: translations.statusLabel,
    systemLabel: translations.systemLabel,
    gameLabel: translations.gameLabel,
    gamePlaceholder: translations.gamePlaceholder,
    noGamesFound: translations.noGamesFound,
    sortRecent: translations.sortRecent,
    sortAlphabetical: translations.sortAlphabetical,
    statusActive: translations.statusActive,
    statusRegistration: translations.statusRegistration,
    statusDraft: translations.statusDraft,
    statusFinished: translations.statusFinished,
    statusCancelled: translations.statusCancelled,
    systemElo: translations.systemElo,
    systemPoints: translations.systemPoints,
  };

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-start gap-6">{header}</div>

        <div className="w-full lg:max-w-3xl">
          <LeagueFilterControls
            filters={filters}
            onFiltersChange={patchFilters}
            games={games}
            searchPlaceholder={translations.searchPlaceholder}
            translations={filterTranslations}
          />
        </div>
      </div>

      <div className="border-b border-white/5" />

      <div className="flex flex-col gap-6">
        {filteredLeagues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="glass-panel mb-6 flex size-20 items-center justify-center rounded-2xl">
              <Table className="text-muted size-10" />
            </div>
            <h3 className="text-xl font-semibold">
              {translations.noLeaguesTitle}
            </h3>
            <p className="text-muted mt-2 max-w-sm text-sm">
              {translations.noLeaguesDescription}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLeagues.map((league) => (
              <LeagueCard
                key={league.eventId}
                league={league}
                game={league.event?.game?.slug ?? ""}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
