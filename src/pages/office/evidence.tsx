import { CheckCircle2, CircleAlert, MessageSquare, ReceiptText, Smartphone, Truck, XCircle } from "lucide-react"
import { useState } from "react"
import { CircleMarker, Polyline, Tooltip } from "react-leaflet"
import { toast } from "sonner"
import { FleetMap } from "@/components/app/fleet-map"
import { Disclosure } from "@/components/app/disclosure"
import { C, Donut } from "@/components/app/charts"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { Pill, VerdictBadge } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { crewById, receiptConflict, siteById, truckById } from "@/data/mock"
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
  { when: "Oct 9, 16:31", trip: "TRP-1009-05", stage: "Release (receipt)", truck: "T01", decision: "Accepted", by: "Christian B.", reason: "Phone accuracy 180 m inside mall; store confirmed receipt by call." },
]

type CheckResult = "pass" | "warn" | "fail"
const resultIcon = { pass: CheckCircle2, warn: CircleAlert, fail: XCircle } as const
const resultTone = { pass: "text-success", warn: "text-warning", fail: "text-danger" } as const

// Checks at a glance: a pass/warn/fail bar, then one colored chip per check grouped by source. The notes sit in a dropdown.
function CheckSummary({ items }: { items: { group: string; name: string; result: CheckResult; detail: string }[] }) {
  const passed = items.filter((i) => i.result === "pass").length
  const groups = [...new Set(items.map((i) => i.group))]
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-brand-navy">{passed} of {items.length} checks passed</span>
          <span className="text-xs text-muted-foreground">{items.filter((i) => i.result === "fail").length} failed</span>
        </div>
        <div className="mt-1.5 flex h-2 gap-0.5" aria-hidden>
          {items.map((i) => (
            <span key={i.group + i.name} className={cn("flex-1 rounded-full", i.result === "pass" ? "bg-success" : i.result === "warn" ? "bg-warning" : "bg-danger")} />
          ))}
        </div>
      </div>
      {groups.map((g) => (
        <div key={g}>
          <div className="mb-1 text-xs font-medium text-muted-foreground">{g}</div>
          <div className="flex flex-wrap gap-1.5">
            {items.filter((i) => i.group === g).map((i) => {
              const Icon = resultIcon[i.result]
              return (
                <span key={i.name} title={i.detail} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                  <Icon className={cn("size-3.5", resultTone[i.result])} /> {i.name}
                </span>
              )
            })}
          </div>
        </div>
      ))}
      <Disclosure label="See each check">
        <ul className="space-y-1.5">
          {items.map((i) => {
            const Icon = resultIcon[i.result]
            return (
              <li key={i.group + i.name} className="flex items-start gap-2">
                <Icon className={cn("mt-0.5 size-4 shrink-0", resultTone[i.result].split(" ")[1])} />
                <span><span className="font-medium text-brand-navy">{i.group} · {i.name}: </span>{i.detail}</span>
              </li>
            )
          })}
        </ul>
      </Disclosure>
    </div>
  )
}

function ReceiptCase() {
  const c = receiptConflict
  const [reason, setReason] = useState("")
  const [decided, setDecided] = useState<null | "Accepted" | "Rejected">(null)
  const rec = c.capture
  function decide(d: "Accepted" | "Rejected") {
    if (reason.trim().length < 10) {
      toast.error("Write a reason of at least 10 characters. It goes to the audit log.")
      return
    }
    setDecided(d)
    toast.success(d === "Rejected" ? "Stop rejected. Receipt number block-listed; billing stays held; playbook R2 opened." : "Stop accepted. Decision and reason written to the audit log.")
  }
  return (
    <Panel
      title={
        <span className="flex flex-wrap items-center gap-2">
          {c.tripId} · Release receipt at {siteById[c.siteId].name}
          <VerdictBadge verdict="conflicting" />
          {decided && <Pill tone={decided === "Accepted" ? "success" : "danger"}>{decided}</Pill>}
        </span>
      }
      description={`${rec.plate} · ${rec.driver} with ${rec.helper} · truck has no tracker, so the receipt and photo checks carry this stop`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <div className="rounded-md bg-muted/60 p-3">
            <div className="flex items-center gap-2 font-medium text-brand-navy">
              <ReceiptText className="size-4" /> Signed capture record
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <Pill tone="success"><CheckCircle2 className="size-3" /> Signed by passkey</Pill>
              <Pill tone="info">±{rec.accuracyM} m at {rec.site}</Pill>
              <Pill tone="neutral">{rec.date} {rec.time}</Pill>
              <Pill tone="neutral">Code {rec.code}</Pill>
            </div>
            <Disclosure className="mt-2" label="Full signed record">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                <dt>Latitude, longitude</dt><dd className="tabular-nums text-foreground">{rec.lat}, {rec.lng} (±{rec.accuracyM} m)</dd>
                <dt>Driver, helper</dt><dd className="text-foreground">{rec.driver}, {rec.helper}</dd>
                <dt>Order no.</dt><dd className="text-foreground">{rec.orderNo}</dd>
                <dt>Tracking ID</dt><dd className="text-foreground">{rec.trackingId}</dd>
                <dt>Photo SHA-256</dt><dd className="font-mono text-foreground">{rec.sha256}</dd>
                <dt>Signed by</dt><dd className="text-foreground">{rec.device}</dd>
              </dl>
              <p className="mt-2 text-xs">Record signed with the KMS key and stored beside the photo; the photo bytes are unchanged.</p>
            </Disclosure>
          </div>
          <div className="rounded-md bg-muted/60 p-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium text-brand-navy"><span aria-hidden className="size-1.5 rounded-full bg-danger" />Receipt {c.receiptNo} was already used</div>
            <p className="text-muted-foreground">
              First accepted on {c.firstUsed.tripId} ({c.firstUsed.date}) at {c.firstUsed.site}, truck {c.firstUsed.plate}.
            </p>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <CheckSummary items={c.checks.map((k) => ({ group: k.advisory ? "Advisory (image checks)" : "Required", name: k.name, result: k.result as CheckResult, detail: k.detail }))} />
          <div className="space-y-2">
            <Label htmlFor="reason2">Decision reason (required, saved to the audit log)</Label>
            <Textarea id="reason2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: called the Sucat receiving lead; no SCSM delivery received today from NCX 4726." />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" disabled={!!decided} onClick={() => decide("Rejected")}>
              <XCircle /> Reject stop
            </Button>
            <Button variant="outline" disabled={!!decided} onClick={() => decide("Accepted")}>
              <CheckCircle2 /> Accept anyway
            </Button>
            <Button variant="ghost" onClick={() => toast.message("Crew asked for a new live receipt capture while still on site.")}>
              <MessageSquare /> Ask for a new capture
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}

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
        description="Stops clear when sources agree. You decide conflicts."
        more="Stops whose evidence conflicts: location sources that disagree, or a receipt or photo that fails a check. No single source confirms a stop; image checks are advisory; a person decides."
      />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Stops this week">
          <Donut
            centerLabel="stops"
            data={[
              { key: "corroborated", label: "Corroborated", value: 142, color: C.good },
              { key: "single", label: "Single-source (no tracker)", value: 61, color: C.slate },
              { key: "conflicting", label: "Conflicting", value: 5, color: C.bad },
            ]}
          />
        </Panel>
        <div className="grid gap-4">
          <Stat label="Open conflicts" value={decided ? 1 : 2} tone="danger" sub="1 location, 1 receipt" />
          <Stat label="Median review time" value="6 min" sub="Alert to decision" />
        </div>
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
            <CheckSummary items={checks.map((c) => ({ group: c.channel, name: c.check, result: c.result, detail: c.detail }))} />
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

      <ReceiptCase />

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
                  <TableCell className="min-w-56 whitespace-normal"><Disclosure label="Why">{h.reason}</Disclosure></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
    </>
  )
}
