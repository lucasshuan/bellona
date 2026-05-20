import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { GET_LEAGUES } from "@/lib/apollo/queries/leagues";
import { GET_GAMES_SIMPLE } from "@/lib/apollo/queries/games";
import {
  type GetLeaguesQuery,
  type GetGamesSimpleQuery,
} from "@/lib/apollo/generated/graphql";
import { SectionHeader } from "@/components/ui/section-header";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { getServerAuthSession } from "@/auth";
import { AddEventButton } from "@/components/triggers/game/add-event-button";
import { type GameOption } from "@/components/ui/game-filter-combobox";
import { LeaguesListing } from "@/components/templates/leagues/leagues-listing";

const getCachedLeagues = unstable_cache(
  async (token: string | null) =>
    safeServerQuery<GetLeaguesQuery>({
      token,
      query: GET_LEAGUES,
      variables: { pagination: { skip: 0, take: 50 } },
    }),
  ["leagues-list"],
  { tags: ["events"], revalidate: 300 },
);

const getCachedGames = unstable_cache(
  async (token: string | null) =>
    safeServerQuery<GetGamesSimpleQuery>({
      token,
      query: GET_GAMES_SIMPLE,
      variables: { pagination: { skip: 0, take: 200 } },
    }),
  ["games-simple-list"],
  { tags: ["games"], revalidate: 300 },
);

type LeaguesPageProps = {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    game?: string;
    status?: string;
    system?: string;
  }>;
};

export default async function LeaguesPage({ searchParams }: LeaguesPageProps) {
  const t = await getTranslations("LeaguesPage");
  const params = await searchParams;
  const session = await getServerAuthSession();
  const token = session?.user?.accessToken ?? null;
  const [data, gamesData] = await Promise.all([
    getCachedLeagues(token),
    getCachedGames(token),
  ]);
  const leagues = data?.leagues?.nodes ?? [];
  const games: GameOption[] = (gamesData?.games?.nodes ?? []).map((g) => ({
    slug: g.slug,
    name: g.name,
    thumbnailImagePath: g.thumbnailImagePath,
  }));

  const translations = {
    filterToggle: t("filterToggle"),
    clearFilters: t("clearFilters"),
    sortLabel: t("sortLabel"),
    statusLabel: t("statusLabel"),
    systemLabel: t("systemLabel"),
    gameLabel: t("gameLabel"),
    gamePlaceholder: t("gamePlaceholder"),
    noGamesFound: t("noGamesFound"),
    noLeaguesTitle: t("noLeaguesTitle"),
    noLeaguesDescription: t("noLeaguesDescription"),
    sortRecent: t("sortRecent"),
    sortAlphabetical: t("sortAlphabetical"),
    statusActive: t("statusActive"),
    statusRegistration: t("statusRegistration"),
    statusDraft: t("statusDraft"),
    statusFinished: t("statusFinished"),
    statusCancelled: t("statusCancelled"),
    systemElo: t("systemElo"),
    systemPoints: t("systemPoints"),
    searchPlaceholder: t("searchPlaceholder"),
  };

  return (
    <main className="mx-auto flex w-full flex-col gap-8 px-6 pt-20 pb-12">
      <LeaguesListing
        leagues={leagues}
        games={games}
        translations={translations}
        initialFilters={{
          search: params.search,
          sort: params.sort,
          game: params.game,
          status: params.status,
          system: params.system,
        }}
        header={
          <>
            <SectionHeader title={t("title")} description={t("description")} />
            <div>
              <AddEventButton gameId="" variant="header" />
            </div>
          </>
        }
      />
    </main>
  );
}
