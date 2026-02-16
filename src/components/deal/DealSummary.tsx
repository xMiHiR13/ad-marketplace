import TonPrice from "@/components/shared/TonPrice";

import { AD_TYPE_LABELS, AdType, Deal, DealRole } from "@/types/deal";
import { FALLBACK_TON_USD_RATE, useTonPrice } from "@/hooks/useTonPrice";

// Ad type colors - consistent with marketplace
const AD_TYPE_COLORS: Record<AdType, string> = {
  post: "text-primary",
  story: "text-violet-400",
  postWithForward: "text-status-success",
};

export default function DealSummarySection({
  deal,
  rawRole,
  isNegotiating,
}: {
  deal: Deal;
  rawRole: DealRole;
  isNegotiating: boolean;
}) {
  const { data: tonPrice } = useTonPrice();
  const usdRate = tonPrice ?? FALLBACK_TON_USD_RATE;
  return (
    <>
      {!isNegotiating && (
        <div className="flex items-stretch gap-2">
          <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] text-foreground-muted tracking-wide">
              Price
            </span>
            {(() => {
              const totalPrice =
                deal.negotiation?.proposedPrice ?? deal.price * deal.duration;
              return (
                <>
                  <div className="mt-1">
                    <TonPrice amount={totalPrice} size="md" />
                  </div>
                  <p className="text-[10px] text-foreground-subtle mt-0.5">
                    ≈ ${Math.round(totalPrice * usdRate)}
                  </p>
                </>
              );
            })()}
          </div>
          <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] text-foreground-muted tracking-wide">
              Duration
            </span>
            <p className="text-sm font-semibold text-foreground mt-1">
              {deal.duration} {deal.duration === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5 flex flex-col justify-center">
          <span className="text-[10px] text-foreground-muted tracking-wide">
            Ad Type
          </span>
          <p
            className={`text-sm font-semibold mt-1 ${AD_TYPE_COLORS[deal.adType]}`}
          >
            {AD_TYPE_LABELS[deal.adType]}
          </p>
        </div>
        <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5 flex flex-col justify-center">
          <span className="text-[10px] text-foreground-muted tracking-wide">
            Your Role
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <i
              className={`${rawRole === "advertiser" ? "ri-megaphone-line" : "ri-broadcast-line"} text-sm text-foreground`}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold capitalize text-foreground">
              {rawRole}
            </span>
            {rawRole === "manager" && (
              <span className="text-[8px] text-foreground-muted bg-white/10 border border-white/5 px-1 py-px rounded font-medium uppercase tracking-wider leading-none">
                Manager
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
