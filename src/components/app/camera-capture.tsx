import { Camera, CheckCircle2, CircleAlert, ImageOff, Loader2, RotateCcw, Send, Timer } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PhotoCheck {
  name: string
  result: "pass" | "warn"
  detail: string
  fix?: string
}

export interface Capture {
  dataUrl: string
  sha256: string
  code: string
  checks: PhotoCheck[]
}

type Kind = "docking" | "receipt"
// Prototype only: which result the image-check function returns, so the defense can show a failed check.
type Sim = "good" | "missing" | "screen"

const CODE_SECONDS = 60
const STEP_MS = 550
const newCode = () => `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9) + 1}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

async function sha256Of(dataUrl: string) {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0))
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

// What the image-check Lambda (OCR + two small classifiers) would return for this photo.
function photoChecks(kind: Kind, plate: string, sim: Sim): PhotoCheck[] {
  const live: PhotoCheck =
    sim === "screen"
      ? { name: "Live scene", result: "warn", detail: "Looks like a photo of a screen", fix: "Point the camera at the real truck or receipt, not a screen or printout." }
      : { name: "Live scene", result: "pass", detail: "Not a screen or printout" }
  if (kind === "docking")
    return [
      live,
      sim === "missing"
        ? { name: "Plate", result: "warn", detail: "Plate not found", fix: "Retake with the truck's plate in view." }
        : { name: "Plate", result: "pass", detail: `${plate} matches this trip` },
      { name: "Cargo", result: "pass", detail: "Loaded" },
    ]
  return [
    live,
    sim === "missing"
      ? { name: "Receipt number", result: "warn", detail: "Number not readable", fix: "Lay the receipt flat and fill the frame." }
      : { name: "Receipt number", result: "pass", detail: "DR-0418230 read" },
    { name: "Vendor format", result: sim === "missing" ? "warn" : "pass", detail: sim === "missing" ? "Not matched" : "SM receipt" },
  ]
}

// Draws a stand-in photo for desktop demos where no camera is available. The real crew view has no upload path.
function demoImage(kind: Kind, plate: string) {
  const c = document.createElement("canvas")
  c.width = 1280
  c.height = 960
  const g = c.getContext("2d")!
  g.fillStyle = kind === "docking" ? "#3b4a63" : "#efe9dc"
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = kind === "docking" ? "#d9dee8" : "#1f2a44"
  g.font = "bold 64px sans-serif"
  g.fillText(kind === "docking" ? "Truck rear at dock" : "DELIVERY RECEIPT", 80, 160)
  g.font = "48px sans-serif"
  g.fillText(kind === "docking" ? `Plate ${plate}` : "DR-0418230 · Oct 16 · SM HYPER BICUTAN", 80, 260)
  g.fillText(`Demo image ${new Date().toLocaleTimeString()}`, 80, 880)
  return c.toDataURL("image/jpeg", 0.85)
}

export function CameraCapture({ kind, plate, onCapture }: { kind: Kind; plate: string; onCapture: (c: Capture) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<"starting" | "live" | "unavailable">("starting")
  const [shot, setShot] = useState<{ dataUrl: string; sha256: string; code: string } | null>(null)
  const [code, setCode] = useState(newCode)
  const [left, setLeft] = useState(CODE_SECONDS)
  const [sim, setSim] = useState<Sim>("good")
  const [checks, setChecks] = useState<PhotoCheck[]>([])
  const [shown, setShown] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api")
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setMode("live")
      } catch {
        setMode("unavailable")
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (shot) return
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setCode(newCode())
          return CODE_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [shot])

  // Reveal the check results one at a time, as they come back from the image-check function.
  useEffect(() => {
    if (!shot || shown >= checks.length) return
    const id = setTimeout(() => setShown((n) => n + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [shot, shown, checks.length])

  async function take(dataUrl: string) {
    setChecks(photoChecks(kind, plate, sim))
    setShown(0)
    setShot({ dataUrl, sha256: await sha256Of(dataUrl), code })
  }

  function capture() {
    const v = videoRef.current
    if (!v) return
    const width = kind === "receipt" ? 1600 : 1280
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = Math.round(width * ((v.videoHeight || 720) / (v.videoWidth || 1280)))
    canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height)
    take(canvas.toDataURL("image/jpeg", kind === "receipt" ? 0.9 : 0.8))
  }

  function retake() {
    setShot(null)
    setChecks([])
    setShown(0)
  }

  const checking = !!shot && shown < checks.length
  const problem = !checking ? checks.find((c) => c.result === "warn") : undefined
  const submit = () => shot && onCapture({ ...shot, checks })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-md bg-brand-navy px-3 py-2 text-white">
        <span className="text-sm" title={`One-time code ${code}: signed with the photo; valid once, for 60 seconds`}>
          Secure capture
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-white/80 tabular-nums">
          <Timer className="size-3.5" /> {shot ? "used" : `${left}s`}
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-navy">
        {shot ? (
          <img src={shot.dataUrl} alt={kind === "docking" ? "Captured docking photo" : "Captured delivery receipt"} className={cn("size-full object-cover", checking && "opacity-70")} />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
        )}
        {!shot && mode === "live" && (
          <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-dashed border-white/70">
            <span className="absolute -top-3 left-3 rounded bg-brand-navy px-2 text-xs text-white">
              {kind === "docking" ? "Truck rear and plate" : "Whole receipt, flat"}
            </span>
          </div>
        )}
        {checking && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-brand-navy/85 px-3 py-2 text-sm text-white">
            <Loader2 className="size-4 animate-spin" /> Checking photo…
          </div>
        )}
        {!shot && mode !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/85">
            {mode === "starting" ? "Opening camera…" : (<><ImageOff className="size-6" />No camera found. Photos come only from the live camera.</>)}
          </div>
        )}
      </div>

      {shot && (
        <ul aria-live="polite" className="space-y-1.5">
          {checks.map((c, i) => {
            const done = i < shown
            return (
              <li key={c.name} className="flex items-center gap-2.5 rounded-md bg-muted/60 px-3 py-2 text-sm">
                {!done ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                ) : c.result === "pass" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                ) : (
                  <CircleAlert className="size-4 shrink-0 text-warning" />
                )}
                <span className="font-medium">{c.name}</span>
                <span className="ml-auto text-muted-foreground">{done ? c.detail : "checking"}</span>
              </li>
            )
          })}
        </ul>
      )}

      {problem && <p className="rounded-md bg-muted px-3 py-2 text-sm font-medium text-brand-navy">{problem.fix}</p>}

      {!shot ? (
        mode === "unavailable" ? (
          <Button variant="secondary" size="lg" className="h-12 w-full text-base" onClick={() => take(demoImage(kind, plate))}>
            <Camera /> Use a demo image (prototype only)
          </Button>
        ) : (
          <Button size="lg" className="h-12 w-full text-base" disabled={mode !== "live"} onClick={capture}>
            <Camera /> Take photo
          </Button>
        )
      ) : checking ? null : problem ? (
        <div className="grid gap-2">
          <Button size="lg" className="h-12 w-full text-base" onClick={retake}>
            <RotateCcw /> Retake
          </Button>
          <Button variant="ghost" className="w-full" onClick={submit}>
            <Send /> Send anyway for staff review
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <Button variant="outline" size="lg" className="h-12 text-base" onClick={retake}>
            <RotateCcw /> Retake
          </Button>
          <Button size="lg" className="h-12 text-base" onClick={submit}>
            <CheckCircle2 /> Use photo
          </Button>
        </div>
      )}

      {!shot && (
        <fieldset className="rounded-md bg-muted/60 px-3 py-2">
          <legend className="sr-only">Prototype: simulate the check result</legend>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Demo result:</span>
            {([
              ["good", "Good photo"],
              ["missing", kind === "docking" ? "No plate" : "Unreadable"],
              ["screen", "Photo of a screen"],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={sim === v}
                onClick={() => setSim(v)}
                className={cn("rounded-full px-2.5 py-1", sim === v ? "bg-brand-navy text-white" : "bg-card text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
