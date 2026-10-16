import { Bell, ChevronsUpDown, ExternalLink, LogOut, Search, ShieldOff } from "lucide-react"
import { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Logo, Mark } from "@/components/app/brand"
import { allowedPath, canSee, navGroups } from "@/components/app/nav"
import { SeverityPill } from "@/components/app/status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ROLES, roleLabel, useRole, type Role } from "@/context/role"
import { alerts } from "@/data/mock"

function NavContent() {
  const { role } = useRole()
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarContent>
      {navGroups.map((g) => {
        const items = g.items.filter((i) => canSee(i, role))
        if (!items.length) return null
        return (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/60">{g.label}</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.path === "/office" ? pathname === "/office" : pathname.startsWith(item.path)
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<NavLink to={item.path} onClick={() => setOpenMobile(false)} />}
                      className="data-active:bg-sidebar-accent data-active:font-medium data-active:text-white"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge className="bg-brand-amber text-brand-navy">{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )
      })}
    </SidebarContent>
  )
}

function Notifications() {
  const [enabled, setEnabled] = useState(typeof Notification !== "undefined" && Notification.permission === "granted")
  async function enablePush() {
    if (typeof Notification === "undefined") {
      toast.error("This browser does not support notifications.")
      return
    }
    const p = await Notification.requestPermission()
    setEnabled(p === "granted")
    if (p === "granted") {
      new Notification("ArkLinx alerts enabled", { body: "1 stage needs review. Open the dashboard to see it.", icon: "/arklinx-icon.svg" })
      toast.success("Browser alerts enabled. Email alerts stay on.")
    } else toast.message("Browser alerts blocked. Email alerts stay on.")
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />}>
        <Bell />
        <span className="absolute top-1 right-1 size-2 rounded-full bg-danger" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Alerts</span>
            <span className="text-xs font-normal text-muted-foreground">Email + browser · no SMS</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {alerts.slice(0, 5).map((a) => (
          <DropdownMenuItem key={a.id} className="flex flex-col items-start gap-1 py-2">
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-medium">{a.kind}</span>
              <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {a.time} <SeverityPill severity={a.severity} />
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-normal">{a.text}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={enablePush}>{enabled ? "Browser alerts are on (send a test)" : "Enable browser pop-up alerts"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RoleSwitcher() {
  const { role, setRole } = useRole()
  const navigate = useNavigate()
  const person = ROLES.find((r) => r.value === role)!
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-10 gap-2 px-2 text-left" />}
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-brand-navy text-xs text-white">{person.person.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-medium">{person.person}</span>
          <span className="text-xs text-muted-foreground">{person.label}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>View as role (access-control demo)</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
            {ROLES.map((r) => (
              <DropdownMenuRadioItem key={r.value} value={r.value}>
                {r.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/driver")}>
          <ExternalLink /> Open driver view
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/partner")}>
          <ExternalLink /> Open partner view
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/")}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Forbidden() {
  const { role } = useRole()
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg bg-card p-8 text-center">
      <ShieldOff className="mx-auto size-10 text-danger" />
      <h1 className="mt-3 text-xl font-semibold text-brand-navy">Not available for {roleLabel(role)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Object-level access control hides this module for your role. In the full system the server refuses the request and the attempt is written to the audit log.
      </p>
      <Button className="mt-5" render={<Link to="/office" />}>
        Back to overview
      </Button>
    </div>
  )
}

export function OfficeLayout() {
  const { role } = useRole()
  const { pathname } = useLocation()
  const ok = allowedPath(pathname, role)
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 pt-4 pb-2">
          <Link to="/office" className="flex items-center gap-2 overflow-hidden rounded-md bg-white px-2 py-1.5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
            <Logo className="h-7 group-data-[collapsible=icon]:hidden" />
            <Mark className="hidden size-8 group-data-[collapsible=icon]:block" />
          </Link>
        </SidebarHeader>
        <NavContent />
        <SidebarFooter className="px-3 pb-4 text-[11px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Prototype · sample data · CXBC Logistics Inc.
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-background/95 px-3 sm:px-5">
          <SidebarTrigger />
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search trips, plates, crew, tracking IDs" className="bg-card pl-8" aria-label="Search" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Notifications />
            <RoleSwitcher />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-5 px-3 pt-2 pb-10 sm:px-5">{ok ? <Outlet /> : <Forbidden />}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
