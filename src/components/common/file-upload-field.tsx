"use client";

import { type DragEvent, useId, useState } from "react";

import { cn } from "cn";
import { FileText, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { SafeImage } from "@/components/common/safe-image";
import {
  getFileNameFromUrl,
  getMaxFilesPerRequest,
  getUploadAccept,
  getUploadHint,
  isImageCategory,
  type UploadCategory,
  validateUploadFile,
} from "@/lib/api/file-upload-api";

export interface FileUploadFieldItem {
  key: string;
  url: string;
  name?: string | null;
}

interface FileUploadFieldProps {
  category: UploadCategory;
  items: FileUploadFieldItem[];
  multiple?: boolean;
  // Total number of items allowed (multiple mode).
  maxItems?: number;
  label?: string;
  hint?: string;
  isUploading?: boolean;
  // Items currently being replaced or removed.
  busyKeys?: string[];
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  onSelect: (files: File[]) => void;
  onReplace?: (item: FileUploadFieldItem, file: File) => void;
  onRemove?: (item: FileUploadFieldItem) => void;
}

const sizeClasses = {
  sm: {
    dropzone: "min-h-[40px] gap-2 px-3 py-2",
    title: "text-[8px]",
    hint: "text-[7px]",
    item: "min-h-[40px] gap-2 px-3 py-1.5",
    thumb: "h-[28px] w-[28px]",
    name: "text-[8px]",
    icon: 13,
    action: "h-[22px] w-[22px]",
    actionIcon: 11,
  },
  md: {
    dropzone: "min-h-[120px] flex-col gap-2 px-5 py-4 text-center",
    title: "text-[13px]",
    hint: "text-[11px]",
    item: "min-h-[56px] gap-3 px-3 py-2",
    thumb: "h-[44px] w-[44px]",
    name: "text-[12px]",
    icon: 22,
    action: "h-[30px] w-[30px]",
    actionIcon: 14,
  },
} as const;

/*
 * Only validates and renders. Uploading, replacing and removing are done by
 * the parent (usually a form hook) so it can keep fileId/url in form state.
 */
export function FileUploadField({
  category,
  items,
  multiple = false,
  maxItems,
  label = "Click to upload or drag and drop",
  hint,
  isUploading = false,
  busyKeys = [],
  disabled = false,
  size = "sm",
  className,
  onSelect,
  onReplace,
  onRemove,
}: FileUploadFieldProps) {
  const inputId = useId();

  const [isDragging, setIsDragging] = useState(false);

  const classes = sizeClasses[size];

  const accept = getUploadAccept(category);

  const itemLimit = multiple ? (maxItems ?? Number.POSITIVE_INFINITY) : 1;

  const remainingSlots = itemLimit - items.length;

  const showDropzone = multiple ? remainingSlots > 0 : items.length === 0;

  const inputDisabled = disabled || isUploading;

  const selectValidFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);

    const validFiles = files.filter((file) => {
      const error = validateUploadFile(file, category);

      if (error) {
        toast.error(error);
      }

      return !error;
    });

    const limit = Math.min(remainingSlots, getMaxFilesPerRequest(category));

    if (validFiles.length > limit) {
      toast.error(`You can add ${limit} more file(s) here.`);
    }

    const filesToUpload = validFiles.slice(0, limit);

    if (filesToUpload.length > 0) {
      onSelect(filesToUpload);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!inputDisabled) {
      selectValidFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <UploadedItem
          key={item.key}
          item={item}
          category={category}
          accept={accept}
          busy={busyKeys.includes(item.key)}
          disabled={disabled || isUploading}
          classes={classes}
          onReplace={onReplace}
          onRemove={onRemove}
        />
      ))}

      {showDropzone && (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-[6px] border border-[#c6c5eb] border-dashed bg-[#fbfaff] transition hover:bg-[#f7f6ff] focus-within:ring-2 focus-within:ring-[#3024c8]/40",
            classes.dropzone,
            isDragging && "border-[#3024c8] bg-[#f3f2ff]",
            inputDisabled && "cursor-not-allowed opacity-70",
          )}
        >
          {isUploading ? (
            <Loader2 size={classes.icon} className="shrink-0 animate-spin text-[#3024c8]" />
          ) : (
            <Upload size={classes.icon} className="shrink-0 text-[#3024c8]" />
          )}

          <span className="flex flex-col">
            <span className={cn("font-semibold text-[#3024c8]", classes.title)}>
              {isUploading ? "Uploading..." : label}
            </span>

            {!isUploading && (
              <span className={cn("mt-0.5 text-[#85899f]", classes.hint)}>{hint ?? getUploadHint(category)}</span>
            )}
          </span>

          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={inputDisabled}
            className="sr-only"
            onChange={(event) => {
              const { files } = event.target;

              if (files) {
                selectValidFiles(files);
              }

              // Allow selecting the same file again later.
              event.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

function UploadedItem({
  item,
  category,
  accept,
  busy,
  disabled,
  classes,
  onReplace,
  onRemove,
}: {
  item: FileUploadFieldItem;
  category: UploadCategory;
  accept: string;
  busy: boolean;
  disabled: boolean;
  classes: (typeof sizeClasses)[keyof typeof sizeClasses];
  onReplace?: (item: FileUploadFieldItem, file: File) => void;
  onRemove?: (item: FileUploadFieldItem) => void;
}) {
  const replaceInputId = useId();

  const name = item.name || getFileNameFromUrl(item.url);

  const showImage = isImageCategory(category) || /\.(jpe?g|png|webp)$/i.test(item.url);

  return (
    <div className={cn("flex items-center rounded-[6px] border border-[#c6c5eb] bg-white", classes.item)}>
      {showImage ? (
        <div className={cn("relative shrink-0 overflow-hidden rounded-[4px] bg-[#f4f4fa]", classes.thumb)}>
          <SafeImage src={item.url} alt={name} fill sizes="48px" className="object-cover" />
        </div>
      ) : (
        <FileText size={classes.icon} className="shrink-0 text-[#1f9d55]" />
      )}

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        title={name}
        className={cn("min-w-0 flex-1 truncate font-semibold text-[#30355c] hover:underline", classes.name)}
      >
        {name}
      </a>

      {busy ? (
        <Loader2 size={classes.actionIcon} className="shrink-0 animate-spin text-[#3024c8]" />
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          {onReplace && (
            <label
              htmlFor={replaceInputId}
              title="Replace file"
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-full text-[#3024c8] transition hover:bg-[#f3f2ff] focus-within:ring-2 focus-within:ring-[#3024c8]/40",
                classes.action,
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <RefreshCw size={classes.actionIcon} />
              <span className="sr-only">Replace {name}</span>

              <input
                id={replaceInputId}
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  event.target.value = "";

                  if (!file) return;

                  const error = validateUploadFile(file, category);

                  if (error) {
                    toast.error(error);
                    return;
                  }

                  onReplace(item, file);
                }}
              />
            </label>
          )}

          {onRemove && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(item)}
              aria-label={`Remove ${name}`}
              title="Remove file"
              className={cn(
                "flex items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50",
                classes.action,
              )}
            >
              <X size={classes.actionIcon} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
