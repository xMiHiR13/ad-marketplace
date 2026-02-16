import { Deal, DealRole } from "@/types/deal";

export default function DealStatusSection({
  deal,
  rawRole,
}: {
  deal: Deal;
  rawRole: DealRole;
}) {
  return (
    <p className="text-xs text-foreground-subtle mt-2 pt-2 border-t border-white/5">
      {/* Advertiser perspective */}
      {rawRole === "advertiser" &&
        deal.status === "negotiating" &&
        deal.duration <= 0 && (
          <span>
            <i className="ri-calendar-2-line mr-1" aria-hidden="true" />
            Set the deal duration first, then you can propose a custom price or
            accept the listed rate to move forward.
          </span>
        )}
      {rawRole === "advertiser" &&
        deal.status === "negotiating" &&
        deal.duration > 0 && (
          <span>
            <i className="ri-edit-line mr-1" aria-hidden="true" />
            You can adjust the duration, propose a different price, or accept
            the current rate to proceed to the next stage.
          </span>
        )}
      {rawRole === "advertiser" &&
        deal.status === "price_proposed" &&
        deal.negotiation?.proposedBy === "advertiser" && (
          <span>
            <i className="ri-time-line mr-1" aria-hidden="true" />
            Your price proposal has been sent. Waiting for the publisher to
            accept or counter.
          </span>
        )}
      {rawRole === "advertiser" &&
        deal.status === "price_proposed" &&
        deal.negotiation?.proposedBy === "publisher" && (
          <span>
            <i className="ri-discuss-line mr-1" aria-hidden="true" />
            The publisher has proposed a different price. You can accept it to
            proceed or submit a counter offer.
          </span>
        )}
      {rawRole === "advertiser" && deal.status === "awaiting_ad_submission" && (
        <span>
          <i className="ri-upload-2-line mr-1" aria-hidden="true" />
          Submit your ad creative for the publisher to review and post.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "ad_under_review" && (
        <span>
          <i className="ri-time-line mr-1" aria-hidden="true" />
          Your ad is under review. Waiting for the publisher to approve it.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "ad_rejected" && (
        <span>
          <i className="ri-close-circle-line mr-1" aria-hidden="true" />
          Your ad was rejected. Take feedback from publisher and resubmit a
          revised version.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "awaiting_payment" && (
        <span>
          <i className="ri-wallet-3-line mr-1" aria-hidden="true" />
          Ad has been approved. Complete the payment to proceed to the next
          stage.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "scheduled" && (
        <span>
          <i className="ri-calendar-check-line mr-1" aria-hidden="true" />
          Payment received. Your ad is scheduled and will be posted soon.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "posted" && (
        <span>
          <i className="ri-checkbox-circle-line mr-1" aria-hidden="true" />
          Your ad has been posted and is now awaiting verification.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "verified" && (
        <span>
          <i className="ri-shield-check-line mr-1" aria-hidden="true" />
          Ad verified successfully. The deal is being finalized.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "completed" && (
        <span>
          <i className="ri-check-double-line mr-1" aria-hidden="true" />
          Deal completed successfully.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "posting_failed" && (
        <span className="text-[hsl(var(--status-error))]">
          <i className="ri-error-warning-line mr-1" aria-hidden="true" />
          Failed to post the ad. A refund is being processed.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "refunded_edit" && (
        <span>
          <i className="ri-refund-2-line mr-1" aria-hidden="true" />
          Payment has been refunded. The ad was edited after publishing.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "refunded_delete" && (
        <span>
          <i className="ri-refund-2-line mr-1" aria-hidden="true" />
          Payment has been refunded. The ad was deleted after publishing.
        </span>
      )}
      {rawRole === "advertiser" && deal.status === "cancelled" && (
        <span>
          <i className="ri-close-line mr-1" aria-hidden="true" />
          This deal has been cancelled due to inactivity.
        </span>
      )}

      {/* Publisher perspective */}
      {rawRole === "publisher" &&
        deal.status === "negotiating" &&
        deal.duration <= 0 && (
          <span>
            <i className="ri-time-line mr-1" aria-hidden="true" />
            Waiting for the advertiser to set the duration and finalize the
            pricing.
          </span>
        )}
      {rawRole === "publisher" &&
        deal.status === "negotiating" &&
        deal.duration > 0 && (
          <span>
            <i className="ri-time-line mr-1" aria-hidden="true" />
            Waiting for the advertiser to finalize the price.
          </span>
        )}
      {rawRole === "publisher" &&
        deal.status === "price_proposed" &&
        deal.negotiation?.proposedBy === "advertiser" && (
          <span>
            <i className="ri-discuss-line mr-1" aria-hidden="true" />
            The advertiser has proposed a price. You can accept it to proceed or
            submit a counter offer.
          </span>
        )}
      {rawRole === "publisher" &&
        deal.status === "price_proposed" &&
        deal.negotiation?.proposedBy === "publisher" && (
          <span>
            <i className="ri-time-line mr-1" aria-hidden="true" />
            Your counter offer has been sent. Waiting for the advertiser to
            respond.
          </span>
        )}
      {rawRole === "publisher" && deal.status === "awaiting_ad_submission" && (
        <span>
          <i className="ri-time-line mr-1" aria-hidden="true" />
          Waiting for the advertiser to submit their ad creative.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "ad_under_review" && (
        <span>
          <i className="ri-eye-line mr-1" aria-hidden="true" />
          Review the submitted ad and decide whether to approve or reject it.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "ad_rejected" && (
        <span>
          <i className="ri-close-circle-line mr-1" aria-hidden="true" />
          You rejected the ad. Waiting for the advertiser to resubmit.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "awaiting_payment" && (
        <span>
          <i className="ri-time-line mr-1" aria-hidden="true" />
          Ad has been approved. Waiting for the advertiser to complete payment.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "scheduled" && (
        <span>
          <i className="ri-calendar-check-line mr-1" aria-hidden="true" />
          Payment received. The ad is scheduled and will be posted
          automatically.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "posted" && (
        <span>
          <i className="ri-checkbox-circle-line mr-1" aria-hidden="true" />
          The ad has been posted and is now being verified.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "verified" && (
        <span>
          <i className="ri-shield-check-line mr-1" aria-hidden="true" />
          Post verified successfully. Payment will be released shortly.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "completed" && (
        <span>
          <i className="ri-check-double-line mr-1" aria-hidden="true" />
          Deal completed successfully. Payment has been released.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "posting_failed" && (
        <span className="text-[hsl(var(--status-error))]">
          <i className="ri-error-warning-line mr-1" aria-hidden="true" />
          Failed to post the ad. The ad was not posted correctly.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "refunded_edit" && (
        <span>
          <i className="ri-refund-2-line mr-1" aria-hidden="true" />
          Payment has been refunded to the advertiser. The ad was edited after
          publishing.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "refunded_delete" && (
        <span>
          <i className="ri-refund-2-line mr-1" aria-hidden="true" />
          Payment has been refunded to the advertiser. The ad was deleted after
          publishing.
        </span>
      )}
      {rawRole === "publisher" && deal.status === "cancelled" && (
        <span>
          <i className="ri-close-line mr-1" aria-hidden="true" />
          This deal has been cancelled due to inactivity.
        </span>
      )}
    </p>
  );
}