import { useState } from "react";
import { Deal, DealRole } from "@/types/deal";
import { formatDateISO } from "@/lib/formatters";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/shared/Button";
import { useTelegram } from "@/contexts/TelegramContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { ScheduleTimePicker } from "@/components/deal/ScheduleTimePicker";
import { useRouter } from "next/navigation";

export default function ActionButtonsSection({
  deal,
  rawRole,
}: {
  deal: Deal;
  rawRole: DealRole;
}) {
  const router = useRouter();
  const { telegram } = useTelegram();

  const [tonConnectUI] = useTonConnectUI();
  const connectedAddress = useTonAddress();

  const [schedule, setSchedule] = useState<{
    date: Date | null;
    isImmediate: boolean;
  }>({
    date: null,
    isImmediate: true,
  });
  const queryClient = useQueryClient();

  const notifySubmitAdMutation = useMutation({
    mutationFn: async (isResubmit: boolean = false) => {
      const res = await fetch(`/api/deals/${deal.id}/notify-ad-submit`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to notify for ad submission");
      }

      return { isResubmit };
    },

    onSuccess: ({ isResubmit }) => {
      toast.success("Notification sent to your PM", {
        description: `You have been notified to ${isResubmit ? "resubmit" : "submit"} your ad.`,
      });
      if (telegram) {
        telegram.openTelegramLink(
          `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`,
        );
      }
    },

    onError: (error: any) => {
      toast.error("Notification failed", {
        description: error.message,
      });
    },
  });

  const viewAdMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deals/${deal.id}/view-ad`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load ad creative");
      }
      return data;
    },

    onSuccess: (data) => {
      toast.success("Ad has been sent to your PM");
      if (telegram) {
        telegram.openTelegramLink(
          `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`,
        );
      }
    },

    onError: (error: any) => {
      toast.error("Failed to load ad", {
        description: error.message,
      });
    },
  });

  const approveAdMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deals/${deal.id}/approve-ad`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve ad");
      return data;
    },

    onSuccess: ({ status, approvedAt }) => {
      queryClient.setQueryData(["deals", deal.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          deal: {
            ...old.deal,
            status,
            ad: {
              ...old.deal.ad,
              approvedAt,
              rejectedAt: undefined,
            },
          },
        };
      });

      toast.success("Ad approved", {
        description:
          "The ad has been approved. Awaiting payment from the advertiser.",
      });
    },

    onError: (error: any) => {
      toast.error("Failed to approve ad", {
        description: error.message,
      });
    },
  });

  const rejectAdMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deals/${deal.id}/reject-ad`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject ad");
      return data;
    },

    onSuccess: ({ status, rejectedAt }) => {
      queryClient.setQueryData(["deals", deal.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          deal: {
            ...old.deal,
            status,
            ad: {
              ...old.deal.ad,
              rejectedAt,
              approvedAt: undefined,
            },
          },
        };
      });

      toast.warning("Ad rejected", {
        description: "The advertiser has been notified to revise their ad.",
      });
    },

    onError: (error: any) => {
      toast.error("Failed to reject ad", {
        description: error.message,
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/deals/${deal.id}/start-chat`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || "Failed to send conversation start option",
        );
      }
      return data;
    },

    onSuccess: (data) => {
      toast.success("Conversation start option has been sent to your PM");
      if (telegram) {
        telegram.openTelegramLink(
          `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`,
        );
      }
    },

    onError: (error: any) => {
      toast.error("Failed to start conversation", {
        description: error.message,
      });
    },
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      // Validate schedule
      if (!schedule.isImmediate) {
        if (!schedule.date) {
          toast.error("Schedule required", {
            description:
              "Please select a posting date/time or choose Immediate.",
          });
          return;
        }
        const now = new Date();
        if (schedule.date > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          // max 7 days ahead
          toast.error("Schedule too far", {
            description: "Maximum scheduling is 1 week in advance.",
          });
          return;
        }
      }

      if (!connectedAddress) {
        try {
          await tonConnectUI.openModal();
        } catch {
          throw {
            message: "Connection failed",
            description: "Could not open wallet connection.",
          };
        }
        throw {
          message: "Wallet not connected",
          description: "Please connect your wallet and try again.",
        };
      }

      // Create payment
      const intentRes = await fetch(`/api/deals/${deal.id}/create-payment`, {
        method: "POST",
      });

      const intent = await intentRes.json();
      if (!intentRes.ok) throw new Error(intent.message);

      // Send TON transaction
      const result = await tonConnectUI.sendTransaction({
        validUntil: intent.validUntil,
        messages: [
          {
            address: intent.recipient,
            amount: intent.amount,
            payload: intent.payload,
          },
        ],
      });

      // Confirm on backend
      const confirmRes = await fetch(`/api/deals/${deal.id}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boc: result.boc,
          schedule: schedule.isImmediate
            ? { immediate: true }
            : { postAt: schedule.date?.toISOString() },
        }),
      });

      if (!confirmRes.ok) {
        throw new Error("Payment confirmation failed");
      }

      return await confirmRes.json();
    },

    onSuccess: (response) => {
      toast.success("Payment sent", {
        description: response.scheduledPostAt
          ? `Ad scheduled for ${formatDateISO(response.scheduledPostAt)}`
          : "Ad will be posted soon.",
      });

      // invalidate deal query so status updates
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });

      // invalidate profile stats
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      router.refresh();
    },

    onError: (error: any) => {
      if (
        error?.message?.toLowerCase().includes("cancelled") ||
        error?.message?.toLowerCase().includes("rejected")
      ) {
        toast.error("Payment cancelled", {
          description: "You cancelled the transaction.",
        });
      } else {
        toast.error("Payment failed", {
          description:
            error?.message || "An error occurred while processing the payment.",
        });
      }
    },
  });

  return (
    <>
      {rawRole === "advertiser" ? (
        deal.status === "awaiting_ad_submission" ? (
          <Button
            variant="primary"
            fullWidth
            loading={notifySubmitAdMutation.isPending}
            onClick={() => notifySubmitAdMutation.mutate(false)}
            className="primary-glow"
          >
            <i className="ri-upload-2-line mr-2" aria-hidden="true" />
            Submit Ad Creative
          </Button>
        ) : deal.status === "ad_rejected" ? (
          <Button
            variant="primary"
            fullWidth
            loading={notifySubmitAdMutation.isPending}
            onClick={() => notifySubmitAdMutation.mutate(true)}
            className="primary-glow"
          >
            <i className="ri-refresh-line mr-2" aria-hidden="true" />
            Resubmit Ad
          </Button>
        ) : deal.status === "awaiting_payment" ? (
          <div className="space-y-4">
            {schedule && setSchedule && (
              <ScheduleTimePicker
                value={schedule.date}
                isImmediate={schedule.isImmediate}
                onScheduleChange={setSchedule}
              />
            )}
            <Button
              variant="primary"
              fullWidth
              loading={payMutation.isPending}
              onClick={() => payMutation.mutate()}
              className="primary-glow"
              disabled={schedule && !schedule.isImmediate && !schedule.date}
            >
              {!!connectedAddress ? (
                <>
                  <i className="ri-wallet-3-line mr-2" aria-hidden="true" />
                  Pay with TON
                </>
              ) : (
                <>
                  <i className="ri-link mr-2" aria-hidden="true" />
                  Connect Wallet to Pay
                </>
              )}
            </Button>
          </div>
        ) : null
      ) : rawRole === "publisher" || rawRole === "manager" ? (
        deal.status === "ad_under_review" ? (
          <div className="space-y-2">
            <Button
              variant="secondary"
              fullWidth
              loading={viewAdMutation.isPending}
              onClick={() => viewAdMutation.mutate()}
            >
              <i className="ri-eye-line mr-2" aria-hidden="true" />
              View Ad Creative
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                loading={rejectAdMutation.isPending}
                disabled={approveAdMutation.isPending}
                onClick={() => rejectAdMutation.mutate()}
              >
                <i className="ri-close-line mr-2" aria-hidden="true" />
                Reject Ad
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={approveAdMutation.isPending}
                disabled={rejectAdMutation.isPending}
                onClick={() => approveAdMutation.mutate()}
              >
                <i className="ri-check-line mr-2" aria-hidden="true" />
                Approve Ad
              </Button>
            </div>
          </div>
        ) : null
      ) : null}
      <Button
        variant="secondary"
        fullWidth
        loading={chatMutation.isPending}
        disabled={chatMutation.isPending}
        onClick={() => chatMutation.mutate()}
      >
        <i className="ri-chat-3-line mr-2" aria-hidden="true" />
        {rawRole === "advertiser"
          ? "Chat with Publisher"
          : "Chat with Advertiser"}
      </Button>
    </>
  );
}
