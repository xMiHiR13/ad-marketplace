"use client";

import { useState, useRef } from "react";
import { WebAppUser } from "@/types/telegram";
import { toast } from "@/components/shared/Toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ChannelManagersProps {
  channelId: number;
  managerIds: number[];
  onManagersChange: (newManagerIds: number[]) => void;
  isUpdatingManagers: boolean;
}

type AdminUser = Pick<WebAppUser, "id" | "first_name" | "username">;

function UserAvatar({
  user,
  size = "md",
}: {
  user: AdminUser;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  // Generate initials
  const initials = user.first_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center`}
    >
      <span className={`${textSize} font-medium text-primary`}>{initials}</span>
    </div>
  );
}

function UserInfo({
  user,
  showUsername = true,
}: {
  user: AdminUser;
  showUsername?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-foreground truncate">
        {user.first_name}
      </p>
      {showUsername && user.username && (
        <p className="text-xs text-foreground-muted truncate">
          @{user.username}
        </p>
      )}
    </div>
  );
}

export function ChannelManagers({
  channelId,
  managerIds,
  onManagersChange,
  isUpdatingManagers,
}: ChannelManagersProps) {
  // UI States
  const [isExpanded, setIsExpanded] = useState(false);
  const [allAdmins, setAllAdmins] = useState<AdminUser[]>([]); // Cached full admin list
  const adminsLoadedRef = useRef(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  // Add flow states
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [removingManagerId, setRemovingManagerId] = useState<number | null>(
    null,
  );

  // Compute available admins from cached list (excluding current managers)
  const availableAdmins = allAdmins.filter(
    (admin) => !managerIds.includes(admin.id),
  );

  const fetchAdmins = async () => {
    if (!adminsLoadedRef.current) {
      setIsLoadingAdmins(true);

      try {
        const res = await fetch("/api/telegram/fetch-admins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId: channelId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error("Admins fetch failed", {
            description: data.error,
          });
          return;
        }
        setAllAdmins(data.admins);
        adminsLoadedRef.current = true;
      } catch (error) {
        console.error("Error fetching admins", error);
        toast.error("Error fetching admins");
      }

      setIsLoadingAdmins(false);
    }
  };

  // Load managers when expanded
  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    setIsExpanded(true);
    await fetchAdmins();
  };

  // Handle add manager flow (with caching)
  const handleStartAdd = async () => {
    setShowAddFlow(true);
    setSelectedAdminIds([]);
    await fetchAdmins();
  };

  const handleToggleAdmin = (adminId: number) => {
    setSelectedAdminIds((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId],
    );
  };

  const handleConfirmAdd = () => {
    if (selectedAdminIds.length === 0) return;
    const newManagerIds = [...managerIds, ...selectedAdminIds];
    onManagersChange(newManagerIds);
    setSelectedAdminIds([]);
  };

  const handleCancelAdd = () => {
    setShowAddFlow(false);
    setSelectedAdminIds([]);
  };

  const handleRemoveManager = async (managerId: number) => {
    setRemovingManagerId(managerId);
    const newManagerIds = managerIds.filter((id) => id !== managerId);
    onManagersChange(newManagerIds);
    setRemovingManagerId(null);
  };

  return (
    <div className="card-surface overflow-hidden">
      {/* Header */}
      <button
        onClick={handleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <i className="ri-team-line text-lg text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Managers</p>
            <p className="text-xs text-foreground-muted">
              {managerIds.length}{" "}
              {managerIds.length === 1 ? "manager" : "managers"}
            </p>
          </div>
        </div>
        <i
          className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line text-lg text-foreground-muted transition-transform`}
        />
      </button>

      {/* Expanded content with smooth transition */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: isExpanded ? "1000px" : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="border-t border-white/5">
          {/* Loading state */}
          {isLoadingAdmins && (
            <div className="p-4 flex items-center gap-2 text-foreground-muted">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading managers...</span>
            </div>
          )}

          {/* Managers list */}
          {!isLoadingAdmins && (
            <div className="p-4 space-y-3">
              {/* Info banner */}
              <div className="p-3 rounded-md bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-300">
                  Managers can handle deals on behalf of the publisher. They
                  cannot manage other managers or access owner settings.
                </p>
              </div>

              {/* Manager list */}
              {managerIds.length === 0 ? (
                <p className="text-xs text-foreground-muted text-center py-4">
                  No managers added yet
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {allAdmins
                    .filter((admin) => managerIds.includes(admin.id))
                    .map((manager: AdminUser) => (
                      <div
                        key={manager.id}
                        className="flex items-center gap-3 p-2 rounded-md bg-white/5 border border-white/5"
                      >
                        <UserAvatar user={manager} />
                        <UserInfo user={manager} />
                        <button
                          onClick={() => handleRemoveManager(manager.id)}
                          disabled={removingManagerId === manager.id || isUpdatingManagers}
                          className="w-8 h-8 rounded-md bg-status-error/10 border border-status-error/20 flex items-center justify-center hover:bg-status-error/20 transition-colors disabled:opacity-50"
                        >
                          {removingManagerId === manager.id ? (
                            <span className="w-4 h-4 border-2 border-status-error border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <i className="ri-close-line text-sm text-status-error" />
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Add button or Add flow */}
              {!showAddFlow ? (
                <button
                  onClick={handleStartAdd}
                  className="w-full py-2.5 rounded-md bg-white/5 border border-white/10 text-sm text-foreground font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-user-add-line" />
                  Add Manager
                </button>
              ) : (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                      Select Admins
                    </h4>
                    <button
                      onClick={handleCancelAdd}
                      className="text-xs text-foreground-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Loading admins */}
                  {isLoadingAdmins && (
                    <div className="py-6 flex flex-col items-center gap-2 text-foreground-muted">
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">
                        Fetching admins from Telegram...
                      </span>
                    </div>
                  )}

                  {/* Admins list */}
                  {!isLoadingAdmins && (
                    <>
                      {availableAdmins.length === 0 ? (
                        <p className="text-xs text-foreground-muted text-center py-4">
                          No available admins to add. All channel admins are
                          already managers.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {availableAdmins.map((admin) => {
                            const isSelected = selectedAdminIds.includes(
                              admin.id,
                            );

                            return (
                              <div
                                key={admin.id}
                                onClick={() => handleToggleAdmin(admin.id)}
                                className={`w-full flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleToggleAdmin(admin.id)
                                  }
                                  disabled={isUpdatingManagers}
                                  onClick={(e) => e.stopPropagation()} // prevent double toggle
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <UserAvatar user={admin} size="sm" />
                                <UserInfo user={admin} />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Confirm button */}
                      {availableAdmins.length > 0 && (
                        <button
                          onClick={handleConfirmAdd}
                          disabled={
                            selectedAdminIds.length === 0 || isUpdatingManagers
                          }
                          className="w-full h-10 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isUpdatingManagers ? (
                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <i className="ri-check-line" />
                              Add{" "}
                              {selectedAdminIds.length > 0
                                ? `${selectedAdminIds.length} `
                                : ""}
                              {selectedAdminIds.length === 1
                                ? "Manager"
                                : "Managers"}
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
