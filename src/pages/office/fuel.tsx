import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fuelRecords, trips, truckById } from "@/data/mock"
import { peso } from "@/lib/format"

const cfg = { expectedL: { label: "Expected L", color: "var(--chart-2)" }, receiptL: { label: "Consumed L", color: "var(--chart-1)" } } satisfies ChartConfig

export default function FuelPage() {
  const rows = fuelRecords.map((f) => ({ ...f, variance: ((f.receiptL - f.expectedL) / f.expectedL) * 100, carriedBack: f.issuedL - f.receiptL }))
  const flagged = rows.filter((r) => r.variance > 10)
  const totalKm = rows.reduce((s, r) => s + r.km, 0)
  const totalL = rows.reduce((s, r) => s + r.receiptL, 0)
  return (
    <>
      <PageHeader title="Fuel and trip costing" description="Trip kilometers come from the Vectras route where a tracker exists, otherwise from odometer entries. Consumed fuel is compared with the truck's expected rate." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Fleet efficiency (7 days)" value={`${(totalKm / totalL).toFixed(1)} km/L`} tone="navy" />
        <Stat label="Trips over 10% variance" value={flagged.length} tone={flagged.length ? "danger" : "success"} />
        <Stat label="Fuel issued, not consumed" value={`${rows.reduce((s, r) => s + r.carriedBack, 0).toFixed(1)} L`} sub="Should be returned or carried over" tone="warning" />
        <Stat label="Receipts verified" value={`${rows.filter((r) => r.receiptVerified).length}/${rows.length}`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Fuel reconciliation per trip">
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead className="text-right">Km</TableHead>
                  <TableHead>Km source</TableHead>
                  <TableHead className="text-right">Issued</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.tripId}>
                    <TableCell className="font-medium">{r.tripId}</TableCell>
                    <TableCell>{truckById[r.truckId].plate}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.km}</TableCell>
                    <TableCell>
                      <Pill tone={r.kmSource === "Vectras route" ? "success" : "neutral"}>{r.kmSource}</Pill>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.issuedL} L</TableCell>
                    <TableCell className="text-right tabular-nums">{r.receiptL} L</TableCell>
                    <TableCell className="text-right tabular-nums">{r.expectedL} L</TableCell>
                    <TableCell>
                      <Pill tone={r.variance > 10 ? "danger" : r.variance > 5 ? "warning" : "success"}>{r.variance > 0 ? "+" : ""}{r.variance.toFixed(1)}%</Pill>
                    </TableCell>
                    <TableCell>
                      {r.receiptVerified ? (
                        <Pill tone="success">Verified</Pill>
                      ) : (
                        <Button size="xs" variant="outline" onClick={() => toast.message("Open receipt photo and confirm liters, station and time.")}>
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Panel>
        <Panel title="Expected vs consumed liters">
          <ChartContainer config={cfg} className="h-72 w-full">
            <BarChart data={rows} margin={{ left: 0, right: 8 }}>
              <XAxis dataKey="tripId" tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(4)} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar isAnimationActive={false} dataKey="expectedL" fill="var(--color-expectedL)" radius={3} />
              <Bar isAnimationActive={false} dataKey="receiptL" fill="var(--color-receiptL)" radius={3} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>
      <Panel title="Trip costing" description="Fuel, tolls, crew labor and fees per trip, against the trip rate.">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Fuel</TableHead>
                <TableHead className="text-right">Tolls</TableHead>
                <TableHead className="text-right">Labor</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-right">Total cost</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((t) => {
                const c = t.costs.fuel + t.costs.tolls + t.costs.labor + t.costs.fees
                const m = t.revenue - c
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.costs.fuel)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.costs.tolls)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.costs.labor)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.costs.fees)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(c)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.revenue)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-success">
                      {peso(m)} <span className="text-xs text-muted-foreground">({Math.round((m / t.revenue) * 100)}%)</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
    </>
  )
}
