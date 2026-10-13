"use client";

import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { SafeImage } from "@/components/common/safe-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
import { contentManagementClassName } from "./content-management-styles";

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
    <div className={contentManagementClassName}>
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
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="relative w-full sm:max-w-lg">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search content"
                placeholder="Search by page, section or content type..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
          </div>
          <section
            aria-labelledby="content-sections-heading"
            className="flex min-w-0 flex-col gap-3"
          >
            <h2
              id="content-sections-heading"
              className="font-bold text-primary text-admin-17"
            >
              Content sections{!loading && ` (${filtered.length})`}
            </h2>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {contentPages.find(
                              (item) => item.id === record.page,
                            )?.label ?? record.page}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {section?.label ?? record.section}
                            </span>
                          </TableCell>
                          <TableCell>
                            <SafeImage
                              src={record.images[0]?.image_url}
                              alt={`${section?.label ?? record.section} preview`}
                              width={160}
                              height={80}
                              className="h-20 w-40 rounded-lg border border-border bg-background object-contain"
                            />
                          </TableCell>
                          <TableCell>
                            {section?.contentTypeLabel ?? record.content_type}
                          </TableCell>
                          <TableCell>
                            {record.images.length}{" "}
                            {record.images.length === 1 ? "image" : "images"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {record.status === null
                                ? "Unavailable"
                                : record.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
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
                          <TableCell>
                            <Button asChild variant="outline">
                              <Link
                                href={`/content-management/${encodeURIComponent(record.id)}/edit`}
                                aria-label={`Edit ${section?.label ?? record.section}`}
                              >
                                Edit
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
