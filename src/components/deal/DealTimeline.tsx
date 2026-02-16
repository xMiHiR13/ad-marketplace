import {
  DealStatus,
  DEAL_TIMELINE_STEPS,
  getTimelineStepIndex,
  isDealError,
  isDealRefunded,
} from "@/types/deal";

interface DealTimelineProps {
  currentStatus: DealStatus;
}

export function DealTimeline({ currentStatus }: DealTimelineProps) {
  const currentIndex = getTimelineStepIndex(currentStatus);
  const isError = isDealError(currentStatus);
  const isRefunded = isDealRefunded(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const totalSteps = DEAL_TIMELINE_STEPS.length;

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-status-error">
          <i className="ri-close-circle-line text-xl" />
          <span className="font-medium">Deal Cancelled</span>
        </div>
      </div>
    );
  }

  // Calculate the progress width percentage
  // Line fills FULLY to the current in-progress step
  const getProgressWidth = () => {
    if (currentIndex < 0) return 0;

    // If all steps completed (deal completed)
    if (currentIndex >= totalSteps) {
      return 100;
    }

    // Each step spans 1/(totalSteps-1) of the total width
    const stepWidth = 100 / (totalSteps - 1);

    // Fill fully to the current step position
    return currentIndex * stepWidth;
  };

  return (
    <div className="relative">
      {/* Progress line background */}
      <div className="absolute top-5 left-5 right-5 h-1 bg-muted rounded-full overflow-hidden" />

      {/* Progress line filled */}
      <div
        className={`absolute top-5 h-1 rounded-full transition-all duration-500 ${
          isError
            ? "bg-gradient-to-r from-[hsl(var(--status-success))] to-[hsl(var(--status-error))]"
            : currentIndex >= totalSteps
              ? "bg-[hsl(var(--status-success))]"
              : "bg-gradient-to-r from-[hsl(var(--status-success))] to-primary"
        }`}
        style={{
          left: "20px",
          width: `calc(${Math.min(getProgressWidth(), 100)}% * (100% - 40px) / 100%)`,
        }}
      />

      <div className="relative flex justify-between">
        {DEAL_TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isCurrentError = isCurrent && isError;
          const isCurrentRefunded = isCurrent && isRefunded;

          // Use completed label for completed steps, "Refunded" for refunded status on verification step
          const getDisplayLabel = () => {
            if (isCurrentRefunded && step.id === "verification") {
              return "Refunded";
            }
            return isCompleted ? step.completedLabel : step.label;
          };
          const displayLabel = getDisplayLabel();

          const getBgClass = () => {
            if (isCompleted)
              return "bg-[hsl(var(--status-success))] text-white";
            if (isCurrentError)
              return "bg-[hsl(var(--status-error))] text-white ring-4 ring-[hsl(var(--status-error))]/20";
            if (isCurrent)
              return "bg-primary text-primary-foreground ring-4 ring-primary/20";
            return "bg-muted text-foreground-muted";
          };

          const getLabelColor = () => {
            if (isCompleted) return "text-[hsl(var(--status-success))]";
            if (isCurrentError) return "text-[hsl(var(--status-error))]";
            if (isCurrent) return "text-primary";
            return "text-foreground-muted";
          };

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getBgClass()}`}
              >
                {isCurrentError ? (
                  <i className="ri-error-warning-line text-lg" />
                ) : (
                  <i className={`${step.icon} text-lg`} />
                )}
              </div>
              <span
                className={`text-[10px] mt-2 text-center max-w-[50px] font-medium ${getLabelColor()}`}
              >
                {displayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
