import { Copy, Plus } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Logo } from "@/components/app/brand"
import { FleetMap } from "@/components/app/fleet-map"
import { Panel, Stat } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { StageTimeline, dwellFor } from "@/components/app/stage-timeline"
import { TripStatusBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { crewById, siteById, sites, trips, truckById, TODAY, type Client } from "@/data/mock"
import { fmtMin } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function PartnerPortal() {
  const [client, setClient] = useState<Client>("SCSM")
  const mine = trips.filter((t) => t.client === client && t.date === TODAY)
  const [openId, setOpenId] = useState<string | null>(mine[0]?.id ?? null)
  const delayed = mine.map((t) => {
    const tr = truckById[t.truckId]
    return { ...tr, lat: tr.lat + 0.012, lng: tr.lng - 0.008, lastPing: "30 min ago" }
  })
  const dwells = mine.flatMap((t) => t.stops.map((s) => dwellFor(s).mins ?? 0)).filter(Boolean)
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/">
            <Logo className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <SimpleSelect
              value={client}
              onChange={(v) => {
                setClient(v as Client)
                setOpenId(trips.find((t) => t.client === v && t.date === TODAY)?.id ?? null)
              }}
              ariaLabel="Partner"
              options={[{ value: "SCSM", label: "SCSM (SM retail)" }, { value: "AAI", label: "AAI Logistics (medical, freight)" }]}
            />
            <Dialog>
              <DialogTrigger render={<Button />}>
                <Plus /> Request trucks
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request trucks from CXBC</DialogTitle>
                  <DialogDescription>Replaces the nightly Viber request. CXBC fills plate, driver and helper and you see them here.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rd">Date</Label>
                    <Input id="rd" type="date" defaultValue="2026-10-17" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rn">Number of trucks</Label>
                    <Input id="rn" type="number" defaultValue={2} min={1} max={11} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Pickup at</Label>
                    <SimpleSelect value="S07" onChange={() => {}} ariaLabel="Pickup site" className="w-full" options={sites.filter((s) => s.kind === "vendor" || s.kind === "dock").map((s) => ({ value: s.id, label: s.name }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => toast.success("Request sent to CXBC dispatch. You will get an email when trucks are assigned.")}>Send request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">{client} deliveries today</h1>
          <p className="text-sm text-muted-foreground">Verified stages from CXBC trucks. Locations are shown 30 minutes delayed for crew and cargo safety.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Trucks on your trips" value={mine.length} tone="navy" />
          <Stat label="Delivered today" value={mine.filter((t) => t.stops.some((s) => s.events.some((e) => e.stage === "Proof of Delivery"))).length} tone="success" />
          <Stat label="Average time on site" value={fmtMin(dwells.length ? Math.round(dwells.reduce((a, b) => a + b, 0) / dwells.length) : 0)} />
          <Stat label="Stages under review" value={mine.filter((t) => t.status === "held").length} tone="warning" sub="CXBC is checking the location" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            {mine.map((t) => {
              const open = openId === t.id
              return (
                <Panel
                  key={t.id}
                  className={cn(open && "ring-2 ring-brand-blue/40")}
                  title={
                    <button className="text-left" onClick={() => setOpenId(open ? null : t.id)}>
                      {truckById[t.truckId].plate} · {t.stops.map((s) => siteById[s.siteId].name.replace("SM Hypermarket", "SM Hyper").replace("SM Supermarket", "SM Super")).join(" → ")}
                    </button>
                  }
                  description={`${crewById[t.driverId].name} · ETA ${t.eta} · ${t.trackingId}`}
                  actions={<TripStatusBadge status={t.status} />}
                  bodyClassName={open ? "" : "hidden"}
                >
                  <StageTimeline stops={t.stops} compact />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${location.origin}/track/${t.trackingId}`)
                      toast.success("Tracking link copied.")
                    }}
                  >
                    <Copy /> Copy tracking link
                  </Button>
                </Panel>
              )
            })}
          </div>
          <Panel title="Truck positions" description="30-minute delay">
            <FleetMap trucks={delayed} sites={sites.filter((s) => s.client === client)} className="h-[30rem]" label="Delayed 30 min · placeholder GPS" />
          </Panel>
        </div>
      </main>
    </div>
  )
}
