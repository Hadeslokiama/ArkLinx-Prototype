import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

export function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  ariaLabel?: string
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => onChange(String(v ?? ""))}>
      <SelectTrigger className={cn("min-w-36 bg-card", className)} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
