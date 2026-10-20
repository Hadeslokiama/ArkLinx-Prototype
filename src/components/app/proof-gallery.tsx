import { BadgeCheck, Clock, ReceiptText, ShieldAlert, Truck as TruckIcon } from "lucide-react"
import { Pill } from "@/components/app/status"
import { photoFor, siteById, truckById, type Trip, type Verdict } from "@/data/mock"

// What a partner sees for each check result. Partners never see crew phone coordinates.
const partnerLabel: Record<Verdict, { text: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  corroborated: { text: "Checked against tracker", tone: "success" },
  "single-source": { text: "Signed by crew", tone: "warning" },
  conflicting: { text: "Under review by CXBC", tone: "danger" },
  pending: { text: "Pending", tone: "neutral" },
}

export function ProofGallery({ trip }: { trip: Trip }) {
  const truck = truckById[trip.truckId]
  const items = trip.stops.flatMap((stop, si) =>
    stop.events
      .filter((e) => photoFor(e.stage, stop.purpose) && e.time && e.verdict !== "pending")
      .map((e) => ({ stop: si + 1, site: siteById[stop.siteId].name, kind: photoFor(e.stage, stop.purpose)!, time: e.time!, verdict: e.verdict })),
  )
  if (!items.length) return <p className="text-sm text-muted-foreground">No proof photos yet. They appear when the crew docks and when the receipt is captured at Release.</p>
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => {
        const label = partnerLabel[p.verdict]
        return (
          <figure key={`${p.stop}-${p.kind}`} className="overflow-hidden rounded-lg bg-muted/60">
            <div className={p.kind === "docking" ? "relative aspect-[4/3] bg-gradient-to-br from-[#3b4a63] to-[#1f2a44]" : "relative aspect-[4/3] bg-gradient-to-br from-[#f3eee3] to-[#ddd5c3]"}>
              <div className={p.kind === "docking" ? "absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/70" : "absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#1f2a44]/60"}>
                {p.kind === "docking" ? <TruckIcon className="size-10" /> : <ReceiptText className="size-10" />}
                <span className="text-xs">Sample image</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-black/65 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white">
                {truck.plate} · {p.site} · 2026-10-16 {p.time} · {trip.trackingId}
                <span className="ml-1 inline-flex items-center gap-0.5 text-[#7ee2a8]">
                  <BadgeCheck className="size-3" /> signed
                </span>
              </div>
            </div>
            <figcaption className="space-y-1 p-2.5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-medium text-brand-navy">
                  Stop {p.stop} · {p.kind === "docking" ? "Docking photo" : "Delivery receipt"}
                </span>
                <Pill tone={label.tone}>
                  {p.verdict === "conflicting" ? <ShieldAlert className="size-3" /> : <BadgeCheck className="size-3" />}
                  {label.text}
                </Pill>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> Taken live at {p.time}; signed on the crew's enrolled phone; photo unchanged since capture
              </div>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
