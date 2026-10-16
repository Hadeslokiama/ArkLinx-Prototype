import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { parts, techLogs, truckById, trucks, workOrders as initial, type WorkOrder } from "@/data/mock"
import { num, peso } from "@/lib/format"

const statuses: WorkOrder["status"][] = ["Open", "In progress", "Waiting parts", "Done"]

export default function Maintenance() {
  const [orders, setOrders] = useState(initial)
  const [newTruck, setNewTruck] = useState("T02")
  const forecast = trucks
    .map((t) => {
      const left = t.nextServiceKm - t.odometerKm
      const perDay = 110
      return { t, left, days: Math.round(left / perDay) }
    })
    .sort((a, b) => a.left - b.left)
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Predictive service scheduling from mileage, work orders, parts and technician logs."
        actions={
          <Dialog>
            <DialogTrigger render={<Button />}>
              <Plus /> New work order
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New work order</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <SimpleSelect value={newTruck} onChange={setNewTruck} ariaLabel="Truck" className="w-full" options={trucks.map((t) => ({ value: t.id, label: t.plate }))} />
                <div className="space-y-1.5">
                  <Label htmlFor="wt">Title</Label>
                  <Input id="wt" placeholder="10,000 km PMS" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wn">Findings</Label>
                  <Textarea id="wn" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => toast.success(`Work order created for ${truckById[newTruck].plate}. Truck blocked from dispatch until done.`)}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open work orders" value={orders.filter((o) => o.status !== "Done").length} tone="navy" />
        <Stat label="Service overdue" value={forecast.filter((f) => f.left < 0).length} tone="danger" sub="Blocked from dispatch" />
        <Stat label="Due within 7 days" value={forecast.filter((f) => f.days >= 0 && f.days <= 7).length} tone="warning" />
        <Stat label="Parts to reorder" value={parts.filter((p) => p.qty <= p.reorderAt).length} />
      </div>
      <Tabs defaultValue="schedule">
        <TabsList className="flex-wrap">
          <TabsTrigger value="schedule">Service forecast</TabsTrigger>
          <TabsTrigger value="orders">Work orders</TabsTrigger>
          <TabsTrigger value="parts">Parts inventory</TabsTrigger>
          <TabsTrigger value="logs">Technician logs</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="mt-4">
          <Panel description="Based on each truck's average of about 110 km a day from trip records.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck</TableHead>
                    <TableHead className="text-right">Odometer</TableHead>
                    <TableHead className="text-right">Service at</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Forecast</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.map(({ t, left, days }) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.plate}</TableCell>
                      <TableCell className="text-right tabular-nums">{num(t.odometerKm)}</TableCell>
                      <TableCell className="text-right tabular-nums">{num(t.nextServiceKm)}</TableCell>
                      <TableCell className="text-right tabular-nums">{num(left)} km</TableCell>
                      <TableCell>
                        <Pill tone={left < 0 ? "danger" : days <= 7 ? "warning" : "neutral"}>{left < 0 ? "Overdue" : days <= 7 ? `In about ${days} days` : `In about ${days} days`}</Pill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <Panel>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Work</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{truckById[o.truckId].plate}</TableCell>
                      <TableCell className="min-w-48">{o.title}</TableCell>
                      <TableCell>{o.type}</TableCell>
                      <TableCell>{o.technician}</TableCell>
                      <TableCell className="text-right tabular-nums">{peso(o.cost)}</TableCell>
                      <TableCell>
                        <SimpleSelect
                          value={o.status}
                          onChange={(v) => setOrders((all) => all.map((x) => (x.id === o.id ? { ...x, status: v as WorkOrder["status"] } : x)))}
                          ariaLabel={`Status of ${o.id}`}
                          options={statuses.map((s) => ({ value: s, label: s }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="parts" className="mt-4">
          <Panel>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                    <TableHead className="text-right">Reorder at</TableHead>
                    <TableHead className="text-right">Unit cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.qty}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.reorderAt}</TableCell>
                      <TableCell className="text-right tabular-nums">{peso(p.unitCost)}</TableCell>
                      <TableCell>
                        <Pill tone={p.qty === 0 ? "danger" : p.qty <= p.reorderAt ? "warning" : "success"}>{p.qty === 0 ? "Out of stock" : p.qty <= p.reorderAt ? "Reorder" : "OK"}</Pill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Panel>
            <ul className="space-y-2">
              {techLogs.map((l, i) => (
                <li key={i} className="rounded-md bg-muted/60 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-brand-navy">{truckById[l.truckId].plate}</span>
                    <span className="text-muted-foreground">
                      {l.date} · {l.hours} h
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{l.note}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
