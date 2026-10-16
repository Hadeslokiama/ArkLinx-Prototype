import { Download } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { dwellBySite, monthlyPnl, truckPnl } from "@/data/mock"
import { peso, pesoShort } from "@/lib/format"

const costCfg = {
  fuel: { label: "Fuel", color: "var(--chart-1)" },
  labor: { label: "Labor", color: "var(--chart-2)" },
  maintenance: { label: "Maintenance", color: "var(--chart-3)" },
  tolls: { label: "Tolls", color: "#7aa7e8" },
  other: { label: "Other", color: "#9aa3b8" },
} satisfies ChartConfig
const revCfg = { revenue: { label: "Revenue", color: "var(--chart-2)" }, net: { label: "Net income", color: "var(--chart-3)" } } satisfies ChartConfig
const dwellCfg = { avg: { label: "Average minutes", color: "var(--chart-1)" } } satisfies ChartConfig

export default function Reports() {
  const [period, setPeriod] = useState("6m")
  const sep = monthlyPnl[4]
  const totals = monthlyPnl.slice(0, 5).reduce((s, m) => ({ revenue: s.revenue + m.revenue, net: s.net + m.net }), { revenue: 0, net: 0 })
  return (
    <>
      <PageHeader
        title="Reports and P&L"
        description="Unit-level and fleet-wide profitability, cost mix and waiting time by site."
        actions={
          <>
            <SimpleSelect value={period} onChange={setPeriod} ariaLabel="Period" options={[{ value: "6m", label: "Last 6 months" }, { value: "q3", label: "Q3 2026" }, { value: "ytd", label: "Year to date" }]} />
            <Button variant="outline" onClick={() => toast.success("P&L exported to Excel.")}>
              <Download /> Export
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue, May–Sep" value={pesoShort(totals.revenue)} tone="navy" />
        <Stat label="Net income, May–Sep" value={pesoShort(totals.net)} tone="success" sub={`${Math.round((totals.net / totals.revenue) * 100)}% margin`} />
        <Stat label="September net" value={pesoShort(sep.net)} sub={`${Math.round((sep.net / sep.revenue) * 100)}% margin`} />
        <Stat label="Fuel share of cost" value={`${Math.round((sep.fuel / (sep.revenue - sep.net)) * 100)}%`} tone="warning" sub="Largest cost line" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Revenue and net income">
          <ChartContainer config={revCfg} className="h-64 w-full">
            <LineChart data={monthlyPnl} margin={{ left: 8, right: 12 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => pesoShort(v)} width={60} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => peso(Number(v))} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line isAnimationActive={false} dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={false} />
              <Line isAnimationActive={false} dataKey="net" stroke="var(--color-net)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ChartContainer>
        </Panel>
        <Panel title="Cost mix by month">
          <ChartContainer config={costCfg} className="h-64 w-full">
            <BarChart data={monthlyPnl} margin={{ left: 8, right: 8 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => pesoShort(v)} width={60} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => peso(Number(v))} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar isAnimationActive={false} dataKey="fuel" stackId="c" fill="var(--color-fuel)" />
              <Bar isAnimationActive={false} dataKey="labor" stackId="c" fill="var(--color-labor)" />
              <Bar isAnimationActive={false} dataKey="maintenance" stackId="c" fill="var(--color-maintenance)" />
              <Bar isAnimationActive={false} dataKey="tolls" stackId="c" fill="var(--color-tolls)" />
              <Bar isAnimationActive={false} dataKey="other" stackId="c" fill="var(--color-other)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Profit and loss by truck" description="September 2026">
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...truckPnl].sort((a, b) => b.net - a.net).map((t) => (
                  <TableRow key={t.truckId}>
                    <TableCell className="font-medium">{t.plate}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.trips}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.revenue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{peso(t.cost)}</TableCell>
                    <TableCell className={t.net < 0 ? "text-right font-medium text-danger tabular-nums" : "text-right font-medium tabular-nums"}>{peso(t.net)}</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round((t.net / t.revenue) * 100)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Panel>
        <Panel title="Average dwell by site" description="Arrival to Release. Normal is 30–60 minutes.">
          <ChartContainer config={dwellCfg} className="h-[26rem] w-full">
            <BarChart data={[...dwellBySite].sort((a, b) => b.avg - a.avg)} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="site" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar isAnimationActive={false} dataKey="avg" fill="var(--color-avg)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>
    </>
  )
}
