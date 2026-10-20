import { CheckCircle2, ExternalLink, FileImage, Search } from "lucide-react"
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

// Last manual check of the MMDA NCAP website per truck (sample data).
const lastChecked: Record<string, string> = { T01: "Oct 19", T02: "Oct 19", T03: "Oct 19", T04: "Oct 13", T05: "Oct 19", T06: "Oct 12", T07: "Oct 19", T08: "Oct 19", T09: "Oct 19", T10: "Oct 11", T11: "Oct 19" }
const due = (d: string) => Number(d.split(" ")[1]) <= 13

export default function Ncap() {
  const [plate, setPlate] = useState("NCX 4721")
  const [when, setWhen] = useState("2026-10-09T07:52")
  const [shot, setShot] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  return (
    <>
      <PageHeader
        title="NCAP"
        description="The MMDA NCAP website shows a penalty only after the truck's OR/CR is submitted, so the check is manual: staff check each truck weekly, and whenever an MMDA message arrives. ArkLinx keeps the OR/CRs on file and matches each penalty to the trip, crew and track at that time."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Penalties this month" value={ncapNotices.length} tone="navy" />
        <Stat label="Matched to a driver" value={ncapNotices.filter((n) => n.matchedDriverId).length} tone="success" />
        <Stat label="Unmatched" value={ncapNotices.filter((n) => n.status === "Unmatched").length} tone="danger" sub="Truck used outside a trip" />
        <Stat label="Weekly checks due" value={trucks.filter((t) => due(lastChecked[t.id]) && !checked[t.id]).length} tone="warning" sub="Check on the MMDA website" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Panel
          title="Weekly check"
          description="Open the MMDA NCAP website, submit the truck's OR/CR, then mark it checked. MMDA texts and emails are only a prompt; never open their links."
          actions={
            <Button variant="outline" size="sm" render={<a href="https://mmda.gov.ph" target="_blank" rel="noreferrer" />}>
              <ExternalLink /> MMDA website
            </Button>
          }
        >
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead>OR/CR on file</TableHead>
                  <TableHead>Last checked</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.plate}</TableCell>
                    <TableCell>
                      <Pill tone="success">
                        <FileImage className="size-3" /> On file
                      </Pill>
                    </TableCell>
                    <TableCell>{checked[t.id] ? "Today" : lastChecked[t.id]}</TableCell>
                    <TableCell className="text-right">
                      {checked[t.id] ? (
                        <CheckCircle2 className="ml-auto size-4 text-success" />
                      ) : due(lastChecked[t.id]) ? (
                        <Button size="sm" variant="outline" onClick={() => { setChecked((c) => ({ ...c, [t.id]: true })); toast.success(`${t.plate} marked checked. No new penalty.`) }}>
                          Mark checked
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not due</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </Panel>

        <Panel title="Record a penalty found on the MMDA website" description="Copy what the site shows and attach a screenshot. ArkLinx then finds who was driving.">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!shot) {
                toast.error("Attach a screenshot of the MMDA page as evidence.")
                return
              }
              const hit = ncapNotices.find((n) => n.plate === plate && when.replace("T", " ").startsWith(n.when.slice(0, 13)))
              setResult(hit ? `${crewById[hit.matchedDriverId ?? ""]?.name ?? "No driver"} · ${hit.matchedTripId ?? "no trip"} · ${hit.evidence}` : "No trip covers that time. The truck should have been in the yard: check the gate log and the last Time Out.")
            }}
          >
            <div className="space-y-1.5">
              <Label>Plate</Label>
              <SimpleSelect value={plate} onChange={setPlate} ariaLabel="Plate" className="w-full" options={trucks.map((t) => ({ value: t.plate, label: t.plate }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="when">Date and time of violation</Label>
              <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="viol">Violation</Label>
              <Input id="viol" defaultValue="Disregarding traffic sign" className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">MMDA reference and fine</Label>
              <Input id="ref" defaultValue="NCAP-2026-0091234 · ₱1,000" className="bg-card" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-sm sm:col-span-2">
              <FileImage className="size-4 text-muted-foreground" />
              {shot ?? "Attach screenshot of the MMDA page"}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setShot(e.target.files?.[0]?.name ?? null)} />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">
                <Search /> Save and match driver
              </Button>
            </div>
          </form>
          {result && <p className="mt-3 rounded-md bg-muted/60 p-3 text-sm">{result}</p>}
        </Panel>
      </div>

      <Panel title="Penalty records">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record</TableHead>
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
          <Button variant="outline" onClick={() => toast.success("Evidence pack (MMDA screenshot, trip, stages, track, verdicts) prepared for NC-0412.")}>
            Export evidence pack
          </Button>
        </div>
      </Panel>
    </>
  )
}
