"use client";

import { useTelegram } from "@/contexts/TelegramContext";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface NotFoundCardProps {
  type: "channel" | "campaign" | "deal";
  backPath?: string;
}

const CONFIG = {
  channel: {
    icon: "ri-broadcast-line",
    title: "Channel Not Found",
    description: "This channel doesn't exist or may have been removed.",
    defaultBackPath: "/channels",
    backLabel: "Browse Channels",
  },
  campaign: {
    icon: "ri-megaphone-line",
    title: "Campaign Not Found",
    description: "This campaign doesn't exist or may have been closed.",
    defaultBackPath: "/campaigns",
    backLabel: "Browse Campaigns",
  },
  deal: {
    icon: "ri-shake-hands-line",
    title: "Deal Not Found",
    description: "This deal doesn't exist or you don't have access to it.",
    defaultBackPath: "/deals",
    backLabel: "View My Deals",
  },
};

export default function NotFoundCard({ type, backPath }: NotFoundCardProps) {
  const router = useRouter();
  const { telegram } = useTelegram();
  const config = CONFIG[type];
  const path = backPath || config.defaultBackPath;

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
      <div className="card-surface p-8 max-w-sm w-full text-center">
        {/* Glow effect behind icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
            <i className={`${config.icon} text-3xl text-foreground-muted`} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-foreground mb-2">
          {config.title}
        </h2>
        <p className="text-sm text-foreground-muted mb-6">
          {config.description}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => router.push(path)}
          >
            <i className="ri-arrow-left-line mr-2" />
            {config.backLabel}
          </Button>
          <button
            onClick={() => router.back()}
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
