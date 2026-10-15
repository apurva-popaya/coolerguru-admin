"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import {
  Plus,
} from "lucide-react";

import {
  DataTable,
} from "@/components/common/data-table/data-table";

import {
  PageHeader,
} from "@/components/common/page-header";

import {
  Button,
} from "@/components/ui/button";

import {
  getAdminUsers,
  getAdminUsersSummary,
  type AdminUsersSummary,
  type AdminUserListItem,
} from "@/lib/api/admin-users-api";

import {
  dataTableFeatures,
} from "@/lib/data-table-features";

import {
  createUsersColumns,
} from "./users-columns";

import {
  mapAdminUserToRow,
  type AdminUserRow,
} from "./users-data";

import {
  UsersFilters,
  type UsersFilterValues,
} from "./users-filters";

import {
  UsersStats,
} from "./users-stats";

const initialFilters: UsersFilterValues = {
  search: "",
  role: "ALL",
  accountType: "ALL",
  status: "ALL",
};

const emptySummary: AdminUsersSummary = {
  total: 0,
  buyers: 0,
  suppliers: 0,
  active: 0,
  inactive: 0,
};

export function AdminUsers() {
  const searchParams = useSearchParams();
  const [
    users,
    setUsers,
  ] =
    React.useState<AdminUserRow[]>(
      [],
    );

  const [
    summary,
    setSummary,
  ] =
    React.useState<AdminUsersSummary>(
      emptySummary,
    );

  const [
    totalItems,
    setTotalItems,
  ] = React.useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = React.useState(1);

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    error,
    setError,
  ] = React.useState("");

  const [
    filters,
    setFilters,
  ] =
    React.useState<UsersFilterValues>(
      initialFilters,
    );

  const [
    appliedSearch,
    setAppliedSearch,
  ] = React.useState("");

  const [
    sorting,
    setSorting,
  ] =
    React.useState<SortingState>(
      [],
    );

  const [
    columnFilters,
    setColumnFilters,
  ] =
    React.useState<ColumnFiltersState>(
      [],
    );

  const [
    columnVisibility,
    setColumnVisibility,
  ] =
    React.useState<ColumnVisibilityState>(
      {
        search: false,
      },
    );

  const [
    pagination,
    setPagination,
  ] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

    React.useEffect(() => {
  const globalSearch =
    searchParams.get("search")?.trim() ?? "";

  setAppliedSearch(
    globalSearch,
  );

  setFilters(
    (previous) => ({
      ...previous,
      search: globalSearch,
    }),
  );

  setPagination(
    (previous) => ({
      ...previous,
      pageIndex: 0,
    }),
  );
}, [searchParams]);

  const userSnapshot = React.useRef<Promise<AdminUserListItem[]> | null>(null);
  const loadSequence = React.useRef(0);

  const loadUsers = React.useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    try {
      if (!userSnapshot.current) {
        userSnapshot.current = (async () => {
          const first = await getAdminUsers({ page: 1, limit: 100 });
          if (!first.data) throw new Error("Unable to load users. Please try again.");
          const result = [...first.data.users];
          for (let page = 2; page <= first.data.pagination.totalPages; page++) {
            const response = await getAdminUsers({ page, limit: first.data.pagination.limit });
            if (!response.data) throw new Error("Unable to load users. Please try again.");
            result.push(...response.data.users);
          }
          return result;
        })();
      }
      const snapshot = userSnapshot.current;
      let allUsers: AdminUserListItem[];
      try {
        allUsers = await snapshot;
      } catch (error) {
        if (userSnapshot.current === snapshot) userSnapshot.current = null;
        throw error;
      }
      if (sequence !== loadSequence.current) return;
      const search = appliedSearch.toLowerCase();
      const matchingUsers = allUsers.filter((user) => {
        if (filters.role !== "ALL" && !user.roles.includes(filters.role)) return false;
        if (filters.accountType !== "ALL" && user.account_type !== filters.accountType) return false;
        if (filters.status !== "ALL" && user.status !== filters.status) return false;
        return !search || [user.name, user.email, user.phone_number, user.company?.name, user.user_id]
          .join(" ").toLowerCase().includes(search);
      });
      const pages = Math.max(Math.ceil(matchingUsers.length / pagination.pageSize), 1);
      const pageIndex = Math.min(pagination.pageIndex, pages - 1);
      setUsers(matchingUsers.slice(pageIndex * pagination.pageSize, (pageIndex + 1) * pagination.pageSize)
        .map(mapAdminUserToRow));
      setTotalItems(matchingUsers.length);
      setTotalPages(pages);
      if (pageIndex !== pagination.pageIndex) setPagination((previous) => ({ ...previous, pageIndex }));
    } catch {
      if (sequence !== loadSequence.current) return;
      setUsers([]);
      setTotalItems(0);
      setTotalPages(1);
      setError("Unable to load users. Please try again.");
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [appliedSearch, filters.role, filters.accountType, filters.status, pagination.pageIndex, pagination.pageSize]);
  const loadSummary =
    React.useCallback(
      async () => {
        try {
          const response =
            await getAdminUsersSummary();

          if (
            response.data
              ?.summary
          ) {
            setSummary(
              response.data
                .summary,
            );
          }
        } catch (error) {
          console.error(
            "Unable to load user summary:",
            error,
          );
        }
      },
      [],
    );

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  React.useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleStatusUpdated =
  React.useCallback(
    () => {
      userSnapshot.current = null;
      void loadUsers();
      void loadSummary();
    },
    [
      loadUsers,
      loadSummary,
    ],
  );

  const columns =
  React.useMemo(
    () =>
      createUsersColumns({
        onStatusUpdated:
          handleStatusUpdated,
      }),
    [
      handleStatusUpdated,
    ],
  );

  const table =
    useTable({
      features:
        dataTableFeatures,

      data:
        users,

      columns,

      state: {
        sorting,
        columnFilters,
        columnVisibility,
        pagination,
      },

      getRowId:
        (row) => row.id,

      manualFiltering: true,

      manualPagination:
        true,

      pageCount:
        totalPages,

      rowCount:
        totalItems,

      autoResetPageIndex:
        false,

      onSortingChange:
        setSorting,

      onColumnFiltersChange:
        setColumnFilters,

      onColumnVisibilityChange:
        setColumnVisibility,

      onPaginationChange:
        setPagination,
    });

  function handleFiltersChange(
    values: UsersFilterValues,
  ) {
    setAppliedSearch(values.search.trim());
    setFilters(
      values,
    );

    setPagination(
      (previous) => ({
        ...previous,
        pageIndex: 0,
      }),
    );
  }

  function handleReset() {
    setFilters(
      initialFilters,
    );

    setAppliedSearch("");

    setPagination(
      (previous) => ({
        ...previous,
        pageIndex: 0,
      }),
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <PageHeader
        title="Manage Users"
        description="View and manage buyers, suppliers, and administrators on CoolerGuru."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/users/add">
                <Plus data-icon="inline-start" />
                Add User
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/add-admin">
                <Plus data-icon="inline-start" />
                Add Admin
              </Link>
            </Button>
          </div>
        }
      />

      <UsersStats total={summary.total} buyers={summary.buyers} suppliers={summary.suppliers} active={summary.active} inactive={summary.inactive} />

      <UsersFilters values={filters} onChange={handleFiltersChange} onReset={handleReset} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-admin-14 font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <p className="text-admin-16 font-semibold text-foreground" aria-live="polite">
        {loading ? "Loading users..." : `Users (${totalItems})`}
      </p>

      <DataTable
        className="users-table"
        table={table}
        emptyState={{
          title:
            loading
              ? "Loading users..."
              : "No users found",

          description:
            loading
              ? "Please wait while users are being loaded."
              : "Try changing or resetting the user filters.",
        }}
      />
    </div>
  );
}

