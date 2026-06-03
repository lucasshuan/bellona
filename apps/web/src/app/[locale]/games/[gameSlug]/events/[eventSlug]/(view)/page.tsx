import { notFound } from "next/navigation";

import { EventOverviewSection } from "@/components/templates/events/event-overview-section";
import {
  getCachedEventEntries,
  getCachedEventStaff,
  getCachedLeague,
} from "@/lib/server/event-page-data";

const EMPTY_ENTRIES = { nodes: [], totalCount: 0, hasNextPage: false };

export default async function EventPage({
  params,
}: {
  params: Promise<{ gameSlug: string; eventSlug: string }>;
}) {
  const { gameSlug, eventSlug } = await params;
  const leagueData = await getCachedLeague(gameSlug, eventSlug);

  if (!leagueData?.league?.event) {
    notFound();
  }

  const eventId = leagueData.league.event.id;
  const [entriesData, staffData] = await Promise.all([
    getCachedEventEntries(eventId),
    getCachedEventStaff(eventId),
  ]);

  const entries = entriesData?.eventEntries ?? EMPTY_ENTRIES;
  const staff = staffData?.eventStaff ?? [];

  return (
    <EventOverviewSection
      league={leagueData.league}
      entries={entries}
      staff={staff}
    />
  );
}
