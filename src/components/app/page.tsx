import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Disclosure } from "@/components/app/disclosure"

// `description` is one short line; `more` holds the full explanation in a collapsed dropdown.
export function PageHeader({ title, description, more, actions }: { title: string; description?: ReactNode; more?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
        {more && <Disclosure label="More" className="mt-1 max-w-3xl">{more}</Disclosure>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// Every stat is the same white card; a status tone shows only as a small dot beside the label.
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
    <div className="flex flex-col gap-1 rounded-lg bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {tone !== "default" && tone !== "navy" && (
            <span aria-hidden className={cn("size-1.5 rounded-full", { "bg-danger": tone === "danger", "bg-warning": tone === "warning", "bg-success": tone === "success" })} />
          )}
          {label}
        </span>
        <span className="text-muted-foreground/70 [&_svg]:size-4">{icon}</span>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-brand-navy tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function Panel({ title, description, more, actions, children, className, bodyClassName }: { title?: ReactNode; description?: ReactNode; more?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-lg bg-card", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-brand-navy">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {more && <Disclosure label="More" className="mt-1">{more}</Disclosure>}
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
  return <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{children}</p>
}
