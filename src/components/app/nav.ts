import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CalendarClock,
  ClipboardList,
  FileWarning,
  Fuel,
  LayoutDashboard,
  Map,
  MapPinned,
  Receipt,
  Route,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/context/role"

export interface NavItem {
  title: string
  path: string
  icon: LucideIcon
  roles: Role[] | "all"
  badge?: string
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", path: "/office", icon: LayoutDashboard, roles: "all" },
      { title: "Live map", path: "/office/map", icon: Map, roles: ["gm", "dispatcher", "admin"] },
      { title: "Dispatch", path: "/office/dispatch", icon: ClipboardList, roles: ["gm", "dispatcher", "admin"], badge: "2" },
      { title: "Trips", path: "/office/trips", icon: Route, roles: ["gm", "dispatcher", "billing", "admin"] },
      { title: "Evidence review", path: "/office/evidence", icon: ShieldAlert, roles: ["gm", "dispatcher", "admin"], badge: "2" },
      { title: "Security center", path: "/office/security", icon: ShieldCheck, roles: ["gm", "admin"], badge: "3" },
      { title: "Sites and geofences", path: "/office/sites", icon: MapPinned, roles: ["gm", "dispatcher", "admin"] },
      { title: "Truck-ban notices", path: "/office/truck-bans", icon: CalendarClock, roles: ["gm", "dispatcher", "admin"] },
      { title: "Alert rules", path: "/office/alerts", icon: Bell, roles: ["gm", "dispatcher", "admin"] },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Trucks", path: "/office/fleet", icon: Truck, roles: "all" },
      { title: "Maintenance", path: "/office/maintenance", icon: Wrench, roles: ["gm", "maintenance", "admin"] },
      { title: "Fuel and costing", path: "/office/fuel", icon: Fuel, roles: ["gm", "billing", "admin"] },
    ],
  },
  {
    label: "People and compliance",
    items: [
      { title: "Drivers and helpers", path: "/office/drivers", icon: Users, roles: ["gm", "dispatcher", "hr", "admin"] },
      { title: "Document verification", path: "/office/documents", icon: BadgeCheck, roles: ["gm", "hr", "admin"], badge: "3" },
      { title: "HR", path: "/office/hr", icon: UserCog, roles: ["gm", "hr", "admin"] },
      { title: "Compliance and expiry", path: "/office/compliance", icon: FileWarning, roles: ["gm", "hr", "maintenance", "admin"] },
      { title: "NCAP", path: "/office/ncap", icon: AlertTriangle, roles: ["gm", "hr", "dispatcher", "admin"] },
    ],
  },
  {
    label: "Finance and admin",
    items: [
      { title: "Billing", path: "/office/billing", icon: Receipt, roles: ["gm", "billing", "admin"] },
      { title: "Reports and P&L", path: "/office/reports", icon: TrendingUp, roles: ["gm", "billing", "admin"] },
      { title: "Administration", path: "/office/admin", icon: Settings, roles: ["gm", "admin"] },
    ],
  },
]

export const canSee = (item: NavItem, role: Role) => item.roles === "all" || item.roles.includes(role)

export function allowedPath(path: string, role: Role) {
  const all = navGroups.flatMap((g) => g.items)
  const match = all
    .filter((i) => path === i.path || (i.path !== "/office" && path.startsWith(i.path)))
    .sort((a, b) => b.path.length - a.path.length)[0]
  return !match || canSee(match, role)
}
