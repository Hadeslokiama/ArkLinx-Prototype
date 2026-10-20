import { MapPinPlus, Phone } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { FleetMap } from "@/components/app/fleet-map"
import { PageHeader, Panel } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { sites } from "@/data/mock"
import { cn } from "@/lib/utils"

const kindLabel = { dock: "Cross-dock", store: "Store", vendor: "Vendor", hospital: "Hospital", yard: "Yard" }

export default function Sites() {
  const [kind, setKind] = useState("all")
  const [selected, setSelected] = useState(sites[0].id)
  const [radius, setRadius] = useState(sites[0].radiusM)
  const list = sites.filter((s) => kind === "all" || s.kind === kind)
  const s = sites.find((x) => x.id === selected) ?? sites[0]
  return (
    <>
      <PageHeader
        title="Sites and geofences"
        description="Saved points of interest with a geofence each. Arrival, the docking photo and the Release receipt are checked against these perimeters; pins carry contacts and notes."
        actions={
          <Button onClick={() => toast.message("Click on the map to drop a pin, then fill in the site profile.")}>
            <MapPinPlus /> Add site
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Panel title={`${list.length} sites`} actions={<SimpleSelect value={kind} onChange={setKind} ariaLabel="Site type" className="min-w-32" options={[{ value: "all", label: "All types" }, ...Object.entries(kindLabel).map(([value, label]) => ({ value, label }))]} />} bodyClassName="pt-3">
          <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {list.map((x) => (
              <li key={x.id}>
                <button
                  onClick={() => {
                    setSelected(x.id)
                    setRadius(x.radiusM)
                  }}
                  className={cn("w-full rounded-md p-3 text-left hover:bg-muted", selected === x.id ? "bg-brand-blue/10" : "bg-muted/50")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-brand-navy">{x.name}</span>
                    <Pill>{kindLabel[x.kind]}</Pill>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {x.address} · avg dwell {x.avgDwellMin} min
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-4">
          <Panel bodyClassName="p-3">
            <FleetMap sites={sites.map((x) => (x.id === s.id ? { ...x, radiusM: radius } : x))} focus={[s.lat, s.lng]} zoom={15} className="h-[24rem]" label="Site positions are approximate placeholders" />
          </Panel>
          <Panel title={s.name} description={`${kindLabel[s.kind]}${s.client ? ` · ${s.client}` : ""}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Geofence radius: {radius} m</Label>
                  <Slider value={radius} min={50} max={400} step={10} onValueChange={(v) => setRadius(Array.isArray(v) ? Number(v[0]) : Number(v))} aria-label="Geofence radius" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="addr">Address</Label>
                  <Input id="addr" defaultValue={s.address} key={`a-${s.id}`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact">Contact</Label>
                    <Input id="contact" defaultValue={s.contact} key={`c-${s.id}`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue={s.phone} key={`p-${s.id}`} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes for crews</Label>
                  <Textarea id="notes" defaultValue={s.notes} key={`n-${s.id}`} rows={5} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => toast.success(`${s.name} saved. New geofence: ${radius} m.`)}>Save site</Button>
                  <Button variant="outline" onClick={() => toast.message(`Calling ${s.contact} at ${s.phone}`)}>
                    <Phone /> {s.phone}
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
