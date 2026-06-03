"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Settings, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { DeleteGameModal } from "@/components/modals/game/delete-game-modal";
import { DropdownItem, DropdownMenu } from "@/components/ui/dropdown-menu";
import { heroPillButtonClass } from "@/components/ui/hero-pill-button";
import { Link } from "@/i18n/routing";

interface GameManageActionsProps {
  gameId: string;
  gameSlug: string;
  gameName: string;
  eventCount: number;
  variant?: "inline" | "dropdown";
}

export function GameManageActions({
  gameSlug,
  gameName,
  eventCount,
  variant = "inline",
}: GameManageActionsProps) {
  const t = useTranslations("GamePage");
  const tAdmin = useTranslations("Admin");
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const editHref = `/games/${gameSlug}/edit`;

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu
          side="bottom"
          align="end"
          width={200}
          trigger={
            <button type="button" className={heroPillButtonClass}>
              <Settings className="size-[15px] shrink-0" />
              <span>{tAdmin("panel")}</span>
              <ChevronDown className="size-3.5 shrink-0 opacity-70" />
            </button>
          }
        >
          <DropdownItem icon={Pencil} onClick={() => router.push(editHref)}>
            {t("editGame")}
          </DropdownItem>
          <DropdownItem
            icon={Trash2}
            className="text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            {t("deleteGame")}
          </DropdownItem>
        </DropdownMenu>

        <DeleteGameModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          gameSlug={gameSlug}
          gameName={gameName}
          eventCount={eventCount}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={editHref}
          className="focus-visible:ring-gold/35 group hover:border-gold/35 hover:bg-gold/10 hover:text-gold relative flex h-8 items-center gap-2 overflow-hidden rounded-lg border border-white/12 bg-black/35 px-5 font-medium text-white/65 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_6px_18px_-12px_rgb(0_0_0/0.9)] backdrop-blur-md transition-[color,border-color,background-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5"
          />
          <Pencil className="relative size-3.5" />
          <span className="relative text-xs font-semibold tracking-wide">
            {t("editGame")}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="group focus-visible:ring-danger/40 relative flex h-8 items-center gap-2 overflow-hidden rounded-lg border border-white/12 bg-black/35 px-5 font-medium text-white/65 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_6px_18px_-12px_rgb(0_0_0/0.9)] backdrop-blur-md transition-[color,border-color,background-color,box-shadow] duration-300 hover:border-red-500/40 hover:bg-red-500/12 hover:text-red-300 focus-visible:ring-2 focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5"
          />
          <Trash2 className="relative size-3.5" />
          <span className="relative text-xs font-semibold tracking-wide">
            {t("deleteGame")}
          </span>
        </button>
      </div>

      <DeleteGameModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        gameSlug={gameSlug}
        gameName={gameName}
        eventCount={eventCount}
      />
    </>
  );
}
