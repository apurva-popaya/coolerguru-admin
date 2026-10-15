"use client";

import type { MouseEvent } from "react";

import type { ReactTable, RowData } from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { DataTablePaginationConfig } from "./types";

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>;

  config?: DataTablePaginationConfig;
}

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from(
      {
        length: pageCount,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= pageCount - 2) {
    return [pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

export function DataTablePagination<TData extends RowData>({ table, config }: DataTablePaginationProps<TData>) {
  const pageSizeOptions = config?.pageSizeOptions ?? [10, 20, 30, 50];

  const showPageInfo = config?.showPageInfo ?? true;

  const showRowsPerPage = config?.showRowsPerPage ?? true;

  const pageCount = Math.max(table.getPageCount(), 1);

  const currentPage = Math.min(table.state.pagination.pageIndex + 1, pageCount);

  const pageNumbers = getPageNumbers(currentPage, pageCount);

  const totalRows = table.getFilteredRowModel().rows.length;

  const pageSize = table.state.pagination.pageSize;

  const start = totalRows === 0 ? 0 : table.state.pagination.pageIndex * pageSize + 1;

  const end = totalRows === 0 ? 0 : Math.min(start + pageSize - 1, totalRows);

  return (
    <div className="admin-pagination flex flex-col gap-4 border-border border-t px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
        {showPageInfo && (
          <span>
            Showing {start} to {end} of {totalRows}
          </span>
        )}

        {showRowsPerPage && (
          <div className="flex items-center gap-2">
            <span>Rows per page</span>

            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));

                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-9 w-[80px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent side="top">
                <SelectGroup>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={`${option}`}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Pagination className="mx-0 w-auto justify-start md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={!table.getCanPreviousPage()}
              tabIndex={!table.getCanPreviousPage() ? -1 : undefined}
              href="#"
              text="Previous"
              className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventNavigation(event);

                table.previousPage();
              }}
            />
          </PaginationItem>

          {pageNumbers[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(event) => {
                    preventNavigation(event);

                    table.setPageIndex(0);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {pageNumbers[0] > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={currentPage === pageNumber}
                onClick={(event) => {
                  preventNavigation(event);

                  table.setPageIndex(pageNumber - 1);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          {pageNumbers[pageNumbers.length - 1] < pageCount && (
            <>
              {pageNumbers[pageNumbers.length - 1] < pageCount - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(event) => {
                    preventNavigation(event);

                    table.setPageIndex(pageCount - 1);
                  }}
                >
                  {pageCount}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              aria-disabled={!table.getCanNextPage()}
              tabIndex={!table.getCanNextPage() ? -1 : undefined}
              href="#"
              text="Next"
              className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                preventNavigation(event);

                table.nextPage();
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
