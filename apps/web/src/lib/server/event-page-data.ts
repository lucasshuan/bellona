import "server-only";

import { unstable_cache } from "next/cache";

import type {
  GetEventEntriesQuery,
  GetEventStaffQuery,
  GetLeagueQuery,
} from "@/lib/apollo/generated/graphql";
import {
  GET_EVENT_ENTRIES,
  GET_EVENT_STAFF,
  GET_LEAGUE,
} from "@/lib/apollo/queries/leagues";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";

export const getCachedLeague = (gameSlug: string, eventSlug: string) =>
  unstable_cache(
    () =>
      safeServerQuery<GetLeagueQuery>({
        query: GET_LEAGUE,
        variables: { gameSlug, leagueSlug: eventSlug },
        token: null,
      }),
    ["event-league", gameSlug, eventSlug],
    { tags: ["events"], revalidate: 300 },
  )();

export const getCachedEventEntries = (eventId: string, take = 1000, skip = 0) =>
  unstable_cache(
    () =>
      safeServerQuery<GetEventEntriesQuery>({
        query: GET_EVENT_ENTRIES,
        variables: { eventId, take, skip },
        token: null,
      }),
    ["event-entries", eventId, String(take), String(skip)],
    { tags: ["events"], revalidate: 300 },
  )();

export const getCachedEventStaff = (eventId: string) =>
  unstable_cache(
    () =>
      safeServerQuery<GetEventStaffQuery>({
        query: GET_EVENT_STAFF,
        variables: { eventId },
        token: null,
      }),
    ["event-staff", eventId],
    { tags: ["events"], revalidate: 300 },
  )();
