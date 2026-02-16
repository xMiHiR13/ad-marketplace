import { Deal } from "@/types/deal";
import { formatDateISO } from "@/lib/formatters";

function ActivityItem({
  icon,
  iconBg,
  iconColor,
  title,
  time,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <i className={`${icon} ${iconColor} text-sm`} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm text-foreground">{title}</p>
        <p className="text-xs text-foreground-muted">{time}</p>
      </div>
    </div>
  );
}

export default function ActivitySection({ deal }: { deal: Deal }) {
  const isRefunded =
    deal.status === "refunded_edit" || deal.status === "refunded_delete";

  return (
    <div className="space-y-4">
      {deal.payment?.refundedAt && (
        <ActivityItem
          icon="ri-refund-2-line"
          iconBg="bg-[hsl(var(--status-error-bg))]"
          iconColor="text-[hsl(var(--status-error))]"
          title={
            deal.status === "refunded_edit"
              ? "Payment refunded (post edited)"
              : "Payment refunded (post deleted)"
          }
          time={formatDateISO(deal.payment.refundedAt)}
        />
      )}
      {deal.schedule?.verifiedAt && (
        <ActivityItem
          icon="ri-shield-check-line"
          iconBg={
            isRefunded
              ? "bg-[hsl(var(--status-error-bg))]"
              : "bg-[hsl(var(--status-success-bg))]"
          }
          iconColor={
            isRefunded
              ? "text-[hsl(var(--status-error))]"
              : "text-[hsl(var(--status-success))]"
          }
          title={`Ad verified${deal.status === "refunded_delete" ? " (Deleted)" : deal.status === "refunded_edit" ? " (Edited)" : ""}`}
          time={formatDateISO(deal.schedule.verifiedAt)}
        />
      )}
      {deal.schedule?.post && (
        <ActivityItem
          icon="ri-send-plane-2-line"
          iconBg="bg-[hsl(var(--status-success-bg))]"
          iconColor="text-[hsl(var(--status-success))]"
          title="Ad posted"
          time={formatDateISO(deal.schedule.post.postedAt)}
        />
      )}
      {deal.payment && (
        <ActivityItem
          icon="ri-wallet-3-line"
          iconBg="bg-[hsl(var(--status-success-bg))]"
          iconColor="text-[hsl(var(--status-success))]"
          title="Payment received"
          time={formatDateISO(deal.payment.paidAt)}
        />
      )}
      {deal.ad?.approvedAt && (
        <ActivityItem
          icon="ri-check-double-line"
          iconBg="bg-[hsl(var(--status-success-bg))]"
          iconColor="text-[hsl(var(--status-success))]"
          title="Ad approved"
          time={formatDateISO(deal.ad.approvedAt)}
        />
      )}
      {deal.ad?.rejectedAt && (
        <ActivityItem
          icon="ri-close-circle-line"
          iconBg="bg-[hsl(var(--status-error-bg))]"
          iconColor="text-[hsl(var(--status-error))]"
          title="Ad rejected"
          time={formatDateISO(deal.ad.rejectedAt)}
        />
      )}
      {deal.ad?.submittedAt && (
        <ActivityItem
          icon="ri-upload-2-line"
          iconBg="bg-[hsl(var(--status-success-bg))]"
          iconColor="text-[hsl(var(--status-success))]"
          title="Ad submitted"
          time={formatDateISO(deal.ad.submittedAt)}
        />
      )}
      <ActivityItem
        icon="ri-shake-hands-line"
        iconBg="bg-muted"
        iconColor="text-foreground-muted"
        title="Deal created"
        time={formatDateISO(deal.createdAt)}
      />
    </div>
  );
}
