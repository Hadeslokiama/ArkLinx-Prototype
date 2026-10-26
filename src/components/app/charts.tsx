import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const pct = (v: number, t: number) => (!t ? "0%" : v > 0 && v / t < 0.01 ? "<1%" : `${Math.round((v / t) * 100)}%`)

// Chart colours: navy and blue for counts, the status colours only where a slice means good, warning or bad.
export const C = { good: "var(--success)", warn: "var(--warning)", bad: "var(--danger)", navy: "var(--chart-2)", blue: "var(--chart-1)", light: "var(--chart-3)", slate: "var(--chart-4)", pale: "var(--chart-5)" }

export type Slice = { key: string; label: string; value: number; color: string }

// A donut with the total in the middle and a legend that carries the numbers, so nothing needs a hover.
export function Donut({ data, centerLabel, className }: { data: Slice[]; centerLabel: string; className?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const config = Object.fromEntries(data.map((d) => [d.key, { label: d.label, color: d.color }])) satisfies ChartConfig
  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative size-40 shrink-0">
        <ChartContainer config={config} className="size-40">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
            <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="key" innerRadius={52} outerRadius={76} strokeWidth={2} stroke="var(--card)">
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-brand-navy tabular-nums">{total.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2 text-sm">
        {data.filter((d) => d.value > 0).map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate">{d.label}</span>
            <span className="font-medium tabular-nums">{d.value.toLocaleString()}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{pct(d.value, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Ranked horizontal bars for short category lists (techniques, sites, crews).
export function BarList({ data, color = "var(--chart-1)", format = (v: number) => v.toLocaleString() }: { data: { label: string; value: number; hint?: string }[]; color?: string; format?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="space-y-2.5 text-sm">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="min-w-0 truncate">
              {d.label}
              {d.hint && <span className="ml-1.5 text-xs text-muted-foreground">{d.hint}</span>}
            </span>
            <span className="font-medium tabular-nums">{format(d.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
