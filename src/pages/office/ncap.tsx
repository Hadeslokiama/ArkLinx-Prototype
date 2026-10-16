import { Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { SimpleSelect } from "@/components/app/simple-select"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { crewById, ncapNotices, trucks } from "@/data/mock"
import { peso } from "@/lib/format"

export default function Ncap() {
  const [plate, setPlate] = useState("NCX 4721")
  const [when, setWhen] = useState("2026-10-09T07:52")
  const [result, setResult] = useState<string | null>(null)
  return (
    <>
      <PageHeader
        title="NCAP"
        description="No Contact Apprehension notices reach CXBC as the registered owner. ArkLinx matches each one to the trip, crew and track recorded at that time and place."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Notices this month" value={ncapNotices.length} tone="navy" />
        <Stat label="Matched to a driver" value={ncapNotices.filter((n) => n.matchedDriverId).length} tone="success" />
        <Stat label="Unmatched" value={ncapNotices.filter((n) => n.status === "Unmatched").length} tone="danger" sub="Truck used outside a trip" />
        <Stat label="Fines at stake" value={peso(ncapNotices.reduce((s, n) => s + n.fine, 0))} />
      </div>
      <Panel title="Look up who was driving" description="Enter the plate and the time on the notice.">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const hit = ncapNotices.find((n) => n.plate === plate && when.replace("T", " ").startsWith(n.when.slice(0, 13)))
            setResult(hit ? `${crewById[hit.matchedDriverId ?? ""]?.name ?? "No driver"} · ${hit.matchedTripId ?? "no trip"} · ${hit.evidence}` : "No trip covers that time. The truck should have been in the yard: check the gate log and the last Time Out.")
          }}
        >
          <div className="space-y-1.5">
            <Label>Plate</Label>
            <SimpleSelect value={plate} onChange={setPlate} ariaLabel="Plate" options={trucks.map((t) => ({ value: t.plate, label: t.plate }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="when">Date and time on notice</Label>
            <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="bg-card" />
          </div>
          <Button type="submit">
            <Search /> Match
          </Button>
        </form>
        {result && <p className="mt-3 rounded-md bg-muted/60 p-3 text-sm">{result}</p>}
      </Panel>
      <Panel title="Notices">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notice</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Violation</TableHead>
                <TableHead>When and where</TableHead>
                <TableHead>Matched to</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead className="text-right">Fine</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ncapNotices.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.id}</TableCell>
                  <TableCell>{n.plate}</TableCell>
                  <TableCell>{n.violation}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {n.when}
                    <div className="text-xs text-muted-foreground">{n.where}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {n.matchedDriverId ? crewById[n.matchedDriverId].name : "—"}
                    <div className="text-xs text-muted-foreground">{n.matchedTripId}</div>
                  </TableCell>
                  <TableCell className="min-w-72 text-sm whitespace-normal text-muted-foreground">{n.evidence}</TableCell>
                  <TableCell className="text-right tabular-nums">{peso(n.fine)}</TableCell>
                  <TableCell>
                    <Pill tone={n.status === "Matched" ? "info" : n.status === "Settled" ? "success" : n.status === "Disputed" ? "warning" : "danger"}>{n.status}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
        <div className="mt-3 flex justify-end">
          <Button variant="outline" onClick={() => toast.success("Evidence pack (trip, stages, track, verdicts) prepared for NC-0412.")}>
            Export evidence pack
          </Button>
        </div>
      </Panel>
    </>
  )
}
