import { Camera, CheckCircle2, Circle, Clock, MapPin } from "lucide-react"
import { VerdictBadge } from "@/components/app/status"
import { STAGES, photoFor, siteById, type Stop } from "@/data/mock"
import { fmtMin, minutesBetween } from "@/lib/format"
import { cn } from "@/lib/utils"

const stopStages = (_purpose: Stop["purpose"], first: boolean, last: boolean) =>
  STAGES.filter((s) => {
    if (s === "Time In") return first
    if (s === "Time Out") return last
    return true
  })

export function dwellFor(stop: Stop) {
  const arr = stop.events.find((e) => e.stage === "Arrival")?.time
  const rel = stop.events.find((e) => e.stage === "Release")?.time
  const lastTime = stop.events.at(-1)?.time
  return { mins: minutesBetween(arr, rel ?? lastTime), done: !!rel }
}

export function StageTimeline({ stops, compact = false, hideVerdicts = false }: { stops: Stop[]; compact?: boolean; hideVerdicts?: boolean }) {
  return (
    <ol className="space-y-4">
      {stops.map((stop, i) => {
        const site = siteById[stop.siteId]
        const stages = stopStages(stop.purpose, i === 0, i === stops.length - 1)
        const dwell = dwellFor(stop)
        const doneCount = stop.events.filter((e) => e.verdict !== "pending").length
        return (
          <li key={i} className="rounded-lg bg-muted/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0 text-brand-blue" />
                <span className="truncate font-medium text-brand-navy">{site?.name}</span>
                <span className="text-xs text-muted-foreground">{stop.purpose}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                On site {fmtMin(dwell.mins)}
                {!dwell.done && dwell.mins !== undefined && " (running)"}
              </span>
            </div>
            <ul className={cn("mt-3 grid gap-1.5", compact ? "" : "")}>
              {stages.map((stage) => {
                const e = stop.events.find((x) => x.stage === stage)
                const done = e && e.verdict !== "pending"
                return (
                  <li key={stage} className="flex items-center justify-between gap-2 rounded-md bg-card px-2.5 py-1.5 text-sm">
                    <span className="flex items-center gap-2">
                      {done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground/50" />}
                      <span className={cn(!done && "text-muted-foreground")}>{stage}</span>
                      {photoFor(stage, stop.purpose) && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Camera className="size-3" />
                          {photoFor(stage, stop.purpose) === "docking" ? "photo" : "receipt"}
                        </span>
                      )}
                      {e?.time && <span className="text-xs text-muted-foreground tabular-nums">{e.time}</span>}
                    </span>
                    {e && !hideVerdicts && <VerdictBadge verdict={e.verdict} />}
                  </li>
                )
              })}
            </ul>
            {!compact && doneCount === 0 && <p className="mt-2 text-xs text-muted-foreground">Not reached yet.</p>}
          </li>
        )
      })}
    </ol>
  )
}
