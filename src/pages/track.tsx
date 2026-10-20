import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Logo } from "@/components/app/brand"
import { FleetMap } from "@/components/app/fleet-map"
import { Panel } from "@/components/app/page"
import { StageTimeline } from "@/components/app/stage-timeline"
import { TripStatusBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { siteById, trips, truckById } from "@/data/mock"

export default function Track() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [q, setQ] = useState(id)
  const trip = trips.find((t) => t.trackingId.toLowerCase() === id.toLowerCase())
  const truck = trip ? truckById[trip.truckId] : undefined
  return (
    <div className="min-h-svh bg-background">
      <header className="bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo className="h-8" />
          </Link>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/track/${q.trim()}`)
            }}
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tracking ID" className="w-40 sm:w-56" aria-label="Tracking ID" />
            <Button type="submit">Track</Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        {!trip || !truck ? (
          <Panel title="No delivery found">
            <p className="text-sm text-muted-foreground">Check the tracking ID on your delivery receipt. Try AXL-7Q4M-21 for the demo.</p>
          </Panel>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
                  {trip.status === "completed" ? "Delivered" : `Arriving around ${trip.eta}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {trip.trackingId} · {trip.stops.map((s) => siteById[s.siteId].name).join(" → ")}
                </p>
              </div>
              <TripStatusBadge status={trip.status} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Panel title="Delivery stages">
                <StageTimeline stops={trip.stops} hideVerdicts />
              </Panel>
              <Panel title="Truck location" description="Shown 30 minutes delayed for crew and cargo safety">
                <FleetMap trucks={[{ ...truck, lat: truck.lat + 0.012, lng: truck.lng - 0.008 }]} sites={trip.stops.map((s) => siteById[s.siteId])} className="h-80" label="Delayed 30 min · placeholder GPS" />
              </Panel>
            </div>
            <Panel title="Proof photos" description="Docking photo and delivery receipt for each stop">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-sm text-muted-foreground">
                  Photos are shown only to the signed-in {trip.client} account that owns this order, so a forwarded tracking link never exposes the receipt.
                </p>
                <Button variant="outline" onClick={() => navigate("/partner")}>
                  Sign in as {trip.client} to view
                </Button>
              </div>
            </Panel>
          </>
        )}
      </main>
    </div>
  )
}
