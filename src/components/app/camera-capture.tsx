import { Camera, ImagePlus, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function CameraCapture({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<"starting" | "live" | "fallback">("starting")
  const [shot, setShot] = useState<string | null>(null)

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
        setMode("fallback")
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capture() {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement("canvas")
    canvas.width = v.videoWidth || 1280
    canvas.height = v.videoHeight || 720
    canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL("image/jpeg", 0.8)
    setShot(url)
    onCapture(url)
  }

  function fromFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setShot(url)
      onCapture(url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-navy">
        {shot ? (
          <img src={shot} alt="Captured proof of delivery" className="size-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
        )}
        {!shot && mode !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/85">
            {mode === "starting" ? "Opening camera…" : "Camera preview is not available here. Use the button below to open the phone camera."}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {shot ? (
          <Button variant="outline" size="lg" className="h-12 text-base" onClick={() => setShot(null)}>
            <RotateCcw /> Retake
          </Button>
        ) : (
          <Button size="lg" className="h-12 text-base" disabled={mode !== "live"} onClick={capture}>
            <Camera /> Take photo
          </Button>
        )}
        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary text-base font-medium text-secondary-foreground">
          <ImagePlus className="size-5" />
          Phone camera
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => fromFile(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  )
}
