import { FileText } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fuelRecords, invoices, trips, truckById } from "@/data/mock"
import { peso } from "@/lib/format"

export default function Billing() {
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0)
  return (
    <>
      <PageHeader title="Billing" description="Invoices built from completed, evidence-backed trips; fuel receipt checks; and trip reconciliation before billing." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Outstanding" value={peso(outstanding)} tone="navy" />
        <Stat label="Overdue" value={invoices.filter((i) => i.status === "Overdue").length} tone="danger" sub="AAI Sep 16–30" />
        <Stat label="Trips ready to bill" value="96" sub="SCSM Oct 1–15, all stages closed" tone="success" />
        <Stat label="Trips on hold" value="1" sub="Conflicting stage under review" tone="warning" />
      </div>
      <Tabs defaultValue="invoices">
        <TabsList className="flex-wrap">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Fuel receipts</TabsTrigger>
          <TabsTrigger value="recon">Trip reconciliation</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-4">
          <Panel>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Trips</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.id}</TableCell>
                      <TableCell>{i.client}</TableCell>
                      <TableCell>{i.period}</TableCell>
                      <TableCell className="text-right tabular-nums">{i.trips}</TableCell>
                      <TableCell className="text-right tabular-nums">{peso(i.amount)}</TableCell>
                      <TableCell>{i.due}</TableCell>
                      <TableCell>
                        <Pill tone={i.status === "Paid" ? "success" : i.status === "Overdue" ? "danger" : i.status === "Sent" ? "info" : "neutral"}>{i.status}</Pill>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => toast.success(`${i.id} PDF generated with stage evidence per trip.`)}>
                          <FileText /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="receipts" className="mt-4">
          <Panel description="Receipts are photographed by the crew at the pump and checked against liters, station and trip time.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Liters on receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelRecords.map((f) => (
                    <TableRow key={f.tripId}>
                      <TableCell className="font-medium">{f.tripId}</TableCell>
                      <TableCell>{truckById[f.truckId].plate}</TableCell>
                      <TableCell>{f.date}</TableCell>
                      <TableCell className="text-right tabular-nums">{f.receiptL} L</TableCell>
                      <TableCell>{f.receiptVerified ? <Pill tone="success">Verified</Pill> : <Pill tone="warning">To check</Pill>}</TableCell>
                      <TableCell>
                        {!f.receiptVerified && (
                          <Button size="sm" onClick={() => toast.success(`Receipt for ${f.tripId} verified.`)}>
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
        </TabsContent>
        <TabsContent value="recon" className="mt-4">
          <Panel description="A trip is billable when every stop has Release and no stage is Conflicting.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Stops closed</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Billable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((t) => {
                    const closed = t.stops.filter((s) => s.events.some((e) => e.stage === "Release")).length
                    const conflict = t.stops.some((s) => s.events.some((e) => e.verdict === "conflicting"))
                    const ok = closed === t.stops.length && !conflict
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.id}</TableCell>
                        <TableCell>{t.client}</TableCell>
                        <TableCell>
                          {closed}/{t.stops.length}
                        </TableCell>
                        <TableCell>{conflict ? <Pill tone="danger">Conflicting stage</Pill> : <Pill tone="success">Clear</Pill>}</TableCell>
                        <TableCell className="text-right tabular-nums">{peso(t.revenue)}</TableCell>
                        <TableCell>{ok ? <Pill tone="success">Ready</Pill> : <Pill>Not yet</Pill>}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
