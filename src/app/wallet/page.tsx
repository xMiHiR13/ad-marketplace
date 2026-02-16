"use client";

import Link from "next/link";
import Image from "next/image";

import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { Payment } from "@/types/payment";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/shared/Toast";
import { useTelegram } from "@/contexts/TelegramContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDateISO, truncateAddressLong, truncateAddressShort, truncateTxHash } from "@/lib/formatters";


const fetchPayments = async () => {
  const res = await fetch("/api/payments", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payments");
  }

  return res.json();
};

export default function Wallet() {
  const address = useTonAddress();
  const wallet = useTonWallet();
  const { telegram } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  useDocumentTitle("Wallet & Payments");

  const isConnected = !!address;

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
  };

  const handleCopy = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-40 ${telegram?.isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <Link
            href={"/profile"}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors"
            aria-label="Go back"
          >
            <i className="ri-arrow-left-s-line text-xl text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            Wallet & Payments
          </h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Wallet Connection Card */}
        <section
          className="card-surface p-5 space-y-4"
          aria-label="Wallet connection"
        >
          {isConnected ? (
            <div className="space-y-3">
              {/* Status + Wallet App row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center">
                  <i className="ri-wallet-3-fill text-lg text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-foreground">
                      TON Wallet
                    </h2>
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-success))]" />
                  </div>
                  <p className="text-[10px] text-foreground-muted">
                    {wallet?.device?.appName || "Connected"}
                  </p>
                </div>
              </div>

              {/* Address display */}
              <div className="bg-background-secondary rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2">
                  <code className="text-sm text-foreground font-mono flex-1 truncate">
                    {truncateAddressLong(address)}
                  </code>
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
                </div>
              </div>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="w-full h-10 rounded-xl bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error))] border border-[hsl(var(--status-error)/0.2)] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[hsl(var(--status-error)/0.15)] transition-colors"
              >
                <i className="ri-logout-box-r-line text-sm" />
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-wallet-3-fill text-lg text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground">
                    TON Wallet
                  </h2>
                  <p className="text-[10px] text-foreground-muted">
                    Connect your wallet to manage payments
                  </p>
                </div>
              </div>
              <div className="flex justify-end [&>div]:scale-90 [&>div]:origin-right">
                <TonConnectButton />
              </div>
            </div>
          )}
        </section>

        {/* Payment History */}
        <section aria-label="Payment history">
          <h3 className="text-xs font-semibold text-foreground-muted mb-2 uppercase tracking-wider">
            Payment History
          </h3>
          <div className="space-y-2.5">
            {isLoading ? (
              <div className="text-center text-sm text-foreground-muted py-6">
                Loading payments...
              </div>
            ) : error ? (
              <div className="text-center text-sm text-red-500 py-6">
                Failed to load payments
              </div>
            ) : !data?.payments?.length ? (
              <div className="text-center text-sm text-foreground-muted py-6">
                No payments yet
              </div>
            ) : (
              data.payments.map((payment: Payment) => {
                const isReceived = payment.type === "received";
                const counterpartyAddr = isReceived ? payment.from : payment.to;

                return (
                  <div
                    key={payment.txHash}
                    className="card-surface rounded-2xl p-4 space-y-3 border border-white/5"
                  >
                    {/* Top row: direction icon + label + amount */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isReceived
                            ? "bg-[hsl(var(--status-success-bg))]"
                            : "bg-[hsl(var(--status-pending-bg))]"
                        }`}
                      >
                        <i
                          className={`text-lg ${
                            isReceived
                              ? "ri-arrow-down-line text-[hsl(var(--status-success))]"
                              : "ri-arrow-up-line text-[hsl(var(--status-pending))]"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {payment.label}
                        </h4>
                        <p className="text-[10px] text-foreground-muted mt-0.5">
                          {formatDateISO(payment.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            isReceived
                              ? "text-[hsl(var(--status-success))]"
                              : "text-[hsl(var(--status-pending))]"
                          }`}
                        >
                          {isReceived ? "+" : "-"}
                          {payment.amount}
                        </span>
                        <Image
                          src={"/ton.svg"}
                          alt="TON"
                          height={14}
                          width={14}
                        />
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="bg-background-secondary rounded-xl p-2.5 space-y-1.5 border border-white/5">
                      {/* From / To counterparty */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground-subtle uppercase tracking-wider font-medium">
                          {isReceived ? "From" : "To"}
                        </span>
                        <code className="text-[11px] text-foreground-muted font-mono">
                          {truncateAddressShort(counterpartyAddr)}
                        </code>
                      </div>

                      {/* My wallet */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground-subtle uppercase tracking-wider font-medium">
                          Wallet
                        </span>
                        <code className="text-[11px] text-foreground-muted font-mono">
                          {truncateAddressShort(isReceived ? payment.to : payment.from)}
                        </code>
                      </div>

                      {/* Tx hash */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground-subtle uppercase tracking-wider font-medium">
                          Tx ID
                        </span>
                        <code className="text-[11px] text-foreground-muted font-mono">
                          {truncateTxHash(payment.txHash)}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
