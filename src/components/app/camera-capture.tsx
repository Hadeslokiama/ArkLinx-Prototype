import { Camera, ImageOff, RotateCcw, Timer } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export interface Capture {
  dataUrl: string
  sha256: string
  code: string
}

const CODE_SECONDS = 60
const newCode = () => `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9) + 1}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

async function sha256Of(dataUrl: string) {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0))
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

// Draws a stand-in photo for desktop demos where no camera is available. The real crew view has no upload path.
function demoImage(kind: "docking" | "receipt") {
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
  g.fillText(kind === "docking" ? "Plate NCX 4721" : "DR-0418230 · Oct 16 · SM HYPER BICUTAN", 80, 260)
  g.fillText(`Demo image ${new Date().toLocaleTimeString()}`, 80, 880)
  return c.toDataURL("image/jpeg", 0.85)
}

export function CameraCapture({ kind, onCapture }: { kind: "docking" | "receipt"; onCapture: (c: Capture) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<"starting" | "live" | "unavailable">("starting")
  const [shot, setShot] = useState<string | null>(null)
  const [code, setCode] = useState(newCode)
  const [left, setLeft] = useState(CODE_SECONDS)

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

  async function finish(dataUrl: string) {
    setShot(dataUrl)
    onCapture({ dataUrl, sha256: await sha256Of(dataUrl), code })
  }

  function capture() {
    const v = videoRef.current
    if (!v) return
    const width = kind === "receipt" ? 1600 : 1280
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = Math.round(width * ((v.videoHeight || 720) / (v.videoWidth || 1280)))
    canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height)
    finish(canvas.toDataURL("image/jpeg", kind === "receipt" ? 0.9 : 0.8))
  }

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
          <img src={shot} alt={kind === "docking" ? "Captured docking photo" : "Captured delivery receipt"} className="size-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
        )}
        {!shot && mode === "live" && (
          <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-dashed border-white/70">
            <span className="absolute -top-3 left-3 rounded bg-brand-navy px-2 text-xs text-white">
              {kind === "docking" ? "Truck rear and plate at the dock" : "Whole receipt, flat, number readable"}
            </span>
          </div>
        )}
        {!shot && mode !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/85">
            {mode === "starting" ? "Opening camera…" : (<><ImageOff className="size-6" />No camera found on this device. Photos can only come from the live camera; there is no upload.</>)}
          </div>
        )}
      </div>
      {shot ? (
        <Button variant="outline" size="lg" className="h-12 w-full text-base" onClick={() => setShot(null)}>
          <RotateCcw /> Retake
        </Button>
      ) : mode === "unavailable" ? (
        <Button variant="secondary" size="lg" className="h-12 w-full text-base" onClick={() => finish(demoImage(kind))}>
          <Camera /> Use a demo image (prototype only)
        </Button>
      ) : (
        <Button size="lg" className="h-12 w-full text-base" disabled={mode !== "live"} onClick={capture}>
          <Camera /> Take photo
        </Button>
      )}
    </div>
  )
}
