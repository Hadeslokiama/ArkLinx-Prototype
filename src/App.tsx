import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { OfficeLayout } from "@/components/app/office-layout"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RoleProvider } from "@/context/role"

const DriverApp = lazy(() => import("@/pages/driver/driver-app"))
const Admin = lazy(() => import("@/pages/office/admin"))
const Alerts = lazy(() => import("@/pages/office/alerts"))
const Billing = lazy(() => import("@/pages/office/billing"))
const Compliance = lazy(() => import("@/pages/office/compliance"))
const Dispatch = lazy(() => import("@/pages/office/dispatch"))
const Documents = lazy(() => import("@/pages/office/documents"))
const Drivers = lazy(() => import("@/pages/office/drivers"))
const Evidence = lazy(() => import("@/pages/office/evidence"))
const Fleet = lazy(() => import("@/pages/office/fleet"))
const FuelPage = lazy(() => import("@/pages/office/fuel"))
const HR = lazy(() => import("@/pages/office/hr"))
const LiveMap = lazy(() => import("@/pages/office/live-map"))
const Maintenance = lazy(() => import("@/pages/office/maintenance"))
const Ncap = lazy(() => import("@/pages/office/ncap"))
const Overview = lazy(() => import("@/pages/office/overview"))
const Reports = lazy(() => import("@/pages/office/reports"))
const Sites = lazy(() => import("@/pages/office/sites"))
const TripDetail = lazy(() => import("@/pages/office/trip-detail"))
const Trips = lazy(() => import("@/pages/office/trips"))
const TruckBans = lazy(() => import("@/pages/office/truck-bans"))
const PartnerPortal = lazy(() => import("@/pages/partner/partner-portal"))
const Portal = lazy(() => import("@/pages/portal"))
const Track = lazy(() => import("@/pages/track"))

export default function App() {
  return (
    <RoleProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Portal />} />
            <Route path="/office" element={<OfficeLayout />}>
              <Route index element={<Overview />} />
              <Route path="map" element={<LiveMap />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="trips" element={<Trips />} />
              <Route path="trips/:id" element={<TripDetail />} />
              <Route path="evidence" element={<Evidence />} />
              <Route path="sites" element={<Sites />} />
              <Route path="truck-bans" element={<TruckBans />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="fuel" element={<FuelPage />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="documents" element={<Documents />} />
              <Route path="hr" element={<HR />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="ncap" element={<Ncap />} />
              <Route path="billing" element={<Billing />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="/driver" element={<DriverApp />} />
            <Route path="/partner" element={<PartnerPortal />} />
            <Route path="/track/:id" element={<Track />} />
            <Route path="/track" element={<Track />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </RoleProvider>
  )
}
