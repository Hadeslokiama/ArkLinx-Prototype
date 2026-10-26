import { useState } from "react"
import { PageHeader, Panel, TableWrap } from "@/components/app/page"
import { C, Donut } from "@/components/app/charts"
import { SimpleSelect } from "@/components/app/simple-select"
import { GpsBadge, Pill, TruckStatusBadge } from "@/components/app/status"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { crewById, fuelRecords, trucks, workOrders, type Truck } from "@/data/mock"
import { daysUntil, num, peso } from "@/lib/format"

function Expiry({ date }: { date: string }) {
  const d = daysUntil(date)
  return <Pill tone={d < 0 ? "danger" : d <= 30 ? "warning" : "neutral"}>{date}{d >= 0 && d <= 30 ? ` · ${d} d` : ""}</Pill>
}

function ServiceBar({ t }: { t: Truck }) {
  const left = t.nextServiceKm - t.odometerKm
  const pctUsed = Math.min(100, Math.max(0, 100 - (left / 10_000) * 100))
  return (
    <div className="min-w-36">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{left < 0 ? `${num(-left)} km overdue` : `${num(left)} km left`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div className={left < 0 ? "h-1.5 rounded-full bg-danger" : left < 1000 ? "h-1.5 rounded-full bg-warning" : "h-1.5 rounded-full bg-brand-blue"} style={{ width: `${left < 0 ? 100 : pctUsed}%` }} />
      </div>
    </div>
  )
}

export default function Fleet() {
  const [status, setStatus] = useState("all")
  const [open, setOpen] = useState<Truck | null>(null)
  const list = trucks.filter((t) => status === "all" || t.status === status)
  return (
    <>
      <PageHeader title="Trucks" description="All 11 trucks at a glance." more="All 11 six-wheelers with GPS source, service status and registration dates." actions={<SimpleSelect value={status} onChange={setStatus} ariaLabel="Status" options={[{ value: "all", label: "All statuses" }, { value: "on-trip", label: "On trip" }, { value: "available", label: "Available" }, { value: "maintenance", label: "Maintenance" }, { value: "off-duty", label: "Off duty" }]} />} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Tracker source">
          <Donut
            centerLabel="trucks"
            data={[
              { key: "vectras", label: "Vectras API", value: 3, color: C.navy },
              { key: "ssd", label: "SSD GPS (pending)", value: 2, color: C.light },
              { key: "phone", label: "Phone only", value: 6, color: C.pale },
            ]}
          />
        </Panel>
        <Panel title="Status now">
          <Donut
            centerLabel="trucks"
            data={[
              { key: "on-trip", label: "On trip", value: trucks.filter((t) => t.status === "on-trip").length, color: C.blue },
              { key: "available", label: "Available", value: trucks.filter((t) => t.status === "available").length, color: C.good },
              { key: "maintenance", label: "Maintenance", value: trucks.filter((t) => t.status === "maintenance").length, color: C.warn },
              { key: "off-duty", label: "Off duty", value: trucks.filter((t) => t.status === "off-duty").length, color: C.pale },
            ]}
          />
        </Panel>
      </div>
      <Panel>
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location source</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right">Odometer</TableHead>
                <TableHead>Next service</TableHead>
                <TableHead>Registration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setOpen(t)}>
                  <TableCell className="font-medium text-brand-blue">{t.plate}</TableCell>
                  <TableCell>{t.model}</TableCell>
                  <TableCell>
                    <TruckStatusBadge status={t.status} />
                  </TableCell>
                  <TableCell>
                    <GpsBadge gps={t.gps} />
                  </TableCell>
                  <TableCell>{t.driverId ? crewById[t.driverId].name : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{num(t.odometerKm)} km</TableCell>
                  <TableCell>
                    <ServiceBar t={t} />
                  </TableCell>
                  <TableCell>
                    <Expiry date={t.registrationExpiry} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.plate}</SheetTitle>
                <SheetDescription>{open.model}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div className="flex flex-wrap gap-2">
                  <TruckStatusBadge status={open.status} />
                  <GpsBadge gps={open.gps} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted-foreground">Driver</dt><dd>{open.driverId ? crewById[open.driverId].name : "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Efficiency</dt><dd>{open.efficiencyKmL} km/L</dd></div>
                  <div><dt className="text-muted-foreground">Odometer</dt><dd>{num(open.odometerKm)} km</dd></div>
                  <div><dt className="text-muted-foreground">Next service</dt><dd>{num(open.nextServiceKm)} km</dd></div>
                  <div><dt className="text-muted-foreground">Registration</dt><dd><Expiry date={open.registrationExpiry} /></dd></div>
                  <div><dt className="text-muted-foreground">LTFRB franchise</dt><dd><Expiry date={open.ltfrbExpiry} /></dd></div>
                  <div><dt className="text-muted-foreground">Insurance</dt><dd><Expiry date={open.insuranceExpiry} /></dd></div>
                  <div><dt className="text-muted-foreground">Last ping</dt><dd>{open.lastPing}</dd></div>
                </dl>
                <div>
                  <h3 className="mb-2 font-medium text-brand-navy">Work orders</h3>
                  <ul className="space-y-1.5 text-sm">
                    {workOrders.filter((w) => w.truckId === open.id).map((w) => (
                      <li key={w.id} className="flex justify-between rounded bg-muted/60 px-3 py-2">
                        <span>{w.title}</span>
                        <span className="text-muted-foreground">{w.status}</span>
                      </li>
                    ))}
                    {!workOrders.some((w) => w.truckId === open.id) && <li className="text-muted-foreground">None recorded.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-medium text-brand-navy">Recent fuel</h3>
                  <ul className="space-y-1.5 text-sm">
                    {fuelRecords.filter((f) => f.truckId === open.id).map((f) => (
                      <li key={f.tripId} className="flex justify-between rounded bg-muted/60 px-3 py-2">
                        <span>{f.tripId}</span>
                        <span className="text-muted-foreground">
                          {f.km} km · {f.receiptL} L
                        </span>
                      </li>
                    ))}
                    {!fuelRecords.some((f) => f.truckId === open.id) && <li className="text-muted-foreground">No fuel records this week.</li>}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">Monthly fixed cost (sample): {peso(38_000)} amortization and insurance.</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
