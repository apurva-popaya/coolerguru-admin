"use client";

import * as React from "react";
import Link from "next/link";

import {
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={updating} aria-label={`Actions for ${user.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild><Link href={`/users/${user.backendId}`}><Eye />View user</Link></DropdownMenuItem>
          <DropdownMenuItem disabled={updating} variant={user.status === "Active" ? "destructive" : "default"}
            onSelect={(event) => { event.preventDefault(); void handleStatusChange(); }}>
            {user.status === "Active" ? <UserX /> : <UserCheck />}
            {updating ? "Updating..." : `${user.status === "Active" ? "Deactivate" : "Activate"} ${user.roles.includes("Admin") ? "Admin" : "User"}`}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {error && <p role="alert" className="px-3 py-2 text-sm text-destructive">{error}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
