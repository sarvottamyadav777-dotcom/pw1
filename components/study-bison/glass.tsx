"use client";

import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Glass card ---------------------------------- */

export function GlassCard({
  children,
  className,
  hover = true,
  sheen = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  sheen?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-3xl",
        sheen && "glass-sheen",
        hover && "glass-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Glass button --------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "glass" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "glass", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-13 px-8 text-base",
          size === "icon" && "h-10 w-10",
          variant === "gold" && "btn-gold",
          variant === "glass" && "btn-glass text-foreground",
          variant === "ghost" &&
            "text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

/* ------------------------------------ Badge ------------------------------------- */

export function GlassBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "gold" | "green" | "red" | "violet";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "neutral" &&
          "border-[#e2e9f3] bg-[#f7f9fc] text-[#62718a] dark:border-[#33425d] dark:bg-[#1a2740] dark:text-[#c4d0e4]",
        tone === "gold" &&
          "border-[#d8e2fb] bg-[#eff4ff] text-[#426bd0] dark:border-[#344b78] dark:bg-[#1c2d4d] dark:text-[#a8c2ff]",
        tone === "green" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-[#285a46] dark:bg-[#17372b] dark:text-[#8de0b3]",
        tone === "red" && "border-red-200 bg-red-50 text-red-700 dark:border-[#63343d] dark:bg-[#3a2028] dark:text-[#ff9aa3]",
        tone === "violet" &&
          "border-violet-200 bg-violet-50 text-violet-700 dark:border-[#4b3c6f] dark:bg-[#2b2140] dark:text-[#c8adff]",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------------- Skeleton ----------------------------------- */

export function GlassSkeleton({ className }: { className?: string }) {
  return <div className={cn("sb-skeleton rounded-2xl", className)} />;
}

/* ------------------------------- Section heading -------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5676c9]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  );
}

/* ------------------------------ Safe remote image ------------------------------- */

export function SafeImage({
  src,
  alt,
  className,
  fallback = "/batch-thumbnail-fallback.svg",
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const url = src && src.startsWith("http") ? src : fallback;
  return (
     
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src !== fallback && !img.src.endsWith(fallback)) img.src = fallback;
      }}
    />
  );
}

/* ---------------------------------- Empty state --------------------------------- */

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="glass-soft rounded-3xl px-8 py-14 text-center">
      {icon && (
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl glass flex items-center justify-center text-[#7655db]">
          {icon}
        </div>
      )}
      <p className="font-bold text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
