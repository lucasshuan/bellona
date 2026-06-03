"use client";

import { ShareButton } from "@/components/ui/share-button";
import { EventManageActions } from "@/components/triggers/events/event-manage-actions";
import { EventWatchButton } from "@/components/triggers/events/event-watch-button";

interface EventManageConfig {
  eventId: string;
  eventName: string;
  gameSlug: string;
  eventSlug: string;
}

interface EventActionBarProps {
  eventId: string;
  followCount: number;
  variant?: "default" | "hero";
  manage?: EventManageConfig;
}

export function EventActionBar({
  eventId,
  followCount,
  variant = "default",
  manage,
}: EventActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <EventWatchButton
        eventId={eventId}
        followCount={followCount}
        variant={variant}
      />
      <ShareButton variant={variant} />
      {manage ? (
        <EventManageActions
          eventId={manage.eventId}
          eventName={manage.eventName}
          gameSlug={manage.gameSlug}
          eventSlug={manage.eventSlug}
          variant={variant === "hero" ? "dropdown" : "inline"}
        />
      ) : null}
    </div>
  );
}
