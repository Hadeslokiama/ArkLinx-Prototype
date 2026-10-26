import { cn } from "@/lib/utils"
import type { DocStatus, GpsProvider, TripStatus, TruckStatus, Verdict } from "@/data/mock"

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "navy"

// One quiet pill for every status: neutral ground, ink text, colour only in the dot.
const dotClass: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-brand-blue",
  neutral: "",
  navy: "bg-brand-navy",
}

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium whitespace-nowrap text-foreground", className)}>
      {tone !== "neutral" && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotClass[tone])} />}
      {children}
    </span>
  )
}

export const verdictMeta: Record<Verdict, { label: string; tone: Tone; hint: string }> = {
  corroborated: { label: "Corroborated", tone: "success", hint: "Phone and tracker agree" },
  "single-source": { label: "Single-source", tone: "warning", hint: "Only one location source" },
  conflicting: { label: "Conflicting", tone: "danger", hint: "Sources disagree; held for review" },
  pending: { label: "Pending", tone: "neutral", hint: "Waiting for stage" },
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const m = verdictMeta[verdict]
  return (
<Pill tone={m.tone}>{m.label}</Pill>
  )
}

const tripMeta: Record<TripStatus, { label: string; tone: Tone }> = {
  scheduled: { label: "Scheduled", tone: "neutral" },
  "in-transit": { label: "In transit", tone: "info" },
  "on-site": { label: "On site", tone: "navy" },
  held: { label: "Held for review", tone: "danger" },
  completed: { label: "Completed", tone: "success" },
}
export function TripStatusBadge({ status }: { status: TripStatus }) {
  const m = tripMeta[status]
  return <Pill tone={m.tone}>{m.label}</Pill>
}

const docMeta: Record<DocStatus, { label: string; tone: Tone }> = {
  "issuer-verified": { label: "Issuer-verified", tone: "success" },
  screened: { label: "Screened only", tone: "info" },
  pending: { label: "Check pending", tone: "neutral" },
  mismatch: { label: "Issuer mismatch", tone: "danger" },
  expiring: { label: "Expiring", tone: "warning" },
  expired: { label: "Expired", tone: "danger" },
}
export function DocBadge({ status }: { status: DocStatus }) {
  const m = docMeta[status]
  return <Pill tone={m.tone}>{m.label}</Pill>
}

const gpsMeta: Record<GpsProvider, { label: string; tone: Tone }> = {
  vectra: { label: "Vectras API", tone: "success" },
  ssd: { label: "SSD GPS (pending)", tone: "warning" },
  none: { label: "Phone only", tone: "neutral" },
}
export function GpsBadge({ gps }: { gps: GpsProvider }) {
  const m = gpsMeta[gps]
  return <Pill tone={m.tone}>{m.label}</Pill>
}

const truckMeta: Record<TruckStatus, { label: string; tone: Tone }> = {
  "on-trip": { label: "On trip", tone: "info" },
  available: { label: "Available", tone: "success" },
  maintenance: { label: "Maintenance", tone: "warning" },
  "off-duty": { label: "Off duty", tone: "neutral" },
}
export function TruckStatusBadge({ status }: { status: TruckStatus }) {
  const m = truckMeta[status]
  return <Pill tone={m.tone}>{m.label}</Pill>
}

export function SeverityPill({ severity }: { severity: "high" | "medium" | "low" }) {
  const tone: Tone = severity === "high" ? "danger" : severity === "medium" ? "warning" : "neutral"
  return <Pill tone={tone}>{severity === "high" ? "High" : severity === "medium" ? "Medium" : "Low"}</Pill>
}

export const truckColor: Record<TruckStatus, string> = {
  "on-trip": "#2172dd",
  available: "#15803d",
  maintenance: "#b45309",
  "off-duty": "#4d5875",
}
