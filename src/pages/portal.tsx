import { ArrowRight, Building2, Smartphone, Truck } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/app/brand"
import { SimpleSelect } from "@/components/app/simple-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROLES, useRole, type Role } from "@/context/role"

export default function Portal() {
  const navigate = useNavigate()
  const { role, setRole } = useRole()
  const [trackId, setTrackId] = useState("AXL-7Q4M-21")
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo className="h-9" />
        <span className="text-sm text-muted-foreground">Prototype for CXBC Logistics Inc.</span>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:py-14">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-brand-navy sm:text-6xl">Every delivery stage, proven twice.</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Dispatch, delivery-stage tracking and crew compliance for CXBC. A stage counts when the crew phone and the truck tracker agree.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 rounded-lg bg-brand-navy p-5 text-white"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/track/${trackId.trim()}`)
            }}
          >
            <label htmlFor="track" className="text-sm text-white/80">
              Track a delivery
            </label>
            <div className="flex gap-2">
              <Input id="track" value={trackId} onChange={(e) => setTrackId(e.target.value)} className="h-11 border-0 bg-white text-brand-navy" />
              <Button type="submit" className="h-11 bg-brand-amber px-4 text-brand-navy hover:bg-brand-amber/90">
                Track
              </Button>
            </div>
            <p className="text-xs text-white/70">Location is shown with a 30-minute delay to protect the crew and the cargo.</p>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-lg bg-card p-6 md:col-span-1">
            <Building2 className="size-8 text-brand-blue" />
            <div>
              <h2 className="text-xl font-semibold text-brand-navy">Office staff</h2>
              <p className="mt-1 text-sm text-muted-foreground">Dispatch, live map, evidence review, HR, documents, fuel, billing and P&L. The menu changes with the role.</p>
            </div>
            <SimpleSelect
              value={role}
              onChange={(v) => setRole(v as Role)}
              options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
              ariaLabel="Role"
              className="h-11 w-full"
            />
            <Button size="lg" className="mt-auto h-11 text-base" onClick={() => navigate("/office")}>
              Sign in with passkey <ArrowRight />
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-lg bg-card p-6">
            <Smartphone className="size-8 text-brand-blue" />
            <div>
              <h2 className="text-xl font-semibold text-brand-navy">Driver and helper</h2>
              <p className="mt-1 text-sm text-muted-foreground">Open from the trip link sent each morning. Big stage buttons, camera for proof of delivery.</p>
            </div>
            <Button size="lg" variant="secondary" className="mt-auto h-11 text-base" onClick={() => navigate("/driver")}>
              Open today's trip <ArrowRight />
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-lg bg-card p-6">
            <Truck className="size-8 text-brand-blue" />
            <div>
              <h2 className="text-xl font-semibold text-brand-navy">SCSM and AAI</h2>
              <p className="mt-1 text-sm text-muted-foreground">Verified delivery stages and truck requests in one place, instead of chasing updates on Viber.</p>
            </div>
            <Button size="lg" variant="secondary" className="mt-auto h-11 text-base" onClick={() => navigate("/partner")}>
              Open partner view <ArrowRight />
            </Button>
          </div>
        </section>
        <p className="mt-8 text-xs text-muted-foreground">Front-end prototype. All trips, people, plates and positions are sample data; maps use placeholder GPS on OpenStreetMap.</p>
      </main>
    </div>
  )
}
