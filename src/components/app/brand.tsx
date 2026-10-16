import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return <img src="/arklinx-logo.svg" alt="ArkLinx" className={cn("h-8 w-auto", className)} />
}

export function Mark({ className }: { className?: string }) {
  return <img src="/arklinx-icon.svg" alt="" aria-hidden className={cn("size-8", className)} />
}
