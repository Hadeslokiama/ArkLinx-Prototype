import { Mail, MonitorSmartphone } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { PageHeader, Panel, TableWrap } from "@/components/app/page"
import { SeverityPill } from "@/components/app/status"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { alertRules, alerts } from "@/data/mock"

export default function Alerts() {
  const [rules, setRules] = useState(alertRules)
  const toggle = (id: string, key: "email" | "push") => setRules((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: !r[key] } : r)))
  return (
    <>
      <PageHeader
        title="Alert rules"
        description="Triggers for route deviation, speeding, idling, unauthorized stops and more. Delivered by email and browser pop-up only; SMS is not used because it can be intercepted or redirected."
        actions={<Button onClick={() => toast.success("Alert rules saved.")}>Save rules</Button>}
      />
      <Panel>
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-4" /> Email
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <MonitorSmartphone className="size-4" /> Browser
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="min-w-64 whitespace-normal text-muted-foreground">{r.condition}</TableCell>
                  <TableCell className="whitespace-nowrap">{r.recipients}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={r.email} onCheckedChange={() => toggle(r.id, "email")} aria-label={`${r.name} email`} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={r.push} onCheckedChange={() => toggle(r.id, "push")} aria-label={`${r.name} browser`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
      <Panel title="Alert history">
        <ul className="divide-y divide-border">
          {alerts.map((a) => (
            <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-brand-navy">{a.kind}</div>
                <div className="text-sm text-muted-foreground">{a.text}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                {a.time}
                <SeverityPill severity={a.severity} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  )
}
