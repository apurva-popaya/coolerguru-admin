"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/api-client";
import { type ContentManagementData, type ContentSection, getContentManagement, saveContentSection } from "@/lib/api/content-management-api";
import { ContentImageUploader } from "./content-image-uploader";

const initialContent: ContentSection = { id: "", page: "homepage", section: "", content_type: "", images: [], status: "active" };

function Choice({ id, label, value, options, disabled, onChange, placeholder }: {
  id: string; label: string; value: string; options: { id: string; label: string }[];
  disabled?: boolean; onChange?: (value: string) => void; placeholder?: string;
}) {
  return <Field data-disabled={disabled}><FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full rounded-xl data-[size=default]:h-11"><SelectValue placeholder={placeholder ?? "Select an option"} /></SelectTrigger>
      <SelectContent className="[&_[data-slot=select-item]]:min-h-9 [&_[data-slot=select-item]]:text-admin-15"><SelectGroup>{options.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
    </Select>
  </Field>;
}

export function ContentSectionForm({ id }: { id?: string }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentSection>(initialContent);
  const [records, setRecords] = useState<ContentSection[]>([]);
  const [metadata, setMetadata] = useState<ContentManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getContentManagement();
      const sections = data.sections;
      setMetadata(data);
      setRecords(sections);
      if (id) {
        const record = sections.find((item) => item.id === id);
        if (!record) { setLoadError("Content not found. Return to Content Management to select a section."); return; }
        setContent(record);
      }
    } catch (cause) { setLoadError(cause instanceof ApiError ? cause.message : "Unable to load content."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const options = (metadata?.section_options ?? []).filter((option) => option.page === content.page);
  const selected = options.find((option) => option.id === content.section);
  const existing = !id && records.find((record) => record.page === content.page && record.section === content.section);
  const canSave = !loading && !loadError && !saving && !existing && Boolean(selected)
    && content.images.length > 0 && Boolean(content.content_type) && content.status !== null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await saveContentSection(content);
      toast.success(id ? "Content updated successfully." : "Content added successfully.");
      router.push("/content-management");
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Unable to save content. Please try again."); }
    finally { setSaving(false); }
  }

  return <div className="flex min-w-0 flex-col gap-4">
    <Link href="/content-management" className="inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft aria-hidden="true" className="size-4" />Back to Content Management</Link>
    <PageHeader title={id ? "Edit Content" : "Add Content"} description="Choose a section and update its image." />
    {loadError ? <Alert variant="destructive"><AlertTitle>Unable to load content.</AlertTitle><AlertDescription>
      <p>{loadError}</p><Button variant="outline" onClick={() => void load()}>Retry</Button>
      <Button asChild variant="link"><Link href="/content-management">Back to content</Link></Button>
    </AlertDescription></Alert> : loading ? <Skeleton className="h-96 w-full" role="status" aria-label="Loading content" /> : <form onSubmit={save}>
      <Card className="min-w-0 rounded-2xl border border-border shadow-sm ring-0 [--card-spacing:1rem] sm:[--card-spacing:1.5rem]"><CardHeader className="border-b border-border"><CardTitle>Content details</CardTitle><CardDescription>Manage the image for a page section.</CardDescription></CardHeader>
        <CardContent><FieldGroup className="gap-5">
          <FieldGroup className="grid gap-4 md:grid-cols-3">
            <Choice id="content-page" label="Page *" value={content.page} options={metadata?.pages ?? []} disabled={saving || Boolean(id)} onChange={(page) => setContent({ ...initialContent, page })} />
            <Choice id="content-section" label="Section *" value={content.section} options={options.map((item) => ({ id: item.id, label: item.label }))} disabled={saving || Boolean(id)} onChange={(section) => {
              const option = options.find((item) => item.id === section);
              setContent((current) => ({ ...current, section, content_type: option?.content_types[0]?.id ?? "", images: [] }));
            }} />
            <Choice id="content-type" label="Content Type *" value={content.content_type} disabled={!selected || saving} options={selected?.content_types ?? []} onChange={(content_type) => setContent((current) => ({ ...current, content_type }))} />
          </FieldGroup>
          {existing && <Alert><AlertTitle>This section already exists</AlertTitle><AlertDescription>
            <Button asChild variant="link"><Link href={`/content-management/${encodeURIComponent(existing.id)}/edit`}>Edit existing content</Link></Button>
          </AlertDescription></Alert>}
          <div className="border-t border-border pt-5">
          <ContentImageUploader images={content.images} disabled={saving || !selected || Boolean(existing)} onChange={(images) => { setContent((current) => ({ ...current, images })); setError(""); }} />
          </div>
          {selected?.id === "hero" && <FieldDescription>Recommended size: 2172 × 724 pixels. Keep the left side clear for the homepage heading and buttons.</FieldDescription>}
          <FieldGroup className="max-w-sm border-t border-border pt-5">
            <Choice id="content-status" label="Status" value={content.status ?? ""} disabled={saving} options={[{ id: "active", label: "Active" }, { id: "inactive", label: "Inactive" }]} onChange={(status) => {
              if (status === "active" || status === "inactive") setContent((current) => ({ ...current, status }));
            }} />
            <FieldDescription>Active content is available for display on the selected page.</FieldDescription>
          </FieldGroup>
          {content.images.length === 0 && <FieldDescription>Choose an image to save content.</FieldDescription>}
          {error && <Alert variant="destructive"><AlertTitle>Unable to save content.</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </FieldGroup></CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 py-4 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" disabled={saving} className="h-10 rounded-xl"><Link href="/content-management" aria-disabled={saving} onClick={(event) => { if (saving) event.preventDefault(); }}>Cancel</Link></Button>
          <Button type="submit" disabled={!canSave} className="h-10 min-w-36 rounded-xl">{saving && <Loader2 data-icon="inline-start" className="animate-spin" />}{saving ? "Saving..." : id ? "Update Content" : "Save Content"}</Button>
        </CardFooter>
      </Card>
    </form>}
  </div>;
}
