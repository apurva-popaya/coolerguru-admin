"use client";

import { ArrowDown, ArrowUp, Star, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/common/safe-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { ContentImage } from "@/lib/api/content-management-api";

function ImagePreview({ image }: { image: ContentImage }) {
  const [preview, setPreview] = useState(image.image_url);
  useEffect(() => {
    if (!image.file) {
      setPreview(image.image_url);
      return;
    }
    const url = URL.createObjectURL(image.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image.file, image.image_url]);
  return (
    <SafeImage
      src={preview}
      alt={image.filename}
      unoptimized={Boolean(image.file)}
      width={480}
      height={240}
      className="h-36 w-full rounded-md border bg-muted/30 object-contain"
    />
  );
}

export function ContentImageUploader({
  images,
  onChange,
  disabled,
  allowMultiple = false,
}: {
  images: ContentImage[];
  onChange: (images: ContentImage[]) => void;
  disabled: boolean;
  // Retain the multiple-image flow for future use; current sections replace one image.
  allowMultiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function update(next: ContentImage[]) {
    onChange(
      next.map((image, index) => ({ ...image, display_order: index + 1 })),
    );
  }
  function move(index: number, direction: number) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor="choose-content-images">
        {allowMultiple ? "Images *" : "Image *"}
      </FieldLabel>
      <input
        ref={inputRef}
        type="file"
        multiple={allowMultiple}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const selectedFiles = Array.from(event.target.files ?? []);
          const files = allowMultiple
            ? selectedFiles
            : selectedFiles.slice(0, 1);
          event.target.value = "";
          setError("");
          if (files.length === 0) return;
          if (
            files.some(
              (file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size === 0 ||
                file.size > 10 * 1024 * 1024,
            )
          ) {
            setError("Choose a non-empty JPG, PNG, or WebP image up to 10 MB.");
            return;
          }
          const uploads = files.map((file) => ({
            id: crypto.randomUUID(),
            image_url: "",
            filename: file.name,
            display_order: 0,
            file,
          }));
          update(
            allowMultiple
              ? [...images, ...uploads]
              : [...uploads, ...images.slice(1)],
          );
        }}
      />
      <Button
        id="choose-content-images"
        type="button"
        variant="outline"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby="content-images-hint"
        onClick={() => inputRef.current?.click()}
      >
        <Upload data-icon="inline-start" />
        {allowMultiple
          ? images.length
            ? "Add More Images"
            : "Choose Images"
          : images.length
            ? "Replace Image"
            : "Choose Image"}
      </Button>
      <FieldDescription id="content-images-hint">
        JPG, PNG, or WebP, up to 10 MB. Save your changes to update the image
        displayed on the homepage.
      </FieldDescription>
      {error && <FieldError>{error}</FieldError>}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 data-[multiple=false]:max-w-160 data-[multiple=false]:grid-cols-1 [&[data-multiple=false]_img]:h-auto! [&[data-multiple=false]_img]:aspect-[3/1]"
        data-multiple={allowMultiple}
        aria-live="polite"
      >
        {(allowMultiple ? images : images.slice(0, 1)).map((image, index) => (
          <div
            key={image.id}
            className="flex min-w-0 flex-col gap-3 rounded-lg border p-3"
          >
            <ImagePreview image={image} />
            <p
              className="truncate text-admin-14 text-muted-foreground"
              title={image.filename}
            >
              {image.filename}
            </p>
            {allowMultiple && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {index === 0 && <Star />}{" "}
                  {index === 0 ? "Primary" : `Image ${index + 1}`}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Order: {image.display_order}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {allowMultiple && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={disabled || index === 0}
                    aria-label={`Move ${image.filename} earlier`}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={disabled || index === images.length - 1}
                    aria-label={`Move ${image.filename} later`}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled}
                aria-label={`Remove ${image.filename}`}
                onClick={() =>
                  update(images.filter((item) => item.id !== image.id))
                }
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Field>
  );
}
