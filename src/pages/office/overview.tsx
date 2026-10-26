import { ArrowRight, BadgeCheck, Clock, Fuel, ShieldAlert, Truck, Wallet } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Link } from "react-router-dom"
import { FleetMap, MapLegend } from "@/components/app/fleet-map"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { C, Donut } from "@/components/app/charts"
import { SeverityPill, TripStatusBadge, VerdictBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { roleLabel, useRole } from "@/context/role"
import { alerts, crew, crewById, monthlyPnl, siteById, trips, truckById, trucks, workOrders, TODAY } from "@/data/mock"
import { pesoShort } from "@/lib/format"

const pnlConfig = { net: { label: "Net income", color: "var(--chart-1)" } } satisfies ChartConfig

export default function Overview() {
  const { role } = useRole()
  const today = trips.filter((t) => t.date === TODAY)
  const onTrip = trucks.filter((t) => t.status === "on-trip").length
  const held = today.filter((t) => t.status === "held").length
  const docIssues = crew.flatMap((c) => c.docs).filter((d) => ["mismatch", "expired", "expiring", "pending"].includes(d.status)).length
  const revenueToday = today.reduce((s, t) => s + t.revenue, 0)
  const lastStage = (t: (typeof trips)[number]) => {
    const evs = t.stops.flatMap((s) => s.events.map((e) => ({ ...e, site: s.siteId })))
    return evs.at(-1)
  }

  return (
    <>
      <PageHeader
        title={`Good morning. ${held} ${held === 1 ? "stage needs" : "stages need"} review.`}
        description={`Friday, October 16, 2026 · ${roleLabel(role)} view`}
        actions={
          <Button render={<Link to="/office/evidence" />}>
            Review evidence <ArrowRight />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Trucks on trip" value={`${onTrip}/11`} sub="3 with Vectras tracker, 2 SSD pending" icon={<Truck className="size-4" />} tone="navy" />
        <Stat label="Stages held" value={held} sub="Phone and tracker disagree" tone={held ? "danger" : "default"} icon={<ShieldAlert className="size-4" />} />
        <Stat label="Documents needing action" value={docIssues} sub="Mismatch, expiring or unchecked" tone="warning" icon={<BadgeCheck className="size-4" />} />
        {role === "gm" || role === "billing" ? (
          <Stat label="Revenue booked today" value={pesoShort(revenueToday)} sub={`${today.length} trips`} icon={<Wallet className="size-4" />} />
        ) : role === "maintenance" ? (
          <Stat label="Open work orders" value={workOrders.filter((w) => w.status !== "Done").length} sub="1 waiting for parts" icon={<Fuel className="size-4" />} />
        ) : (
          <Stat label="Longest dwell now" value="3 h 26 min" sub="NCX 4728 at Prime Foods, Pasig" tone="warning" icon={<Clock className="size-4" />} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Trucks now">
          <Donut
            centerLabel="trucks"
            data={[
              { key: "on-trip", label: "On trip", value: onTrip, color: C.blue },
              { key: "available", label: "Available", value: trucks.filter((t) => t.status === "available").length, color: C.good },
              { key: "maintenance", label: "Maintenance", value: trucks.filter((t) => t.status === "maintenance").length, color: C.warn },
              { key: "off-duty", label: "Off duty", value: trucks.filter((t) => t.status === "off-duty").length, color: C.pale },
            ]}
          />
        </Panel>
        <Panel title="Today's trips">
          <Donut
            centerLabel="trips"
            data={[
              { key: "completed", label: "Completed", value: today.filter((t) => t.status === "completed").length, color: C.good },
              { key: "moving", label: "In transit or on site", value: today.filter((t) => t.status === "in-transit" || t.status === "on-site").length, color: C.blue },
              { key: "scheduled", label: "Scheduled", value: today.filter((t) => t.status === "scheduled").length, color: C.pale },
              { key: "held", label: "Held for review", value: held, color: C.bad },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Fleet now" description="Placeholder positions until Vectras connects." more="Truck markers use placeholder positions until the Vectras feed is connected." actions={<Button variant="outline" size="sm" render={<Link to="/office/map" />}>Open live map</Button>}>
          <FleetMap trucks={trucks} className="h-[22rem] xl:h-[34rem]" />
          <div className="mt-3">
            <MapLegend />
          </div>
        </Panel>
        <Panel title="Alerts" description="Sent by email and browser pop-up. No SMS." bodyClassName="pt-2">
          <ul className="space-y-2">
            {alerts.slice(0, 6).map((a) => (
              <li key={a.id} className="rounded-md bg-muted/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-brand-navy">{a.kind}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {a.time}
                    <SeverityPill severity={a.severity} />
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
                {a.link && (
                  <Link to={a.link} className="mt-1 inline-block text-xs font-medium text-brand-blue hover:underline">
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Today's trips" description="Latest stage and its corroboration verdict" actions={<Button variant="outline" size="sm" render={<Link to="/office/trips" />}>All trips</Button>}>
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Latest stage</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {today.map((t) => {
                const e = lastStage(t)
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link to={`/office/trips/${t.id}`} className="font-medium text-brand-blue hover:underline">
                        {t.id}
                      </Link>
                    </TableCell>
                    <TableCell>{truckById[t.truckId].plate}</TableCell>
                    <TableCell>{crewById[t.driverId].name}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell className="min-w-48">
                      {e ? (
                        <span>
                          {e.stage} · <span className="text-muted-foreground">{siteById[e.site].name}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{e && <VerdictBadge verdict={e.verdict} />}</TableCell>
                    <TableCell>
                      <TripStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{t.eta}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>

      {(role === "gm" || role === "billing") && (
        <Panel title="Net income by month" description="Revenue minus all costs, by month." more="Revenue minus fuel, tolls, labor, maintenance and other costs. October is month to date." actions={<Button variant="outline" size="sm" render={<Link to="/office/reports" />}>Full P&L</Button>}>
          <ChartContainer config={pnlConfig} className="h-60 w-full">
            <BarChart data={monthlyPnl} margin={{ left: 8, right: 8 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => pesoShort(v)} width={56} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => pesoShort(Number(v))} />} />
              <Bar isAnimationActive={false} dataKey="net" fill="var(--color-net)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Panel>
      )}
    </>
  )
}
