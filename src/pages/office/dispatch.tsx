import { CheckCircle2, Plus, TriangleAlert, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { DocBadge, Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { crew, crewById, requests as initial, siteById, truckBans, truckById, trucks, type TruckRequest } from "@/data/mock"
import { daysUntil } from "@/lib/format"
import { cn } from "@/lib/utils"

type Check = { label: string; state: "pass" | "warn" | "fail"; detail: string }

function readiness(truckId: string, driverId: string, helperId: string, req: TruckRequest): Check[] {
  const t = truckById[truckId]
  const d = crewById[driverId]
  const h = crewById[helperId]
  const checks: Check[] = []
  const reg = daysUntil(t.registrationExpiry)
  checks.push({ label: "Truck registration (LTO)", state: reg < 0 ? "fail" : reg < 30 ? "warn" : "pass", detail: `Expires ${t.registrationExpiry}` })
  const ltfrb = daysUntil(t.ltfrbExpiry)
  checks.push({ label: "LTFRB franchise", state: ltfrb < 0 ? "fail" : ltfrb < 30 ? "warn" : "pass", detail: `Expires ${t.ltfrbExpiry}` })
  checks.push({ label: "Truck availability", state: t.status === "maintenance" ? "fail" : t.status === "on-trip" ? "warn" : "pass", detail: t.status === "maintenance" ? "In the shop" : t.status === "on-trip" ? "On a trip today; check return time" : "In the yard" })
  for (const person of [d, h]) {
    if (!person) continue
    const bad = person.docs.find((x) => x.status === "mismatch" || x.status === "expired")
    const warn = person.docs.find((x) => x.status === "pending" || x.status === "expiring")
    checks.push({
      label: `${person.role} documents: ${person.name}`,
      state: bad ? "fail" : warn ? "warn" : "pass",
      detail: bad ? `${bad.type}: ${bad.status === "mismatch" ? "issuer mismatch" : "expired"}` : warn ? `${warn.type}: ${warn.status}` : "All issuer-verified or screened",
    })
  }
  const lgus = req.stores.map((s) => siteById[s].address.split(", ").at(-1) ?? "")
  const ban = truckBans.find((b) => b.status !== "Expired" && lgus.some((l) => b.lgu.startsWith(l)))
  checks.push({ label: "Truck-ban notices on route", state: ban ? "warn" : "pass", detail: ban ? `${ban.lgu}: ${ban.window}` : "No notice on file for the route's LGUs" })
  checks.push({ label: "GPS source", state: t.gps === "vectra" ? "pass" : "warn", detail: t.gps === "vectra" ? "Vectras tracker + phone (corroborated stages)" : "Phone only (single-source stages)" })
  return checks
}

const icon = { pass: <CheckCircle2 className="size-4 text-success" />, warn: <TriangleAlert className="size-4 text-warning" />, fail: <XCircle className="size-4 text-danger" /> }

const columns: { key: TruckRequest["status"]; label: string }[] = [
  { key: "new", label: "New requests" },
  { key: "filling", label: "Filling crew" },
  { key: "assigned", label: "Sent to partner" },
  { key: "accepted", label: "Accepted" },
]

export default function Dispatch() {
  const [reqs, setReqs] = useState(initial)
  const [active, setActive] = useState<TruckRequest | null>(null)
  const [truckId, setTruckId] = useState("T05")
  const [driverId, setDriverId] = useState("D05")
  const [helperId, setHelperId] = useState("H09")

  const checks = useMemo(() => (active ? readiness(truckId, driverId, helperId, active) : []), [active, truckId, driverId, helperId])
  const blocked = checks.some((c) => c.state === "fail")

  function assign() {
    if (!active) return
    setReqs((all) =>
      all.map((r) => {
        if (r.id !== active.id) return r
        const assigned = [...r.assigned, { truckId, driverId, helperIds: [helperId] }]
        return { ...r, assigned, status: assigned.length >= r.trucks ? "assigned" : "filling" }
      }),
    )
    toast.success(`${truckById[truckId].plate} assigned to ${active.id}. ${active.client} can now see the plate, driver and helper.`)
    setActive(null)
  }

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Truck requests from SCSM and AAI. Each assignment passes a readiness check of registration, crew documents, truck-ban notices and GPS source."
        actions={
          <Button onClick={() => toast.message("New request form: client, vendor, date, number of trucks, stores.")}>
            <Plus /> New request
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {columns.map((col) => {
          const items = reqs.filter((r) => r.status === col.key)
          return (
            <Panel key={col.key} title={col.label} actions={<Pill>{items.length}</Pill>} bodyClassName="space-y-3 pt-3">
              {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing here.</p>}
              {items.map((r) => (
                <div key={r.id} className="space-y-3 rounded-md bg-muted/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-brand-navy">{r.id}</span>
                    <Pill tone={r.client === "SCSM" ? "info" : "success"}>{r.client}</Pill>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">From</dt>
                    <dd>{r.vendor}</dd>
                    <dt className="text-muted-foreground">For</dt>
                    <dd>{r.forDate}</dd>
                    <dt className="text-muted-foreground">Stores</dt>
                    <dd>{r.stores.map((s) => siteById[s].name).join(", ")}</dd>
                    <dt className="text-muted-foreground">Received</dt>
                    <dd>{r.requestedAt}</dd>
                  </dl>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Trucks filled</span>
                      <span>
                        {r.assigned.length}/{r.trucks}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-card">
                      <div className="h-1.5 rounded-full bg-brand-blue" style={{ width: `${(r.assigned.length / r.trucks) * 100}%` }} />
                    </div>
                  </div>
                  {r.assigned.length > 0 && (
                    <ul className="space-y-1 text-xs">
                      {r.assigned.map((a, i) => (
                        <li key={i} className="flex justify-between rounded bg-card px-2 py-1">
                          <span>{truckById[a.truckId].plate}</span>
                          <span className="text-muted-foreground">{crewById[a.driverId].name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {r.assigned.length < r.trucks && (
                    <Button size="sm" className="w-full" onClick={() => setActive(r)}>
                      Assign truck and crew
                    </Button>
                  )}
                </div>
              ))}
            </Panel>
          )
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign to {active?.id}</DialogTitle>
            <DialogDescription>
              {active?.client} · {active?.vendor} · {active?.forDate}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <SimpleSelect value={truckId} onChange={setTruckId} ariaLabel="Truck" options={trucks.map((t) => ({ value: t.id, label: t.plate }))} className="w-full" />
            <SimpleSelect value={driverId} onChange={setDriverId} ariaLabel="Driver" options={crew.filter((c) => c.role === "Driver").map((c) => ({ value: c.id, label: c.name }))} className="w-full" />
            <SimpleSelect value={helperId} onChange={setHelperId} ariaLabel="Helper" options={crew.filter((c) => c.role === "Helper").map((c) => ({ value: c.id, label: c.name }))} className="w-full" />
          </div>
          <ul className="space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className={cn("flex items-start gap-2 rounded-md px-3 py-2 text-sm", c.state === "fail" ? "bg-danger/8" : c.state === "warn" ? "bg-warning/8" : "bg-muted/60")}>
                <span className="mt-0.5">{icon[c.state]}</span>
                <span className="min-w-0">
                  <span className="font-medium">{c.label}</span>
                  <span className="block text-muted-foreground">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            Driver documents: {crewById[driverId].docs.slice(1, 4).map((d) => <DocBadge key={d.type} status={d.status} />)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button disabled={blocked} onClick={assign}>
              {blocked ? "Blocked by a failed check" : "Assign and notify partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
