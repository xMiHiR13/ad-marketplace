import NegotiationCard from "./NegotiationCard";
import DurationSelector from "./DurationSelector";

import { useState } from "react";
import { Deal, DealRole } from "@/types/deal";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/shared/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NegotiationSection({
  deal,
  rawRole,
}: {
  deal: Deal;
  rawRole: DealRole;
}) {
  const [negotiationDuration, setNegotiationDuration] = useState<number | null>(
    null,
  );
  const [durationConfirmed, setDurationConfirmed] = useState(false);

  const queryClient = useQueryClient();
  const updateDurationMutation = useMutation({
    mutationFn: async (newDuration: number) => {
      const res = await fetch(`/api/deals/${deal.id}/duration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: newDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update duration");
      return data.duration;
    },

    onSuccess: (updatedDuration) => {
      // Update deal cache
      queryClient.setQueryData(["deals", deal.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          deal: {
            ...old.deal,
            negotiation: undefined,
            duration: updatedDuration,
            status: "negotiating",
          },
        };
      });

      toast.success("Duration updated", {
        description: `Duration set to ${updatedDuration} ${
          updatedDuration === 1 ? "day" : "days"
        }.`,
      });

      setDurationConfirmed(true);
    },

    onError: (error: any) => {
      toast.error("Failed to update duration", {
        description: error.message,
      });
    },
  });

  const proposePriceMutation = useMutation({
    mutationFn: async (price: number) => {
      const res = await fetch(`/api/deals/${deal.id}/propose-price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to propose price");
      return data;
    },

    onSuccess: ({ negotiation, status }) => {
      queryClient.setQueryData(["deals", deal.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          deal: {
            ...old.deal,
            negotiation,
            status,
          },
        };
      });

      toast.success("Price proposed", {
        description: `Your offer has been sent.`,
      });
    },

    onError: (error: any) => {
      toast.error("Failed to propose price", {
        description: error.message,
      });
    },
  });

  const acceptPriceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deals/${deal.id}/accept-price`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept price");
      return data;
    },

    onSuccess: ({ price, status }) => {
      queryClient.setQueryData(["deals", deal.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          deal: {
            ...old.deal,
            price,
            status,
            negotiation: {
              ...old.deal.negotiation,
              acceptedAt: new Date(),
            },
          },
        };
      });
    },
    onError: (error: any) => {
      toast.error("Failed to accept price", {
        description: error.message,
      });
    },
  });

  const role = rawRole === "manager" ? "publisher" : rawRole;

  const handleSetDuration = () => {
    const finalDuration = negotiationDuration ?? deal.duration;
    updateDurationMutation.mutate(finalDuration);
  };
  return (
    <>
      {/* Duration Selector - advertiser only */}
      {rawRole === "advertiser" &&
        (deal.status === "negotiating" || deal.status === "price_proposed") && (
          <div className="card-surface p-3">
            <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
              <i className="ri-calendar-2-line" aria-hidden="true" />
              <span>
                Duration{" "}
                {(() => {
                  const displayDuration = durationConfirmed
                    ? (negotiationDuration ?? deal.duration)
                    : deal.duration;
                  return displayDuration > 0 ? (
                    <span className="text-foreground-subtle">
                      (Current: {displayDuration}{" "}
                      {displayDuration === 1 ? "day" : "days"})
                    </span>
                  ) : null;
                })()}
              </span>
            </div>
            <DurationSelector
              value={negotiationDuration ?? (deal.duration || 1)}
              onChange={(d) => {
                setNegotiationDuration(d);
                setDurationConfirmed(false);
              }}
              disabled={updateDurationMutation.isPending}
              className="w-full"
            />
            {!durationConfirmed && (
              <Button
                variant="primary"
                fullWidth
                loading={updateDurationMutation.isPending}
                disabled={
                  (negotiationDuration ?? (deal.duration || 1)) ===
                    deal.duration && deal.duration > 0
                }
                onClick={handleSetDuration}
                className="mt-3"
              >
                <i className="ri-check-line mr-2" aria-hidden="true" />
                Set Duration
              </Button>
            )}
            {durationConfirmed && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[hsl(var(--status-success))]">
                <i className="ri-checkbox-circle-fill" aria-hidden="true" />
                <span>
                  Duration set to {negotiationDuration ?? deal.duration}{" "}
                  {(negotiationDuration ?? deal.duration) === 1
                    ? "day"
                    : "days"}
                </span>
              </div>
            )}
          </div>
        )}

      {/* Duration display - publisher view */}
      {rawRole === "publisher" &&
        (deal.status === "negotiating" || deal.status === "price_proposed") && (
          <div className="card-surface p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <i className="ri-calendar-2-line" aria-hidden="true" />
                <span>Duration</span>
              </div>
              {deal.duration > 0 && (
                <span className="text-sm font-semibold text-foreground">
                  {deal.duration} {deal.duration === 1 ? "day" : "days"}
                </span>
              )}
            </div>
            {deal.duration <= 0 && (
              <div className="bg-muted/50 border border-white/10 rounded-xl p-3 text-center mt-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <i
                    className="ri-time-line text-lg text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-foreground">
                  Waiting for advertiser to set duration
                </p>
                <p className="text-xs text-foreground-subtle mt-1">
                  The advertiser needs to choose the ad placement duration first
                </p>
              </div>
            )}
          </div>
        )}

      {/* Negotiation Card */}
      {rawRole &&
        (deal.status === "negotiating" || deal.status === "price_proposed") && (
          <NegotiationCard
            initialPerDayPrice={deal.price}
            proposedPrice={deal.negotiation?.proposedPrice}
            proposedBy={deal.negotiation?.proposedBy}
            role={role}
            status={deal.status}
            duration={
              durationConfirmed
                ? (negotiationDuration ?? deal.duration)
                : deal.duration
            }
            durationSet={deal.duration > 0 || durationConfirmed}
            onProposePrice={proposePriceMutation.mutate}
            onAcceptPrice={acceptPriceMutation.mutate}
            proposeLoading={proposePriceMutation.isPending}
            acceptLoading={acceptPriceMutation.isPending}
          />
        )}
    </>
  );
}
