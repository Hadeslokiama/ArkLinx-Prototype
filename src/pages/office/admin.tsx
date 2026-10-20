import { Check, KeyRound, Minus } from "lucide-react"
import { toast } from "sonner"
import { PageHeader, Panel, Placeholder, TableWrap } from "@/components/app/page"
import { Pill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { navGroups } from "@/components/app/nav"
import { ROLES } from "@/context/role"
import { auditLog, kmsKeys, receiptTemplates, retentionSchedule, users } from "@/data/mock"

export default function Admin() {
  const modules = navGroups.flatMap((g) => g.items)
  return (
    <>
      <PageHeader title="Administration" description="Users and sign-in methods, the role access matrix, the audit log, integrations, keys, privacy and retention, receipt templates and settings." />
      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role access</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="privacy">Privacy and retention</TabsTrigger>
          <TabsTrigger value="receipts">Receipt templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <Panel actions={<Button onClick={() => toast.message("Invite sent. The new user must register a passkey on first sign-in.")}>Invite user</Button>}>
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Second factor</TableHead>
                    <TableHead>Last sign-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <Pill tone={u.mfa === "Passkey" ? "success" : "info"}>
                          <KeyRound className="size-3" />
                          {u.mfa}
                        </Pill>
                      </TableCell>
                      <TableCell>{u.lastLogin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <Panel description="Which roles can open each module. Switch roles from the top-right menu to see the menu change.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    {ROLES.map((r) => (
                      <TableHead key={r.value} className="text-center">
                        {r.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((m) => (
                    <TableRow key={m.path}>
                      <TableCell className="font-medium">{m.title}</TableCell>
                      {ROLES.map((r) => (
                        <TableCell key={r.value} className="text-center">
                          {m.roles === "all" || m.roles.includes(r.value) ? <Check className="mx-auto size-4 text-success" /> : <Minus className="mx-auto size-4 text-muted-foreground/50" />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <Panel description="Insert-only, hash-linked records. The latest hash is anchored hourly to storage that cannot be overwritten.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Record hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((a) => (
                    <TableRow key={a.time}>
                      <TableCell className="tabular-nums">{a.time}</TableCell>
                      <TableCell>{a.actor}</TableCell>
                      <TableCell>{a.action}</TableCell>
                      <TableCell className="min-w-56 whitespace-normal">{a.target}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{a.hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Pill tone="success">Chain verified</Pill>
              <span className="text-muted-foreground">Last check 10:00 · 4,812 anchors · no gaps</span>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Panel title="Vectras Inc." description="3 trucks · WTrackLite User API v1.18" actions={<Pill tone="success">Connected</Pill>}>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Polling every 30 s, server-side only</li>
                <li>Allowed: GET_LOCATIONS, GET_ROUTE, GET_MESSAGES, GET_EVENTS</li>
                <li>Blocked: OBJECT_CMD_GPRS, OBJECT_CMD_SMS</li>
                <li>API key encrypted with KMS, never logged</li>
              </ul>
            </Panel>
            <Panel title="SSD GPS" description="2 trucks" actions={<Pill tone="warning">Awaiting access</Pill>}>
              <p className="text-sm text-muted-foreground">Client is coordinating API availability with SSD. Trucks are crew-only until then.</p>
            </Panel>
            <Panel title="Cloudflare" description="CXBC's domain" actions={<Pill tone="success">Active</Pill>}>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Tunnel: 2 connectors, no open inbound ports</li>
                <li>WAF managed rules, rate limits, Turnstile</li>
                <li>R2 with bucket locks (photos, backups, log anchors)</li>
              </ul>
            </Panel>
            <Panel title="AWS Lightsail" description="Singapore · 8 GB · fixed US$44/month" actions={<Pill tone="success">Healthy</Pill>}>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Laravel, PostgreSQL + PostGIS, Redis, Reverb</li>
                <li>Budget alerts at US$50 and US$60</li>
                <li>Daily snapshots; database archived to R2</li>
              </ul>
            </Panel>
            <Panel title="AI and image workers" description="On the same server" actions={<Pill tone="success">Running</Pill>}>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Ollama: Qwen3-1.7B (fine-tuned, hash-pinned) + Qwen3Guard</li>
                <li>Python worker: hashing, PaddleOCR (plates, receipts), truck and cargo detection, liveness score, JPEG XL archive</li>
                <li>All results advisory; rules decide</li>
              </ul>
            </Panel>
            <Panel title="Email (Amazon SES)" description="Alert delivery" actions={<Pill tone="success">Ready</Pill>}>
              <p className="text-sm text-muted-foreground">SPF, DKIM and DMARC set on the CXBC domain. SMS is not used.</p>
            </Panel>
          </div>
          <div className="mt-3">
            <Placeholder>Integration status is illustrative. The prototype does not call Vectras or send email.</Placeholder>
          </div>
        </TabsContent>
        <TabsContent value="keys" className="mt-4">
          <Panel description="AWS KMS. Each person's data has its own data key, wrapped by K1, K2 or K3; destroying that data key erases every copy, including backups.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rotation</TableHead>
                    <TableHead>Last use</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kmsKeys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.id}</TableCell>
                      <TableCell className="min-w-64 whitespace-normal">{k.purpose}</TableCell>
                      <TableCell>{k.type}</TableCell>
                      <TableCell>{k.rotation}</TableCell>
                      <TableCell className="text-muted-foreground">{k.lastUse}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
            <p className="mt-3 text-sm text-muted-foreground">The server's access key can only use these keys; it cannot create AWS resources. CloudTrail records every use.</p>
          </Panel>
        </TabsContent>
        <TabsContent value="privacy" className="mt-4">
          <Panel description="Retention runs from the day a person leaves, not the day they were hired. Data is erased by destroying the person's key. Approved by CXBC's data protection officer.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Kept for</TableHead>
                    <TableHead>Then</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retentionSchedule.map((r) => (
                    <TableRow key={r.data}>
                      <TableCell className="min-w-64 font-medium whitespace-normal">{r.data}</TableCell>
                      <TableCell className="whitespace-normal">{r.keep}</TableCell>
                      <TableCell className="min-w-56 whitespace-normal text-muted-foreground">{r.then}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.message("Privacy notice shown to every user at first sign-in. Last updated Oct 19.")}>View privacy notice</Button>
              <Button variant="outline" onClick={() => toast.message("2 data-subject requests: 1 access (done), 1 correction (open).")}>Data-subject requests</Button>
              <Button variant="outline" onClick={() => toast.message("Privacy impact assessment: draft, due before the pilot.")}>Privacy impact assessment</Button>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="receipts" className="mt-4">
          <Panel
            description="Each vendor's receipt layout, registered from sample receipts. A reused receipt number is Conflicting at once; low-confidence reads go to staff."
            actions={<Button onClick={() => toast.message("Upload 5 to 10 sample receipts from the office scanner and mark the number, date and store fields.")}>Register a vendor</Button>}
          >
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Number pattern</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead className="text-right">Samples</TableHead>
                    <TableHead>Reading accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptTemplates.map((r) => (
                    <TableRow key={r.vendor}>
                      <TableCell className="font-medium">{r.vendor}</TableCell>
                      <TableCell className="font-mono text-xs">{r.pattern}</TableCell>
                      <TableCell className="min-w-56 whitespace-normal text-muted-foreground">{r.fields}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.samples}</TableCell>
                      <TableCell>{r.accuracy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Panel>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="delay">Partner and public map delay (minutes)</Label>
                <Input id="delay" type="number" defaultValue={30} min={15} max={60} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dist">Corroboration distance threshold (m)</Label>
                <Input id="dist" type="number" defaultValue={250} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="idle">Session idle timeout (minutes)</Label>
                <Input id="idle" type="number" defaultValue={15} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Maximum tracker fix age (s)</Label>
                <Input id="age" type="number" defaultValue={120} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">Capture one-time code window (s)</Label>
                <Input id="code" type="number" defaultValue={60} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ocr">Receipt reading confidence for automatic acceptance</Label>
                <Input id="ocr" type="number" step="0.01" defaultValue={0.9} />
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/60 p-3">
                <Label htmlFor="twoadmin">Account recovery needs a second admin</Label>
                <Switch id="twoadmin" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/60 p-3">
                <Label htmlFor="block">Block dispatch on document mismatch</Label>
                <Switch id="block" defaultChecked />
              </div>
            </div>
            <Button className="mt-5" onClick={() => toast.success("Settings saved. Change recorded in the audit log.")}>
              Save settings
            </Button>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}
