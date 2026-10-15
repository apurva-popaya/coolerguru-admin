"use client";

import { Pencil, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SafeImage } from "@/components/common/safe-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ContentManagementData,
  type ContentSection,
  getContentManagement,
} from "@/lib/api/content-management-api";
import { ApiError } from "@/lib/api/api-client";

/* Add Content UI retained for future use. Restore the Plus import when enabling it.
function AddContentButton() {
  return (
    <Button asChild>
      <Link href="/content-management/add">
        <Plus data-icon="inline-start" />
        Add Content
      </Link>
    </Button>
  );
}

*/

export function ContentManagementTable() {
  const [records, setRecords] = useState<ContentSection[]>([]);
  const [metadata, setMetadata] = useState<ContentManagementData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getContentManagement();
      setMetadata(data);
      setRecords(data.sections);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "Unable to load content.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const contentPages = metadata?.pages ?? [];
  const contentSectionOptions = (metadata?.section_options ?? []).map(
    (option) => ({
      ...option,
      contentTypeLabel: option.content_types[0]?.label,
    }),
  );

  const filtered = records.filter((record) => {
    const page =
      contentPages.find((item) => item.id === record.page)?.label ??
      record.page;
    const section = contentSectionOptions.find(
      (item) => item.id === record.section && item.page === record.page,
    );
    return `${page} ${section?.label ?? record.section} ${section?.contentTypeLabel ?? record.content_type}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        title="Content Management"
        description="Manage images and content displayed across CoolerGuru."
        // action={<AddContentButton />} // Restore when Add Content is enabled.
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load content.</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <InputGroup className="h-11 min-w-0 flex-1 rounded-xl">
              <InputGroupInput aria-label="Search content" placeholder="Search pages, sections or content types..."
                value={search} onChange={(event) => setSearch(event.target.value)} className="h-full" />
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            </InputGroup>
            <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl"
              onClick={() => setSearch("")} disabled={!search} aria-label="Reset search" title="Reset search"><RotateCcw /></Button>
          </div>
          <section
            aria-labelledby="content-sections-heading"
            className="flex min-w-0 flex-col gap-3"
          >
            <h2
              id="content-sections-heading"
              className="font-bold text-foreground text-admin-17"
            >
              Content sections{!loading && ` (${filtered.length})`}
            </h2>
            <div className="content-list-table min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {loading ? (
                <div
                  role="status"
                  aria-label="Loading content"
                  className="flex flex-col gap-3"
                >
                  {[1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-16 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No content found</EmptyTitle>
                    <EmptyDescription>
                      {search
                        ? "Try a different search."
                        : "Manage your homepage and other visual content by adding a content section."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {/* {!search && <AddContentButton />} */}
                </Empty>
              ) : (
                <Table className="content-sections-table">
                  <TableHeader>
                    <TableRow>
                      {[
                        "#",
                        "Page",
                        "Section",
                        "Preview",
                        "Content Type",
                        "Images",
                        "Status",
                        "Updated",
                        "Actions",
                      ].map((label) => (
                        <TableHead key={label}>{label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((record, index) => {
                      const section = contentSectionOptions.find(
                        (item) =>
                          item.id === record.section &&
                          item.page === record.page,
                      );
                      return (
                        <TableRow key={record.id}>
                          <TableCell data-label="#">{index + 1}</TableCell>
                          <TableCell data-label="Page">
                            {contentPages.find(
                              (item) => item.id === record.page,
                            )?.label ?? record.page}
                          </TableCell>
                          <TableCell data-label="Section">
                            <span className="font-semibold text-primary">
                              {section?.label ?? record.section}
                            </span>
                          </TableCell>
                          <TableCell data-label="Preview">
                            <SafeImage
                              src={record.images[0]?.image_url}
                              alt={`${section?.label ?? record.section} preview`}
                              width={160}
                              height={80}
                              className="h-16 w-full max-w-40 rounded-lg border border-border bg-muted/40 object-contain"
                            />
                          </TableCell>
                          <TableCell data-label="Content Type">
                            {section?.contentTypeLabel ?? record.content_type}
                          </TableCell>
                          <TableCell data-label="Images">
                            {record.images.length}{" "}
                            {record.images.length === 1 ? "image" : "images"}
                          </TableCell>
                          <TableCell data-label="Status">
                            <StatusBadge variant={record.status === "active" ? "success" : "neutral"}>
                              {record.status === null
                                ? "Unavailable"
                                : record.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                            </StatusBadge>
                          </TableCell>
                          <TableCell data-label="Updated">
                            <span className="text-muted-foreground">
                              {record.updated_at &&
                              !Number.isNaN(Date.parse(record.updated_at))
                                ? new Date(record.updated_at).toLocaleString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell data-label="Actions">
                            <Button asChild variant="ghost" size="icon" title="Edit content">
                              <Link
                                href={`/content-management/${encodeURIComponent(record.id)}/edit`}
                                aria-label={`Edit ${section?.label ?? record.section}`}
                              >
                                <Pencil />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
