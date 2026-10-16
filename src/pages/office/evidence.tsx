import { CheckCircle2, MessageSquare, Smartphone, Truck, XCircle } from "lucide-react"
import { useState } from "react"
import { CircleMarker, Polyline, Tooltip } from "react-leaflet"
import { toast } from "sonner"
import { FleetMap } from "@/components/app/fleet-map"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { Pill, VerdictBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { crewById, siteById, truckById } from "@/data/mock"
import { cn } from "@/lib/utils"

const site = siteById.S04
const phonePt: [number, number] = [site.lat + 0.0002, site.lng + 0.0003]
const trackerPt: [number, number] = [14.3485, 120.9455]

const checks: { channel: string; check: string; result: "pass" | "fail"; detail: string }[] = [
  { channel: "Phone", check: "Inside geofence", result: "pass", detail: "31 m from site center (radius 150 m)" },
  { channel: "Phone", check: "Accuracy", result: "pass", detail: "±5 m reported" },
  { channel: "Phone", check: "Fix regularity", result: "fail", detail: "Last 12 fixes exactly 1.000 s apart with identical accuracy: typical of a mock-location app" },
  { channel: "Phone", check: "Jump from previous fix", result: "fail", detail: "2.3 km in 4 s (implied 2,070 km/h)" },
  { channel: "Tracker", check: "Inside geofence", result: "fail", detail: "2.4 km north-east of the site" },
  { channel: "Tracker", check: "Kinematics", result: "pass", detail: "Speed and heading consistent for the last 20 min" },
  { channel: "Tracker", check: "Device events", result: "pass", detail: "No gpscut, pwrcut or jamming events" },
  { channel: "Tracker", check: "Reporting cadence", result: "pass", detail: "Normal 30 s interval, sensor params present" },
  { channel: "Cross-source", check: "Distance agreement", result: "fail", detail: "2,380 m apart (threshold 250 m)" },
  { channel: "Cross-source", check: "Time agreement", result: "pass", detail: "Tracker fix 35 s older than the button press" },
]

const history = [
  { when: "Oct 14, 14:02", trip: "TRP-1014-03", stage: "Release", truck: "T02", decision: "Rejected", by: "Operations 1", reason: "Tracker showed truck still at vendor; crew re-pressed on actual release." },
  { when: "Oct 11, 09:47", trip: "TRP-1011-01", stage: "Arrival", truck: "T03", decision: "Accepted", by: "Operations 2", reason: "Tracker lagged in basement parking; tracker caught up 3 min later." },
  { when: "Oct 9, 16:31", trip: "TRP-1009-05", stage: "Proof of Delivery", truck: "T01", decision: "Accepted", by: "Christian B.", reason: "Phone accuracy 180 m inside mall; store confirmed receipt by call." },
]

export default function Evidence() {
  const [reason, setReason] = useState("")
  const [decided, setDecided] = useState<null | "Accepted" | "Rejected">(null)
  const truck = truckById.T02

  function decide(d: "Accepted" | "Rejected") {
    if (reason.trim().length < 10) {
      toast.error("Write a reason of at least 10 characters. It goes to the audit log.")
      return
    }
    setDecided(d)
    toast.success(`Stage ${d.toLowerCase()}. Decision and reason written to the hash-linked audit log.`)
  }

  return (
    <>
      <PageHeader
        title="Evidence review"
        description="Stages whose location sources disagree. Neither the crew phone nor the tracker can confirm a stage alone; a person decides when they conflict."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Corroborated this week" value="142" tone="success" sub="Phone and tracker agree" />
        <Stat label="Single-source" value="61" tone="warning" sub="Trucks without a tracker" />
        <Stat label="Conflicting" value={decided ? "0 open" : "1 open"} tone={decided ? "default" : "danger"} sub="3 resolved this week" />
        <Stat label="Median review time" value="6 min" sub="From alert to decision" />
      </div>

      <Panel
        title={
          <span className="flex flex-wrap items-center gap-2">
            TRP-1016-02 · Arrival at {site.name}
            <VerdictBadge verdict="conflicting" />
            {decided && <Pill tone={decided === "Accepted" ? "success" : "danger"}>{decided}</Pill>}
          </span>
        }
        description={`${truck.plate} · ${crewById.D02.name} with ${crewById.H02.name} · pressed 08:48`}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-w-0 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-muted/60 p-3">
                <div className="flex items-center gap-2 font-medium text-brand-navy">
                  <Smartphone className="size-4" /> Crew phone
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Position</dt><dd className="tabular-nums">{phonePt[0].toFixed(4)}, {phonePt[1].toFixed(4)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Accuracy</dt><dd>±5 m</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Captured</dt><dd>08:48:12</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Geofence</dt><dd className="text-success">Inside</dd></div>
                </dl>
              </div>
              <div className="rounded-md bg-muted/60 p-3">
                <div className="flex items-center gap-2 font-medium text-brand-navy">
                  <Truck className="size-4" /> Vectras tracker
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Position</dt><dd className="tabular-nums">{trackerPt[0].toFixed(4)}, {trackerPt[1].toFixed(4)}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Speed</dt><dd>34 km/h, heading SW</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Fix time</dt><dd>08:47:37</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Geofence</dt><dd className="text-danger">2.4 km away</dd></div>
                </dl>
              </div>
            </div>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Check</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((c) => (
                    <TableRow key={c.channel + c.check}>
                      <TableCell className="text-muted-foreground">{c.channel}</TableCell>
                      <TableCell className="min-w-56">
                        <div className="font-medium">{c.check}</div>
                        <div className="text-xs whitespace-normal text-muted-foreground">{c.detail}</div>
                      </TableCell>
                      <TableCell>{c.result === "pass" ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-danger" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </div>
          <div className="min-w-0 space-y-3">
            <FleetMap sites={[site]} focus={[14.338, 120.941]} zoom={14} className="h-80" label="Placeholder positions for the review demo">
              <Polyline positions={[phonePt, trackerPt]} pathOptions={{ color: "#c0262d", dashArray: "6 6", weight: 2 }} />
              <CircleMarker center={phonePt} radius={9} pathOptions={{ color: "#fff", fillColor: "#f5a623", fillOpacity: 1, weight: 2 }}>
                <Tooltip permanent direction="right">Phone</Tooltip>
              </CircleMarker>
              <CircleMarker center={trackerPt} radius={9} pathOptions={{ color: "#fff", fillColor: "#2172dd", fillOpacity: 1, weight: 2 }}>
                <Tooltip permanent direction="right">Tracker</Tooltip>
              </CircleMarker>
            </FleetMap>
            <div className="space-y-2">
              <Label htmlFor="reason">Decision reason (required, saved to the audit log)</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: tracker shows the truck still on Aguinaldo Hwy; asked crew to press Arrival again on site." />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" disabled={!!decided} onClick={() => decide("Rejected")}>
                <XCircle /> Reject stage
              </Button>
              <Button variant="outline" disabled={!!decided} onClick={() => decide("Accepted")}>
                <CheckCircle2 /> Accept anyway
              </Button>
              <Button variant="ghost" onClick={() => toast.message("Message sent to the driver view: please press Arrival again when inside the store yard.")}>
                <MessageSquare /> Ask crew to re-press
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Recent decisions">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.when}>
                  <TableCell className="whitespace-nowrap">{h.when}</TableCell>
                  <TableCell>{h.trip}</TableCell>
                  <TableCell>{h.stage}</TableCell>
                  <TableCell>{truckById[h.truck].plate}</TableCell>
                  <TableCell>
                    <Pill tone={h.decision === "Accepted" ? "success" : "danger"}>{h.decision}</Pill>
                  </TableCell>
                  <TableCell>{h.by}</TableCell>
                  <TableCell className={cn("min-w-72 text-sm whitespace-normal text-muted-foreground")}>{h.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
    </>
  )
}
