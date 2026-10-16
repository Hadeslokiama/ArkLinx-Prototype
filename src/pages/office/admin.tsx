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
import { auditLog, users } from "@/data/mock"

export default function Admin() {
  const modules = navGroups.flatMap((g) => g.items)
  return (
    <>
      <PageHeader title="Administration" description="Users and sign-in methods, the role access matrix, the audit log, integrations and notification settings." />
      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role access</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
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
                <li>Polling every 45 s, server-side only</li>
                <li>Allowed: GET_LOCATIONS, GET_ROUTE, GET_MESSAGES, GET_EVENTS</li>
                <li>Blocked: OBJECT_CMD_GPRS, OBJECT_CMD_SMS</li>
                <li>API key stored in Parameter Store, never logged</li>
              </ul>
            </Panel>
            <Panel title="SSD GPS" description="2 trucks" actions={<Pill tone="warning">Awaiting access</Pill>}>
              <p className="text-sm text-muted-foreground">Client is coordinating API availability with SSD. Trucks are phone-only until then.</p>
            </Panel>
            <Panel title="Email (Amazon SES)" description="Alert delivery" actions={<Pill tone="success">Ready</Pill>}>
              <p className="text-sm text-muted-foreground">SPF, DKIM and DMARC set on the CXBC domain. SMS is not used.</p>
            </Panel>
          </div>
          <div className="mt-3">
            <Placeholder>Integration status is illustrative. The prototype does not call Vectras or send email.</Placeholder>
          </div>
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
