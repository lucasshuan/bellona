"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

import { Link } from "@/i18n/routing";
import { cdnUrl } from "@/lib/utils/cdn";
import { cn } from "@/lib/utils/helpers";
import type { GetEventEntriesQuery } from "@/lib/apollo/generated/graphql";

type EntryNode = GetEventEntriesQuery["eventEntries"]["nodes"][number];

interface LeagueLeaderboardPreviewTableProps {
  entries: EntryNode[];
  classificationSystem: string;
  allowDraw: boolean;
}

function getStats(entry: EntryNode): Record<string, unknown> {
  return (entry.stats as Record<string, unknown> | null) ?? {};
}

function getEntryPoints(entry: EntryNode, system: string): number | null {
  const s = getStats(entry);
  if (system === "ELO") {
    if (typeof s.currentElo === "number") return s.currentElo;
    if (typeof s.elo === "number") return s.elo;
    return null;
  }
  return typeof s.points === "number" ? s.points : null;
}

function getPointsDelta(entry: EntryNode, system: string): number | null {
  const s = getStats(entry);
  const raw =
    system === "ELO"
      ? (s.eloDelta ?? s.elo_delta ?? s.pointsDelta ?? s.pointsChange)
      : (s.pointsDelta ?? s.points_delta ?? s.pointsChange);
  return typeof raw === "number" ? raw : null;
}

function getStatsWins(entry: EntryNode): number | null {
  const s = getStats(entry);
  const raw = s.wins ?? s.victories ?? s.won;
  return typeof raw === "number" ? raw : null;
}

function getLosses(entry: EntryNode): number | null {
  const s = getStats(entry);
  const raw = s.losses ?? s.defeats ?? s.lost;
  return typeof raw === "number" ? raw : null;
}

function getDraws(entry: EntryNode): number | null {
  const s = getStats(entry);
  const raw = s.draws ?? s.ties ?? s.drawn;
  return typeof raw === "number" ? raw : null;
}

const RANK_BADGE: Record<number, string> = {
  1: "border-gold bg-linear-to-br from-[#f0cf7a] to-gold text-background",
  2: "border-secondary/40 bg-secondary/14 text-secondary",
  3: "border-match-near-draw/35 bg-match-near-draw/12 text-match-near-draw",
};

export function LeagueLeaderboardPreviewTable({
  entries,
  classificationSystem,
  allowDraw,
}: LeagueLeaderboardPreviewTableProps) {
  const isElo = classificationSystem === "ELO";
  const ptsLabel = isElo ? "Elo" : "Pts";

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Trophy className="text-muted/20 mb-3 size-8" />
        <p className="text-muted text-sm">—</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-muted/42 w-[34px] px-3 pb-3 text-left font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
              #
            </th>
            <th className="text-muted/42 px-3 pb-3 text-left font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
              Player
            </th>
            <th className="text-muted/42 px-3 pb-3 text-right font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
              W–L
            </th>
            <th className="text-muted/42 px-3 pb-3 text-right font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
              Δ
            </th>
            <th className="text-muted/42 px-3 pb-3 text-right font-mono text-[10px] font-medium tracking-[0.12em] uppercase">
              {ptsLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1;
            const wins = getStatsWins(entry);
            const losses = getLosses(entry);
            const draws = getDraws(entry);
            const points = getEntryPoints(entry, classificationSystem);
            const delta = getPointsDelta(entry, classificationSystem);
            const username = entry.user?.username;
            const profileHref = entry.user
              ? `/profile/${entry.user.username ?? entry.user.id}`
              : null;

            const wlLabel =
              wins != null && losses != null
                ? allowDraw && draws != null
                  ? `${wins}–${losses}–${draws}`
                  : `${wins}–${losses}`
                : "—";

            return (
              <tr
                key={entry.id}
                className="border-border/70 hover:bg-gold-dim/8 border-t transition-colors"
              >
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "font-display inline-grid size-[26px] place-items-center rounded-lg border text-[13px] font-bold",
                      RANK_BADGE[rank] ?? "border-border text-secondary/70",
                    )}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="group flex min-w-0 items-center gap-2.5"
                    >
                      <PlayerAvatar entry={entry} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
                          {entry.displayName}
                        </div>
                        {username ? (
                          <div className="text-muted/42 truncate font-mono text-[10.5px]">
                            @{username}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PlayerAvatar entry={entry} />
                      <div className="truncate text-sm font-semibold text-white/90">
                        {entry.displayName}
                      </div>
                    </div>
                  )}
                </td>
                <td className="text-muted/55 px-3 py-3 text-right font-mono text-xs tabular-nums">
                  {wlLabel}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[11.5px] font-semibold tabular-nums">
                  {delta == null || delta === 0 ? (
                    <span className="text-white/20">—</span>
                  ) : (
                    <span
                      className={cn(
                        delta > 0 ? "text-match-dominant" : "text-danger",
                      )}
                    >
                      {delta > 0 ? "+" : ""}
                      {isElo ? Math.round(delta) : delta}
                    </span>
                  )}
                </td>
                <td className="text-secondary px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums">
                  {points != null
                    ? isElo
                      ? Math.round(points)
                      : points.toLocaleString()
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlayerAvatar({ entry }: { entry: EntryNode }) {
  const imagePath = entry.user?.imagePath ?? entry.imagePath;

  return (
    <div className="border-border relative size-7 shrink-0 overflow-hidden rounded-full border bg-white/10">
      {imagePath ? (
        <Image
          src={cdnUrl(imagePath)!}
          alt={entry.displayName}
          fill
          className="object-cover"
          sizes="28px"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-[9px] font-bold text-white/50">
          {entry.displayName.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
