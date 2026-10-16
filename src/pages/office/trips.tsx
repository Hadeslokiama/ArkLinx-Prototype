import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader, Panel, TableWrap } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { TripStatusBadge, VerdictBadge } from "@/components/app/status"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { crewById, siteById, trips, truckById, type Verdict } from "@/data/mock"
import { peso } from "@/lib/format"

function worst(t: (typeof trips)[number]): Verdict {
  const v = t.stops.flatMap((s) => s.events.map((e) => e.verdict))
  if (v.includes("conflicting")) return "conflicting"
  if (v.includes("single-source")) return "single-source"
  if (v.includes("corroborated")) return "corroborated"
  return "pending"
}

export default function Trips() {
  const [client, setClient] = useState("all")
  const [status, setStatus] = useState("all")
  const [q, setQ] = useState("")
  const rows = useMemo(
    () =>
      trips.filter(
        (t) =>
          (client === "all" || t.client === client) &&
          (status === "all" || t.status === status) &&
          (q === "" || `${t.id} ${t.trackingId} ${truckById[t.truckId].plate} ${crewById[t.driverId].name}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [client, status, q],
  )
  return (
    <>
      <PageHeader title="Trips" description="Every trip with its stops, weakest stage verdict and costs." />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <Input placeholder="Trip, tracking ID, plate, driver" value={q} onChange={(e) => setQ(e.target.value)} className="w-64 bg-card" aria-label="Search trips" />
          <SimpleSelect value={client} onChange={setClient} ariaLabel="Client" options={[{ value: "all", label: "All clients" }, { value: "SCSM", label: "SCSM" }, { value: "AAI", label: "AAI" }]} />
          <SimpleSelect
            value={status}
            onChange={setStatus}
            ariaLabel="Status"
            options={[{ value: "all", label: "All statuses" }, { value: "scheduled", label: "Scheduled" }, { value: "in-transit", label: "In transit" }, { value: "on-site", label: "On site" }, { value: "held", label: "Held for review" }, { value: "completed", label: "Completed" }]}
          />
        </div>
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link to={`/office/trips/${t.id}`} className="font-medium text-brand-blue hover:underline">
                      {t.id}
                    </Link>
                    <div className="text-xs text-muted-foreground">{t.trackingId}</div>
                  </TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.client}</TableCell>
                  <TableCell>{truckById[t.truckId].plate}</TableCell>
                  <TableCell className="min-w-40">
                    {crewById[t.driverId].name}
                    <div className="text-xs text-muted-foreground">+ {t.helperIds.map((h) => crewById[h].name).join(", ")}</div>
                  </TableCell>
                  <TableCell className="min-w-56 text-sm">{t.stops.map((s) => siteById[s.siteId].name).join(" → ")}</TableCell>
                  <TableCell>
                    <VerdictBadge verdict={worst(t)} />
                  </TableCell>
                  <TableCell>
                    <TripStatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{peso(t.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
    </>
  )
}
