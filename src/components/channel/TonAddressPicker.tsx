"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/shared/Toast";
import { truncateAddressLong } from "@/lib/formatters";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

interface TonAddressPickerProps {
  value: string;
  onChange?: (address: string) => Promise<void>;
  required?: boolean;
  label?: string;
  /** "editable" allows wallet connect + update; "readonly" just displays the address */
  mode?: "editable" | "readonly";
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  }, [textToCopy]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      aria-label="Copy address"
    >
      <i
        className={`${copied ? "ri-check-double-line text-primary" : "ri-file-copy-line text-foreground-muted"} text-sm transition-colors`}
      />
    </button>
  );
}

export function TonAddressPicker({
  value,
  onChange,
  required = false,
  label = "Payout Address",
  mode = "editable",
}: TonAddressPickerProps) {
  const connectedAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);

  const isConnected = !!connectedAddress;

  const handleUseConnected = async () => {
    if (!connectedAddress || !onChange) return;
    setLoading(true);
    await onChange(connectedAddress);
    setLoading(false);
  };

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch {
      toast.error("Connection failed", {
        description: "Could not open wallet connection.",
      });
    }
  };

  // Readonly mode — just display the address
  if (mode === "readonly") {
    if (!value) return null;
    return (
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <i
            className="ri-wallet-3-line text-xs text-foreground-muted"
            aria-hidden="true"
          />
          <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-sm text-foreground font-mono flex-1 truncate">
            {truncateAddressLong(value)}
          </code>
          <CopyButton textToCopy={value} />
        </div>
      </div>
    );
  }

  // Editable mode
  return (
    <div className="card-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
          <i className="ri-wallet-3-line text-xs" aria-hidden="true" />
          {label}
          {required && <span className="text-status-error text-xs">*</span>}
        </h3>
      </div>

      <p className="text-[10px] text-foreground-muted">
        TON wallet address where you&apos;ll receive payments from completed
        deals.
      </p>

      {value ? (
        <div className="space-y-2">
          {/* Address display */}
          <div className="bg-background-secondary rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2">
              <code className="text-sm text-foreground font-mono flex-1 truncate">
                {truncateAddressLong(value)}
              </code>
              <CopyButton textToCopy={value} />
            </div>
          </div>

          {/* Update action — only show when connected wallet differs from current */}
          {isConnected && connectedAddress !== value && (
            <button
              type="button"
              onClick={handleUseConnected}
              disabled={loading}
              className="w-full h-9 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <i className="ri-refresh-line text-sm" />
                  Update to Connected Wallet
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {isConnected ? (
            <button
              type="button"
              onClick={handleUseConnected}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <i className="ri-wallet-3-line text-sm" aria-hidden="true" />
                  Use Connected Wallet
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <i className="ri-wallet-3-line text-sm" aria-hidden="true" />
              Connect Wallet to Set Address
            </button>
          )}
          {required && (
            <p className="text-[10px] text-status-error text-center">
              A payout address is required to list your channel.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
