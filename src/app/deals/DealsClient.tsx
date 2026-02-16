"use client";

import { useMemo } from "react";
import { DealCardType, isDealTerminal } from "@/types/deal";
import { useQuery } from "@tanstack/react-query";
import { TabBar } from "@/components/layout/TabBar";
import { DealCard } from "@/components/deal/DealCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { DealCardSkeleton } from "@/components/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRouter, useSearchParams } from "next/navigation";
import { useTelegram } from "@/contexts/TelegramContext";

const fetchDeals = async (): Promise<DealCardType[]> => {
  const res = await fetch("/api/deals");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to fetch deals");
  }

  return data.deals;
};

export default function DealsList() {
  const router = useRouter();
  const { telegram } = useTelegram();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "active";

  const {
    data: deals,
    isLoading,
    isFetched,
    error,
  } = useQuery({
    queryKey: ["deals"],
    queryFn: fetchDeals,
  });

  const activeDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter((deal) => !isDealTerminal(deal.status));
  }, [deals]);

  const completedDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter((deal) => isDealTerminal(deal.status));
  }, [deals]);

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  useDocumentTitle("My Deals");

  const tabs = [
    {
      id: "active",
      label: "Active",
      count: isFetched ? activeDeals.length : undefined,
    },
    {
      id: "completed",
      label: "Completed",
      count: isFetched ? completedDeals.length : undefined,
    },
  ];

  const filteredDeals =
    activeTab === "completed" ? completedDeals : activeDeals;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header
        className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5">
          <h1 className="text-xl font-bold text-foreground mb-3">My Deals</h1>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </header>

      <main className="px-4 py-3 space-y-2">
        {isLoading ? (
          <>
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
          </>
        ) : deals && deals.length === 0 ? (
          <EmptyState
            icon="ri-shake-hands-line"
            title="No Deals Yet"
            description="Start by applying to campaigns or accepting ad requests on your channels"
          />
        ) : filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        ) : (
          <EmptyState
            icon="ri-shake-hands-line"
            title={
              activeTab === "active" ? "No Active Deals" : "No Completed Deals"
            }
            description={
              activeTab === "active"
                ? "You don't have any ongoing deals"
                : "Your completed deals will appear here"
            }
          />
        )}
      </main>
    </div>
  );
}
