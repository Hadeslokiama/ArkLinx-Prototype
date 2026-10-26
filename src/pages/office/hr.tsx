import { FileLock2, Send } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { crewById, hrDocuments, onboarding, reviews, timesheets } from "@/data/mock"

export default function HR() {
  return (
    <>
      <PageHeader
        title="HR"
        description="Onboarding, timesheets and paperwork." more="Onboarding, timesheets from Time In and Time Out, performance reviews, and a secure portal for sending and signing paperwork."
        actions={
          <Dialog>
            <DialogTrigger render={<Button />}>
              <Send /> Send document
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send for signature</DialogTitle>
                <DialogDescription>Files are encrypted at rest. Recipients open them only after signing in; every view is logged.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dt">Title</Label>
                  <Input id="dt" placeholder="Payslip, Oct 16–31" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="df">File</Label>
                  <Input id="df" type="file" accept="application/pdf" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => toast.success("Sent to all crew. They will see it in their trip link after signing in.")}>Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Crew" value="21" sub="11 drivers, 10 helpers" tone="navy" />
        <Stat label="In onboarding" value={onboarding.length} />
        <Stat label="Overtime this week" value={`${timesheets.reduce((s, t) => s + t.overtime, 0)} h`} tone="warning" />
        <Stat label="Unsigned documents" value={hrDocuments.reduce((s, d) => s + d.total - d.signed, 0)} />
      </div>
      <Tabs defaultValue="onboarding">
        <TabsList className="flex-wrap group-data-horizontal/tabs:h-auto">
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="exchange">Secure documents</TabsTrigger>
        </TabsList>
        <TabsContent value="onboarding" className="mt-4">
          <div className="grid gap-3 md:grid-cols-3">
            {onboarding.map((o) => (
              <Panel key={o.name} title={o.name} description={o.role}>
                <div className="flex justify-between text-sm">
                  <span>{o.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{o.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-brand-blue" style={{ width: `${o.progress}%` }} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Missing: {o.missing}</p>
              </Panel>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="timesheets" className="mt-4">
          <Panel description="From Time In and Time Out, Oct 12–17." more="Hours come from Time In and Time Out on the driver view. Week of Oct 12–17.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crew</TableHead>
                    <TableHead className="text-right">Today</TableHead>
                    <TableHead className="text-right">This week</TableHead>
                    <TableHead className="text-right">Overtime</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets.map((t) => (
                    <TableRow key={t.crewId}>
                      <TableCell className="font-medium">{crewById[t.crewId].name}</TableCell>
                      <TableCell className="text-right tabular-nums">{t.days} h</TableCell>
                      <TableCell className="text-right tabular-nums">{t.week} h</TableCell>
                      <TableCell className="text-right">{t.overtime > 0 ? <Pill tone="warning">{t.overtime} h</Pill> : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{t.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <Panel key={r.crewId} title={crewById[r.crewId].name} description={r.period} actions={<Pill tone={r.rating === "Exceeds" ? "success" : r.rating === "Meets" ? "info" : "warning"}>{r.rating}</Pill>}>
                <p className="text-sm">{r.note}</p>
              </Panel>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="exchange" className="mt-4">
          <Panel description="HR and the GM send; crew sign their own." more="Role-restricted. HR and the GM can send; crew can view and sign only their own files.">
            <ul className="space-y-2">
              {hrDocuments.map((d) => (
                <li key={d.title} className="flex flex-col gap-2 rounded-md bg-muted/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FileLock2 className="mt-0.5 size-5 text-brand-blue" />
                    <div>
                      <div className="font-medium text-brand-navy">{d.title}</div>
                      <div className="text-xs text-muted-foreground">
                        To {d.to} · sent {d.sent}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums">
                      {d.signed}/{d.total} signed
                    </span>
                    <Button size="sm" variant="outline" disabled={d.signed === d.total} onClick={() => toast.success("Reminder sent by email.")}>
                      Remind
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
