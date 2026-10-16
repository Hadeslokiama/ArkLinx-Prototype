import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "gm" | "dispatcher" | "hr" | "billing" | "maintenance" | "admin"

export const ROLES: { value: Role; label: string; person: string }[] = [
  { value: "gm", label: "General Manager", person: "Christian B." },
  { value: "dispatcher", label: "Dispatcher", person: "Operations 1" },
  { value: "hr", label: "HR / Compliance", person: "Compliance" },
  { value: "billing", label: "Billing", person: "Billing Admin" },
  { value: "maintenance", label: "Maintenance", person: "Mechanic" },
  { value: "admin", label: "System Admin", person: "IT Admin" },
]

export const roleLabel = (r: Role) => ROLES.find((x) => x.value === r)?.label ?? r

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void } | null>(null)

function readStored(): Role {
  try {
    const v = localStorage.getItem("arklinx-role") as Role | null
    if (v && ROLES.some((r) => r.value === v)) return v
  } catch {
    /* storage unavailable */
  }
  return "gm"
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(readStored)
  useEffect(() => {
    try {
      localStorage.setItem("arklinx-role", role)
    } catch {
      /* storage unavailable */
    }
  }, [role])
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used inside RoleProvider")
  return ctx
}
