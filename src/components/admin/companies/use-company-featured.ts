"use client";

import * as React from "react";

import {
  getFeaturedCompanies,
  updateFeaturedCompany,
} from "@/lib/api/admin-featured-companies-api";

import type { CompanyRow } from "./companies-data";

async function getAllFeaturedCompanies() {
  const first = await getFeaturedCompanies({ featured: "FEATURED", page: 1, limit: 100 });
  const totalPages = Math.max(Number(first.data?.pagination.total_pages ?? 1), 1);
  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getFeaturedCompanies({ featured: "FEATURED", page: index + 2, limit: 100 }),
    ),
  );
  return [
    ...(first.data?.companies ?? []),
    ...remaining.flatMap((response) => response.data?.companies ?? []),
  ].sort((a, b) =>
    (a.featured_priority ?? Number.MAX_SAFE_INTEGER) - (b.featured_priority ?? Number.MAX_SAFE_INTEGER),
  );
}

export function useCompanyFeatured(
  reload: () => Promise<void>,
  onError: (message: string | null) => void,
) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updating = React.useRef(false);
  const [draggedCompanyId, setDraggedCompanyId] = React.useState<number | null>(null);
  const [dropTargetCompanyId, setDropTargetCompanyId] = React.useState<number | null>(null);

  const resetDrag = React.useCallback(() => {
    setDraggedCompanyId(null);
    setDropTargetCompanyId(null);
  }, []);

  const runUpdate = React.useCallback(async (action: () => Promise<void>) => {
    if (updating.current) return;
    updating.current = true;
    setIsUpdating(true);
    onError(null);
    let failure: string | null = null;
    try {
      await action();
    } catch (error) {
      failure = error instanceof Error ? error.message : "Unable to update featured companies.";
    } finally {
      // Refresh even after a partial update so displayed priorities reflect the backend.
      await reload();
      if (failure) onError(failure);
      updating.current = false;
      setIsUpdating(false);
      resetDrag();
    }
  }, [reload, onError, resetDrag]);

  const toggleFeatured = React.useCallback((company: CompanyRow) => runUpdate(async () => {
    if (company.featured) {
      await updateFeaturedCompany(company.companyId, { is_featured: false });
      const remaining = await getAllFeaturedCompanies();
      for (const [index, item] of remaining.entries()) {
        if (item.featured_priority !== index + 1) {
          await updateFeaturedCompany(item.company_id, { is_featured: true, priority: index + 1 });
        }
      }
    } else {
      const featured = await getAllFeaturedCompanies();
      const priority = featured.reduce((maximum, item) => Math.max(maximum, item.featured_priority ?? 0), 0) + 1;
      await updateFeaturedCompany(company.companyId, { is_featured: true, priority });
    }
  }), [runUpdate]);

  const reorder = React.useCallback((sourceId: number, targetId: number | null, direction = 0) => runUpdate(async () => {
    const ordered = await getAllFeaturedCompanies();
    const sourceIndex = ordered.findIndex((company) => company.company_id === sourceId);
    const targetIndex = targetId === null ? sourceIndex + direction :
      ordered.findIndex((company) => company.company_id === targetId);
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length || sourceIndex === targetIndex) return;
    const [moved] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, moved);
    const temporaryPriority = ordered.reduce((maximum, item) => Math.max(maximum, item.featured_priority ?? 0), 0) + 1;
    await updateFeaturedCompany(sourceId, { is_featured: true, priority: temporaryPriority });
    // Shift toward the vacated position to avoid colliding with existing priorities.
    const shifted = ordered.map((company, index) => ({ company, priority: index + 1 }))
      .filter(({ company, priority }) => company.company_id !== sourceId && company.featured_priority !== priority);
    if (sourceIndex > targetIndex) shifted.reverse();
    for (const { company, priority } of shifted) {
      await updateFeaturedCompany(company.company_id, { is_featured: true, priority });
    }
    await updateFeaturedCompany(sourceId, { is_featured: true, priority: targetIndex + 1 });
  }), [runUpdate]);

  const drop = React.useCallback((targetId: number) => {
    if (draggedCompanyId !== null && draggedCompanyId !== targetId) {
      void reorder(draggedCompanyId, targetId);
    } else {
      resetDrag();
    }
  }, [draggedCompanyId, reorder, resetDrag]);

  const movePriority = React.useCallback((companyId: number, direction: -1 | 1) => {
    void reorder(companyId, null, direction);
  }, [reorder]);

  return React.useMemo(() => ({
    isUpdating, draggedCompanyId, dropTargetCompanyId, toggleFeatured,
    startDrag: setDraggedCompanyId, overDrag: setDropTargetCompanyId, resetDrag, drop, movePriority,
  }), [isUpdating, draggedCompanyId, dropTargetCompanyId, toggleFeatured, resetDrag, drop, movePriority]);
}
