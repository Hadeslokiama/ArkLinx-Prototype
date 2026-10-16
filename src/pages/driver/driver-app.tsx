import {
  AlertOctagon,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flag,
  LogIn,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  Signal,
  Truck as TruckIcon,
  Undo2,
  Warehouse,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Mark } from "@/components/app/brand"
import { CameraCapture } from "@/components/app/camera-capture"
import { VerdictBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { DRIVER_TRIP_ID, STAGE_HINT, crewById, siteById, tripById, truckById, type StageName, type Verdict } from "@/data/mock"
import { cn } from "@/lib/utils"

const stageIcon: Record<StageName, LucideIcon> = {
  "Time In": LogIn,
  Arrival: MapPin,
  Docking: Warehouse,
  Undocking: Undo2,
  "Proof of Delivery": Camera,
  "Proof Checking": ClipboardCheck,
  Release: PackageCheck,
  "Time Out": LogOut,
}

const GEOFENCED: StageName[] = ["Arrival", "Proof of Delivery"]

type Step = { stop: number; stage: StageName }
type Done = { time: string; verdict: Verdict; photo?: string }

const now = () => new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false })

export default function DriverApp() {
  const trip = tripById[DRIVER_TRIP_ID]
  const truck = truckById[trip.truckId]
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = []
    trip.stops.forEach((s, i) => {
      if (i === 0) out.push({ stop: i, stage: "Time In" })
      out.push({ stop: i, stage: "Arrival" }, { stop: i, stage: "Docking" }, { stop: i, stage: "Undocking" })
      if (s.purpose !== "Pickup") out.push({ stop: i, stage: "Proof of Delivery" }, { stop: i, stage: "Proof Checking" })
      out.push({ stop: i, stage: "Release" })
      if (i === trip.stops.length - 1) out.push({ stop: i, stage: "Time Out" })
    })
    return out
  }, [trip])

  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState<Record<number, Done>>({})
  const [inside, setInside] = useState(true)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [delayOpen, setDelayOpen] = useState(false)
  const [showStops, setShowStops] = useState(false)
  const [tick, setTick] = useState(0)
  const [arrivedAt, setArrivedAt] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const finished = idx >= steps.length
  const step = steps[Math.min(idx, steps.length - 1)]
  const site = siteById[trip.stops[step.stop].siteId]
  const needsFence = GEOFENCED.includes(step.stage)
  const blockedByFence = needsFence && !inside
  const needsPhoto = step.stage === "Proof of Delivery"
  const Icon = stageIcon[step.stage]
  const onSiteSecs = arrivedAt ? Math.floor((Date.now() - arrivedAt) / 1000) : 0
  void tick

  function press() {
    if (blockedByFence) {
      toast.error(`You are outside the ${site.name} geofence. Move inside the yard, then press again.`)
      return
    }
    if (needsPhoto && !photo) {
      setCameraOpen(true)
      return
    }
    const verdict: Verdict = truck.gps === "vectra" ? "corroborated" : "single-source"
    setDone((d) => ({ ...d, [idx]: { time: now(), verdict, photo: needsPhoto ? (photo ?? undefined) : undefined } }))
    if (step.stage === "Arrival") setArrivedAt(Date.now())
    if (step.stage === "Release") setArrivedAt(null)
    if (needsPhoto) setPhoto(null)
    toast.success(`${step.stage} recorded at ${now()}. ${verdict === "corroborated" ? "Phone and truck tracker agree." : "Phone location only."}`)
    setIdx((i) => i + 1)
  }

  const stopSteps = steps.map((s, i) => ({ ...s, i })).filter((s) => s.stop === step.stop)
  const mmss = `${String(Math.floor(onSiteSecs / 60)).padStart(2, "0")}:${String(onSiteSecs % 60).padStart(2, "0")}`

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
              <div className="text-white/70">{crewById[trip.driverId].name.split(" ")[0]} + {crewById[trip.helperIds[0]].name.split(" ")[0]}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <Signal className="size-3.5" /> GPS ±8 m
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <TruckIcon className="size-3.5" /> {truck.gps === "vectra" ? "Truck tracker linked" : "Phone location only"}
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">
          {finished ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <CheckCircle2 className="size-16 text-success" />
              <h1 className="text-2xl font-semibold text-brand-navy">Trip complete. Salamat!</h1>
              <p className="text-muted-foreground">All {steps.length} stages are recorded. You can close this page.</p>
              <Button variant="outline" size="lg" className="h-12" onClick={() => { setIdx(0); setDone({}) }}>
                <RotateCcw /> Restart demo
              </Button>
            </div>
          ) : (
            <>
              <section className="rounded-xl bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Stop {step.stop + 1} of {trip.stops.length} · {trip.stops[step.stop].purpose}
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
                className={cn(
                  "flex min-h-28 w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-white transition-transform active:scale-[0.98]",
                  blockedByFence ? "bg-muted-foreground" : step.stage === "Time Out" ? "bg-brand-navy" : "bg-brand-blue",
                )}
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="size-8" />
                </span>
                <span>
                  <span className="block text-2xl font-semibold">{needsPhoto && !photo ? "Take proof photo" : step.stage}</span>
                  <span className="block text-base text-white/80">{STAGE_HINT[step.stage]}</span>
                  {needsFence && <span className="mt-1 block text-xs text-white/75">{inside ? "Location checked automatically" : "Move inside the site first"}</span>}
                </span>
              </button>

              {needsPhoto && photo && (
                <div className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <img src={photo} alt="Proof of delivery preview" className="size-16 rounded-md object-cover" />
                  <div className="flex-1 text-sm">Photo ready. Press the blue button to send it.</div>
                  <Button variant="ghost" size="sm" onClick={() => setCameraOpen(true)}>
                    Retake
                  </Button>
                </div>
              )}

              <section className="rounded-xl bg-card p-4">
                <h2 className="mb-2 font-semibold text-brand-navy">This stop</h2>
                <ul className="space-y-1.5">
                  {stopSteps.map((s) => {
                    const d = done[s.i]
                    const Ic = stageIcon[s.stage]
                    return (
                      <li key={s.i} className={cn("flex items-center justify-between gap-2 rounded-md px-3 py-2.5", s.i === idx ? "bg-brand-blue/10" : "bg-muted/50")}>
                        <span className="flex items-center gap-2.5">
                          {d ? <CheckCircle2 className="size-5 text-success" /> : <Ic className={cn("size-5", s.i === idx ? "text-brand-blue" : "text-muted-foreground")} />}
                          <span className={cn("text-base", !d && s.i !== idx && "text-muted-foreground")}>{s.stage}</span>
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
                        Stop {i + 1} · {s.purpose}
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
            <SheetTitle>Proof of delivery photo</SheetTitle>
            <SheetDescription>Photograph the signed delivery receipt with the goods visible.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {cameraOpen && (
              <CameraCapture
                onCapture={(url) => {
                  setPhoto(url)
                  setTimeout(() => setCameraOpen(false), 400)
                }}
              />
            )}
          </div>
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
