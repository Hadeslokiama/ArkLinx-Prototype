import { useState } from "react"
import { PageHeader, Panel, Stat, TableWrap } from "@/components/app/page"
import { C, Donut } from "@/components/app/charts"
import { SimpleSelect } from "@/components/app/simple-select"
import { Pill } from "@/components/app/status"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { crew, trucks } from "@/data/mock"
import { daysUntil } from "@/lib/format"

type Row = { owner: string; kind: "Truck" | "Crew" | "Company"; item: string; expiry: string; days: number }

const company: Row[] = [
  { owner: "CXBC Logistics Inc.", kind: "Company" as const, item: "SEC registration (GIS filing)", expiry: "2027-01-30", days: 0 },
  { owner: "CXBC Logistics Inc.", kind: "Company" as const, item: "BIR Certificate of Registration (annual fee)", expiry: "2027-01-31", days: 0 },
  { owner: "CXBC Logistics Inc.", kind: "Company" as const, item: "Mayor's permit, Taguig", expiry: "2027-01-20", days: 0 },
  { owner: "CXBC Logistics Inc.", kind: "Company" as const, item: "LTFRB franchise renewal (fleet)", expiry: "2026-11-05", days: 0 },
].map((r) => ({ ...r, days: daysUntil(r.expiry) }))

export default function Compliance() {
  const [kind, setKind] = useState("all")
  const [win, setWin] = useState("90")
  const rows: Row[] = [
    ...trucks.flatMap((t) => [
      { owner: t.plate, kind: "Truck" as const, item: "LTO registration", expiry: t.registrationExpiry, days: daysUntil(t.registrationExpiry) },
      { owner: t.plate, kind: "Truck" as const, item: "LTFRB franchise", expiry: t.ltfrbExpiry, days: daysUntil(t.ltfrbExpiry) },
      { owner: t.plate, kind: "Truck" as const, item: "Commercial insurance", expiry: t.insuranceExpiry, days: daysUntil(t.insuranceExpiry) },
    ]),
    ...crew.flatMap((c) => c.docs.filter((d) => d.expiry !== "—").map((d) => ({ owner: c.name, kind: "Crew" as const, item: d.type, expiry: d.expiry, days: daysUntil(d.expiry) }))),
    ...company,
  ]
    .filter((r) => (kind === "all" || r.kind === kind) && r.days <= Number(win))
    .sort((a, b) => a.days - b.days)

  const all = [...trucks.map((t) => daysUntil(t.registrationExpiry)), ...crew.flatMap((c) => c.docs.map((d) => daysUntil(d.expiry)))]
  return (
    <>
      <PageHeader title="Compliance and expiry" description="Papers expiring in the next 30 days." more="Vehicle registrations, permits, insurance, crew licenses and clearances, and company SEC and BIR filings, with warnings 30 days ahead." />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Expiry window">
          <Donut
            centerLabel="papers"
            data={[
              { key: "expired", label: "Expired", value: all.filter((d) => d < 0).length, color: C.bad },
              { key: "d30", label: "Within 30 days", value: all.filter((d) => d >= 0 && d <= 30).length, color: C.warn },
              { key: "d90", label: "Within 90 days", value: all.filter((d) => d > 30 && d <= 90).length, color: C.light },
              { key: "later", label: "Later", value: all.filter((d) => d > 90).length, color: C.pale },
            ]}
          />
        </Panel>
        <Stat label="LTO renewal month" value="By plate" sub="Ends in 1 → January, 2 → February" />
      </div>
      <Panel
        actions={
          <div className="flex flex-wrap gap-2">
            <SimpleSelect value={kind} onChange={setKind} ariaLabel="Type" options={[{ value: "all", label: "All types" }, { value: "Truck", label: "Trucks" }, { value: "Crew", label: "Crew" }, { value: "Company", label: "Company" }]} />
            <SimpleSelect value={win} onChange={setWin} ariaLabel="Window" options={[{ value: "30", label: "Next 30 days" }, { value: "90", label: "Next 90 days" }, { value: "365", label: "Next 12 months" }]} />
          </div>
        }
        title={`${rows.length} items`}
      >
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.owner}</TableCell>
                  <TableCell>{r.kind}</TableCell>
                  <TableCell>{r.item}</TableCell>
                  <TableCell>{r.expiry}</TableCell>
                  <TableCell>
                    <Pill tone={r.days < 0 ? "danger" : r.days <= 30 ? "warning" : "neutral"}>{r.days < 0 ? `Expired ${-r.days} d ago` : `${r.days} days left`}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </Panel>
    </>
  )
}
