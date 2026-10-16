import { Plus, Tag } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { DocBadge, Pill } from "@/components/app/status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { crew, truckById, type Crew } from "@/data/mock"
import { cn } from "@/lib/utils"

function Meter({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value <= 2 : value >= 85
  const ok = invert ? value <= 5 : value >= 75
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{invert ? `${value} events` : `${value}`}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className={cn("h-1.5 rounded-full", good ? "bg-success" : ok ? "bg-brand-blue" : "bg-warning")} style={{ width: `${invert ? Math.max(8, 100 - value * 10) : value}%` }} />
      </div>
    </div>
  )
}

const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("")

export default function Drivers() {
  const [group, setGroup] = useState("all")
  const [role, setRole] = useState("all")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<Crew | null>(null)
  const list = crew.filter((c) => (group === "all" || c.group === group) && (role === "all" || c.role === role) && c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHeader
        title="Drivers and helpers"
        description="Crew grouped by fleet segment, tagged by skills, with safety and efficiency scorecards from trip data."
        actions={
          <Button onClick={() => toast.message("Add crew opens onboarding in HR with document checks.")}>
            <Plus /> Add crew
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search name" value={q} onChange={(e) => setQ(e.target.value)} className="w-52 bg-card" aria-label="Search crew" />
        <SimpleSelect value={group} onChange={setGroup} ariaLabel="Group" options={[{ value: "all", label: "All groups" }, { value: "SCSM Retail", label: "SCSM Retail" }, { value: "AAI Medical", label: "AAI Medical" }, { value: "Freight", label: "Freight" }]} />
        <SimpleSelect value={role} onChange={setRole} ariaLabel="Role" options={[{ value: "all", label: "Drivers and helpers" }, { value: "Driver", label: "Drivers" }, { value: "Helper", label: "Helpers" }]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const docIssue = c.docs.find((d) => ["mismatch", "expired", "expiring", "pending"].includes(d.status))
          return (
            <button key={c.id} onClick={() => setOpen(c)} className="rounded-lg bg-card p-4 text-left transition-colors hover:bg-muted/60">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-brand-navy text-white">{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-brand-navy">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.role} · {c.group}
                    {c.truckId && ` · ${truckById[c.truckId].plate}`}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <Pill key={t}>
                    <Tag className="size-3" />
                    {t}
                  </Pill>
                ))}
              </div>
              {c.role === "Driver" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Meter label="Safety" value={c.score.safety} />
                  <Meter label="On-time" value={c.score.onTime} />
                  <Meter label="Fuel" value={c.score.fuel} />
                  <Meter label="Harsh braking" value={c.score.harshBraking} invert />
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Documents</span>
                {docIssue ? <DocBadge status={docIssue.status} /> : <DocBadge status="issuer-verified" />}
              </div>
            </button>
          )
        })}
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>
                  {open.role} · {open.group} · hired {open.hired}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-brand-navy">Group</div>
                  <SimpleSelect value={open.group} onChange={(v) => toast.success(`${open.name} moved to ${v}.`)} ariaLabel="Group" className="w-full" options={["SCSM Retail", "AAI Medical", "Freight"].map((g) => ({ value: g, label: g }))} />
                </div>
                {open.role === "Driver" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-brand-navy">Scorecard (last 30 days)</div>
                    <Meter label="Safety" value={open.score.safety} />
                    <Meter label="On-time arrival" value={open.score.onTime} />
                    <Meter label="Fuel efficiency" value={open.score.fuel} />
                    <Meter label="Harsh braking" value={open.score.harshBraking} invert />
                    <Meter label="Speeding" value={open.score.speeding} invert />
                    <p className="text-xs text-muted-foreground">Harsh braking and speeding come from Vectras events (haccel, hbrake) and only cover tracker trucks.</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-brand-navy">Documents</div>
                  {open.docs.map((d) => (
                    <div key={d.type} className="flex items-center justify-between gap-2 rounded bg-muted/60 px-3 py-2 text-sm">
                      <div>
                        <div>{d.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.issuer} · expires {d.expiry}
                        </div>
                      </div>
                      <DocBadge status={d.status} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Phone {open.phone}. Opening this profile is recorded in the audit log.</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
