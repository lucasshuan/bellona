import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { GET_GAMES } from "@/lib/apollo/queries/games";
import { GetGamesQuery } from "@/lib/apollo/generated/graphql";
import { SectionHeader } from "@/components/ui/section-header";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";
import { getServerAuthSession } from "@/auth";
import { AddGameButton } from "@/components/triggers/game/add-game-button";
import {
  GamesListing,
  type GameListItem,
} from "@/components/templates/games/games-listing";

const getCachedGames = unstable_cache(
  async (token: string | null) =>
    safeServerQuery<GetGamesQuery>({
      token,
      query: GET_GAMES,
      variables: { pagination: { skip: 0, take: 50 } },
    }),
  ["games-list"],
  { tags: ["games"], revalidate: 300 },
);

interface GamesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { search } = await searchParams;
  const t = await getTranslations("GamesPage");
  const session = await getServerAuthSession();
  const token = session?.user?.accessToken ?? null;
  const data = await getCachedGames(token);

  const games: GameListItem[] = (data?.games?.nodes ?? []).map((game) => ({
    ...game,
    leagueCount: game._count?.events || 0,
    playerCount: 0,
    tourneyCount: 0,
    postCount: 0,
  }));

  const translations = {
    searchPlaceholder: t("searchPlaceholder"),
    sortPopular: t("sortPopular"),
    sortAlphabetical: t("sortAlphabetical"),
    cardFallbackDescription: t("cardFallbackDescription"),
    pendingBadge: t("pendingBadge"),
    noGamesFound: t("noGamesFound"),
    noGamesTitle: t("noGamesTitle"),
    noGamesFoundDescription: t("noGamesFoundDescription"),
    noGamesDescription: t("noGamesDescription"),
    clearSearch: t("clearSearch"),
  };

  return (
    <main className="mx-auto flex w-full flex-col gap-8 px-6 pt-20 pb-12">
      <GamesListing
        games={games}
        translations={translations}
        initialSearch={search}
        header={
          <>
            <SectionHeader title={t("title")} description={t("description")} />
            <div>
              <AddGameButton />
            </div>
          </>
        }
      />
    </main>
  );
}
