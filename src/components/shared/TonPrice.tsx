"use client";

import Image from "next/image";
import { useTonPrice, FALLBACK_TON_USD_RATE } from "@/hooks/useTonPrice";

interface TonPriceProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showUsd?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

const iconSizes = {
  sm: { width: 16, height: 16 },
  md: { width: 16, height: 16 },
  lg: { width: 20, height: 20 },
};

export default function TonPrice({
  amount,
  size = "md",
  showUsd = false,
  className = "",
}: TonPriceProps) {
  const { data: usdRate, isLoading } = useTonPrice();
  const rate = usdRate ?? FALLBACK_TON_USD_RATE;
  const sizes = iconSizes[size];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Image
        src={"/ton.svg"}
        alt="TON"
        height={sizes.height}
        width={sizes.width}
      />
      <span className={`font-bold text-foreground ${sizeClasses[size]}`}>
        {amount}
      </span>
      {showUsd && (
        <span
          className={`text-foreground-muted ${size === "lg" ? "text-sm" : "text-xs"} ml-1`}
        >
          {isLoading ? "..." : `≈ $${Math.round(amount * rate)}`}
        </span>
      )}
    </span>
  );
}