import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// A "Details" dropdown: the short, visual summary stays on screen and the long explanation opens on click.
export function Disclosure({ label = "Details", children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <details className={cn("group/disc text-sm", className)}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-xs font-medium text-brand-blue select-none hover:underline [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 transition-transform group-open/disc:rotate-180" />
        {label}
      </summary>
      <div className="mt-2 rounded-md bg-muted/60 p-3 text-muted-foreground">{children}</div>
    </details>
  )
}

// A horizontal bar for a 0–1 score (model confidence) or a count against a max.
export function MeterBar({ value, max = 1, tone = "info", className }: { value: number; max?: number; tone?: "info" | "success" | "warning" | "danger"; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted", className)}>
      <div
        className={cn("h-1.5 rounded-full", {
          "bg-brand-blue": tone === "info",
          "bg-success": tone === "success",
          "bg-warning": tone === "warning",
          "bg-danger": tone === "danger",
        })}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
}
