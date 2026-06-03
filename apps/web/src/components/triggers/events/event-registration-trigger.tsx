"use client";

import { useState } from "react";
import { CheckCircle2, LogIn, Swords, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AuthModal } from "@/components/modals/auth/auth-modal";
import { EventRegistrationModal } from "@/components/modals/events/event-registration-modal";
import { GlowBorder } from "@/components/ui/glow-border";
import { formatDate } from "@/lib/utils/date-utils";
import { cn } from "@/lib/utils/helpers";

interface EventRegistrationTriggerProps {
  eventId: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
  userId?: string;
  defaultDisplayName?: string;
  participantCount?: number;
  maxParticipants?: number | null;
  registrationsEnabled: boolean;
  registrationEndDate?: string | null;
  layout?: "default" | "hero";
}

const CARD_BASE =
  "w-full rounded-2xl border px-5 py-4 shadow-[0_18px_44px_rgb(0_0_0/0.28)] backdrop-blur-sm";

const CARD_ROW = "flex items-center gap-3";

const HERO_BUTTON =
  "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/60 bg-linear-to-b from-primary to-primary-strong text-sm font-bold text-white shadow-[0_8px_24px_rgb(164_20_27/0.3),inset_0_1px_0_rgb(255_255_255/0.14)] transition-all hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100";

export function EventRegistrationTrigger({
  eventId,
  isRegistered,
  isLoggedIn,
  userId,
  defaultDisplayName = "",
  participantCount,
  maxParticipants,
  registrationsEnabled,
  registrationEndDate,
  layout = "default",
}: EventRegistrationTriggerProps) {
  const t = useTranslations("EventPage");
  const locale = useLocale();
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isFull =
    maxParticipants != null &&
    participantCount != null &&
    participantCount >= maxParticipants;

  const progressPercent =
    maxParticipants != null && participantCount != null && maxParticipants > 0
      ? Math.min(100, (participantCount / maxParticipants) * 100)
      : null;

  const registrationMeta =
    registrationEndDate && registrationsEnabled
      ? t("registrationCloses", {
          date: formatDate(registrationEndDate, locale, {
            day: "2-digit",
            month: "short",
          }),
        })
      : null;

  const modals = (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isPending={false}
      />
      {isRegModalOpen ? (
        <EventRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          eventId={eventId}
          userId={userId!}
          defaultDisplayName={defaultDisplayName}
        />
      ) : null}
    </>
  );

  if (layout === "hero") {
    return (
      <>
        <GlowBorder className="rounded-3xl">
          <div className="glass-panel no-hover rounded-3xl p-[18px]">
            <div className="flex items-baseline justify-between">
              <div className="font-display text-[26px] font-bold tabular-nums">
                {participantCount ?? 0}
                {maxParticipants != null ? (
                  <span className="text-muted/50 text-base font-bold">
                    {" "}
                    / {maxParticipants}
                  </span>
                ) : null}
              </div>
              <div className="text-secondary/60 text-[11px] font-bold tracking-[0.12em] uppercase">
                {t("competitorsLabel")}
              </div>
            </div>

            {progressPercent != null ? (
              <div className="mt-3 mb-3.5 h-[7px] overflow-hidden rounded-full bg-white/7">
                <div
                  className="from-primary to-gold h-full rounded-full bg-linear-to-r transition-[width] duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            ) : (
              <div className="mb-3.5" />
            )}

            {isRegistered ? (
              <div className="border-success/35 bg-success/10 flex items-center gap-3 rounded-xl border px-4 py-3">
                <CheckCircle2 className="text-success size-5 shrink-0" />
                <div>
                  <p className="text-success text-sm font-semibold">
                    {t("alreadyRegistered")}
                  </p>
                  <p className="text-muted text-xs">
                    {t("alreadyRegisteredHint")}
                  </p>
                </div>
              </div>
            ) : !registrationsEnabled ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-black/45 px-4 py-3">
                <Swords className="text-muted size-5 shrink-0" />
                <p className="text-secondary/80 text-sm font-medium">
                  {t("registrationsClosed")}
                </p>
              </div>
            ) : !isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className={HERO_BUTTON}
              >
                <LogIn className="size-4" />
                {t("loginToRegister")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => !isFull && setIsRegModalOpen(true)}
                disabled={isFull}
                className={HERO_BUTTON}
              >
                <UserPlus className="size-4" />
                {isFull ? t("eventFull") : t("register")}
              </button>
            )}

            {registrationMeta ? (
              <div className="text-muted/50 mt-2.5 flex items-center justify-center gap-1.75 text-[11.5px]">
                <span className="bg-gold size-1.5 shrink-0 rounded-full shadow-[0_0_10px_var(--gold)]" />
                {registrationMeta}
              </div>
            ) : null}
          </div>
        </GlowBorder>
        {modals}
      </>
    );
  }

  if (isRegistered) {
    return (
      <div
        className={cn(
          CARD_BASE,
          CARD_ROW,
          "border-success/40 from-success-dark to-success-dark/60 bg-gradient-to-br",
        )}
      >
        <div className="bg-success/15 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10">
          <CheckCircle2 className="text-success size-5" />
        </div>
        <div>
          <p className="text-success text-sm font-semibold">
            {t("alreadyRegistered")}
          </p>
          <p className="text-muted text-xs">{t("alreadyRegisteredHint")}</p>
        </div>
      </div>
    );
  }

  if (!registrationsEnabled) {
    return (
      <div
        className={cn(
          CARD_BASE,
          CARD_ROW,
          "border-white/12 bg-black/60 bg-gradient-to-br from-white/8 to-white/3",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8">
          <Swords className="text-muted size-5" />
        </div>
        <p className="text-secondary/80 text-sm font-medium">
          {t("registrationsClosed")}
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className={cn(
            CARD_BASE,
            "group relative overflow-hidden px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
            "border-primary/28 from-primary/24 to-primary-strong/18 hover:border-primary/42 hover:from-primary/30 hover:to-primary-strong/24 bg-black/55 bg-gradient-to-br",
          )}
        >
          <div className={cn(CARD_ROW, "relative")}>
            <div className="bg-primary/16 group-hover:bg-primary/22 border-primary/18 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
              <LogIn className="text-primary size-5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {t("loginToRegister")}
              </p>
              <p className="text-secondary/75 text-xs">
                {t("loginToRegisterHint")}
              </p>
            </div>
          </div>
        </button>
        {modals}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !isFull && setIsRegModalOpen(true)}
        disabled={isFull}
        className={cn(
          CARD_BASE,
          "group relative overflow-hidden px-5 py-4 text-left transition-all duration-200 active:scale-[0.98]",
          isFull
            ? "border-gold/20 from-gold/18 to-gold-dim/14 cursor-not-allowed bg-black/55 bg-gradient-to-br"
            : "border-gold/26 from-gold/24 to-gold-dim/18 hover:border-gold/42 hover:from-gold/30 hover:to-gold-dim/24 cursor-pointer bg-black/55 bg-gradient-to-br hover:-translate-y-0.5",
        )}
      >
        {!isFull ? (
          <div className="from-gold/0 via-gold/10 to-gold/0 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r transition-transform duration-700 group-hover:translate-x-full" />
        ) : null}
        <div className={cn(CARD_ROW, "relative")}>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
              isFull
                ? "border-gold/10 bg-gold/10"
                : "border-gold/18 bg-gold/16 group-hover:bg-gold/22",
            )}
          >
            <Swords
              className={cn(
                "size-5",
                isFull ? "text-secondary/55" : "text-gold",
              )}
            />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-bold tracking-wide uppercase",
                isFull ? "text-secondary" : "text-foreground",
              )}
            >
              {isFull ? t("eventFull") : t("register")}
            </p>
            {participantCount != null && maxParticipants != null ? (
              <p
                className={cn(
                  "text-xs",
                  isFull ? "text-secondary/70" : "text-secondary/75",
                )}
              >
                {participantCount}/{maxParticipants} {t("participants")}
              </p>
            ) : participantCount != null ? (
              <p
                className={cn(
                  "text-xs",
                  isFull ? "text-secondary/70" : "text-secondary/75",
                )}
              >
                {participantCount} {t("participants")}
              </p>
            ) : null}
          </div>
        </div>
      </button>
      {modals}
    </>
  );
}
