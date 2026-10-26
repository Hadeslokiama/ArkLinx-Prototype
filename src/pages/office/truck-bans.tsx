import { FileUp } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Panel, Placeholder, TableWrap } from "@/components/app/page"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { truckBans } from "@/data/mock"

const routes = [
  { name: "Taguig cross-dock → Calamba", lgus: ["Taguig", "Parañaque", "Muntinlupa", "Biñan", "Sta. Rosa", "Cabuyao", "Calamba"], affected: "Calamba City (TB-031)" },
  { name: "Taguig cross-dock → Dasmariñas", lgus: ["Taguig", "Parañaque", "Las Piñas", "Bacoor", "Imus", "Dasmariñas"], affected: "Dasmariñas City from Nov 3 (TB-032)" },
  { name: "Taguig cross-dock → Sucat", lgus: ["Taguig", "Parañaque"], affected: "Parañaque City (TB-029)" },
  { name: "Pasig vendor → Taguig cross-dock", lgus: ["Pasig", "Taguig"], affected: "None on file" },
]

export default function TruckBans() {
  return (
    <>
      <PageHeader
        title="Truck-ban notices"
        description="LGU notices, 1–3 weeks ahead." more="Advance notices received under the MOU with LGUs, 1–3 weeks before they take effect. Dispatch is warned when a route passes an LGU with an active notice. ArkLinx does not re-route; SCSM routes are fixed."
        actions={
          <Dialog>
            <DialogTrigger render={<Button />}>
              <FileUp /> Encode notice
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Encode an MOU notice</DialogTitle>
                <DialogDescription>Attach the LGU notice as received. Every field is checked against the attachment by a second person.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lgu">LGU</Label>
                  <Input id="lgu" placeholder="Calamba City" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="roads">Roads</Label>
                  <Input id="roads" placeholder="Real St." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="veh">Vehicle criteria</Label>
                  <Input id="veh" placeholder="6-wheelers and up" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="win">Time window</Label>
                  <Input id="win" placeholder="6:00–9:00 AM, Mon–Sat" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="from">Effective</Label>
                  <Input id="from" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to">Until</Label>
                  <Input id="to" type="date" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="file">Notice attachment (PDF or photo)</Label>
                  <Input id="file" type="file" accept="application/pdf,image/*" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => toast.success("Notice saved as draft. A second staff member must confirm it before it warns dispatch.")}>Save for confirmation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Panel title="Notice register">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LGU</TableHead>
                <TableHead>Roads</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {truckBans.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.lgu}</TableCell>
                  <TableCell className="min-w-48 whitespace-normal">{b.roads}</TableCell>
                  <TableCell>{b.vehicles}</TableCell>
                  <TableCell className="min-w-48 whitespace-normal">{b.window}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {b.effective} to {b.until}
                  </TableCell>
                  <TableCell className="min-w-48 text-sm whitespace-normal">
                    {b.source}
                    <div className="text-xs text-muted-foreground">{b.receivedVia}</div>
                  </TableCell>
                  <TableCell>
                    <Pill tone={b.status === "Active" ? "danger" : b.status === "Upcoming" ? "warning" : "neutral"}>{b.status}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
      <Panel title="Predefined SCSM corridors" description="LGUs on each corridor." more="LGUs each corridor passes, and the notices that apply. An LGU with no notice shows 'none on file', never 'unrestricted'.">
        <div className="grid gap-3 md:grid-cols-2">
          {routes.map((r) => (
            <div key={r.name} className="rounded-md bg-muted/60 p-3">
              <div className="font-medium text-brand-navy">{r.name}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.lgus.map((l) => (
                  <Pill key={l} tone={r.affected.startsWith(l) ? "danger" : "neutral"}>
                    {l}
                  </Pill>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Notices: {r.affected}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Placeholder>Hazard layer (flood-risk areas) is a later extension and is not part of this prototype.</Placeholder>
        </div>
      </Panel>
    </>
  )
}
