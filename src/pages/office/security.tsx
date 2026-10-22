import { Bot, CheckCircle2, Fingerprint, Gavel, LockKeyhole, ShieldCheck, ShieldOff, Siren, Undo2, UserSearch, Wrench } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, Placeholder, Stat, TableWrap } from "@/components/app/page"
import { Pill, SeverityPill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { SimpleSelect } from "@/components/app/simple-select"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { attackActivity, attackerSession, autoRepairs, decisionQueue, decoys, guardBlocks, honeypotEvents, securityIncidents, suspiciousCases, techniqueHeat, triageLog, vulnerabilities, type ActorKind } from "@/data/mock"
import { cn } from "@/lib/utils"

const activityCfg = {
  bot: { label: "Bot logins", color: "var(--chart-1)" },
  scanner: { label: "Scanners", color: "#9aa3b8" },
  decoy: { label: "Decoy hits", color: "#f5a623" },
  injection: { label: "Injection tries", color: "#c0262d" },
} satisfies ChartConfig

const ALLOWED = [
  "Block an address in the app and at Cloudflare",
  "Revoke a session or freeze a passkey (soft containment for employees; the admin approves or denies)",
  "Hold a trip and its billing",
  "Turn on a stricter WAF rule or Under Attack mode for a set time",
  "Rotate a touched honeytoken",
  "Open an incident, recommend Approve or Deny, and draft the report (repairs come from a fixed list, never from the model)",
]

const ZERO_TRUST = [
  "Every request checked on its own: passkey session, role, order",
  "Admin pages behind Cloudflare Access; no trusted office network",
  "Fresh passkey signature for approve, deny, restore, role change",
  "Running risk score per session: a rise asks for a passkey, then contains",
  "Least privilege: Lambda functions read one photo by a short-lived link",
]

const actorTone: Record<ActorKind, "danger" | "warning" | "info"> = { Outsider: "danger", Employee: "warning", Crew: "info" }

export default function Security() {
  const [decided, setDecided] = useState<Record<string, "approved" | "denied">>({})
  const [undone, setUndone] = useState<Record<string, boolean>>({})
  const [repairOk, setRepairOk] = useState<Record<string, boolean>>({})
  const pending = decisionQueue.filter((d) => !decided[d.id]).length
  const [held, setHeld] = useState<Record<string, "approved" | "denied">>({})
  const [filter, setFilter] = useState("all")
  const events = honeypotEvents.filter((e) =>
    filter === "agent" ? e.flags.some((f) => /AI agent|agent-like/.test(f)) || !!e.session : filter === "blocked" ? e.action === "Blocked" : true,
  )
  return (
    <>
      <PageHeader
        title="Security center"
        description="Zero trust: nothing is trusted by default, including staff accounts. Fixed rules contain attacks in milliseconds, decoys and honeytokens expose them, and damaged pages and records are repaired automatically from signed known-good copies. Every automatic action waits for an admin's Approve or Deny, because a flagged user may simply be an employee. ArkLinx never attacks back."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Awaiting your decision" value={pending} tone="navy" sub="Approve keeps an action; Deny undoes it" />
        <Stat label="Median time to contain" value="21 ms" tone="success" sub="Rules, before the model runs" />
        <Stat label="Repaired automatically" value={autoRepairs.filter((r) => r.state === "Repaired").length} tone="success" sub="Defaced page back in 58 s" />
        <Stat label="Decoy and honeytoken hits" value={decoys.reduce((s, d) => s + d.hits, 0)} tone="warning" sub="Last 7 days" />
      </div>

      <Tabs defaultValue="decisions">
        <TabsList className="flex-wrap group-data-horizontal/tabs:h-auto">
          <TabsTrigger value="decisions">Decisions{pending > 0 && ` (${pending})`}</TabsTrigger>
          <TabsTrigger value="overview">Incidents</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
          <TabsTrigger value="mitre">MITRE and CVE</TabsTrigger>
          <TabsTrigger value="honeypot">Honeypot log</TabsTrigger>
          <TabsTrigger value="replay">Session replay</TabsTrigger>
          <TabsTrigger value="triage">AI triage log</TabsTrigger>
        </TabsList>
        <TabsContent value="decisions" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {decisionQueue.map((d) => (
                <Panel
                  key={d.id}
                  title={
                    <span className="flex flex-wrap items-center gap-2">
                      <Gavel className="size-4" /> {d.id} · {d.actor}
                      <Pill tone={actorTone[d.actorKind]}>{d.actorKind}</Pill>
                      <Pill tone="info">{d.technique}</Pill>
                    </span>
                  }
                  description={`${d.time} · ${d.incident} · ${d.waiting}`}
                  actions={decided[d.id] && <Pill tone={decided[d.id] === "approved" ? "success" : "neutral"}>{decided[d.id] === "approved" ? "Approved · signed" : "Denied · undone"}</Pill>}
                >
                  <p className="text-sm">{d.why}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md bg-success/8 p-3 text-sm">
                      <div className="mb-0.5 font-medium text-brand-navy">Done automatically</div>
                      {d.autoAction}
                    </div>
                    <div className="rounded-md bg-muted/60 p-3 text-sm">
                      <div className="mb-0.5 font-medium text-brand-navy">If you deny</div>
                      {d.denyUndoes}
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-md border p-3 text-sm">
                    <Bot className="mt-0.5 size-4 shrink-0 text-brand-blue" />
                    <div>
                      <span className="font-medium">Triage recommends {d.recommendation}</span>{" "}
                      <span className="text-muted-foreground">({Math.round(d.confidence * 100)}%)</span>
                      <div className="text-muted-foreground">{d.note}</div>
                    </div>
                  </div>
                  {!decided[d.id] && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setDecided((s) => ({ ...s, [d.id]: "approved" }))
                          toast.success("Approved and signed with your passkey. The action stays and the evidence package is sealed.")
                        }}
                      >
                        <ShieldCheck /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDecided((s) => ({ ...s, [d.id]: "denied" }))
                          toast.success(`Denied as a false alarm. ${d.denyUndoes}. Saved for rule tuning.`)
                        }}
                      >
                        <Undo2 /> Deny (false alarm)
                      </Button>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Fingerprint className="size-3.5" /> Needs your passkey
                      </span>
                    </div>
                  )}
                </Panel>
              ))}
            </div>
            <div className="space-y-4">
              <Panel title={<span className="flex items-center gap-2"><LockKeyhole className="size-4" /> Zero trust in ArkLinx</span>} description="NIST SP 800-207, applied as controls.">
                <ul className="space-y-1.5 text-sm">
                  {ZERO_TRUST.map((z) => (
                    <li key={z} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {z}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="How containment scales" description="Rules act at once; the admin decides afterwards.">
                <dl className="space-y-2 text-sm">
                  <div><dt className="font-medium text-danger">Outsider</dt><dd className="text-muted-foreground">Blocked in the app and at Cloudflare, tarpitted, served decoys. Stays blocked until decided.</dd></div>
                  <div><dt className="font-medium text-warning">Employee</dt><dd className="text-muted-foreground">Soft containment only: session revoked, fresh passkey, sensitive actions frozen. Never deleted. GM alerted after 30 min.</dd></div>
                  <div><dt className="font-medium text-brand-blue">Crew evidence</dt><dd className="text-muted-foreground">Stop and billing held; new live capture requested while still on site.</dd></div>
                </dl>
              </Panel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="repairs" className="mt-4 space-y-4">
          <Panel
            title={<span className="flex items-center gap-2"><Wrench className="size-4" /> Automatic repairs</span>}
            description="Restored from known-good copies: the signed release image, the hash-linked audit log, locked R2 versions and the approved configuration. A repair that could overwrite real staff work waits for approval."
          >
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Damage</TableHead>
                    <TableHead>How it was found</TableHead>
                    <TableHead>Repair</TableHead>
                    <TableHead className="text-right">Took</TableHead>
                    <TableHead>State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autoRepairs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap tabular-nums">{r.time}</TableCell>
                      <TableCell className="min-w-44 font-medium whitespace-normal">{r.what}</TableCell>
                      <TableCell className="min-w-48 text-sm whitespace-normal text-muted-foreground">{r.detected}</TableCell>
                      <TableCell className="min-w-56 text-sm whitespace-normal">{r.repair}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.tookS ? `${r.tookS} s` : "—"}</TableCell>
                      <TableCell>
                        {r.state === "Repaired" ? (
                          undone[r.id] ? (
                            <Pill tone="neutral">Undone by you</Pill>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Pill tone="success">Repaired</Pill>
                              <Button size="sm" variant="ghost" onClick={() => { setUndone((s) => ({ ...s, [r.id]: true })); toast.success("Repair undone. Logged with your passkey signature.") }}>
                                <Undo2 /> Undo
                              </Button>
                            </div>
                          )
                        ) : repairOk[r.id] ? (
                          <Pill tone="success">Restored · approved</Pill>
                        ) : (
                          <Button size="sm" onClick={() => { setRepairOk((s) => ({ ...s, [r.id]: true })); toast.success("Restore approved. Evidence re-verified; billing stays held until verified.") }}>
                            <ShieldCheck /> Approve restore
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

        <TabsContent value="mitre" className="mt-4 space-y-4">
          <div className="grid gap-4 2xl:grid-cols-[1fr_1.6fr]">
            <Panel title="MITRE ATT&CK techniques seen, last 30 days" description="Each rule carries a fixed technique ID; the model may only suggest IDs that exist in the local ATT&CK copy.">
              <ul className="space-y-2">
                {techniqueHeat.map((t) => {
                  const max = Math.max(...techniqueHeat.map((x) => x.count))
                  return (
                    <li key={t.id} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span><span className="font-mono text-xs">{t.id}</span> {t.name}</span>
                        <span className="tabular-nums text-muted-foreground">{t.count}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-brand-blue" style={{ width: `${(t.count / max) * 100}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Panel>
            <Panel title="Vulnerabilities (CVE)" description="Probes caught by decoys, plus nightly composer audit, npm audit and Trivy. CISA's Known Exploited list comes first (patch within 7 days), then FIRST's EPSS.">
              <TableWrap>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CVE</TableHead>
                      <TableHead>Where</TableHead>
                      <TableHead className="text-right">CVSS</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vulnerabilities.map((v) => (
                      <TableRow key={v.cve}>
                        <TableCell className="whitespace-nowrap">
                          <span className="font-mono text-xs font-medium">{v.cve}</span>
                          <div className="text-xs text-muted-foreground">{v.component}</div>
                        </TableCell>
                        <TableCell className="min-w-44 text-sm whitespace-normal text-muted-foreground">{v.where}</TableCell>
                        <TableCell className="text-right tabular-nums">{v.cvss}</TableCell>
                        <TableCell>{v.kev ? <Pill tone="danger">CISA KEV</Pill> : <Pill tone="neutral">By EPSS</Pill>}</TableCell>
                        <TableCell className="min-w-44 text-sm whitespace-normal">
                          {v.status}
                          {v.due !== "—" && <div className="text-xs text-warning">Due {v.due}</div>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-4 space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {securityIncidents.map((inc) => (
            <Panel
              key={inc.id}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <Siren className="size-4 text-danger" /> {inc.id} · {inc.title}
                  <SeverityPill severity={inc.severity} />
                  <Pill tone="info">{inc.technique}</Pill>
                </span>
              }
              description={`${inc.time} · ${inc.source} · contained in ${inc.containedMs} ms · playbook ${inc.playbook}`}
              actions={<Pill tone={inc.status === "Under review" ? "warning" : "success"}>{inc.status}</Pill>}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-brand-navy">Rule actions (automatic)</h3>
                  <ul className="space-y-1 text-sm">
                    {inc.actions.map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-muted/60 p-3 text-sm">
                  <h3 className="mb-1 flex items-center gap-1.5 font-medium text-brand-navy">
                    <Bot className="size-4" /> Qwen3 triage (JSON, schema-checked)
                  </h3>
                  <dl className="space-y-0.5">
                    <div><dt className="inline text-muted-foreground">Guard: </dt><dd className="inline">{inc.triage.guard}</dd></div>
                    <div><dt className="inline text-muted-foreground">Class: </dt><dd className="inline font-mono text-xs">{inc.triage.attackClass}</dd> <span className="text-muted-foreground">({Math.round(inc.triage.confidence * 100)}%)</span></div>
                    <div><dt className="inline text-muted-foreground">Playbook: </dt><dd className="inline font-mono text-xs">{inc.triage.playbook}</dd></div>
                  </dl>
                  <p className="mt-2 text-muted-foreground">{inc.triage.summary}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{inc.approval}</div>
            </Panel>
          ))}
        </div>

        <div className="space-y-4">
          <Panel title="What the model can do" description="The only six actions it may choose (OWASP LLM06, excessive agency).">
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {ALLOWED.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground">
              <ShieldOff className="mt-0.5 size-4 shrink-0" />
              It cannot run server commands, query the database, change other firewall settings or contact any outside system. Network attacks are absorbed by Cloudflare; ARP poisoning does not apply to the cloud server.
            </div>
          </Panel>
          <Panel title="Decoys and honeytokens">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decoy</TableHead>
                    <TableHead className="text-right">Hits</TableHead>
                    <TableHead>Last</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decoys.map((d) => (
                    <TableRow key={d.name}>
                      <TableCell>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.kind}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{d.hits}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{d.last}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </div>
      </div>

      <Panel
        title={
          <span className="flex items-center gap-2">
            <UserSearch className="size-4" /> Suspicious user activity
          </span>
        }
        description="Rules and each user's own normal pattern. Only actions inside ArkLinx are watched; the privacy notice says so. ArkLinx may pause an action but never disciplines anyone."
      >
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousCases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {c.who}
                    <div className="text-xs text-muted-foreground">{c.role}</div>
                  </TableCell>
                  <TableCell>
                    <Pill tone={c.level === "Hold" ? "danger" : c.level === "Alert" ? "warning" : "neutral"}>{c.level}</Pill>
                  </TableCell>
                  <TableCell className="min-w-64 text-sm whitespace-normal">{c.signal}</TableCell>
                  <TableCell className="min-w-48 text-sm whitespace-normal text-muted-foreground">{c.action}</TableCell>
                  <TableCell>
                    {c.level === "Hold" && !held[c.id] ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setHeld((s) => ({ ...s, [c.id]: "approved" })); toast.success("Export released by a second person. Logged.") }}>
                          Release
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setHeld((s) => ({ ...s, [c.id]: "denied" })); toast.success("Export denied. Session revoked; GM notified.") }}>
                          Deny
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">{held[c.id] ? (held[c.id] === "approved" ? "Released" : "Denied") : c.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
        </TabsContent>

        <TabsContent value="honeypot" className="mt-4 space-y-4">
          <Panel title="Attack attempts, last 7 days" description="From Cloudflare edge logs and the decoys. Every attempt shown was contained.">
            <ChartContainer config={activityCfg} className="h-64 w-full">
              <BarChart data={attackActivity} margin={{ left: 4, right: 8 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar isAnimationActive={false} dataKey="bot" stackId="a" fill="var(--color-bot)" />
                <Bar isAnimationActive={false} dataKey="scanner" stackId="a" fill="var(--color-scanner)" />
                <Bar isAnimationActive={false} dataKey="decoy" stackId="a" fill="var(--color-decoy)" />
                <Bar isAnimationActive={false} dataKey="injection" stackId="a" fill="var(--color-injection)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Panel>
          <Panel
            title="Honeypot event log"
            description="Decoy and honeytoken hits. Decoys serve fake data only; nothing real is ever returned."
            actions={<SimpleSelect value={filter} onChange={setFilter} ariaLabel="Filter" options={[{ value: "all", label: "All events" }, { value: "agent", label: "AI agents" }, { value: "blocked", label: "Blocked" }]} />}
          >
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Path and request</TableHead>
                    <TableHead>Decoy served</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.time + e.path}>
                      <TableCell className="whitespace-nowrap tabular-nums">{e.time}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-mono text-xs">{e.ip}</span>
                        <div className="text-xs text-muted-foreground">{e.country}</div>
                      </TableCell>
                      <TableCell className="min-w-56 whitespace-normal">
                        <div className="font-mono text-xs font-medium">{e.path}</div>
                        <div className="font-mono text-xs text-muted-foreground">{e.request}</div>
                      </TableCell>
                      <TableCell className="min-w-48 text-sm whitespace-normal text-muted-foreground">
                        {e.served}
                        {e.tarpitMs > 0 && <div className="text-xs">Tarpit {e.tarpitMs / 1000} s</div>}
                      </TableCell>
                      <TableCell className="min-w-44">
                        <div className="flex flex-wrap gap-1">
                          {e.flags.map((f) => (
                            <Pill key={f} tone={/AI agent|agent-like|Honeytoken/.test(f) ? "danger" : "warning"}>{f}</Pill>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Pill tone={e.action === "Blocked" ? "danger" : e.action === "Tarpit" ? "warning" : "neutral"}>{e.action}</Pill>
                        {e.session && <div className="mt-1 text-xs text-brand-blue">{e.session}</div>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>

        <TabsContent value="replay" className="mt-4">
          <Panel
            title={`Session ${attackerSession.id} · ${attackerSession.ip}`}
            description={attackerSession.verdict}
            actions={<Pill tone="danger">AI agent caught</Pill>}
          >
            <ol className="relative space-y-3 border-l-2 border-muted pl-5">
              {attackerSession.steps.map((s, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[1.6rem] size-3 rounded-full ring-4 ring-card",
                      s.dir === "in" ? "bg-danger" : s.dir === "out" ? "bg-brand-blue" : "bg-success",
                    )}
                  />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{s.t}</span>
                    <span className="text-xs font-medium">{s.dir === "in" ? "Attacker" : s.dir === "out" ? "Decoy reply" : "ArkLinx"}</span>
                  </div>
                  <div className={cn("mt-0.5 rounded-md px-3 py-2 font-mono text-xs whitespace-pre-wrap", s.dir === "in" ? "bg-danger/8" : s.dir === "out" ? "bg-brand-blue/8" : "bg-success/10 font-sans")}>{s.text}</div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              The canary line in the decoy .env is passive prompt injection: only an automated agent repeats it. ArkLinx never reaches into the attacker's machine (Cybercrime Prevention Act).
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="triage" className="mt-4 space-y-4">
          <Panel title="AI triage log" description="Every Qwen3 run. Input uses IDs, not names; output must match the JSON schema; the model may only pick an allowed action; the admin approves or denies each action.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Input (masked)</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Model output</TableHead>
                    <TableHead className="text-right">Time taken</TableHead>
                    <TableHead>Action, approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triageLog.map((r) => (
                    <TableRow key={r.time}>
                      <TableCell className="whitespace-nowrap tabular-nums">{r.time}</TableCell>
                      <TableCell className="font-medium">{r.incident}</TableCell>
                      <TableCell className="min-w-40 text-xs whitespace-normal text-muted-foreground">{r.input}</TableCell>
                      <TableCell className="min-w-40 text-xs whitespace-normal">
                        <Pill tone={r.guard === "Passed" ? "success" : "warning"}>{r.guard === "Passed" ? "Passed" : "Flagged"}</Pill>
                        {r.guard !== "Passed" && <div className="mt-1 text-muted-foreground">{r.guard.replace(/^Flagged: /, "")}</div>}
                      </TableCell>
                      <TableCell className="w-80 min-w-56 whitespace-normal">
                        <pre className="rounded bg-muted/70 p-2 font-mono text-[11px] break-all whitespace-pre-wrap">{r.output}</pre>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.latencyS} s</TableCell>
                      <TableCell className="min-w-36 text-xs whitespace-normal">
                        {r.action}
                        <div className={r.approvedBy === "Pending" ? "text-warning" : "text-muted-foreground"}>{r.approvedBy === "Pending" ? "Awaiting admin decision" : `Approved by ${r.approvedBy}`}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
          <Panel title="Blocked by the guard model" description="Attacker or user text that tried to steer the model. It never reaches the model as an instruction.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Where it came from</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Guard label</TableHead>
                    <TableHead>Handling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guardBlocks.map((g) => (
                    <TableRow key={g.time}>
                      <TableCell className="whitespace-nowrap tabular-nums">{g.time}</TableCell>
                      <TableCell>{g.source}</TableCell>
                      <TableCell className="min-w-56 font-mono text-xs whitespace-normal">"{g.text}"</TableCell>
                      <TableCell>
                        <Pill tone={g.label.startsWith("unsafe") ? "danger" : "warning"}>{g.label}</Pill>
                      </TableCell>
                      <TableCell className="min-w-56 text-xs whitespace-normal text-muted-foreground">{g.handled}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>
      </Tabs>
      <Placeholder>Prototype data. The real triage runs a fine-tuned Qwen3 with llama.cpp on AWS Lambda in CXBC's own account; nothing here calls a model.</Placeholder>
    </>
  )
}
