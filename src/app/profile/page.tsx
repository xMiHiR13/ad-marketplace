"use client";

import Link from "next/link";
import Image from "next/image";

import { Channel } from "@/types/channel";
import { WebAppUser } from "@/types/telegram";
import { useQuery } from "@tanstack/react-query";
import { ProfileSkeleton } from "@/components/skeleton";
import { useTelegram } from "@/contexts/TelegramContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Campaign, CATEGORY_COLORS } from "@/types/campaign";
import { buildChannelUrl, buildCampaignUrl } from "@/lib/navigation";

const menuItems = [
  {
    icon: "ri-wallet-3-line",
    label: "Wallet & Payments",
    path: "/wallet",
    color: "from-green-500 to-emerald-500",
  },
  // {
  //   icon: "ri-bar-chart-line",
  //   label: "Analytics",
  //   path: "/analytics",
  //   color: "from-blue-500 to-cyan-500",
  // },
  // {
  //   icon: "ri-notification-3-line",
  //   label: "Notifications",
  //   path: "/notifications",
  //   color: "from-purple-500 to-violet-500",
  // },
  // {
  //   icon: "ri-shield-check-line",
  //   label: "Verification",
  //   path: "/verification",
  //   color: "from-orange-500 to-amber-500",
  // },
  // {
  //   icon: "ri-settings-4-line",
  //   label: "Settings",
  //   path: "/settings",
  //   color: "from-gray-500 to-slate-500",
  // },
  {
    icon: "ri-question-line",
    label: "Help & Support",
    path: "https://t.me/your_support_username",
    color: "from-pink-500 to-rose-500",
    external: true,
  },
];

const fetchProfile = async () => {
  const res = await fetch("/api/profile", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  return res.json();
};

function UserAvatar({ user }: { user: WebAppUser }) {
  if (user.photo_url) {
    return (
      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/30 relative">
        <Image
          src={user.photo_url || ""}
          alt="profile photo"
          fill
          className="object-cover"
          sizes="64px"
          priority
        />
      </div>
    );
  }

  // Generate initials from name
  const initials = user.first_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-16 h-16 rounded-xl overflow-hidden bg-primary/20 border-2 border-primary/30 flex items-center justify-center`}
    >
      <span className={`text-xl font-medium text-primary`}>{initials}</span>
    </div>
  );
}

export default function Profile() {
  const { telegram, user } = useTelegram();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  useDocumentTitle("Profile");

  if (isLoading || !user) {
    return <ProfileSkeleton isFullscreen={telegram?.isFullscreen ?? false} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* User Info */}
        <section
          aria-label="User information"
          className="flex items-center gap-4"
        >
          <UserAvatar user={user} />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">
              {user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.first_name}
            </h2>
            <p className="text-sm text-foreground-muted">
              {user.username ? `@${user.username}` : user.id}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section
          aria-label="User statistics"
          className="grid grid-cols-2 gap-2"
        >
          <div className="card-surface p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {data?.stats.totalDeals}
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Total Deals
            </div>
          </div>
          <div className="card-surface p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {data?.stats.activeDeals}
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Active Deals
            </div>
          </div>
          <div className="card-surface p-3 text-center">
            <div className="text-2xl font-bold text-status-pending">
              ${data?.stats.totalSpent.toLocaleString()}
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Total Spent
            </div>
          </div>
          <div className="card-surface p-3 text-center">
            <div className="text-2xl font-bold text-status-success">
              ${data?.stats.totalEarned.toLocaleString()}
            </div>
            <div className="text-[10px] text-foreground-muted mt-0.5">
              Total Earned
            </div>
          </div>
        </section>

        {/* Managed Channels */}
        <section aria-label="My channels">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            My Channels
          </h3>
          <div className="space-y-2">
            {data?.channels.map(
              (channel: Pick<Channel, "chatId" | "title" | "username" | "photo">) => (
                <Link
                  key={channel.chatId}
                  href={buildChannelUrl(channel.chatId)}
                  className="w-full card-surface-hover p-3 flex items-center gap-2 text-left"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                    {channel.photo ? (
                      <Image
                        src={channel.photo}
                        alt={channel.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <i className="ri-telegram-fill text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {channel.title}
                    </h4>
                    {channel.username && (
                      <p className="text-[10px] text-foreground-muted">
                        @{channel.username}
                      </p>
                    )}
                  </div>
                  <i
                    className="ri-arrow-right-s-line text-lg text-foreground-muted flex-shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
            {data?.channels.length === 0 && (
              <EmptyState
                icon="ri-broadcast-line"
                title="No Channels"
                description="List your first Telegram channel"
                variant="compact"
              />
            )}
            <Link
              href={"/channels/new"}
              className="w-full card-surface p-2.5 flex items-center justify-center gap-2 text-primary hover:bg-card-hover transition-colors border-dashed border border-primary/20"
              aria-label="List a new channel"
            >
              <i className="ri-add-line text-lg" aria-hidden="true" />
              <span className="text-xs font-semibold">List Channel</span>
            </Link>
          </div>
        </section>

        {/* Managed Campaigns */}
        <section aria-label="My campaigns">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            My Campaigns
          </h3>
          <div className="space-y-2">
            {data?.campaigns.map(
              (
                campaign: Pick<
                  Campaign,
                  "id" | "title" | "budgetMin" | "budgetMax" | "category"
                >,
              ) => (
                <Link
                  key={campaign.id}
                  href={buildCampaignUrl(campaign.id)}
                  className="w-full card-surface-hover p-3 flex items-center gap-2 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <i className="ri-megaphone-fill text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {campaign.title}
                    </h4>
                    <p className="text-[10px] text-foreground-muted">
                      ${campaign.budgetMin} - ${campaign.budgetMax}
                    </p>
                  </div>
                  {campaign.category && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${CATEGORY_COLORS[campaign.category]}`}
                    >
                      {campaign.category}
                    </span>
                  )}
                  <i
                    className="ri-arrow-right-s-line text-lg text-foreground-muted flex-shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
            {data?.campaigns.length === 0 && (
              <EmptyState
                icon="ri-megaphone-line"
                title="No Campaigns"
                description="Create your first ad campaign"
                variant="compact"
              />
            )}
            <Link
              href={"/campaigns/new"}
              className="w-full card-surface p-2.5 flex items-center justify-center gap-2 text-accent hover:bg-card-hover transition-colors border-dashed border border-accent/20"
              aria-label="Create a new campaign"
            >
              <i className="ri-add-line text-lg" aria-hidden="true" />
              <span className="text-xs font-semibold">Create Campaign</span>
            </Link>
          </div>
        </section>

        {/* Menu */}
        <nav aria-label="Settings and support">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Settings
          </h3>
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const content = (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                  >
                    <i
                      className={`${item.icon} text-sm text-white`}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="flex-1 text-xs font-medium text-foreground text-left">
                    {item.label}
                  </span>

                  <i
                    className={`${
                      item.external
                        ? "ri-external-link-line"
                        : "ri-arrow-right-s-line"
                    } text-lg text-foreground-muted`}
                    aria-hidden="true"
                  />
                </>
              );

              if (item.external) {
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full card-surface-hover p-3 flex items-center gap-3"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="w-full card-surface-hover p-3 flex items-center gap-3"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
