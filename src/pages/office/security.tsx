import {
  Ban, Bot, ChevronDown, ChevronRight, CirclePause, CircleX, Clock, Cloud, Database, FileText, Fingerprint, Gauge, Gavel, Ghost, Globe, KeyRound,
  LockKeyhole, RefreshCw, ShieldAlert, ShieldBan, ShieldCheck, Siren, Terminal, Undo2, UserSearch, Wrench, Zap, type LucideIcon,
} from "lucide-react"
import { Fragment, useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, Placeholder, TableWrap } from "@/components/app/page"
import { Pill, SeverityPill } from "@/components/app/status"
import { Disclosure, MeterBar } from "@/components/app/disclosure"
import { BarList, Donut, type Slice } from "@/components/app/charts"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { SimpleSelect } from "@/components/app/simple-select"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { attackActivity, attackerSession, autoRepairs, decisionQueue, decoys, guardBlocks, honeypotEvents, securityIncidents, suspiciousCases, techniqueHeat, triageLog, vulnerabilities, type ActorKind } from "@/data/mock"
import { cn } from "@/lib/utils"

const activityCfg = {
  bot: { label: "Bot logins", color: "var(--chart-2)" },
  scanner: { label: "Scanners", color: "var(--chart-4)" },
  decoy: { label: "Decoy hits", color: "var(--chart-3)" },
  injection: { label: "Injection tries", color: "var(--danger)" },
} satisfies ChartConfig

// The six actions the model may choose: short label on the tile, full rule in the dropdown.
const ALLOWED: { icon: LucideIcon; short: string; long: string }[] = [
  { icon: Ban, short: "Block an address", long: "Block an address in the app and at Cloudflare" },
  { icon: KeyRound, short: "Revoke session", long: "Revoke a session or freeze a passkey (soft containment for employees; the admin approves or denies)" },
  { icon: CirclePause, short: "Hold a trip", long: "Hold a trip and its billing" },
  { icon: ShieldAlert, short: "Stricter WAF", long: "Turn on a stricter WAF rule or Under Attack mode for a set time" },
  { icon: RefreshCw, short: "Rotate honeytoken", long: "Rotate a touched honeytoken" },
  { icon: FileText, short: "Open incident", long: "Open an incident, recommend Approve or Deny, and draft the report (repairs come from a fixed list, never from the model)" },
]
const NEVER: { icon: LucideIcon; label: string }[] = [
  { icon: Terminal, label: "Run commands" },
  { icon: Database, label: "Query the database" },
  { icon: ShieldBan, label: "Change other firewall settings" },
  { icon: Globe, label: "Reach outside systems" },
]

const ZERO_TRUST: { icon: LucideIcon; short: string; long: string }[] = [
  { icon: Fingerprint, short: "Every request checked", long: "Every request checked on its own: passkey session, role, order" },
  { icon: Cloud, short: "Admin behind Access", long: "Admin pages behind Cloudflare Access; no trusted office network" },
  { icon: KeyRound, short: "Passkey for big actions", long: "Fresh passkey signature for approve, deny, restore, role change" },
  { icon: Gauge, short: "Risk score per session", long: "Running risk score per session: a rise asks for a passkey, then contains" },
  { icon: LockKeyhole, short: "Least privilege", long: "Least privilege: Lambda functions read one photo by a short-lived link" },
]

const CONTAINMENT: { kind: ActorKind; label: string; chips: string[]; long: string }[] = [
  { kind: "Outsider", label: "Outsider", chips: ["Blocked", "Tarpit", "Decoys"], long: "Blocked in the app and at Cloudflare, tarpitted, served decoys. Stays blocked until decided." },
  { kind: "Employee", label: "Employee", chips: ["Session revoked", "Passkey again", "Never deleted"], long: "Soft containment only: session revoked, fresh passkey, sensitive actions frozen. Never deleted. GM alerted after 30 min." },
  { kind: "Crew", label: "Crew evidence", chips: ["Stop held", "Billing held", "New capture"], long: "Stop and billing held; new live capture requested while still on site." },
]

const actorTone: Record<ActorKind, "danger" | "warning" | "info"> = { Outsider: "danger", Employee: "warning", Crew: "info" }

const confTone = (c: number) => (c >= 0.85 ? "success" : c >= 0.7 ? "info" : "warning")

function Confidence({ value, label }: { value: number; label?: string }) {
  return (
    <div className="flex min-w-32 items-center gap-2 text-xs">
      {label && <span className="font-mono">{label}</span>}
      <MeterBar value={value} tone={confTone(value)} className="w-16" />
      <span className="tabular-nums text-muted-foreground">{Math.round(value * 100)}%</span>
    </div>
  )
}

function ExpandButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <Button size="sm" variant="ghost" aria-expanded={open} onClick={onClick}>
      <ChevronDown className={cn("transition-transform", open && "rotate-180")} /> {open ? "Hide" : "Details"}
    </Button>
  )
}

export default function Security() {
  const [tab, setTab] = useState("decisions")
  const [decided, setDecided] = useState<Record<string, "approved" | "denied">>({})
  const [undone, setUndone] = useState<Record<string, boolean>>({})
  const [repairOk, setRepairOk] = useState<Record<string, boolean>>({})
  const pending = decisionQueue.filter((d) => !decided[d.id]).length
  const [held, setHeld] = useState<Record<string, "approved" | "denied">>({})
  const [filter, setFilter] = useState("all")
  const [openEvent, setOpenEvent] = useState<string | null>(null)
  const [openRun, setOpenRun] = useState<string | null>(null)
  const events = honeypotEvents.filter((e) =>
    filter === "agent" ? e.flags.some((f) => /AI agent|agent-like/.test(f)) || !!e.session : filter === "blocked" ? e.action === "Blocked" : true,
  )

  const attempts = attackActivity.reduce((s, d) => s + d.bot + d.scanner + d.decoy + d.injection, 0)
  const decoyHits = decoys.reduce((s, d) => s + d.hits, 0)
  const triageAvg = triageLog.reduce((s, r) => s + r.latencyS, 0) / triageLog.length
  const maxHits = Math.max(...decoys.map((d) => d.hits))

  // The defense chain, edge to admin. Each step opens the tab that holds its records.
  const chain: { label: string; value: string | number; sub: string; tab: string }[] = [
    { label: "Edge", value: attempts.toLocaleString(), sub: "stopped, 7 days", tab: "honeypot" },
    { label: "Detect", value: securityIncidents.length, sub: "incidents opened", tab: "overview" },
    { label: "Contain", value: "21 ms", sub: "median, rules only", tab: "overview" },
    { label: "Deceive", value: decoyHits, sub: "decoy hits", tab: "honeypot" },
    { label: "AI triage", value: `${triageAvg.toFixed(1)} s`, sub: "guarded Qwen3", tab: "triage" },
    { label: "Repair", value: "58 s", sub: "page restored", tab: "repairs" },
    { label: "You decide", value: pending, sub: "waiting for you", tab: "decisions" },
  ]
  const attemptMix: Slice[] = [
    { key: "bot", label: "Bot logins", value: attackActivity.reduce((s, d) => s + d.bot, 0), color: "var(--chart-2)" },
    { key: "scanner", label: "Scanners", value: attackActivity.reduce((s, d) => s + d.scanner, 0), color: "var(--chart-4)" },
    { key: "decoy", label: "Decoy hits", value: attackActivity.reduce((s, d) => s + d.decoy, 0), color: "var(--chart-1)" },
    { key: "injection", label: "Prompt-injection tries", value: attackActivity.reduce((s, d) => s + d.injection, 0), color: "var(--danger)" },
  ]

  return (
    <>
      <PageHeader title="Security center" description="Rules contain attacks in milliseconds. AI explains. You decide." />
      <Disclosure label="How the security center works" className="-mt-2">
        Zero trust: nothing is trusted by default, including staff accounts. Fixed rules contain attacks in milliseconds, decoys and honeytokens expose them, and damaged pages and records are repaired automatically from signed known-good copies.
        Every automatic action waits for an admin's Approve or Deny, because a flagged user may simply be an employee. ArkLinx never attacks back.
      </Disclosure>

      <section aria-label="Defense chain" className="rounded-lg bg-card p-2">
        <ol className="grid grid-cols-2 gap-1 sm:grid-cols-4 xl:grid-cols-7">
          {chain.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => setTab(s.tab)}
                aria-pressed={tab === s.tab}
                className={cn("flex h-full w-full flex-col items-start gap-1 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted/60", tab === s.tab && "bg-muted")}
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-2xl leading-none font-semibold tracking-tight text-brand-navy tabular-nums">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.sub}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Attempts by type" description="Everything stopped in the last 7 days.">
          <Donut data={attemptMix} centerLabel="attempts" />
        </Panel>
        <Panel title="Techniques seen" description="MITRE ATT&CK and ATLAS, 30 days.">
          <BarList data={[...techniqueHeat].sort((x, y) => y.count - x.count).slice(0, 5).map((t) => ({ label: t.name, hint: t.id, value: t.count }))} color="var(--chart-2)" />
        </Panel>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList className="flex-wrap group-data-horizontal/tabs:h-auto">
          <TabsTrigger value="decisions">Decisions{pending > 0 && ` (${pending})`}</TabsTrigger>
          <TabsTrigger value="overview">Incidents</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
          <TabsTrigger value="mitre">MITRE and CVE</TabsTrigger>
          <TabsTrigger value="honeypot">Honeypot log</TabsTrigger>
          <TabsTrigger value="replay">Session replay</TabsTrigger>
          <TabsTrigger value="triage">AI triage log</TabsTrigger>
        </TabsList>

        {/* ---------------- Decisions ---------------- */}
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
                  actions={
                    decided[d.id] ? (
                      <Pill tone={decided[d.id] === "approved" ? "success" : "neutral"}>{decided[d.id] === "approved" ? "Approved · signed" : "Denied · undone"}</Pill>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> {d.waiting.split(" · ")[0]}</span>
                    )
                  }
                >
                  <p className="text-sm">{d.why}</p>
                  <div className="mt-3 grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr]">
                    <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-sm">
                      <Zap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Done automatically</div>
                        {d.autoAction}
                      </div>
                    </div>
                    <ChevronRight aria-hidden className="hidden size-4 self-center text-muted-foreground md:block" />
                    <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-sm">
                      <Bot className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground">AI recommends</div>
                        <div className="font-semibold text-brand-navy">{d.recommendation}</div>
                        <Confidence value={d.confidence} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!decided[d.id] && (
                      <>
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
                      </>
                    )}
                  </div>
                  <Disclosure className="mt-2">
                    <dl className="space-y-1.5">
                      <div><dt className="inline font-medium text-brand-navy">If you deny: </dt><dd className="inline">{d.denyUndoes}</dd></div>
                      <div><dt className="inline font-medium text-brand-navy">Model's note: </dt><dd className="inline">{d.note}</dd></div>
                      <div><dt className="inline font-medium text-brand-navy">Incident: </dt><dd className="inline">{d.incident} · {d.time} · {d.waiting}</dd></div>
                    </dl>
                  </Disclosure>
                </Panel>
              ))}
            </div>
            <div className="space-y-4">
              <Panel title={<span className="flex items-center gap-2"><LockKeyhole className="size-4" /> Zero trust in ArkLinx</span>} description="NIST SP 800-207, applied as controls.">
                <div className="grid grid-cols-2 gap-2">
                  {ZERO_TRUST.map((z) => (
                    <div key={z.short} className="flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs font-medium text-brand-navy">
                      <z.icon className="size-4 shrink-0 text-muted-foreground" />
                      {z.short}
                    </div>
                  ))}
                </div>
                <Disclosure className="mt-3" label="What each control means">
                  <ul className="list-disc space-y-1 pl-4">{ZERO_TRUST.map((z) => <li key={z.short}>{z.long}</li>)}</ul>
                </Disclosure>
              </Panel>
              <Panel title="Who gets contained, how" description="Rules act at once; you decide afterwards.">
                <div className="space-y-2">
                  {CONTAINMENT.map((c) => (
                    <div key={c.kind} className="flex flex-wrap items-center gap-1.5">
                      <Pill tone={actorTone[c.kind]} className="w-28 justify-center">{c.label}</Pill>
                      {c.chips.map((ch) => <span key={ch} className="rounded-full bg-muted px-2 py-0.5 text-xs">{ch}</span>)}
                    </div>
                  ))}
                </div>
                <Disclosure className="mt-3">
                  <dl className="space-y-1.5">{CONTAINMENT.map((c) => <div key={c.kind}><dt className="inline font-medium text-brand-navy">{c.label}: </dt><dd className="inline">{c.long}</dd></div>)}</dl>
                </Disclosure>
              </Panel>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- Repairs ---------------- */}
        <TabsContent value="repairs" className="mt-4 space-y-4">
          <Panel
            title={<span className="flex items-center gap-2"><Wrench className="size-4" /> Automatic repairs</span>}
            description="Restored from signed copies." more="Restored from signed known-good copies. Anything that could overwrite real work waits for you."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {autoRepairs.map((r) => (
                <div key={r.id} className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-brand-navy">{r.what}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">{r.id} · {r.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl leading-none font-semibold tabular-nums text-brand-navy">{r.tookS ? `${r.tookS} s` : "—"}</div>
                      <div className="text-[11px] text-muted-foreground">to repair</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <Pill tone="danger">Found</Pill>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                    <Pill tone={r.state === "Repaired" ? "success" : "warning"}>{r.state === "Repaired" ? "Restored" : "Prepared"}</Pill>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                    <Pill tone="navy">You</Pill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {r.state === "Repaired" ? (
                      undone[r.id] ? (
                        <Pill tone="neutral">Undone by you</Pill>
                      ) : (
                        <>
                          <Pill tone="success">Repaired</Pill>
                          <Button size="sm" variant="ghost" onClick={() => { setUndone((s) => ({ ...s, [r.id]: true })); toast.success("Repair undone. Logged with your passkey signature.") }}>
                            <Undo2 /> Undo
                          </Button>
                        </>
                      )
                    ) : repairOk[r.id] ? (
                      <Pill tone="success">Restored · approved</Pill>
                    ) : (
                      <Button size="sm" onClick={() => { setRepairOk((s) => ({ ...s, [r.id]: true })); toast.success("Restore approved. Evidence re-verified; billing stays held until verified.") }}>
                        <ShieldCheck /> Approve restore
                      </Button>
                    )}
                  </div>
                  <Disclosure className="mt-2">
                    <dl className="space-y-1.5">
                      <div><dt className="inline font-medium text-brand-navy">How it was found: </dt><dd className="inline">{r.detected}</dd></div>
                      <div><dt className="inline font-medium text-brand-navy">Repair: </dt><dd className="inline">{r.repair}</dd></div>
                    </dl>
                  </Disclosure>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* ---------------- MITRE and CVE ---------------- */}
        <TabsContent value="mitre" className="mt-4 space-y-4">
          <div className="grid gap-4 2xl:grid-cols-[1fr_1.6fr]">
            <Panel title="MITRE ATT&CK techniques, last 30 days" description="Each rule carries a fixed technique ID.">
              <ul className="space-y-2">
                {techniqueHeat.map((t) => {
                  const max = Math.max(...techniqueHeat.map((x) => x.count))
                  return (
                    <li key={t.id} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span><span className="font-mono text-xs">{t.id}</span> {t.name}</span>
                        <span className="tabular-nums text-muted-foreground">{t.count}</span>
                      </div>
                      <MeterBar value={t.count} max={max} className="mt-1 h-2 [&>div]:h-2" />
                    </li>
                  )
                })}
              </ul>
              <Disclosure className="mt-3">The model may only suggest technique IDs that exist in ArkLinx's local copy of ATT&CK.</Disclosure>
            </Panel>
            <Panel title="Vulnerabilities (CVE)" description="Known-exploited first, then by likelihood of attack.">
              <div className="space-y-2">
                {vulnerabilities.map((v) => (
                  <div key={v.cve} className="flex flex-wrap items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <div className={cn("flex size-12 shrink-0 flex-col items-center justify-center rounded-md", v.cvss >= 9 ? "bg-brand-navy text-white" : "bg-card text-brand-navy")}>
                      <span className="text-base leading-none font-semibold tabular-nums">{v.cvss}</span>
                      <span className="text-[10px] opacity-70">CVSS</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-medium">{v.cve}</span>
                        {v.kev ? <Pill tone="danger">CISA KEV</Pill> : <Pill tone="neutral">By EPSS</Pill>}
                        {v.due !== "—" && <Pill tone="warning">Due {v.due}</Pill>}
                      </div>
                      <div className="text-xs text-muted-foreground">{v.component}</div>
                      <div className="mt-1 text-sm">{v.status}</div>
                      <Disclosure className="mt-1" label="Where it was found">{v.where}</Disclosure>
                    </div>
                  </div>
                ))}
              </div>
              <Disclosure className="mt-3" label="How we rank">
                Probes caught by decoys, plus nightly composer audit, npm audit and Trivy. CISA's Known Exploited list comes first (patch within 7 days), then FIRST's EPSS.
              </Disclosure>
            </Panel>
          </div>
        </TabsContent>

        {/* ---------------- Incidents ---------------- */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              {securityIncidents.map((inc) => (
                <Panel
                  key={inc.id}
                  title={
                    <span className="flex flex-wrap items-center gap-2">
                      <Siren className="size-4 text-muted-foreground" /> {inc.id} · {inc.title}
                      <SeverityPill severity={inc.severity} />
                    </span>
                  }
                  description={`${inc.time} · ${inc.source}`}
                  actions={<Pill tone={inc.status === "Under review" ? "warning" : "success"}>{inc.status}</Pill>}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="success">Contained in {inc.containedMs} ms</Pill>
                    <Pill tone="info">{inc.technique}</Pill>
                    <Pill tone="neutral">Playbook {inc.playbook}</Pill>
                    <Pill tone={inc.triage.guard.startsWith("Passed") ? "success" : "warning"}>Guard: {inc.triage.guard.startsWith("Passed") ? "passed" : "flagged"}</Pill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <Bot className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">AI:</span>
                    <Confidence value={inc.triage.confidence} label={inc.triage.attackClass} />
                  </div>
                  <Disclosure className="mt-2" label="Rule actions and AI summary">
                    <ul className="mb-2 space-y-1">
                      {inc.actions.map((a) => (
                        <li key={a} className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {a}</li>
                      ))}
                    </ul>
                    <p><span className="font-medium text-brand-navy">Guard: </span>{inc.triage.guard}</p>
                    <p><span className="font-medium text-brand-navy">Playbook: </span><span className="font-mono text-xs">{inc.triage.playbook}</span></p>
                    <p className="mt-1">{inc.triage.summary}</p>
                    <p className="mt-1 text-xs">{inc.approval}</p>
                  </Disclosure>
                </Panel>
              ))}
            </div>

            <div className="space-y-4">
              <Panel title="What the AI may do" description="Six allowed actions, nothing else (OWASP LLM06).">
                <div className="grid grid-cols-2 gap-2">
                  {ALLOWED.map((a) => (
                    <div key={a.short} className="flex items-center gap-2 rounded-md bg-muted/60 p-2 text-xs font-medium text-brand-navy">
                      <a.icon className="size-4 shrink-0 text-muted-foreground" /> {a.short}
                    </div>
                  ))}
                </div>
                <div className="mt-3 mb-1 text-xs font-medium text-muted-foreground">It can never</div>
                <div className="flex flex-wrap gap-1.5">
                  {NEVER.map((n) => (
                    <span key={n.label} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                      <CircleX className="size-3.5 text-danger" /> {n.label}
                    </span>
                  ))}
                </div>
                <Disclosure className="mt-3">
                  <ol className="list-decimal space-y-1 pl-4">{ALLOWED.map((a) => <li key={a.short}>{a.long}</li>)}</ol>
                  <p className="mt-2">Network attacks are absorbed by Cloudflare; ARP poisoning does not apply to the cloud server.</p>
                </Disclosure>
              </Panel>
              <Panel title={<span className="flex items-center gap-2"><Ghost className="size-4" /> Decoys and honeytokens</span>} description="Hits in the last 7 days.">
                <ul className="space-y-2.5">
                  {decoys.map((d) => (
                    <li key={d.name} className="text-sm" title={`Last hit: ${d.last}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 truncate font-medium">{d.name}</span>
                        <span className="tabular-nums text-muted-foreground">{d.hits}</span>
                      </div>
                      <MeterBar value={d.hits} max={maxHits} tone="info" className="mt-1" />
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{d.kind} · last {d.last}</div>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          <Panel
            title={<span className="flex items-center gap-2"><UserSearch className="size-4" /> Suspicious user activity</span>}
            description="Compared with each user's usual pattern." more="Compared with each user's normal pattern. ArkLinx may pause an action but never disciplines anyone."
          >
            <ul className="divide-y">
              {suspiciousCases.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Pill tone={c.level === "Hold" ? "danger" : c.level === "Alert" ? "warning" : "neutral"} className="w-16 justify-center">{c.level}</Pill>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{c.who} <span className="font-normal text-muted-foreground">· {c.role} · {c.id}</span></div>
                    <div className="text-sm">{c.signal}</div>
                    <Disclosure className="mt-1" label="What ArkLinx did">{c.action}</Disclosure>
                  </div>
                  <div className="shrink-0">
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
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        {/* ---------------- Honeypot log ---------------- */}
        <TabsContent value="honeypot" className="mt-4 space-y-4">
          <Panel title="Attack attempts, last 7 days" description="Edge and decoy logs; all contained." more="From Cloudflare edge logs and the decoys. Every attempt shown was contained.">
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
            description="Decoys serve fake data only; nothing real is ever returned."
            actions={<SimpleSelect value={filter} onChange={setFilter} ariaLabel="Filter" options={[{ value: "all", label: "All events" }, { value: "agent", label: "AI agents" }, { value: "blocked", label: "Blocked" }]} />}
          >
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => {
                    const key = e.time + e.path
                    const open = openEvent === key
                    return (
                      <Fragment key={key}>
                        <TableRow>
                          <TableCell className="whitespace-nowrap tabular-nums">{e.time}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-mono text-xs">{e.ip}</span>
                            <div className="text-xs text-muted-foreground">{e.country}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-medium">{e.path}</TableCell>
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
                          <TableCell><ExpandButton open={open} onClick={() => setOpenEvent(open ? null : key)} /></TableCell>
                        </TableRow>
                        {open && (
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableCell colSpan={6} className="whitespace-normal">
                              <dl className="grid gap-2 text-sm md:grid-cols-3">
                                <div><dt className="text-xs text-muted-foreground">Request</dt><dd className="font-mono text-xs">{e.request}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Decoy served</dt><dd>{e.served}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Tarpit</dt><dd>{e.tarpitMs > 0 ? `${e.tarpitMs / 1000} s` : "None"}</dd></div>
                              </dl>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </TableWrap>
          </Panel>
        </TabsContent>

        {/* ---------------- Session replay ---------------- */}
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
                  <div className={cn("mt-0.5 rounded-md px-3 py-2 font-mono text-xs whitespace-pre-wrap", s.dir === "in" ? "bg-muted" : s.dir === "out" ? "bg-secondary" : "bg-muted/50 font-sans")}>{s.text}</div>
                </li>
              ))}
            </ol>
            <Disclosure className="mt-4" label="Why the canary line matters">
              The canary line in the decoy .env is passive prompt injection: only an automated agent repeats it. ArkLinx never reaches into the attacker's machine (Cybercrime Prevention Act).
            </Disclosure>
          </Panel>
        </TabsContent>

        {/* ---------------- AI triage log ---------------- */}
        <TabsContent value="triage" className="mt-4 space-y-4">
          <Panel title="AI triage log" description="Every Qwen3 run, schema-checked and approved by an admin.">
            <TableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Incident</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Took</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triageLog.map((r) => {
                    const out = JSON.parse(r.output) as { attack_class: string; confidence: number; playbook_id: string }
                    const open = openRun === r.time
                    return (
                      <Fragment key={r.time}>
                        <TableRow>
                          <TableCell className="whitespace-nowrap tabular-nums">{r.time}</TableCell>
                          <TableCell className="font-medium">{r.incident}</TableCell>
                          <TableCell><Pill tone={r.guard === "Passed" ? "success" : "warning"}>{r.guard === "Passed" ? "Passed" : "Flagged"}</Pill></TableCell>
                          <TableCell><Confidence value={out.confidence} label={out.attack_class} /></TableCell>
                          <TableCell className="text-right tabular-nums">{r.latencyS} s</TableCell>
                          <TableCell className="min-w-36 text-xs whitespace-normal">
                            {r.action}
                            <div className={r.approvedBy === "Pending" ? "text-warning" : "text-muted-foreground"}>{r.approvedBy === "Pending" ? "Awaiting admin" : `Approved by ${r.approvedBy}`}</div>
                          </TableCell>
                          <TableCell><ExpandButton open={open} onClick={() => setOpenRun(open ? null : r.time)} /></TableCell>
                        </TableRow>
                        {open && (
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableCell colSpan={7} className="whitespace-normal">
                              <dl className="grid gap-3 text-sm md:grid-cols-2">
                                <div>
                                  <dt className="text-xs text-muted-foreground">Input (masked, IDs only)</dt>
                                  <dd>{r.input}</dd>
                                  {r.guard !== "Passed" && (<><dt className="mt-2 text-xs text-muted-foreground">Guard note</dt><dd>{r.guard.replace(/^Flagged: /, "")}</dd></>)}
                                  <dt className="mt-2 text-xs text-muted-foreground">Playbook</dt>
                                  <dd className="font-mono text-xs">{out.playbook_id}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-muted-foreground">Model output (JSON)</dt>
                                  <dd><pre className="rounded bg-muted/70 p-2 font-mono text-[11px] break-all whitespace-pre-wrap">{r.output}</pre></dd>
                                </div>
                              </dl>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </TableWrap>
            <Disclosure className="mt-3" label="Rules for every run">
              Input uses IDs, not names; output must match the JSON schema; the model may only pick an allowed action; the admin approves or denies each action.
            </Disclosure>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><ShieldBan className="size-4" /> Blocked by the guard model</span>} description="Attacker text the guard stopped." more="Text that tried to steer the model. It never reaches the model as an instruction.">
            <div className="grid gap-3 md:grid-cols-3">
              {guardBlocks.map((g) => (
                <div key={g.time} className="rounded-lg bg-muted/50 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Pill tone={g.label.startsWith("unsafe") ? "danger" : "warning"}>{g.label}</Pill>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{g.source} · {g.time}</div>
                  <p className="mt-1 rounded-md bg-card px-2 py-1.5 font-mono text-xs">"{g.text}"</p>
                  <Disclosure className="mt-2" label="How it was handled">{g.handled}</Disclosure>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
      <Placeholder>Prototype data. The real triage runs a fine-tuned Qwen3 with llama.cpp on AWS Lambda in CXBC's own account; nothing here calls a model.</Placeholder>
    </>
  )
}
