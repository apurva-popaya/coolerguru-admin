"use client";

import * as React from "react";

import {
  MoreVertical,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  changeAdminUserStatus,
} from "@/lib/api/admin-users-api";

import {
  getApiErrorMessage,
} from "@/lib/api/get-api-error-message";

import type {
  AdminUserRow,
} from "./users-data";

interface UserActionsMenuProps {
  user:
    AdminUserRow;

  onStatusUpdated?:
    () => void;
}

export function UserActionsMenu({
  user,
  onStatusUpdated,
}: UserActionsMenuProps) {
  const [
    open,
    setOpen,
  ] = React.useState(false);

  const [
    updating,
    setUpdating,
  ] = React.useState(false);

  const [
    error,
    setError,
  ] = React.useState("");

  const containerRef =
    React.useRef<HTMLDivElement>(
      null,
    );

  React.useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const element =
        containerRef.current;

      if (
        element &&
        !element.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  async function handleStatusChange() {
    const nextActive =
      user.status !== "Active";

    const action =
      nextActive
        ? "activate"
        : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${user.name}?`,
      );

    if (!confirmed) {
      return;
    }

    setUpdating(true);
    setError("");

    try {
      const response = await changeAdminUserStatus(
        user.backendId,
        nextActive,
      );
      if (response.success === false) {
        throw new Error(response.message || "Unable to update user status.");
      }

      setOpen(false);

      onStatusUpdated?.();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
        ),
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Button type="button" variant="outline" size="icon-sm" onClick={() => setOpen((current) => !current)} className="border-[#d9d8ef] text-[#2720a8] hover:bg-[#f3f2ff]" aria-label={`Actions for ${user.name}`}>
        <MoreVertical className="size-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-10 z-50 min-w-[190px] overflow-hidden rounded-[8px] border border-[#e4e4ef] bg-white py-1 shadow-[0_10px_30px_rgba(20,19,70,0.14)]">
          <button type="button" disabled={updating} onClick={() => { void handleStatusChange(); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-[#313650] text-admin-14 transition hover:bg-[#f7f7fb] disabled:opacity-50">
            {user.status === "Active" ? (
              <>
                <UserX className="size-4 text-amber-600" />
                {updating ? "Deactivating..." : user.roles.includes("Admin") ? "Deactivate Admin" : "Deactivate User"}
              </>
            ) : (
              <>
                <UserCheck className="size-4 text-green-600" />
                {updating ? "Activating..." : user.roles.includes("Admin") ? "Activate Admin" : "Activate User"}
              </>
            )}
          </button>

          {error ? (
            <div className="px-4 py-2 text-admin-14 text-red-600">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
