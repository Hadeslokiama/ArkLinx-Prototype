import { Pause, Play } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Marker } from "react-leaflet"
import L from "leaflet"
import { FleetMap, MapLegend } from "@/components/app/fleet-map"
import { PageHeader, Panel, Placeholder } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { GpsBadge, TruckStatusBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { crewById, playbackTrack, truckById, trucks } from "@/data/mock"
import { cn } from "@/lib/utils"

const playIcon = L.divIcon({ className: "", html: `<div class="truck-pin" style="background:#f5a623;color:#0c1f5c">4721</div>`, iconSize: [30, 30], iconAnchor: [15, 15] })

export default function LiveMap() {
  const [status, setStatus] = useState("all")
  const [source, setSource] = useState("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | undefined>("T01")
  const [geofences, setGeofences] = useState(true)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const filtered = useMemo(
    () =>
      trucks.filter(
        (t) =>
          (status === "all" || t.status === status) &&
          (source === "all" || t.gps === source) &&
          (query === "" || t.plate.toLowerCase().includes(query.toLowerCase()) || (t.driverId && crewById[t.driverId].name.toLowerCase().includes(query.toLowerCase()))),
      ),
    [status, source, query],
  )

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setStep((s) => (s + 1 >= playbackTrack.length ? 0 : s + 1)), 700)
    return () => clearInterval(id)
  }, [playing])

  const sel = selected ? truckById[selected] : undefined
  const times = playbackTrack.map((_, i) => {
    const m = 7 * 60 + 41 + i * 8
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
  })

  return (
    <>
      <PageHeader title="Live map" description="Real-time positions with history playback. Vectras trucks refresh every 30–60 s once the API is connected; phone-only trucks update at each stage button." />
      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Live positions</TabsTrigger>
          <TabsTrigger value="playback">History playback</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
            <Panel bodyClassName="p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Input placeholder="Plate or driver" value={query} onChange={(e) => setQuery(e.target.value)} className="w-44 bg-card" aria-label="Filter by plate or driver" />
                <SimpleSelect value={status} onChange={setStatus} ariaLabel="Status" options={[{ value: "all", label: "All statuses" }, { value: "on-trip", label: "On trip" }, { value: "available", label: "Available" }, { value: "maintenance", label: "Maintenance" }, { value: "off-duty", label: "Off duty" }]} />
                <SimpleSelect value={source} onChange={setSource} ariaLabel="Location source" options={[{ value: "all", label: "All sources" }, { value: "vectra", label: "Vectras tracker" }, { value: "ssd", label: "SSD GPS" }, { value: "none", label: "Phone only" }]} />
                <div className="ml-auto flex items-center gap-2">
                  <Switch id="gf" checked={geofences} onCheckedChange={setGeofences} />
                  <Label htmlFor="gf">Geofences</Label>
                </div>
              </div>
              <FleetMap trucks={filtered} selectedTruckId={selected} onSelectTruck={setSelected} showGeofences={geofences} focus={sel ? [sel.lat, sel.lng] : undefined} className="h-[60vh] min-h-96" />
              <div className="mt-3">
                <MapLegend />
              </div>
            </Panel>
            <Panel title={`${filtered.length} trucks`} bodyClassName="pt-2">
              <ul className="max-h-[66vh] space-y-2 overflow-y-auto pr-1">
                {filtered.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelected(t.id)}
                      className={cn("w-full rounded-md p-3 text-left transition-colors hover:bg-muted", selected === t.id ? "bg-brand-blue/10" : "bg-muted/50")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-brand-navy">{t.plate}</span>
                        <TruckStatusBadge status={t.status} />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{t.driverId ? crewById[t.driverId].name : "No driver"}</div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <GpsBadge gps={t.gps} />
                        <span>
                          {t.speedKph} km/h · {t.lastPing}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="playback" className="mt-4">
          <Panel title="NCX 4721 · Oct 16, 07:41–08:53" description="SCSM Cross-Dock, Taguig to SM Hypermarket Bicutan. Replays the stored track; useful for NCAP disputes and route-deviation checks.">
            <FleetMap track={playbackTrack} className="h-[55vh] min-h-80" zoom={13} focus={playbackTrack[step]} label="Placeholder track: sample positions">
              <Marker position={playbackTrack[step]} icon={playIcon} />
            </FleetMap>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="icon" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause /> : <Play />}
              </Button>
              <Slider className="min-w-48 flex-1" value={step} min={0} max={playbackTrack.length - 1} onValueChange={(v) => setStep(Array.isArray(v) ? Number(v[0]) : Number(v))} aria-label="Playback position" />
              <span className="w-28 text-right text-sm tabular-nums">{times[step]}</span>
            </div>
            <div className="mt-3">
              <Placeholder>Playback uses a placeholder track. In production it is built from Vectras OBJECT_GET_MESSAGES for the selected period.</Placeholder>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
