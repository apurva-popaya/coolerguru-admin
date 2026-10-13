"use client";

import { useEffect, useState } from "react";

import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK =
  "/images/placeholders/image-placeholder.png";

function isRemoteUrl(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

function canUseRemoteUrl(value: string) {
  if (!isRemoteUrl(value)) {
    return true;
  }

  try {
    const url = new URL(value);

    /*
     * Temporary backend image domains.
     *
     * These will eventually be replaced by
     * proper S3/CDN URLs from the backend.
     */
    const allowedTemporaryHosts = [
      "dummy-storage.coolerguru.com",
      "example.com",
    ];

    if (allowedTemporaryHosts.includes(url.hostname)) {
      return true;
    }

    return true;
  } catch {
    return false;
  }
}

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  onError,
  fill,
  className,
  ...props
}: SafeImageProps) {
  const initialSrc =
    src && canUseRemoteUrl(src)
      ? src
      : fallbackSrc;

  const [imageSrc, setImageSrc] =
    useState(initialSrc);

  useEffect(() => {
    setImageSrc(
      src && canUseRemoteUrl(src)
        ? src
        : fallbackSrc,
    );
  }, [src, fallbackSrc]);

  /*
   * Local images can use next/image optimization.
   */
  if (!isRemoteUrl(imageSrc)) {
    return (
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        fill={fill}
        className={className}
        onError={(event) => {
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          }

          onError?.(event);
        }}
      />
    );
  }

  /*
   * Temporary remote backend images.
   *
   * Use normal <img> so Next.js does not require
   * the hostname to be configured in next.config.
   *
   * When `fill` is provided, manually reproduce
   * the positioning behavior of next/image fill.
   */
  return (
    <img
      src={imageSrc}
      alt={alt}
      width={
        typeof props.width === "number"
          ? props.width
          : undefined
      }
      height={
        typeof props.height === "number"
          ? props.height
          : undefined
      }
      className={
        fill
          ? `absolute inset-0 h-full w-full ${
              className ?? ""
            }`
          : className
      }
      onError={(event) => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }

        onError?.(
          event as unknown as React.SyntheticEvent<HTMLImageElement>,
        );
      }}
    />
  );
}