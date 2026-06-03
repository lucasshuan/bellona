# Handoff: Event Overview Tab

## Overview

This package specifies the **Overview tab** of an event (league) page in **Bellona** — the route that currently renders `<EventComingSoonSection section="overview" />`. The Overview is the event's landing tab: a glanceable summary that surfaces the most useful information (about, standings, latest matches, event facts, staff) and funnels users into the dedicated detail tabs (Leaderboard, Forum, Players, Matches).

The **hero/header** and the **tab bar** already exist (`EventHero`, `EventRouteTabs` in `(view)/layout.tsx`). The tab bar needs no changes. The **event header is in scope** — the prototype refines the existing `EventHero` (see the "Event Header / Hero" section below for the exact deltas: format chip, title scale, and the new registration card with progress bar). Everything else here is the **Overview body** that replaces the "coming soon" placeholder.

## About the Design Files

The files in this bundle (`Event Overview.html`, `tokens.css`, `overview.css`) are **design references created in plain HTML/CSS** — a prototype showing intended look, layout, and behavior. They are **not** production code to copy directly.

The task is to **recreate this design inside the Bellona codebase** (`apps/web` — Next.js 15 App Router, TypeScript, **Tailwind CSS v4**, GraphQL/Apollo, next-intl) using its **existing patterns, components, and design tokens**. Almost everything in the prototype already has a real equivalent in the repo — this is a translation job, not a from-scratch build. The hand-written CSS in `tokens.css`/`overview.css` exists only to make the prototype standalone; **do not port that CSS** — map it to the Tailwind utilities and component classes that already live in `apps/web/src/app/globals.css`.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and the visual language (crimson/gold on near-black, Cinzel display, glass panels, slash-sheen tabs, ember particles) are final and are lifted directly from the existing Bellona design system. Recreate pixel-faithfully using the repo's tokens. Where the prototype hand-rolls a pattern that the repo already has a component for (see mapping table), **use the repo component** rather than reproducing the markup.

---

## Where It Goes (routing & data)

**Route:** `apps/web/src/app/[locale]/games/[gameSlug]/events/[eventSlug]/(view)/page.tsx`

Currently:

```tsx
import { EventComingSoonSection } from "@/components/templates/events/event-route-sections";
export default function EventPage() {
  return <EventComingSoonSection section="overview" />;
}
```

Replace with a server component that fetches the same data the leaderboard page already uses:

```tsx
import { notFound } from "next/navigation";
import { EventOverviewSection } from "@/components/templates/events/event-overview-section";
import {
  getCachedEventEntries,
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
  if (!leagueData?.league?.event) notFound();
  const entries =
    (await getCachedEventEntries(leagueData.league.event.id))?.eventEntries ??
    EMPTY_ENTRIES;
  return <EventOverviewSection league={leagueData.league} entries={entries} />;
}
```

> **Standings + About + Info + Staff need no new data plumbing** — `getCachedLeague` and `getCachedEventEntries` are already used by `leaderboard/page.tsx`. See the "Data" notes per block.

---

## Event Header / Hero (in scope — enhances existing `EventHero`)

The event header lives in `components/templates/events/event-hero.tsx` (rendered by `(view)/layout.tsx`, so it sits above **every** tab, not just Overview). A baseline `EventHero` already exists; the prototype refines it. Recreate the prototype's version and **fold these deltas into the existing `EventHero`** rather than creating a parallel component. (This is the event header only — NOT the global site topbar, which is separate chrome.)

**Container:** wrapped in the existing `MediaHeroSection` (background = `game.backgroundImagePath` via `cdnUrl`, with the dark gradient + crimson radial wash already applied there). Ember particles belong to the hero/`MediaHeroSection` and stay. Inner width `mx-auto w-full max-w-400`, padding `px-5 sm:px-6 lg:px-8`, `pt-3.5 pb-5.5`.

**Top row** (`flex items-center justify-between`):

- **Back-link** (left): `ChevronLeft` + small game thumbnail (`aspect-[92/43]`, `rounded-sm`) + "Back to {game.name}". Color `text-gold/70 hover:text-gold`, `text-xs font-semibold`; chevron nudges left on hover. → `EventActionBar` / existing back-link already does most of this.
- **Action buttons** (right): `EventActionBar` — Follow (`Bell` + `followCount`) and Share (`Share2`). Pill buttons: `h-[34px] rounded-[9px] border border-border bg-card-strong/70 text-secondary text-xs font-semibold px-3`, hover `border-gold/55 text-foreground`.

**Main grid** (`lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] gap-6 items-center`):

### Header component A — Event identity (left)

Inner grid `md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-[22px] items-center`.

- **Event banner thumb:** `event.thumbnailImagePath` via `cdnUrl` (fallback `/league-placeholder.webp`). `aspect-[92/43] max-w-[300px] rounded-xl`, `shadow-[0_18px_48px_rgb(0_0_0/0.42)]`, with a `to-top` black gradient overlay.
- **Badge row** (`flex flex-wrap gap-1.5 mb-2.5`): pill badges `rounded-lg border px-2.5 py-[3px] text-[9.5px] font-extrabold tracking-[0.12em] uppercase backdrop-blur`:
  - **Type** (`Trophy` + "League"/"Tournament"): `border-gold/25 bg-black/45 text-secondary`. (Existing `typeLabel`.)
  - **Status** (`CircleDot` + label): uses the existing `STATUS_ACCENT` map — e.g. ACTIVE → `border-emerald-300/25 bg-emerald-300/10 text-emerald-200` ("In progress"), REGISTRATION → gold. (Existing `statusLabel`.)
  - **Format** chip ("Elo · 1v1"): `border-gold/25 bg-gold/10 text-secondary`, derived from `league.classificationSystem` + `league.allowedFormats`. _(New chip — add it.)_
- **Kicker:** `text-primary text-xs font-bold` — the short event/series name (`event.name`).
- **Title:** `font-display font-bold text-[clamp(22px,2.4vw,32px)] leading-[1.12] tracking-tight`. The prototype shows the full league title here; the existing hero shows `event.description` (clamped) with `event.name` as fallback. **Keep the existing description-as-headline logic** but apply this type scale.
- **Subtitle:** `text-muted/62 text-sm leading-relaxed max-w-[46ch]` — `event.description` (or a one-line tagline when description is used as the title).

### Header component B — Registration card (right) ⭐ the new bit

This is the standout enhancement over today's plain `EventRegistrationTrigger`. **Wrap the existing `EventRegistrationTrigger` in this card treatment** (or extend it):

- **Container:** `glass-panel` **+ `GlowBorder`** (animated gold/crimson conic border), `rounded-3xl`, padding `18px`.
- **Header row** (`flex items-baseline justify-between`):
  - Count: `font-display text-[26px] font-bold` → `{entries.totalCount}` with `/ {event.maxParticipants}` in `text-muted/50 text-base`.
  - Label: "Competitors", `text-[11px] font-bold tracking-[0.12em] uppercase text-secondary/60`.
- **Progress bar:** `h-[7px] rounded-full bg-white/7` track with a fill `bg-gradient-to-r from-primary to-gold`, width = `totalCount / maxParticipants`. _(New — add it. Hide the bar if `maxParticipants` is null.)_
- **CTA button:** the existing registration trigger button, styled `h-11 w-full rounded-xl border border-primary/60 bg-gradient-to-b from-primary to-primary-strong text-white font-bold text-sm`, `shadow-[0_8px_24px] + inset highlight`, hover `-translate-y-px brightness-110`. Icon `UserPlus`. Label/disabled state driven by existing `isRegistered` / `registrationsEnabled` / `isLoggedIn` logic — **do not change that logic**, only the styling.
- **Meta line:** centered `text-[11.5px] text-muted/50` with a glowing gold dot — "Registration closes {registrationEndDate}". _(New — derive from `event.registrationEndDate` via `formatDate`; omit if absent.)_
- Mobile: the existing hero already renders a registration trigger inside the left column under `lg`; keep that responsive behavior.

**Deltas to add to the existing `EventHero` (summary):**
| Enhancement | Status today | Action |
|---|---|---|
| Format chip ("Elo · 1v1") | not present | add to badge row from `league` fields |
| Title type scale (`font-display` clamp) | smaller | bump to prototype scale |
| Registration **glow-border card** wrapper | plain trigger | wrap `EventRegistrationTrigger` |
| **Competitor progress fill bar** | not present | add (needs `totalCount` + `maxParticipants`) |
| "Registration closes …" meta + gold dot | not present | add from `event.registrationEndDate` |

**Data:** all already available to the hero — `game`, `league`, `entries.totalCount`, `event.maxParticipants`, `event.registrationEndDate`, `event.registrationsEnabled`, `event.followCount`. No new queries.

---

## Layout

Outer wrapper matches the existing sections:
`<section className="mx-auto w-full max-w-400 px-5 pt-5 pb-12 sm:px-6 lg:px-8">`
(`max-w-400` is the repo's hero/tab width — keep it consistent.)

Two-column grid, main + sidebar:

```
lg:grid-cols-[minmax(0,1fr)_332px]  gap-[22px]  items-start
```

- **Main column** (`flex flex-col gap-[22px]`): About → Standings preview → Matches preview
- **Sidebar** (`flex flex-col gap-[18px]`, `lg:sticky lg:top-[72px]`): Event info card → Staff → Recently joined → Season note
- Collapses to a single column under `lg` (1080px). At `lg` the sidebar is no longer sticky.

---

## Screens / Views

### View: Overview tab body

**Purpose:** Give a visitor or competitor a one-screen summary of the league and clear entry points to every detail tab.

#### Component 1 — About panel

- **Container:** `glass-panel` (squircle, `rounded-3xl`), padding `~22px`.
- **Header:** use existing `<SectionHeader eyebrow="About" title="How the season runs" />`. Eyebrow style is the repo's mono-uppercase-gold treatment.
- **Body:** render `event.about` (rich HTML) via `dangerouslySetInnerHTML`, reusing the exact `prose` class string already in `EloLeagueTemplate.tsx` (`prose prose-sm text-foreground/80 …`). Falls back to `event.description` if `about` is empty.
- **Format-at-a-glance grid:** 3-col grid (`grid-cols-3 gap-[10px]`, 1-col on mobile) of cells. Each cell: `border border-border rounded-xl bg-background/45 px-3.5 py-3`, a mono uppercase `key` (`text-[10px] tracking-[0.1em] text-muted/45`) and a bold `value` (`text-[15px] font-bold text-secondary`).
  - **Data source:** `league.config` JSON + `event` dates. ELO shape gives `initialElo`, `kFactor`; `league.allowDraw`; `league.allowedFormats` (e.g. `ONE_V_ONE` → "1v1"). Cells in the mock: Rating (`Elo · K-32`), Match type, Draws, Starting Elo, Decay after, Finals cut. Show only cells whose data exists.

#### Component 2 — Standings preview

- **Container:** `glass-panel`, padding `~22px`.
- **Header:** `<SectionHeader eyebrow="Standings" title="Top of the ladder" description="Live Elo rankings · updated after every recorded match" actions={<LinkMore href={leaderboardHref}>Full leaderboard</LinkMore>} />`. `SectionHeader` already supports an `actions` slot (see leaderboard section).
- **Body:** **reuse `LeagueLeaderboardTable`** (the compact variant, `components/tables/league-leaderboard-table.tsx`) passing `entries.nodes.slice(0, 5)`, `classificationSystem`, `allowDraw`. Do **not** rebuild the table — the prototype's hand-built table just mirrors it. If the compact table doesn't accept a limit, slice before passing.
- Columns shown in mock: rank, player (avatar + name + @handle), W–L, Δ (last change), Elo. The repo table already renders these from `EventEntry.stats` (`{ currentElo }` for ELO, `{ points, wins, draws, losses }` for POINTS).
- Rank medals: #1 gold gradient, #2 cream, #3 orange (`--match-near-draw`), rest neutral. (Check whether `league-leaderboard-table` already styles top-3; if so, keep its styling.)
- **Link target:** `/games/${gameSlug}/events/${eventSlug}/leaderboard` via `@/i18n/routing` `Link`.

#### Component 3 — Matches preview ("Latest action")

- **Container:** `glass-panel`, padding `~22px`. Header eyebrow "Matches", title "Latest action", `actions` → "All matches" link to `…/matches`.
- **Body:** two sub-columns (`grid-cols-2 gap-[22px]`, 1-col on mobile), each with a small mono eyebrow:
  - **Recent results:** rows for recorded matches (`Match.playedAt` set). Row = 3-col grid `[1fr auto 1fr]`: left participant (avatar+name), center score `2 – 0` + a **margin pill**, right participant. Loser side at `opacity-50`. Winner score `text-foreground`, loser `text-muted/45`.
  - **Scheduled:** rows for scheduled matches (`Match.scheduledAt` set, `playedAt` null). Center shows `VS` + a mono datetime line (`text-muted/38`) instead of a score.
- **Margin pill** colors come from the existing `--match-*` scale: `match-shutout` (cyan) → "Shutout", `match-dominant`, `match-moderate`, `match-close` (yellow), `match-near-draw` (orange), `match-draw`. Each pill: `text-match-X bg-match-X/14 rounded-full px-[7px] text-[9px] font-extrabold tracking-[0.1em] uppercase`.
  - **If a margin helper already exists** (the `--match-*` vars imply one — check `lib/utils`), reuse it to map `(winnerScore, loserScore)` → tier + label.

> **⚠️ Dependency:** Per `CONTEXT.md`, the **match recording flow (frontend) is the next task and not yet built**, and the matches tab is still "coming soon". Ship this block **after** the matches query/UI lands. Recommended order: **PR 1 = About + Standings + Info + Staff** (all data exists today); **PR 2 = Matches preview**. About + Standings alone already replace the placeholder.

#### Component 4 — Event info card (sidebar)

- **Container:** `glass-panel`. Top = event banner image (`event.thumbnailImagePath` via `cdnUrl`, `aspect-[368/150]`, rounded top); fall back to `/league-placeholder.webp`.
- **Body padding `18px`.** Title `font-display text-[16px]`. Then a `<dl>` of label/value rows — **lift the exact `<dl>` from `EloLeagueTemplate.tsx`** (Format, Status, Início/Fim, Reg. start/end, Participants `totalCount / maxParticipants`, Created). Use `formatDate` from `@/lib/utils/date-utils`. Status value uses `STATUS_COLOR` map already defined there. Thin `border-border` separators between groups.
- Labels are i18n keys under `EventPage` (see existing usage); reuse them.

#### Component 5 — Staff panel ("Run by")

- **Container:** `glass-panel`, eyebrow "Run by".
- Rows of `EventStaff`: avatar (`UserChip`-style) + name + role label. Role colors: **Organizer → gold**, **Moderator → steam blue (`--steam`)**, **Scorekeeper → muted**. Roles come from `EventStaff.role` (`ORGANIZER | MODERATOR | SCOREKEEPER`).
- **Data:** needs the event's staff list. If not already fetched, add to the league/event cached query or a dedicated `getCachedEventStaff(eventId)` following the `event-page-data` pattern.

#### Component 6 — Recently joined (sidebar)

- **Container:** `glass-panel`, eyebrow "Recently joined" + "All" link to `…/players`.
- Wrap of **`UserChip`** components (already in the library) for the most recent `EventEntry.user`s, plus a `+N` overflow chip. Sort `entries.nodes` by `createdAt` desc, take ~5.

#### Component 7 — Season note (sidebar)

- Small `GlowBorder`-wrapped panel (use existing `<GlowBorder>`), mono text, gold `//` label. Static/derived copy (e.g. inactivity-decay reminder pulled from `league.config.inactivityThresholdHours`).

---

## Interactions & Behavior

- **Tab bar:** already implemented in `EventRouteTabs` (active state from `usePathname`, animated slash indicator). No work — the Overview is just the default route.
- **"More" links** navigate to sibling tabs via `@/i18n/routing` `Link`; preserve locale.
- **Standings rows:** hover background `gold-dim/8`; clicking a player → `/profile/[username]` (match repo behavior in the full table).
- **Ember particles** in the hero are part of `EventHero`/`MediaHeroSection` already — not in scope here.
- **Responsive:** single column under `lg`; sidebar non-sticky under `lg`; match sub-columns and format grid stack to 1-col on small screens.
- **Reduced motion:** the repo already gates animations under `prefers-reduced-motion`; inherit it.

## State Management

- Server components only — all data fetched server-side via the existing `getCached*` helpers (React `cache` + Apollo). No client state for the Overview body itself.
- Registration/follow/share state lives in the hero triggers (`EventRegistrationTrigger`, `EventActionBar`) — already built, out of scope.

## Data Requirements (summary)

| Block               | Source                                                                                                           | New work?                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| About + format grid | `event.about` / `event.description`, `league.config`, `league.allowDraw`, `league.allowedFormats`, `event` dates | None                                                     |
| Standings preview   | `getCachedEventEntries` → `EventEntry.stats`                                                                     | None (slice top 5)                                       |
| Matches preview     | `Match` (playedAt / scheduledAt) + `MatchParticipant`                                                            | **Yes — depends on matches frontend (next task)**        |
| Event info card     | `event` + `entries.totalCount`                                                                                   | None                                                     |
| Staff panel         | `EventStaff`                                                                                                     | Maybe — add `getCachedEventStaff` if not already fetched |
| Recently joined     | `entries.nodes` sorted by `createdAt`                                                                            | None                                                     |

---

## Design Tokens

All already defined in `apps/web/src/app/globals.css` (`:root` + `@theme inline`). **Use these, not new values.**

| Token             | Value                            | Tailwind utility                |
| ----------------- | -------------------------------- | ------------------------------- |
| Background        | `#0d0c0e`                        | `bg-background`                 |
| Background soft   | `#1d1b1f`                        | `bg-background-soft`            |
| Card              | `rgb(18 16 20 / 0.9)`            | `bg-card`                       |
| Card strong       | `rgb(24 22 27 / 0.97)`           | `bg-card-strong`                |
| Foreground        | `#ffffff`                        | `text-foreground`               |
| Muted             | `#d4cecc`                        | `text-muted`                    |
| Secondary (cream) | `#e8d5a3`                        | `text-secondary`                |
| Primary (crimson) | `#a4141b`                        | `text-primary` / `bg-primary`   |
| Primary strong    | `#6d0d12`                        | `bg-primary-strong`             |
| Gold              | `#da9d3b`                        | `text-gold`                     |
| Gold dim          | `rgb(142 89 27)`                 | `border-gold-dim`               |
| Border            | `color-mix(gold-dim 35%)`        | `border-border`                 |
| Success           | `#10b981`                        | `text-success`                  |
| Danger            | `#ff7b7b`                        | `text-danger`                   |
| Steam blue        | `#66c0f4`                        | `text-steam`                    |
| Match scale       | `--match-draw … --match-shutout` | `text-match-*`, `bg-match-*/14` |

**Radii:** `--radius-xl 11px`, `--radius-2xl 14px`, `--radius-3xl 20px` → `rounded-xl/2xl/3xl`.
**Fonts:** `font-display` = Cinzel (titles), `font-sans` = Outfit/Space-Grotesk (body), `font-mono` = IBM Plex Mono (eyebrows, stats, scores, dates).
**Surface classes:** `.glass-panel` (squircle + animated border-on-hover), `.glow-border-card` / `<GlowBorder>` (animated conic border), `.grid-surface` (background trellis). All in `globals.css`.

## Reusable components already in the repo

- `@/components/ui/section-header` — `SectionHeader` (eyebrow / title / description / actions)
- `@/components/ui/glow-border` — `GlowBorder`
- `@/components/tables/league-leaderboard-table` — compact standings table (use for the preview)
- `@/components/tables/league-leaderboard-full-table` — full table (leaderboard tab)
- `UserChip` — player avatar+name chip (component library)
- `@/lib/utils/cdn` `cdnUrl`, `@/lib/utils/date-utils` `formatDate`, `@/lib/utils/helpers` `cn`
- `@/i18n/routing` `Link`, `usePathname`
- i18n: all copy under the `EventPage` namespace (next-intl) — add new keys there, with `en` + `pt`.

## Assets

- Event banner: `event.thumbnailImagePath` (S3/CDN via `cdnUrl`), fallback `/league-placeholder.webp` (already in repo).
- Game thumbnail (back-link): `game.thumbnailImagePath`.
- Avatars: user `imageUrl`; the prototype uses striped placeholders only because it's standalone.
- Icons: **lucide-react** (already a dependency). Mock uses: Home, ListOrdered, MessageSquareText, UsersRound, History, Trophy, CircleDot, Bell, Share2, ChevronLeft, ArrowRight, Sparkles, Info.

## Files in this bundle (design reference)

- `Event Overview.html` — the full prototype (hero + tabs + Overview body). Hero/tabs are shown for context only; they already exist in the repo.
- `tokens.css` — standalone mirror of the repo's `globals.css` tokens. **Reference only — do not port; the real tokens already exist.**
- `overview.css` — standalone component styles for the prototype. **Reference only — translate to Tailwind utilities + existing classes.**

## Suggested implementation order

1. **PR 1:** `EventOverviewSection` shell + About panel + Standings preview + Event info card + Staff panel + Recently joined. (All data exists today; immediately replaces the "coming soon" wall.)
2. **PR 2:** Matches preview, once the match recording flow / matches query is in place.
