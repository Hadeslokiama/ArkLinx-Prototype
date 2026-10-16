import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: "default" | "danger" | "warning" | "success" | "navy"
  icon?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg p-4",
        tone === "navy" ? "bg-brand-navy text-white" : "bg-card",
        tone === "danger" && "bg-danger/8",
        tone === "warning" && "bg-warning/8",
        tone === "success" && "bg-success/8",
      )}
    >
      <div className={cn("flex items-center justify-between text-sm", tone === "navy" ? "text-white/75" : "text-muted-foreground")}>
        <span>{label}</span>
        {icon}
      </div>
      <div
        className={cn(
          "text-3xl font-semibold tracking-tight tabular-nums",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
          tone === "default" && "text-brand-navy",
        )}
      >
        {value}
      </div>
      {sub && <div className={cn("text-xs", tone === "navy" ? "text-white/70" : "text-muted-foreground")}>{sub}</div>}
    </div>
  )
}

export function Panel({ title, description, actions, children, className, bodyClassName }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-lg bg-card", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-brand-navy">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  )
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4">{children}</div>
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-brand-amber/12 px-3 py-2 text-xs text-brand-navy">{children}</p>
}
