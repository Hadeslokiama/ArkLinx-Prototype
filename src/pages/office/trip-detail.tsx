import { ArrowLeft, Copy } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { FleetMap } from "@/components/app/fleet-map"
import { PageHeader, Panel, Stat } from "@/components/app/page"
import { StageTimeline, dwellFor } from "@/components/app/stage-timeline"
import { GpsBadge, TripStatusBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { crewById, siteById, tripById, truckById } from "@/data/mock"
import { fmtMin, peso } from "@/lib/format"

export default function TripDetail() {
  const { id = "" } = useParams()
  const trip = tripById[id]
  if (!trip)
    return (
      <div className="space-y-3">
        <p>Trip not found.</p>
        <Button render={<Link to="/office/trips" />}>Back to trips</Button>
      </div>
    )
  const truck = truckById[trip.truckId]
  const cost = trip.costs.fuel + trip.costs.tolls + trip.costs.labor + trip.costs.fees
  const tripSites = trip.stops.map((s) => siteById[s.siteId])
  const totalDwell = trip.stops.reduce((s, st) => s + (dwellFor(st).mins ?? 0), 0)
  return (
    <>
      <Button variant="ghost" size="sm" render={<Link to="/office/trips" />} className="-ml-2 w-fit">
        <ArrowLeft /> Trips
      </Button>
      <PageHeader
        title={trip.id}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {trip.client} · {truck.plate} · {crewById[trip.driverId].name} with {trip.helperIds.map((h) => crewById[h].name).join(", ")}
            <TripStatusBadge status={trip.status} />
            <GpsBadge gps={truck.gps} />
          </span>
        }
        actions={
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(`${location.origin}/track/${trip.trackingId}`)
              toast.success("Tracking link copied. Location is shown 30 minutes delayed.")
            }}
          >
            <Copy /> Copy tracking link
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Planned / actual km" value={`${trip.plannedKm} / ${trip.actualKm ?? "—"}`} sub={truck.gps === "vectra" ? "Actual from Vectras route" : "Actual from odometer entry"} />
        <Stat label="Time on site" value={fmtMin(totalDwell)} sub="Arrival to Release, all stops" />
        <Stat label="Trip cost" value={peso(cost)} sub={`Fuel ${peso(trip.costs.fuel)} · tolls ${peso(trip.costs.tolls)} · labor ${peso(trip.costs.labor)}`} />
        <Stat label="Trip margin" value={peso(trip.revenue - cost)} sub={`Revenue ${peso(trip.revenue)}`} tone={trip.revenue - cost > 0 ? "success" : "danger"} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Stages and evidence" description="Each stage shows its corroboration verdict.">
          <StageTimeline stops={trip.stops} />
          {trip.delayReason && <p className="mt-3 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">Delay logged: {trip.delayReason}</p>}
        </Panel>
        <Panel title="Route and geofences">
          <FleetMap trucks={[truck]} sites={tripSites} focus={[truck.lat, truck.lng]} className="h-[28rem]" />
        </Panel>
      </div>
    </>
  )
}
