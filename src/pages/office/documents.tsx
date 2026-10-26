import { CheckCircle2, ExternalLink, QrCode, ShieldX, Upload, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, Placeholder, Stat, TableWrap } from "@/components/app/page"
import { C, Donut } from "@/components/app/charts"
import { DocBadge, Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { crew, type CrewDoc } from "@/data/mock"
import { cn } from "@/lib/utils"

const ALLOWLIST = ["verify.philsys.gov.ph", "clearance.nbi.gov.ph", "pnpclearance.ph", "lto.gov.ph", "sec.gov.ph", "bir.gov.ph"]

type Case = {
  title: string
  person: string
  doc: CrewDoc["type"]
  qr: string
  fields: { field: string; document: string; issuer: string; philid: string }[]
}

const genuine: Case = {
  title: "NBI Clearance · Ricky Mendoza",
  person: "Ricky Mendoza",
  doc: "NBI Clearance",
  qr: "https://clearance.nbi.gov.ph/verify?ref=7XK2-0931-55",
  fields: [
    { field: "Full name", document: "RICKY P. MENDOZA", issuer: "RICKY P. MENDOZA", philid: "RICKY PASCUAL MENDOZA" },
    { field: "Birthdate", document: "1989-04-12", issuer: "1989-04-12", philid: "1989-04-12" },
    { field: "Reference no.", document: "7XK2-0931-55", issuer: "7XK2-0931-55", philid: "—" },
    { field: "Valid until", document: "2027-03-20", issuer: "2027-03-20", philid: "—" },
    { field: "Remarks", document: "No record", issuer: "No record", philid: "—" },
  ],
}

const forged: Case = {
  title: "Police Clearance · Efren Navarro",
  person: "Efren Navarro",
  doc: "Police Clearance",
  qr: "https://pnp-clearance-verify.com/check?id=PC-22-88140",
  fields: [
    { field: "Full name", document: "EFREN T. NAVARRO", issuer: "No record for this ID", philid: "EFREN TOLENTINO NAVARRO" },
    { field: "Birthdate", document: "1991-08-02", issuer: "—", philid: "1990-08-02" },
    { field: "Clearance ID", document: "PC-22-88140", issuer: "Not found", philid: "—" },
    { field: "Valid until", document: "2027-02-28", issuer: "—", philid: "—" },
  ],
}

function host(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function Documents() {
  const [active, setActive] = useState<Case | null>(null)
  const queue = crew.flatMap((c) => c.docs.filter((d) => ["pending", "mismatch", "expiring", "expired"].includes(d.status)).map((d) => ({ c, d })))
  const verified = crew.flatMap((c) => c.docs).filter((d) => d.status === "issuer-verified").length
  const screened = crew.flatMap((c) => c.docs).filter((d) => d.status === "screened").length
  const docCount = (st: CrewDoc["status"]) => crew.flatMap((c) => c.docs).filter((d) => d.status === st).length

  return (
    <>
      <PageHeader
        title="Document verification"
        description="Trusted only when the issuer confirms." more="Crew credentials are trusted when their issuer confirms them, not because the scan looks right. QR codes open only official issuer domains; results are stored as evidence and re-checked before dispatch."
        actions={
          <>
            <Button variant="outline" onClick={() => setActive(forged)}>
              Demo: forged clearance
            </Button>
            <Button onClick={() => setActive(genuine)}>
              <Upload /> Verify a document
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Crew documents">
          <Donut
            centerLabel="documents"
            data={[
              { key: "verified", label: "Issuer-verified", value: verified, color: C.good },
              { key: "screened", label: "Screened only", value: screened, color: C.slate },
              { key: "pending", label: "Check pending", value: docCount("pending"), color: C.pale },
              { key: "expiring", label: "Expiring or expired", value: docCount("expiring") + docCount("expired"), color: C.warn },
              { key: "mismatch", label: "Issuer mismatch", value: docCount("mismatch"), color: C.bad },
            ]}
          />
        </Panel>
        <div className="grid gap-4">
          <Stat label="Needs action" value={queue.length} tone="warning" />
          <Stat label="Crew blocked" value={queue.filter((x) => x.d.status === "mismatch").length} tone="danger" sub="Issuer mismatch" />
        </div>
      </div>
      <Panel title="Verification queue">
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crew</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Issuer channel</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map(({ c, d }) => (
                <TableRow key={c.id + d.type}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell className="min-w-56 whitespace-normal text-muted-foreground">{d.channel}</TableCell>
                  <TableCell>{d.expiry}</TableCell>
                  <TableCell>
                    <DocBadge status={d.status} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setActive(d.status === "mismatch" ? { ...forged, person: c.name, title: `${d.type} · ${c.name}` } : { ...genuine, person: c.name, title: `${d.type} · ${c.name}` })}>
                      Check
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
      <Panel title="Issuer channels" description="Only these domains can be opened from a scanned QR code.">
        <div className="flex flex-wrap gap-2">
          {ALLOWLIST.map((d) => (
            <Pill key={d} tone="info">
              {d}
            </Pill>
          ))}
        </div>
        <div className="mt-3">
          <Placeholder>Issuer portals have no public API. Staff open the official page from ArkLinx, compare the result, and ArkLinx stores who checked, when, and what the issuer returned.</Placeholder>
        </div>
      </Panel>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
          {active && <VerifyFlow c={active} onDone={() => setActive(null)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function VerifyFlow({ c, onDone }: { c: Case; onDone: () => void }) {
  const h = host(c.qr)
  const allowed = ALLOWLIST.includes(h)
  const allMatch = c.fields.every((f) => f.issuer === f.document && (f.philid === "—" || f.philid.startsWith(f.document.split(" ")[0]) || f.philid === f.document))
  return (
    <>
      <DialogHeader>
        <DialogTitle>{c.title}</DialogTitle>
        <DialogDescription>Step through the issuer check. Every step is recorded.</DialogDescription>
      </DialogHeader>
      <ol className="space-y-4">
        <li className="rounded-md bg-muted/60 p-3">
          <div className="flex items-center gap-2 font-medium text-brand-navy">
            <QrCode className="size-4" /> 1. QR code decoded from the upload
          </div>
          <p className="mt-1 text-sm break-all text-muted-foreground">{c.qr}</p>
          <div className="mt-2 flex items-center gap-2 rounded bg-card px-2 py-1.5 text-sm">
            {allowed ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <ShieldX className="size-4 shrink-0 text-danger" />}
            {allowed ? `${h} is an official issuer domain.` : `${h} is not an issuer domain. ArkLinx will not open it. Use the official portal instead.`}
          </div>
        </li>
        <li className="rounded-md bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-brand-navy">2. Compare with the issuer record and PhilID</div>
            <Button size="sm" variant="outline" onClick={() => toast.message(`Opening the official ${c.doc === "NBI Clearance" ? "clearance.nbi.gov.ph" : "pnpclearance.ph"} page in a new tab.`)}>
              <ExternalLink /> Open official portal
            </Button>
          </div>
          <TableWrap>
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>On document</TableHead>
                  <TableHead>Issuer returns</TableHead>
                  <TableHead>PhilID anchor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.fields.map((f) => {
                  const ok = f.issuer === f.document
                  return (
                    <TableRow key={f.field}>
                      <TableCell className="text-muted-foreground">{f.field}</TableCell>
                      <TableCell>{f.document}</TableCell>
                      <TableCell className={cn(!ok && "text-danger")}>{f.issuer}</TableCell>
                      <TableCell className={cn(f.philid !== "—" && f.field === "Birthdate" && f.philid !== f.document && "text-danger")}>{f.philid}</TableCell>
                      <TableCell>{ok ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-danger" />}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableWrap>
        </li>
        <li className="rounded-md bg-muted/60 p-3 text-sm">
          <div className="font-medium text-brand-navy">3. Result</div>
          {allMatch && allowed ? (
            <p className="mt-1 text-success">All fields match the issuer and the PhilID. Record as issuer-verified; re-check scheduled before expiry.</p>
          ) : (
            <p className="mt-1 text-danger">The issuer has no matching record and the birthdate differs from the PhilID. Mark as mismatch; the crew member is blocked from dispatch until resolved.</p>
          )}
        </li>
      </ol>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Close
        </Button>
        {allMatch && allowed ? (
          <Button
            onClick={() => {
              toast.success(`${c.person}: ${c.doc} recorded as issuer-verified with evidence.`)
              onDone()
            }}
          >
            Record as issuer-verified
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => {
              toast.error(`${c.person}: ${c.doc} marked as mismatch. Compliance and the GM were alerted by email.`)
              onDone()
            }}
          >
            Mark mismatch and block
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
