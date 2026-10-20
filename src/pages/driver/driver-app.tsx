import {
  AlertOctagon,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock,
  Fingerprint,
  Flag,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  ReceiptText,
  RotateCcw,
  Signal,
  Truck as TruckIcon,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Mark } from "@/components/app/brand"
import { CameraCapture, type Capture } from "@/components/app/camera-capture"
import { VerdictBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  DRIVER_TRIP_ID, STAGE_HINT, TODAY, crewById, photoFor, siteById, tripById, truckById,
  type CaptureRecord, type ImageCheck, type StageName, type Verdict,
} from "@/data/mock"
import { cn } from "@/lib/utils"

const stageIcon: Record<StageName, LucideIcon> = {
  "Time In": LogIn,
  Arrival: MapPin,
  Docking: Warehouse,
  Release: ReceiptText,
  "Time Out": LogOut,
}

const GEOFENCED: StageName[] = ["Arrival", "Docking", "Release"]

type Step = { stop: number; stage: StageName; photo: "docking" | "receipt" | null }
type Done = { time: string; verdict: Verdict; record?: CaptureRecord; checks?: ImageCheck[]; img?: string }

const now = () => new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false })
const nowSec = () => new Date().toLocaleTimeString("en-PH", { hour12: false })

function checksFor(kind: "docking" | "receipt", plate: string, siteName: string): ImageCheck[] {
  const base: ImageCheck[] = [
    { name: "Signature and one-time code", result: "pass", detail: "Signed by this phone's passkey; code used in time" },
    { name: "Inside the store's geofence", result: "pass", detail: `${siteName}, 28 m from center` },
  ]
  if (kind === "docking")
    return [
      ...base,
      { name: "Truck and plate", result: "pass", detail: `Truck detected; plate read ${plate} matches the assignment`, advisory: true },
      { name: "Cargo state", result: "pass", detail: "Rear bay loaded (classifier 0.93)", advisory: true },
      { name: "Liveness (screen or print recapture)", result: "pass", detail: "No moiré or screen edges (score 0.05)", advisory: true },
      { name: "AI-generated image score", result: "pass", detail: "0.03 · advisory only", advisory: true },
    ]
  return [
    ...base,
    { name: "Vendor format", result: "pass", detail: "SM template DR-####### (OCR confidence 0.96)" },
    { name: "Receipt number", result: "pass", detail: "DR-0418230 never used before" },
    { name: "Receipt date and store", result: "pass", detail: `${TODAY} · ${siteName}` },
    { name: "Liveness (screen or print recapture)", result: "pass", detail: "Score 0.07", advisory: true },
  ]
}

export default function DriverApp() {
  const trip = tripById[DRIVER_TRIP_ID]
  const truck = truckById[trip.truckId]
  const driver = crewById[trip.driverId]
  const helper = crewById[trip.helperIds[0]]
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = []
    trip.stops.forEach((s, i) => {
      const add = (stage: StageName) => out.push({ stop: i, stage, photo: photoFor(stage, s.purpose) })
      if (i === 0) add("Time In")
      add("Arrival")
      add("Docking")
      add("Release")
      if (i === trip.stops.length - 1) add("Time Out")
    })
    return out
  }, [trip])

  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState<Record<number, Done>>({})
  const [inside, setInside] = useState(true)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [phase, setPhase] = useState<"idle" | "signing" | "checking">("idle")
  const [delayOpen, setDelayOpen] = useState(false)
  const [showStops, setShowStops] = useState(false)
  const [tick, setTick] = useState(0)
  const [arrivedAt, setArrivedAt] = useState<number | null>(null)
  const [lastPhoto, setLastPhoto] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const finished = idx >= steps.length
  const step = steps[Math.min(idx, steps.length - 1)]
  const stop = trip.stops[step.stop]
  const site = siteById[stop.siteId]
  const needsFence = GEOFENCED.includes(step.stage)
  const blockedByFence = needsFence && !inside
  const Icon = step.photo ? Camera : stageIcon[step.stage]
  const onSiteSecs = arrivedAt ? Math.floor((Date.now() - arrivedAt) / 1000) : 0
  void tick

  const verdict: Verdict = truck.gps === "vectra" ? "corroborated" : "single-source"

  function record(extra: Partial<Done> = {}) {
    setDone((d) => ({ ...d, [idx]: { time: now(), verdict, ...extra } }))
    if (step.stage === "Arrival") setArrivedAt(Date.now())
    if (step.stage === "Release") setArrivedAt(null)
    toast.success(`${step.stage} signed and recorded at ${now()}. ${verdict === "corroborated" ? "Tracker agrees." : "Crew only (no tracker on this truck)."}`)
    setIdx((i) => i + 1)
  }

  function press() {
    if (blockedByFence) {
      toast.error(`You are outside the ${site.name} geofence. Move inside the site, then press again.`)
      return
    }
    if (step.photo) {
      setCameraOpen(true)
      return
    }
    setPhase("signing")
    setTimeout(() => {
      setPhase("idle")
      record()
    }, 700)
  }

  function onCapture(c: Capture) {
    const kind = step.photo!
    setTimeout(() => setCameraOpen(false), 400)
    setPhase("signing")
    setTimeout(() => {
      setPhase("checking")
      const rec: CaptureRecord = {
        kind, lat: site.lat + 0.0001, lng: site.lng + 0.0002, accuracyM: 8, driver: driver.name, helper: helper.name, plate: truck.plate, site: site.name,
        orderNo: "SCSM-ORD-101622", trackingId: trip.trackingId, date: TODAY, time: nowSec(), code: c.code, sha256: c.sha256, device: `Passkey · ${driver.name.split(" ")[0]}'s phone`,
      }
      setTimeout(() => {
        setPhase("idle")
        setLastPhoto(idx)
        record({ record: rec, checks: checksFor(kind, truck.plate, site.name), img: c.dataUrl })
      }, 1100)
    }, 900)
  }

  const stopSteps = steps.map((s, i) => ({ ...s, i })).filter((s) => s.stop === step.stop)
  const mmss = `${String(Math.floor(onSiteSecs / 60)).padStart(2, "0")}:${String(onSiteSecs % 60).padStart(2, "0")}`
  const shown = lastPhoto !== null ? done[lastPhoto] : undefined
  const buttonLabel = step.photo === "docking" ? "Docking: take photo" : step.photo === "receipt" ? "Release: photograph receipt" : step.stage

  return (
    <div className="min-h-svh bg-brand-navy sm:py-6">
      <div className="mx-auto flex min-h-svh max-w-md flex-col bg-background sm:min-h-[calc(100svh-3rem)] sm:overflow-hidden sm:rounded-2xl">
        <header className="bg-brand-navy px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white p-1">
                <Mark className="size-6" />
              </span>
              <div className="leading-tight">
                <div className="text-sm text-white/70">Today's trip</div>
                <div className="font-semibold">{trip.id}</div>
              </div>
            </div>
            <div className="text-right text-sm leading-tight">
              <div className="font-semibold">{truck.plate}</div>
              <div className="text-white/70">{driver.name.split(" ")[0]} + {helper.name.split(" ")[0]}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <Fingerprint className="size-3.5" /> Passkey enrolled
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <Signal className="size-3.5" /> Location only when you press
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <TruckIcon className="size-3.5" /> {truck.gps === "vectra" ? "Truck tracker linked" : "No truck tracker"}
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">
          {finished ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <CheckCircle2 className="size-16 text-success" />
              <h1 className="text-2xl font-semibold text-brand-navy">Trip complete. Salamat!</h1>
              <p className="text-muted-foreground">All {steps.length} stages are signed and recorded. Each stop was checked on its own.</p>
              <Button variant="outline" size="lg" className="h-12" onClick={() => { setIdx(0); setDone({}); setLastPhoto(null) }}>
                <RotateCcw /> Restart demo
              </Button>
            </div>
          ) : (
            <>
              <section className="rounded-xl bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Stop {step.stop + 1} of {trip.stops.length} · {stop.purpose}
                    </div>
                    <h1 className="text-xl font-semibold text-brand-navy">{site.name}</h1>
                    <p className="text-sm text-muted-foreground">{site.address}</p>
                  </div>
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="rounded-full bg-secondary p-3 text-brand-navy" aria-label={`Call ${site.contact}`}>
                    <Phone className="size-5" />
                  </a>
                </div>
                {site.notes && <p className="mt-3 rounded-md bg-brand-amber/15 px-3 py-2 text-sm text-brand-navy">{site.notes}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className={cn("rounded-md px-3 py-2", inside ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
                    <div className="text-xs opacity-80">Geofence</div>
                    <div className="font-medium">{inside ? "Inside site" : "Outside site"}</div>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <div className="text-xs text-muted-foreground">Time on site</div>
                    <div className="font-medium tabular-nums">{arrivedAt ? mmss : "—"}</div>
                  </div>
                </div>
              </section>

              <button
                onClick={press}
                disabled={phase !== "idle"}
                className={cn(
                  "flex min-h-28 w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-white transition-transform active:scale-[0.98] disabled:opacity-80",
                  blockedByFence ? "bg-muted-foreground" : step.stage === "Time Out" ? "bg-brand-navy" : "bg-brand-blue",
                )}
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15">
                  {phase === "idle" ? <Icon className="size-8" /> : <Fingerprint className="size-8 animate-pulse" />}
                </span>
                <span>
                  <span className="block text-2xl font-semibold">
                    {phase === "signing" ? "Unlock to sign…" : phase === "checking" ? "Checking photo…" : buttonLabel}
                  </span>
                  <span className="block text-base text-white/80">{STAGE_HINT[step.stage]}</span>
                  {needsFence && phase === "idle" && <span className="mt-1 block text-xs text-white/75">{inside ? "Location read once, at this press" : "Move inside the site first"}</span>}
                </span>
              </button>

              {shown?.record && (
                <section className="rounded-xl bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-semibold text-brand-navy">{shown.record.kind === "docking" ? "Docking photo" : "Delivery receipt"} · signed record</h2>
                    <VerdictBadge verdict={shown.verdict} />
                  </div>
                  <div className="flex gap-3">
                    {shown.img && <img src={shown.img} alt="Captured evidence" className="size-20 shrink-0 rounded-md object-cover" />}
                    <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                      <dt className="text-muted-foreground">Lat, long</dt><dd className="tabular-nums">{shown.record.lat.toFixed(5)}, {shown.record.lng.toFixed(5)}</dd>
                      <dt className="text-muted-foreground">Driver</dt><dd>{shown.record.driver}</dd>
                      <dt className="text-muted-foreground">Site</dt><dd>{shown.record.site}</dd>
                      <dt className="text-muted-foreground">Date, time</dt><dd className="tabular-nums">{shown.record.date} {shown.record.time}</dd>
                      <dt className="text-muted-foreground">Order no.</dt><dd>{shown.record.orderNo}</dd>
                      <dt className="text-muted-foreground">Code</dt><dd className="font-mono">{shown.record.code}</dd>
                      <dt className="text-muted-foreground">SHA-256</dt><dd className="truncate font-mono" title={shown.record.sha256}>{shown.record.sha256.slice(0, 16)}…</dd>
                    </dl>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {shown.checks?.map((c) => (
                      <li key={c.name} className="flex items-start gap-2 text-xs">
                        {c.result === "pass" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" /> : <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />}
                        <span>
                          <span className="font-medium">{c.name}</span>
                          {c.advisory && <span className="text-muted-foreground"> (advisory)</span>}: <span className="text-muted-foreground">{c.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-muted-foreground">The record is signed by the server and stored beside the photo. The photo itself is never changed.</p>
                </section>
              )}

              <section className="rounded-xl bg-card p-4">
                <h2 className="mb-2 font-semibold text-brand-navy">This stop</h2>
                <ul className="space-y-1.5">
                  {stopSteps.map((s) => {
                    const d = done[s.i]
                    const Ic = s.photo ? Camera : stageIcon[s.stage]
                    return (
                      <li key={s.i} className={cn("flex items-center justify-between gap-2 rounded-md px-3 py-2.5", s.i === idx ? "bg-brand-blue/10" : "bg-muted/50")}>
                        <span className="flex items-center gap-2.5">
                          {d ? <CheckCircle2 className="size-5 text-success" /> : <Ic className={cn("size-5", s.i === idx ? "text-brand-blue" : "text-muted-foreground")} />}
                          <span className={cn("text-base", !d && s.i !== idx && "text-muted-foreground")}>
                            {s.stage}
                            {s.photo && <span className="text-xs text-muted-foreground"> · {s.photo === "docking" ? "photo" : "receipt"}</span>}
                          </span>
                        </span>
                        {d ? (
                          <span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
                            {d.time}
                            <VerdictBadge verdict={d.verdict} />
                          </span>
                        ) : (
                          s.i === idx && <span className="text-xs font-medium text-brand-blue">Next</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>

              <button onClick={() => setShowStops((v) => !v)} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-left">
                <span className="font-medium text-brand-navy">All stops ({trip.stops.length})</span>
                <ChevronDown className={cn("size-5 transition-transform", showStops && "rotate-180")} />
              </button>
              {showStops && (
                <ol className="space-y-2">
                  {trip.stops.map((s, i) => (
                    <li key={i} className={cn("rounded-lg px-4 py-3", i === step.stop ? "bg-brand-blue/10" : "bg-card")}>
                      <div className="text-sm text-muted-foreground">
                        Stop {i + 1} · {s.purpose} · {s.purpose === "Pickup" ? "docking photo" : "docking photo + receipt"}
                      </div>
                      <div className="font-medium">{siteById[s.siteId].name}</div>
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-auto grid grid-cols-2 gap-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
                <Button variant="outline" size="lg" className="h-14 text-base" onClick={() => setDelayOpen(true)}>
                  <Clock /> Report delay
                </Button>
                <Button variant="outline" size="lg" className="h-14 text-base text-danger" onClick={() => toast.error("Emergency sent to dispatch with your location. Dispatch will call you.")}>
                  <AlertOctagon /> Emergency
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <label htmlFor="fence" className="flex items-center gap-2">
                  <Switch id="fence" checked={inside} onCheckedChange={setInside} />
                  Demo: phone inside geofence
                </label>
                <Link to="/" className="underline">
                  Exit demo
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      <Sheet open={cameraOpen} onOpenChange={setCameraOpen}>
        <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{step.photo === "receipt" ? "Delivery receipt" : "Docking photo"}</SheetTitle>
            <SheetDescription>
              {step.photo === "receipt"
                ? "Photograph the vendor's delivery receipt flat, with the receipt number readable. Live camera only."
                : "Photograph the truck's rear and plate at the dock. Live camera only; faces are not needed."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{cameraOpen && step.photo && <CameraCapture kind={step.photo} onCapture={onCapture} />}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={delayOpen} onOpenChange={setDelayOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Why are you delayed?</SheetTitle>
            <SheetDescription>Dispatch and SCSM will see this right away.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-2 px-4 pb-6">
            {["Vendor or store staff not ready", "Waiting in queue to dock", "Heavy traffic", "Truck problem", "Truck ban window", "Other"].map((r) => (
              <Button
                key={r}
                variant="secondary"
                size="lg"
                className="h-14 justify-start text-base"
                onClick={() => {
                  setDelayOpen(false)
                  toast.success(`Delay reported: ${r}.`)
                }}
              >
                <Flag /> {r}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
