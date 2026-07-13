"use client";

import Image from "next/image";

interface OptimizedImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

function PlaceholderGradient({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-green-700 via-green-800 to-blue-900 ${className ?? ""}`}
    >
      <svg
        className="h-12 w-12 text-white/30"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
    </div>
  );
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
}: OptimizedImageProps) {
  if (!src) {
    return <PlaceholderGradient className={className} />;
  }

  const isRemote =
    src.startsWith("https://") || src.startsWith("http://");

  if (isRemote) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes={sizes ?? "100vw"}
          unoptimized
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 800}
        height={height ?? 400}
        className={className}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        sizes={sizes}
        unoptimized
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        sizes={sizes ?? "100vw"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 400}
      className={className}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      sizes={sizes}
    />
  );
}
