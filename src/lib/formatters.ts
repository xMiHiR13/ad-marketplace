/**
 * Shared formatting utilities used across the app.
 * Consolidates duplicated formatNumber, formatDelta, and formatDate functions.
 */

/** Format a number with K/M suffix for compact display */
export const formatNumber = (num: number): string => {
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (absNum >= 1000000) return sign + (absNum / 1000000).toFixed(1) + "M";
  if (absNum >= 1000) return sign + (absNum / 1000).toFixed(1) + "K";
  return num.toString();
};

/** Calculate and format delta between current and previous values */
export const formatDelta = (
  current: number,
  previous: number,
): { value: string; positive: boolean } => {
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "";
  return {
    value: `${sign}${formatNumber(delta)}`,
    positive: delta >= 0,
  };
};

/** Format an ISO date string to a readable format (e.g., "Jan 1, 2026 12:00 PM") */
export const formatDateISO = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${month} ${day}, ${year} ${time}`;
};

export const truncateAddressShort = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr || "";

export const truncateAddressLong = (addr: string) =>
  addr.length > 24 ? `${addr.slice(0, 14)}…${addr.slice(-10)}` : addr || "";

export const truncateTxHash = (hash: string) =>
  hash.length > 8 ? `${hash.slice(0, 4)}…${hash.slice(-4)}` : hash;
