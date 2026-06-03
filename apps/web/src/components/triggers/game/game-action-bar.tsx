"use client";

import { ShareButton } from "@/components/ui/share-button";
import { GameManageActions } from "@/components/triggers/game/game-manage-actions";
import { GameWatchButton } from "@/components/triggers/game/game-watch-button";

interface GameManageConfig {
  gameId: string;
  gameSlug: string;
  gameName: string;
  eventCount: number;
}

interface GameActionBarProps {
  gameId: string;
  followCount: number;
  variant?: "default" | "hero";
  manage?: GameManageConfig;
}

export function GameActionBar({
  gameId,
  followCount,
  variant = "default",
  manage,
}: GameActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <GameWatchButton
        gameId={gameId}
        followCount={followCount}
        variant={variant}
      />
      <ShareButton variant={variant} />
      {manage ? (
        <GameManageActions
          gameId={manage.gameId}
          gameSlug={manage.gameSlug}
          gameName={manage.gameName}
          eventCount={manage.eventCount}
          variant={variant === "hero" ? "dropdown" : "inline"}
        />
      ) : null}
    </div>
  );
}
