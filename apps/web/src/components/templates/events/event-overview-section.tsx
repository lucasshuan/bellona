import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { LeagueLeaderboardPreviewTable } from "@/components/tables/league-leaderboard-preview-table";
import { GlowBorder } from "@/components/ui/glow-border";
import { SectionEyebrow, SectionHeader } from "@/components/ui/section-header";
import { UserChip } from "@/components/ui/user-chip";
import { Link } from "@/i18n/routing";
import type {
  GetEventEntriesQuery,
  GetEventStaffQuery,
  GetLeagueQuery,
} from "@/lib/apollo/generated/graphql";
import { cdnUrl } from "@/lib/utils/cdn";
import { formatDate, formatHoursDuration } from "@/lib/utils/date-utils";
import { cn } from "@/lib/utils/helpers";

type LeagueNode = NonNullable<GetLeagueQuery["league"]>;
type EntriesData = GetEventEntriesQuery["eventEntries"];
type StaffMember = GetEventStaffQuery["eventStaff"][number];

interface EventOverviewSectionProps {
  league: LeagueNode;
  entries: EntriesData;
  staff: StaffMember[];
}

const PROSE_CLASS =
  "prose prose-sm text-foreground/80 [&_em]:text-foreground/70 [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5";

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "text-warning",
  REGISTRATION: "text-primary",
  ACTIVE: "text-success",
  FINISHED: "text-white/40",
  CANCELLED: "text-danger",
};

type LeagueConfig = {
  initialElo?: number;
  kFactor?: number;
  inactivityThresholdHours?: number;
  finalsCut?: number;
};

function parseLeagueConfig(config: unknown): LeagueConfig {
  if (!config || typeof config !== "object") return {};
  return config as LeagueConfig;
}

function getStaffRole(
  member: StaffMember,
  t: Awaited<ReturnType<typeof getTranslations>>,
): { label: string; className: string } {
  if (member.isFullAccess) {
    return { label: t("staffRoleOrganizer"), className: "text-gold" };
  }
  if (member.capabilities.includes("MANAGE_MATCHES")) {
    return { label: t("staffRoleScorekeeper"), className: "text-muted/55" };
  }
  if (member.capabilities.includes("MANAGE_PARTICIPANTS")) {
    return { label: t("staffRoleModerator"), className: "text-steam" };
  }
  if (
    member.capabilities.includes("MANAGE_DETAILS") ||
    member.capabilities.includes("MANAGE_STAFF")
  ) {
    return { label: t("staffRoleOrganizer"), className: "text-gold" };
  }
  return { label: t("staffRoleStaff"), className: "text-muted/55" };
}

function LinkMore({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gold/80 hover:text-gold inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold whitespace-nowrap transition-all hover:gap-2.25"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

export async function EventOverviewSection({
  league,
  entries,
  staff,
}: EventOverviewSectionProps) {
  const t = await getTranslations("EventPage");
  const locale = await getLocale();
  const event = league.event!;
  const gameSlug = event.game.slug;
  const eventSlug = event.slug;
  const config = parseLeagueConfig(league.config);
  const eventThumbnailSrc =
    cdnUrl(event.thumbnailImagePath) ?? "/league-placeholder.webp";

  const aboutHtml = event.about || event.description || "";
  const aboutIsHtml = Boolean(event.about);
  const leaderboardHref = `/games/${gameSlug}/events/${eventSlug}/leaderboard`;
  const playersHref = `/games/${gameSlug}/events/${eventSlug}/players`;

  const formatCells = buildFormatCells(league, config, t);

  const topEntries = entries.nodes.slice(0, 5);
  const recentEntries = [...entries.nodes]
    .filter((entry) => entry.user)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const visibleRecent = recentEntries.slice(0, 5);
  const overflowCount = Math.max(
    0,
    recentEntries.length - visibleRecent.length,
  );

  const statusLabel =
    {
      DRAFT: t("statusDraft"),
      REGISTRATION: t("statusRegistration"),
      ACTIVE: t("statusActive"),
      FINISHED: t("statusFinished"),
      CANCELLED: t("statusCancelled"),
    }[event.status] ?? event.status;

  const classificationLabel =
    league.classificationSystem === "ELO"
      ? t("classificationElo")
      : t("classificationPoints");

  return (
    <section className="mx-auto w-full max-w-400 px-5 pt-5 pb-12 sm:px-6 lg:px-8">
      <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,1fr)_332px]">
        <div className="flex flex-col gap-[22px]">
          <AboutPanel
            aboutHtml={aboutHtml}
            aboutIsHtml={aboutIsHtml}
            formatCells={formatCells}
            t={t}
          />

          <div className="glass-panel rounded-3xl p-[22px]">
            <SectionHeader
              eyebrow={t("overviewStandingsEyebrow")}
              title={t("overviewStandingsTitle")}
              description={t("overviewStandingsDescription")}
              actions={
                <LinkMore href={leaderboardHref}>
                  {t("overviewFullLeaderboard")}
                </LinkMore>
              }
            />
            <LeagueLeaderboardPreviewTable
              entries={topEntries}
              classificationSystem={league.classificationSystem}
              allowDraw={league.allowDraw}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[72px]">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="relative aspect-[368/150] w-full overflow-hidden">
              <Image
                src={eventThumbnailSrc}
                alt={event.name}
                fill
                className="object-cover"
                sizes="332px"
              />
            </div>
            <div className="p-[18px]">
              <h3 className="font-display text-foreground mb-3 text-[16px] font-bold">
                {event.description || event.name}
              </h3>
              <dl className="space-y-2.25">
                <InfoRow label={t("formatLabel")} value={classificationLabel} />
                <InfoRow
                  label={t("overviewInfoStatus")}
                  value={statusLabel}
                  valueClassName={STATUS_COLOR[event.status] ?? "text-white/40"}
                />

                <Separator />

                {event.startDate ? (
                  <InfoRow
                    label={t("overviewInfoSeasonStart")}
                    value={formatDate(event.startDate, locale)}
                  />
                ) : null}
                {event.endDate ? (
                  <InfoRow
                    label={t("overviewInfoSeasonEnd")}
                    value={formatDate(event.endDate, locale)}
                  />
                ) : null}
                {(event.registrationStartDate || event.registrationEndDate) && (
                  <InfoRow
                    label={t("overviewInfoRegistration")}
                    value={formatRegistrationRange(event, t, locale)}
                  />
                )}

                <Separator />

                <InfoRow
                  label={t("overviewInfoParticipants")}
                  value={
                    event.maxParticipants != null
                      ? `${entries.totalCount} / ${event.maxParticipants}`
                      : String(entries.totalCount)
                  }
                />
                <InfoRow
                  label={t("overviewInfoCreated")}
                  value={formatDate(event.createdAt, locale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </dl>
            </div>
          </div>

          {staff.length > 0 ? (
            <div className="glass-panel rounded-3xl p-[22px]">
              <SectionEyebrow className="mb-3.5">
                {t("overviewStaffEyebrow")}
              </SectionEyebrow>
              <div className="flex flex-col gap-3">
                {staff.map((member) => {
                  if (!member.user) return null;
                  const role = getStaffRole(member, t);
                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="border-border relative size-[34px] shrink-0 overflow-hidden rounded-full border bg-white/10">
                        {member.user.imagePath ? (
                          <Image
                            src={cdnUrl(member.user.imagePath)!}
                            alt={member.user.name ?? member.user.username ?? ""}
                            fill
                            className="object-cover"
                            sizes="34px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] font-bold text-white/50">
                            {(member.user.name ?? member.user.username ?? "?")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-semibold">
                          {member.user.name ?? member.user.username}
                        </div>
                        <div
                          className={cn(
                            "font-mono text-[10px] tracking-[0.08em] uppercase",
                            role.className,
                          )}
                        >
                          {role.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {visibleRecent.length > 0 ? (
            <div className="glass-panel rounded-3xl p-[22px]">
              <div className="mb-3.5 flex items-end justify-between gap-3">
                <SectionEyebrow>{t("overviewRecentlyJoined")}</SectionEyebrow>
                <LinkMore href={playersHref}>
                  {t("overviewAllPlayers")}
                </LinkMore>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleRecent.map((entry) =>
                  entry.user ? (
                    <UserChip
                      key={entry.id}
                      user={entry.user}
                      className="rounded-full px-2.5 py-1.25 pl-1.5"
                    />
                  ) : null,
                )}
                {overflowCount > 0 ? (
                  <span className="border-border bg-background/40 inline-flex items-center rounded-full border px-2.5 py-1.25 text-xs font-semibold">
                    +{overflowCount}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {config.inactivityThresholdHours ? (
            <GlowBorder className="rounded-3xl">
              <div className="text-secondary/60 p-[16px_18px] font-mono text-[11px] leading-relaxed tracking-[0.04em]">
                <b className="text-gold font-semibold">
                  {"// "}
                  {t("overviewSeasonNote")}
                </b>
                <br />
                {t("overviewSeasonNoteBody", {
                  duration: formatHoursDuration(
                    config.inactivityThresholdHours,
                    locale,
                  ),
                })}
              </div>
            </GlowBorder>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function AboutPanel({
  aboutHtml,
  aboutIsHtml,
  formatCells,
  t,
}: {
  aboutHtml: string;
  aboutIsHtml: boolean;
  formatCells: Array<{ key: string; value: string }>;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  if (!aboutHtml && formatCells.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-[22px]">
      <SectionHeader
        eyebrow={t("overviewAboutEyebrow")}
        title={t("overviewAboutTitle")}
      />

      {aboutHtml ? (
        aboutIsHtml ? (
          <div
            className={PROSE_CLASS}
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        ) : (
          <p className="text-foreground/82 text-sm leading-7">{aboutHtml}</p>
        )
      ) : null}

      {formatCells.length > 0 ? (
        <>
          {aboutHtml ? <hr className="border-border my-[18px]" /> : null}
          <h4 className="font-display text-foreground mb-2 text-[15px] font-bold">
            {t("overviewFormatAtGlance")}
          </h4>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {formatCells.map((cell) => (
              <div
                key={cell.key}
                className="border-border bg-background/45 rounded-xl border px-3.5 py-3"
              >
                <div className="text-muted/45 font-mono text-[10px] tracking-[0.1em] uppercase">
                  {cell.key}
                </div>
                <div className="text-secondary mt-1 text-[15px] font-bold">
                  {cell.value}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted/50 shrink-0 text-[11.5px]">{label}</dt>
      <dd
        className={cn(
          "text-foreground/82 text-right text-[12.5px] font-semibold tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Separator() {
  return <div className="border-border my-1 h-px" />;
}

function formatRegistrationRange(
  event: NonNullable<LeagueNode["event"]>,
  t: Awaited<ReturnType<typeof getTranslations>>,
  locale: string,
) {
  const openLabel = event.registrationsEnabled
    ? t("registrationsOpen")
    : t("registrationsClosedShort");

  if (event.registrationEndDate) {
    return `${openLabel} · ${formatDate(event.registrationEndDate, locale, {
      day: "2-digit",
      month: "short",
    })}`;
  }

  return openLabel;
}

function buildFormatCells(
  league: LeagueNode,
  config: LeagueConfig,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  const cells: Array<{ key: string; value: string }> = [];

  if (league.classificationSystem === "ELO" && config.kFactor != null) {
    cells.push({
      key: t("overviewFormatRating"),
      value: `${t("classificationElo")} · K-${config.kFactor}`,
    });
  } else if (league.classificationSystem === "POINTS") {
    cells.push({
      key: t("overviewFormatRating"),
      value: t("classificationPoints"),
    });
  }

  if (league.allowedFormats.length > 0) {
    const formatLabels = league.allowedFormats.map((format) =>
      t(`matchFormat.${format}` as "matchFormat.ONE_V_ONE"),
    );
    cells.push({
      key: t("overviewFormatMatchType"),
      value: formatLabels.join(", "),
    });
  }

  cells.push({
    key: t("overviewFormatDraws"),
    value: league.allowDraw
      ? t("overviewFormatDrawsAllowed")
      : t("overviewFormatDrawsNotAllowed"),
  });

  if (config.initialElo != null) {
    cells.push({
      key: t("overviewFormatStartingElo"),
      value: String(config.initialElo),
    });
  }

  if (config.inactivityThresholdHours != null) {
    cells.push({
      key: t("overviewFormatDecayAfter"),
      value: formatHoursDuration(config.inactivityThresholdHours),
    });
  }

  if (config.finalsCut != null) {
    cells.push({
      key: t("overviewFormatFinalsCut"),
      value: t("overviewFormatFinalsCutValue", { count: config.finalsCut }),
    });
  }

  return cells;
}
