const pesoFmt = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })
const numFmt = new Intl.NumberFormat("en-PH")

export const peso = (n: number) => pesoFmt.format(n)
export const num = (n: number) => numFmt.format(n)
export const pesoShort = (n: number) =>
  Math.abs(n) >= 1_000_000 ? `₱${(n / 1_000_000).toFixed(2)}M` : Math.abs(n) >= 1000 ? `₱${Math.round(n / 1000)}k` : `₱${n}`
export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`

export function minutesBetween(a?: string, b?: string) {
  if (!a || !b) return undefined
  const [ah, am] = a.split(":").map(Number)
  const [bh, bm] = b.split(":").map(Number)
  return bh * 60 + bm - (ah * 60 + am)
}

export const fmtMin = (m?: number) => (m === undefined ? "—" : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`)

export function daysUntil(date: string, today = "2026-10-16") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Infinity
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000)
}
