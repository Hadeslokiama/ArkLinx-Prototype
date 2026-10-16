// Mock data for the ArkLinx prototype. Every name, plate and figure is sample data.
// GPS coordinates are placeholders around Metro Manila and South Luzon.

export type GpsProvider = "vectra" | "ssd" | "none"
export type TruckStatus = "on-trip" | "available" | "maintenance" | "off-duty"
export type Verdict = "corroborated" | "single-source" | "conflicting" | "pending"
export type DocStatus = "issuer-verified" | "screened" | "pending" | "mismatch" | "expiring" | "expired"
export type TripStatus = "scheduled" | "in-transit" | "on-site" | "held" | "completed"
export type Client = "SCSM" | "AAI"
export type SiteKind = "dock" | "store" | "vendor" | "hospital" | "yard"

export const TODAY = "2026-10-16"

export const STAGES = [
  "Time In",
  "Arrival",
  "Docking",
  "Undocking",
  "Proof of Delivery",
  "Proof Checking",
  "Release",
  "Time Out",
] as const
export type StageName = (typeof STAGES)[number]

export const STAGE_HINT: Record<StageName, string> = {
  "Time In": "Pumasok",
  Arrival: "Dumating",
  Docking: "Nag-dock",
  Undocking: "Tapos mag-dock",
  "Proof of Delivery": "Patunay ng hatid",
  "Proof Checking": "Sinusuri",
  Release: "Pinakawalan",
  "Time Out": "Umuwi",
}

export interface Truck {
  id: string
  plate: string
  model: string
  gps: GpsProvider
  apiStatus: "live" | "pending" | "no-device"
  status: TruckStatus
  driverId?: string
  odometerKm: number
  nextServiceKm: number
  efficiencyKmL: number
  registrationExpiry: string
  ltfrbExpiry: string
  insuranceExpiry: string
  lat: number
  lng: number
  speedKph: number
  lastPing: string
  ignition: boolean
}

export const trucks: Truck[] = [
  { id: "T01", plate: "NCX 4721", model: "Isuzu Forward 6W", gps: "vectra", apiStatus: "live", status: "on-trip", driverId: "D01", odometerKm: 182_340, nextServiceKm: 185_000, efficiencyKmL: 6.1, registrationExpiry: "2027-01-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-02-28", lat: 14.4876, lng: 121.0446, speedKph: 0, lastPing: "10:42", ignition: true },
  { id: "T02", plate: "NCX 4722", model: "Isuzu Forward 6W", gps: "vectra", apiStatus: "live", status: "on-trip", driverId: "D02", odometerKm: 201_115, nextServiceKm: 201_500, efficiencyKmL: 5.8, registrationExpiry: "2027-02-28", ltfrbExpiry: "2026-11-05", insuranceExpiry: "2027-01-15", lat: 14.3301, lng: 120.9372, speedKph: 4, lastPing: "10:43", ignition: true },
  { id: "T03", plate: "NCX 4723", model: "Fuso Fighter 6W", gps: "vectra", apiStatus: "live", status: "on-trip", driverId: "D03", odometerKm: 156_902, nextServiceKm: 160_000, efficiencyKmL: 6.4, registrationExpiry: "2027-03-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-05-30", lat: 14.2702, lng: 121.1206, speedKph: 61, lastPing: "10:43", ignition: true },
  { id: "T04", plate: "NCX 4724", model: "Fuso Fighter 6W", gps: "ssd", apiStatus: "pending", status: "on-trip", driverId: "D04", odometerKm: 174_488, nextServiceKm: 175_000, efficiencyKmL: 6.0, registrationExpiry: "2027-04-30", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-04-12", lat: 14.5040, lng: 121.0195, speedKph: 0, lastPing: "phone 10:38", ignition: true },
  { id: "T05", plate: "NCX 4725", model: "Isuzu Forward 6W", gps: "ssd", apiStatus: "pending", status: "available", driverId: "D05", odometerKm: 143_210, nextServiceKm: 150_000, efficiencyKmL: 6.3, registrationExpiry: "2027-05-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-06-01", lat: 14.5101, lng: 121.0561, speedKph: 0, lastPing: "phone 06:12", ignition: false },
  { id: "T06", plate: "NCX 4726", model: "Hino 300 6W", gps: "none", apiStatus: "no-device", status: "on-trip", driverId: "D06", odometerKm: 221_004, nextServiceKm: 225_000, efficiencyKmL: 5.6, registrationExpiry: "2026-11-30", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2026-12-20", lat: 14.4627, lng: 121.0383, speedKph: 0, lastPing: "phone 10:21", ignition: true },
  { id: "T07", plate: "NCX 4727", model: "Hino 300 6W", gps: "none", apiStatus: "no-device", status: "maintenance", odometerKm: 238_770, nextServiceKm: 238_000, efficiencyKmL: 5.4, registrationExpiry: "2027-07-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-07-10", lat: 14.5100, lng: 121.0558, speedKph: 0, lastPing: "—", ignition: false },
  { id: "T08", plate: "NCX 4728", model: "Isuzu Elf 6W", gps: "none", apiStatus: "no-device", status: "on-trip", driverId: "D08", odometerKm: 98_430, nextServiceKm: 100_000, efficiencyKmL: 7.2, registrationExpiry: "2027-08-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-08-15", lat: 14.5765, lng: 121.0853, speedKph: 0, lastPing: "phone 10:40", ignition: true },
  { id: "T09", plate: "NCX 4729", model: "Isuzu Elf 6W", gps: "none", apiStatus: "no-device", status: "available", driverId: "D09", odometerKm: 110_652, nextServiceKm: 115_000, efficiencyKmL: 7.0, registrationExpiry: "2027-09-30", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-09-02", lat: 14.5103, lng: 121.0563, speedKph: 0, lastPing: "—", ignition: false },
  { id: "T10", plate: "NCX 4730", model: "Fuso Canter 6W", gps: "none", apiStatus: "no-device", status: "off-duty", driverId: "D10", odometerKm: 132_980, nextServiceKm: 135_000, efficiencyKmL: 6.8, registrationExpiry: "2026-10-31", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2026-10-25", lat: 14.5098, lng: 121.0566, speedKph: 0, lastPing: "—", ignition: false },
  { id: "T11", plate: "NCX 4731", model: "Fuso Canter 6W", gps: "none", apiStatus: "no-device", status: "on-trip", driverId: "D11", odometerKm: 121_336, nextServiceKm: 125_000, efficiencyKmL: 6.9, registrationExpiry: "2027-11-30", ltfrbExpiry: "2027-03-15", insuranceExpiry: "2027-11-11", lat: 14.4233, lng: 121.0412, speedKph: 32, lastPing: "phone 10:41", ignition: true },
]

export interface CrewDoc {
  type: "Driver's License" | "NBI Clearance" | "Police Clearance" | "Medical Certificate" | "Drug Test" | "PhilID"
  issuer: string
  channel: string
  status: DocStatus
  expiry: string
  checkedAt?: string
}

export interface Crew {
  id: string
  name: string
  role: "Driver" | "Helper"
  group: "SCSM Retail" | "AAI Medical" | "Freight"
  tags: string[]
  phone: string
  hired: string
  truckId?: string
  score: { safety: number; onTime: number; fuel: number; harshBraking: number; speeding: number }
  docs: CrewDoc[]
}

function docs(seed: number): CrewDoc[] {
  const s = (n: number): DocStatus => {
    const list: DocStatus[] = ["issuer-verified", "issuer-verified", "issuer-verified", "pending", "expiring", "issuer-verified", "mismatch", "issuer-verified", "screened", "expired"]
    return list[(seed + n) % list.length]
  }
  return [
    { type: "PhilID", issuer: "PSA", channel: "PhilSys Check (verify.philsys.gov.ph)", status: "issuer-verified", expiry: "—", checkedAt: "2026-09-02" },
    { type: "Driver's License", issuer: "LTO", channel: "LTMS portal", status: s(0), expiry: `2027-0${(seed % 8) + 1}-15`, checkedAt: "2026-09-02" },
    { type: "NBI Clearance", issuer: "NBI", channel: "clearance.nbi.gov.ph QR", status: s(3), expiry: `2027-0${(seed % 5) + 1}-20`, checkedAt: "2026-09-04" },
    { type: "Police Clearance", issuer: "PNP", channel: "pnpclearance.ph QR", status: s(6), expiry: `2026-1${seed % 2}-28`, checkedAt: "2026-09-04" },
    { type: "Medical Certificate", issuer: "LTO-accredited clinic", channel: "Clinic accreditation list (screened only)", status: seed % 4 === 0 ? "expiring" : "screened", expiry: "2026-11-10" },
    { type: "Drug Test", issuer: "DOH-accredited lab", channel: "Lab accreditation list (screened only)", status: "screened", expiry: "2027-01-05" },
  ]
}

const crewBase: [string, string, Crew["role"], Crew["group"], string?][] = [
  ["D01", "Ramon Dela Cruz", "Driver", "SCSM Retail", "T01"],
  ["D02", "Eduardo Santos", "Driver", "SCSM Retail", "T02"],
  ["D03", "Jomar Villanueva", "Driver", "SCSM Retail", "T03"],
  ["D04", "Ricky Mendoza", "Driver", "AAI Medical", "T04"],
  ["D05", "Arnel Castillo", "Driver", "Freight", "T05"],
  ["D06", "Noel Aquino", "Driver", "SCSM Retail", "T06"],
  ["D07", "Dante Ramos", "Driver", "Freight", undefined],
  ["D08", "Rolando Garcia", "Driver", "AAI Medical", "T08"],
  ["D09", "Efren Navarro", "Driver", "Freight", "T09"],
  ["D10", "Mario Lopez", "Driver", "SCSM Retail", "T10"],
  ["D11", "Jerome Pascual", "Driver", "SCSM Retail", "T11"],
  ["H01", "Kevin Reyes", "Helper", "SCSM Retail", "T01"],
  ["H02", "Mark Soriano", "Helper", "SCSM Retail", "T02"],
  ["H03", "Paolo Cruz", "Helper", "SCSM Retail", "T03"],
  ["H04", "JR Manalo", "Helper", "AAI Medical", "T04"],
  ["H05", "Bong Torres", "Helper", "SCSM Retail", "T06"],
  ["H06", "Allan Dizon", "Helper", "SCSM Retail", "T06"],
  ["H07", "Jayson Tan", "Helper", "AAI Medical", "T08"],
  ["H08", "Leo Marquez", "Helper", "SCSM Retail", "T11"],
  ["H09", "Ronnie Gomez", "Helper", "Freight", undefined],
  ["H10", "Carlo Ignacio", "Helper", "SCSM Retail", "T03"],
]

export const crew: Crew[] = crewBase.map(([id, name, role, group, truckId], i) => ({
  id,
  name,
  role,
  group,
  truckId,
  tags: [
    group === "AAI Medical" ? "Cold-chain trained" : "Retail docking",
    i % 3 === 0 ? "Night shift OK" : "Day shift",
    ...(i % 4 === 0 ? ["Senior"] : []),
  ],
  phone: `0917 ${String(400 + i * 13).padStart(3, "0")} ${String(1000 + i * 271).slice(0, 4)}`,
  hired: `20${18 + (i % 7)}-0${(i % 9) + 1}-1${i % 9}`,
  score: {
    safety: 70 + ((i * 7) % 28),
    onTime: 75 + ((i * 5) % 24),
    fuel: 68 + ((i * 11) % 30),
    harshBraking: (i * 3) % 9,
    speeding: (i * 5) % 7,
  },
  docs: docs(i),
}))

export const crewById = Object.fromEntries(crew.map((c) => [c.id, c]))
export const truckById = Object.fromEntries(trucks.map((t) => [t.id, t]))

export interface Site {
  id: string
  name: string
  kind: SiteKind
  client?: Client
  lat: number
  lng: number
  radiusM: number
  address: string
  contact: string
  phone: string
  notes: string
  avgDwellMin: number
}

export const sites: Site[] = [
  { id: "S01", name: "SCSM Cross-Dock, Taguig", kind: "dock", client: "SCSM", lat: 14.5232, lng: 121.0563, radiusM: 180, address: "FTI Complex, Taguig", contact: "Dock supervisor", phone: "02 8888 0101", notes: "Gate 3 for 6-wheelers. Queue from 5:30 AM.", avgDwellMin: 48 },
  { id: "S02", name: "SM Hypermarket Bicutan", kind: "store", client: "SCSM", lat: 14.4870, lng: 121.0440, radiusM: 120, address: "Doña Soledad Ave, Parañaque", contact: "Receiving lead", phone: "02 8888 0202", notes: "Receiving 7 AM to 3 PM. Bring printed DR.", avgDwellMin: 72 },
  { id: "S03", name: "SM Supermarket Sucat", kind: "store", client: "SCSM", lat: 14.4627, lng: 121.0380, radiusM: 120, address: "Dr. A. Santos Ave, Parañaque", contact: "Receiving lead", phone: "02 8888 0303", notes: "Narrow ramp. Helper must guide reversing.", avgDwellMin: 55 },
  { id: "S04", name: "SM Hypermarket Dasmariñas", kind: "store", client: "SCSM", lat: 14.3294, lng: 120.9367, radiusM: 150, address: "Aguinaldo Hwy, Dasmariñas", contact: "Receiving lead", phone: "046 888 0404", notes: "Frequent long holds. Log waiting reason.", avgDwellMin: 168 },
  { id: "S05", name: "SM City Calamba", kind: "store", client: "SCSM", lat: 14.2117, lng: 121.1653, radiusM: 150, address: "National Hwy, Calamba", contact: "Receiving lead", phone: "049 888 0505", notes: "Truck ban on Real St. 6–9 AM (per MOU notice).", avgDwellMin: 64 },
  { id: "S06", name: "SM Supermarket Sta. Rosa", kind: "store", client: "SCSM", lat: 14.3122, lng: 121.1114, radiusM: 120, address: "Old National Hwy, Sta. Rosa", contact: "Receiving lead", phone: "049 888 0606", notes: "", avgDwellMin: 51 },
  { id: "S07", name: "Prime Foods Warehouse, Pasig", kind: "vendor", client: "SCSM", lat: 14.5764, lng: 121.0851, radiusM: 160, address: "C. Raymundo Ave, Pasig", contact: "Warehouse dispatcher", phone: "02 8888 0707", notes: "Vendor pickup. Loading can exceed 2 h on Fridays.", avgDwellMin: 96 },
  { id: "S08", name: "Golden Grains DC, Cabuyao", kind: "vendor", client: "SCSM", lat: 14.2788, lng: 121.1250, radiusM: 200, address: "Light Industry Park, Cabuyao", contact: "DC supervisor", phone: "049 888 0808", notes: "", avgDwellMin: 81 },
  { id: "S09", name: "AAI Medical Hub, Parañaque", kind: "vendor", client: "AAI", lat: 14.5040, lng: 121.0195, radiusM: 140, address: "Ninoy Aquino Ave, Parañaque", contact: "AAI coordinator", phone: "02 8888 0909", notes: "Cold-chain cargo. Temperature log required.", avgDwellMin: 40 },
  { id: "S10", name: "Metro General Hospital, BGC", kind: "hospital", client: "AAI", lat: 14.5520, lng: 121.0480, radiusM: 100, address: "32nd St, Taguig", contact: "Receiving pharmacist", phone: "02 8888 1010", notes: "Basement loading bay. Height limit 3.2 m.", avgDwellMin: 35 },
  { id: "S11", name: "CXBC Yard, Bagumbayan", kind: "yard", lat: 14.5100, lng: 121.0560, radiusM: 100, address: "Lot 5 B2 Pasong Kalabaw, Taguig", contact: "Operations", phone: "02 8888 1111", notes: "Home yard and barracks.", avgDwellMin: 0 },
]
export const siteById = Object.fromEntries(sites.map((s) => [s.id, s]))

export interface StageEvent {
  stage: StageName
  time?: string
  verdict: Verdict
  phone?: { lat: number; lng: number; accuracyM: number }
  tracker?: { lat: number; lng: number; ageSec: number } | null
  distanceM?: number
  flags?: string[]
  photo?: boolean
}

export interface Stop {
  siteId: string
  purpose: "Pickup" | "Delivery" | "Return"
  events: StageEvent[]
}

export interface Trip {
  id: string
  trackingId: string
  client: Client
  truckId: string
  driverId: string
  helperIds: string[]
  date: string
  status: TripStatus
  stops: Stop[]
  eta: string
  plannedKm: number
  actualKm?: number
  fuelIssuedL: number
  revenue: number
  costs: { fuel: number; tolls: number; labor: number; fees: number }
  delayReason?: string
}

const ev = (stage: StageName, time: string, verdict: Verdict, extra: Partial<StageEvent> = {}): StageEvent => ({
  stage,
  time,
  verdict,
  phone: { lat: 14.5, lng: 121.04, accuracyM: 12 },
  tracker: verdict === "single-source" ? null : { lat: 14.5, lng: 121.04, ageSec: 35 },
  distanceM: verdict === "conflicting" ? 2380 : verdict === "corroborated" ? 34 : undefined,
  ...extra,
})

export const trips: Trip[] = [
  {
    id: "TRP-1016-01", trackingId: "AXL-7Q4M-21", client: "SCSM", truckId: "T01", driverId: "D01", helperIds: ["H01"], date: TODAY, status: "on-site",
    stops: [
      { siteId: "S01", purpose: "Pickup", events: [ev("Time In", "05:58", "corroborated"), ev("Arrival", "06:21", "corroborated"), ev("Docking", "06:40", "corroborated"), ev("Undocking", "07:32", "corroborated"), ev("Release", "07:41", "corroborated")] },
      { siteId: "S02", purpose: "Delivery", events: [ev("Arrival", "08:55", "corroborated"), ev("Docking", "10:02", "corroborated")] },
      { siteId: "S03", purpose: "Delivery", events: [] },
    ],
    eta: "13:30", plannedKm: 48, fuelIssuedL: 40, revenue: 14_500, costs: { fuel: 2_480, tolls: 620, labor: 2_100, fees: 300 }, delayReason: "Waited 67 min before docking (vendor staff on break)",
  },
  {
    id: "TRP-1016-02", trackingId: "AXL-9K2P-05", client: "SCSM", truckId: "T02", driverId: "D02", helperIds: ["H02"], date: TODAY, status: "held",
    stops: [
      { siteId: "S01", purpose: "Pickup", events: [ev("Time In", "05:45", "corroborated"), ev("Arrival", "06:10", "corroborated"), ev("Docking", "06:25", "corroborated"), ev("Undocking", "07:15", "corroborated"), ev("Release", "07:20", "corroborated")] },
      { siteId: "S04", purpose: "Delivery", events: [ev("Arrival", "08:48", "conflicting", { distanceM: 2380, flags: ["Phone inside geofence, tracker 2.4 km away", "Phone fixes perfectly regular (mock-location pattern)"] }), ev("Docking", "10:36", "pending")] },
    ],
    eta: "12:45", plannedKm: 62, fuelIssuedL: 45, revenue: 16_800, costs: { fuel: 2_790, tolls: 840, labor: 2_100, fees: 300 },
  },
  {
    id: "TRP-1016-03", trackingId: "AXL-3B8T-88", client: "SCSM", truckId: "T03", driverId: "D03", helperIds: ["H03", "H10"], date: TODAY, status: "in-transit",
    stops: [
      { siteId: "S08", purpose: "Pickup", events: [ev("Time In", "05:30", "corroborated"), ev("Arrival", "06:05", "corroborated"), ev("Docking", "06:20", "corroborated"), ev("Undocking", "08:12", "corroborated"), ev("Release", "08:20", "corroborated")] },
      { siteId: "S05", purpose: "Delivery", events: [] },
      { siteId: "S06", purpose: "Delivery", events: [] },
    ],
    eta: "11:20", plannedKm: 71, fuelIssuedL: 50, revenue: 18_200, costs: { fuel: 3_100, tolls: 910, labor: 3_150, fees: 300 },
  },
  {
    id: "TRP-1016-04", trackingId: "AXL-5H1C-42", client: "AAI", truckId: "T04", driverId: "D04", helperIds: ["H04"], date: TODAY, status: "on-site",
    stops: [
      { siteId: "S09", purpose: "Pickup", events: [ev("Time In", "07:00", "single-source"), ev("Arrival", "07:24", "single-source"), ev("Docking", "07:35", "single-source"), ev("Undocking", "08:05", "single-source"), ev("Release", "08:10", "single-source")] },
      { siteId: "S10", purpose: "Delivery", events: [ev("Arrival", "09:02", "single-source"), ev("Docking", "09:10", "single-source"), ev("Undocking", "09:41", "single-source"), ev("Proof of Delivery", "09:44", "single-source", { photo: true }), ev("Proof Checking", "09:55", "single-source")] },
    ],
    eta: "10:30", plannedKm: 18, fuelIssuedL: 20, revenue: 9_800, costs: { fuel: 1_120, tolls: 0, labor: 2_100, fees: 150 },
  },
  {
    id: "TRP-1016-05", trackingId: "AXL-2N6V-17", client: "SCSM", truckId: "T06", driverId: "D06", helperIds: ["H05", "H06"], date: TODAY, status: "on-site",
    stops: [
      { siteId: "S01", purpose: "Pickup", events: [ev("Time In", "06:05", "single-source"), ev("Arrival", "06:30", "single-source"), ev("Docking", "06:44", "single-source"), ev("Undocking", "07:40", "single-source"), ev("Release", "07:46", "single-source")] },
      { siteId: "S03", purpose: "Delivery", events: [ev("Arrival", "08:40", "single-source"), ev("Docking", "09:15", "single-source"), ev("Undocking", "10:05", "single-source"), ev("Proof of Delivery", "10:12", "single-source", { photo: true })] },
    ],
    eta: "11:00", plannedKm: 26, fuelIssuedL: 25, revenue: 11_200, costs: { fuel: 1_510, tolls: 310, labor: 3_150, fees: 300 },
  },
  {
    id: "TRP-1016-06", trackingId: "AXL-8D3R-63", client: "SCSM", truckId: "T08", driverId: "D08", helperIds: ["H07"], date: TODAY, status: "on-site",
    stops: [
      { siteId: "S07", purpose: "Pickup", events: [ev("Time In", "06:30", "single-source"), ev("Arrival", "07:05", "single-source"), ev("Docking", "08:50", "single-source")] },
      { siteId: "S01", purpose: "Delivery", events: [] },
    ],
    eta: "12:15", plannedKm: 22, fuelIssuedL: 20, revenue: 8_900, costs: { fuel: 1_240, tolls: 0, labor: 2_100, fees: 150 }, delayReason: "Vendor loading delayed 105 min",
  },
  {
    id: "TRP-1016-07", trackingId: "AXL-4F7W-30", client: "SCSM", truckId: "T11", driverId: "D11", helperIds: ["H08"], date: TODAY, status: "in-transit",
    stops: [
      { siteId: "S01", purpose: "Pickup", events: [ev("Time In", "06:20", "single-source"), ev("Arrival", "06:44", "single-source"), ev("Docking", "07:02", "single-source"), ev("Undocking", "08:01", "single-source"), ev("Release", "08:09", "single-source")] },
      { siteId: "S06", purpose: "Delivery", events: [] },
    ],
    eta: "11:40", plannedKm: 44, fuelIssuedL: 35, revenue: 13_400, costs: { fuel: 2_260, tolls: 620, labor: 2_100, fees: 300 },
  },
  {
    id: "TRP-1015-02", trackingId: "AXL-1M9S-77", client: "SCSM", truckId: "T01", driverId: "D01", helperIds: ["H01"], date: "2026-10-15", status: "completed",
    stops: [
      { siteId: "S01", purpose: "Pickup", events: [ev("Time In", "05:52", "corroborated"), ev("Arrival", "06:15", "corroborated"), ev("Docking", "06:30", "corroborated"), ev("Undocking", "07:20", "corroborated"), ev("Release", "07:28", "corroborated")] },
      { siteId: "S05", purpose: "Delivery", events: [ev("Arrival", "09:20", "corroborated"), ev("Docking", "09:41", "corroborated"), ev("Undocking", "10:35", "corroborated"), ev("Proof of Delivery", "10:39", "corroborated", { photo: true }), ev("Proof Checking", "10:50", "corroborated"), ev("Release", "10:58", "corroborated"), ev("Time Out", "13:05", "corroborated")] },
    ],
    eta: "—", plannedKm: 118, actualKm: 124, fuelIssuedL: 30, revenue: 21_500, costs: { fuel: 3_720, tolls: 1_240, labor: 2_100, fees: 300 },
  },
  {
    id: "TRP-1017-01", trackingId: "AXL-6C5Z-12", client: "AAI", truckId: "T05", driverId: "D05", helperIds: ["H09"], date: "2026-10-17", status: "scheduled",
    stops: [
      { siteId: "S09", purpose: "Pickup", events: [] },
      { siteId: "S10", purpose: "Delivery", events: [] },
    ],
    eta: "08:30", plannedKm: 18, fuelIssuedL: 20, revenue: 9_800, costs: { fuel: 1_120, tolls: 0, labor: 2_100, fees: 150 },
  },
]
export const tripById = Object.fromEntries(trips.map((t) => [t.id, t]))

export interface TruckRequest {
  id: string
  client: Client
  requestedAt: string
  vendor: string
  forDate: string
  trucks: number
  status: "new" | "filling" | "assigned" | "accepted"
  assigned: { truckId: string; driverId: string; helperIds: string[] }[]
  stores: string[]
}

export const requests: TruckRequest[] = [
  { id: "REQ-1017-01", client: "SCSM", requestedAt: "Oct 16, 11:04 PM", vendor: "Prime Foods Warehouse, Pasig", forDate: "2026-10-17", trucks: 3, status: "new", assigned: [], stores: ["S02", "S03", "S06"] },
  { id: "REQ-1017-02", client: "SCSM", requestedAt: "Oct 16, 10:41 PM", vendor: "Golden Grains DC, Cabuyao", forDate: "2026-10-17", trucks: 2, status: "filling", assigned: [{ truckId: "T03", driverId: "D03", helperIds: ["H03"] }], stores: ["S05", "S04"] },
  { id: "REQ-1017-03", client: "AAI", requestedAt: "Oct 16, 4:15 PM", vendor: "AAI Medical Hub, Parañaque", forDate: "2026-10-17", trucks: 1, status: "assigned", assigned: [{ truckId: "T05", driverId: "D05", helperIds: ["H09"] }], stores: ["S10"] },
  { id: "REQ-1016-04", client: "SCSM", requestedAt: "Oct 15, 11:20 PM", vendor: "SCSM Cross-Dock, Taguig", forDate: "2026-10-16", trucks: 5, status: "accepted", assigned: [{ truckId: "T01", driverId: "D01", helperIds: ["H01"] }, { truckId: "T02", driverId: "D02", helperIds: ["H02"] }, { truckId: "T06", driverId: "D06", helperIds: ["H05", "H06"] }, { truckId: "T11", driverId: "D11", helperIds: ["H08"] }, { truckId: "T08", driverId: "D08", helperIds: ["H07"] }], stores: ["S02", "S03", "S04", "S06"] },
]

export interface AlertItem {
  id: string
  time: string
  kind: "Conflicting stage" | "Speeding" | "Route deviation" | "Prolonged idling" | "Unauthorized stop" | "Document" | "Truck ban" | "Fuel variance" | "Long dwell" | "Tracker offline"
  severity: "high" | "medium" | "low"
  text: string
  truckId?: string
  link?: string
}

export const alerts: AlertItem[] = [
  { id: "A1", time: "10:36", kind: "Conflicting stage", severity: "high", text: "NCX 4722 Arrival at SM Hypermarket Dasmariñas: phone inside geofence, tracker 2.4 km away", truckId: "T02", link: "/office/evidence" },
  { id: "A2", time: "10:31", kind: "Long dwell", severity: "medium", text: "NCX 4728 at Prime Foods Warehouse for 3 h 26 min (site average 96 min)", truckId: "T08" },
  { id: "A3", time: "10:12", kind: "Speeding", severity: "medium", text: "NCX 4723 at 92 km/h on SLEX near Sta. Rosa exit (limit 80)", truckId: "T03" },
  { id: "A4", time: "09:58", kind: "Document", severity: "high", text: "Police clearance for Efren Navarro does not match the PNP record", link: "/office/documents" },
  { id: "A5", time: "09:20", kind: "Truck ban", severity: "medium", text: "Calamba notice active 6–9 AM on Real St. Tomorrow's TRP to SM City Calamba is affected", link: "/office/truck-bans" },
  { id: "A6", time: "08:44", kind: "Tracker offline", severity: "low", text: "SSD GPS API not yet connected for NCX 4724 and NCX 4725", truckId: "T04" },
  { id: "A7", time: "Yesterday", kind: "Fuel variance", severity: "medium", text: "TRP-1014-03 used 9.4 L more than expected for 112 km", link: "/office/fuel" },
  { id: "A8", time: "Yesterday", kind: "Unauthorized stop", severity: "low", text: "NCX 4721 stopped 22 min outside any geofence on C-5 Road", truckId: "T01" },
]

export const alertRules = [
  { id: "R1", name: "Conflicting stage verdict", condition: "Phone and tracker disagree on a stage", email: true, push: true, recipients: "Dispatcher, GM" },
  { id: "R2", name: "Speeding", condition: "Over 80 km/h on expressways, 60 km/h elsewhere for 30 s", email: false, push: true, recipients: "Dispatcher" },
  { id: "R3", name: "Route deviation", condition: "More than 1.5 km off the SCSM predetermined route", email: true, push: true, recipients: "Dispatcher" },
  { id: "R4", name: "Prolonged idling", condition: "Ignition on, speed 0 for over 20 min outside a geofence", email: false, push: true, recipients: "Dispatcher" },
  { id: "R5", name: "Unauthorized stop", condition: "Stop over 15 min outside any saved site", email: true, push: true, recipients: "Dispatcher, GM" },
  { id: "R6", name: "Long dwell at site", condition: "Dwell over 1.5× the site average", email: false, push: true, recipients: "Dispatcher" },
  { id: "R7", name: "Document expiring or failed", condition: "30 days before expiry, or issuer mismatch", email: true, push: true, recipients: "HR / Compliance, GM" },
  { id: "R8", name: "Fuel variance", condition: "Consumed fuel over 10% above expected for trip km", email: true, push: false, recipients: "Billing, GM" },
]

export interface WorkOrder {
  id: string
  truckId: string
  title: string
  type: "Preventive" | "Repair" | "Inspection"
  status: "Open" | "In progress" | "Waiting parts" | "Done"
  technician: string
  opened: string
  cost: number
}

export const workOrders: WorkOrder[] = [
  { id: "WO-231", truckId: "T07", title: "Clutch replacement", type: "Repair", status: "Waiting parts", technician: "Mang Celso", opened: "2026-10-13", cost: 18_500 },
  { id: "WO-232", truckId: "T02", title: "10,000 km PMS: oil, filters", type: "Preventive", status: "Open", technician: "Mang Celso", opened: "2026-10-15", cost: 6_200 },
  { id: "WO-229", truckId: "T10", title: "Brake pads and drum skimming", type: "Repair", status: "In progress", technician: "Mang Celso", opened: "2026-10-11", cost: 9_800 },
  { id: "WO-226", truckId: "T04", title: "Pre-trip inspection fail: tail light", type: "Inspection", status: "Done", technician: "Mang Celso", opened: "2026-10-08", cost: 450 },
  { id: "WO-224", truckId: "T01", title: "Tire rotation and alignment", type: "Preventive", status: "Done", technician: "Mang Celso", opened: "2026-10-04", cost: 3_200 },
]

export const parts = [
  { sku: "FLT-OIL-ISZ", name: "Oil filter (Isuzu Forward)", qty: 6, reorderAt: 4, unitCost: 680 },
  { sku: "FLT-FUEL-FSO", name: "Fuel filter (Fuso Fighter)", qty: 2, reorderAt: 3, unitCost: 920 },
  { sku: "BRK-PAD-HNO", name: "Brake pad set (Hino 300)", qty: 1, reorderAt: 2, unitCost: 3_400 },
  { sku: "CLT-KIT-HNO", name: "Clutch kit (Hino 300)", qty: 0, reorderAt: 1, unitCost: 14_800 },
  { sku: "OIL-15W40-20L", name: "Engine oil 15W-40, 20 L", qty: 5, reorderAt: 3, unitCost: 4_600 },
  { sku: "BLB-TAIL-24V", name: "Tail light bulb 24 V", qty: 14, reorderAt: 6, unitCost: 85 },
]

export const techLogs = [
  { date: "2026-10-15", truckId: "T07", note: "Clutch slipping under load. Removed transmission; disc worn to rivets. Ordered kit.", hours: 4.5 },
  { date: "2026-10-14", truckId: "T10", note: "Front brake drums scored. Sent for skimming; pads to replace.", hours: 3 },
  { date: "2026-10-12", truckId: "T02", note: "Oil seep at rocker cover gasket. Monitor; schedule with PMS.", hours: 0.5 },
  { date: "2026-10-08", truckId: "T04", note: "Replaced left tail light bulb found during pre-trip check.", hours: 0.3 },
]

export interface FuelRecord {
  tripId: string
  date: string
  truckId: string
  km: number
  kmSource: "Vectra route" | "Odometer entry"
  issuedL: number
  receiptL: number
  expectedL: number
  receiptVerified: boolean
}

export const fuelRecords: FuelRecord[] = [
  { tripId: "TRP-1015-02", date: "2026-10-15", truckId: "T01", km: 124, kmSource: "Vectra route", issuedL: 30, receiptL: 21.0, expectedL: 20.3, receiptVerified: true },
  { tripId: "TRP-1015-03", date: "2026-10-15", truckId: "T02", km: 96, kmSource: "Vectra route", issuedL: 25, receiptL: 17.1, expectedL: 16.6, receiptVerified: true },
  { tripId: "TRP-1015-04", date: "2026-10-15", truckId: "T03", km: 138, kmSource: "Vectra route", issuedL: 30, receiptL: 22.0, expectedL: 21.6, receiptVerified: true },
  { tripId: "TRP-1014-03", date: "2026-10-14", truckId: "T02", km: 112, kmSource: "Vectra route", issuedL: 35, receiptL: 28.7, expectedL: 19.3, receiptVerified: false },
  { tripId: "TRP-1014-05", date: "2026-10-14", truckId: "T06", km: 54, kmSource: "Odometer entry", issuedL: 15, receiptL: 10.4, expectedL: 9.6, receiptVerified: true },
  { tripId: "TRP-1014-06", date: "2026-10-14", truckId: "T08", km: 61, kmSource: "Odometer entry", issuedL: 15, receiptL: 9.0, expectedL: 8.5, receiptVerified: false },
  { tripId: "TRP-1013-01", date: "2026-10-13", truckId: "T11", km: 88, kmSource: "Odometer entry", issuedL: 20, receiptL: 13.8, expectedL: 12.8, receiptVerified: true },
]

export const monthlyPnl = [
  { month: "May", revenue: 1_412_000, fuel: 352_000, tolls: 61_000, labor: 398_000, maintenance: 84_000, other: 96_000 },
  { month: "Jun", revenue: 1_468_000, fuel: 366_000, tolls: 64_000, labor: 401_000, maintenance: 51_000, other: 98_000 },
  { month: "Jul", revenue: 1_325_000, fuel: 341_000, tolls: 58_000, labor: 396_000, maintenance: 112_000, other: 97_000 },
  { month: "Aug", revenue: 1_390_000, fuel: 358_000, tolls: 60_000, labor: 404_000, maintenance: 138_000, other: 121_000 },
  { month: "Sep", revenue: 1_534_000, fuel: 372_000, tolls: 66_000, labor: 409_000, maintenance: 67_000, other: 99_000 },
  { month: "Oct", revenue: 812_000, fuel: 201_000, tolls: 35_000, labor: 214_000, maintenance: 39_000, other: 52_000 },
].map((m) => ({ ...m, net: m.revenue - m.fuel - m.tolls - m.labor - m.maintenance - m.other }))

export const truckPnl = trucks.map((t, i) => {
  const revenue = [168, 172, 181, 104, 96, 141, 38, 120, 88, 72, 139][i] * 1000
  const cost = [118, 131, 124, 79, 70, 112, 61, 86, 64, 66, 101][i] * 1000
  return { truckId: t.id, plate: t.plate, revenue, cost, net: revenue - cost, trips: [22, 23, 24, 14, 13, 19, 4, 17, 12, 10, 18][i] }
})

export const dwellBySite = sites
  .filter((s) => s.kind !== "yard")
  .map((s) => ({ site: s.name.replace("SM Hypermarket", "SM Hyper").replace("SM Supermarket", "SM Super"), avg: s.avgDwellMin, max: Math.round(s.avgDwellMin * 2.4) }))

export interface Invoice {
  id: string
  client: Client
  period: string
  trips: number
  amount: number
  status: "Draft" | "Sent" | "Paid" | "Overdue"
  due: string
}

export const invoices: Invoice[] = [
  { id: "INV-2610-01", client: "SCSM", period: "Oct 1–15", trips: 96, amount: 1_284_000, status: "Draft", due: "2026-10-31" },
  { id: "INV-2610-02", client: "AAI", period: "Oct 1–15", trips: 21, amount: 205_800, status: "Sent", due: "2026-10-30" },
  { id: "INV-2609-03", client: "SCSM", period: "Sep 16–30", trips: 102, amount: 1_361_000, status: "Paid", due: "2026-10-15" },
  { id: "INV-2609-04", client: "AAI", period: "Sep 16–30", trips: 19, amount: 186_200, status: "Overdue", due: "2026-10-12" },
]

export interface NcapNotice {
  id: string
  received: string
  plate: string
  violation: string
  when: string
  where: string
  fine: number
  matchedTripId?: string
  matchedDriverId?: string
  evidence: string
  status: "Matched" | "Unmatched" | "Disputed" | "Settled"
}

export const ncapNotices: NcapNotice[] = [
  { id: "NC-0412", received: "2026-10-14", plate: "NCX 4721", violation: "Disregarding traffic sign", when: "2026-10-09 07:52", where: "EDSA–Shaw Blvd", fine: 1_000, matchedTripId: "TRP-1009-01", matchedDriverId: "D01", evidence: "Vectra track at 07:52 shows NCX 4721 at EDSA–Shaw, 18 km/h. Corroborated by crew phone.", status: "Matched" },
  { id: "NC-0415", received: "2026-10-15", plate: "NCX 4728", violation: "Truck ban violation", when: "2026-10-10 16:20", where: "C-5 Katipunan", fine: 2_000, matchedTripId: "TRP-1010-04", matchedDriverId: "D08", evidence: "Phone-only trip. Last stage update 16:05 at Prime Foods, Pasig.", status: "Disputed" },
  { id: "NC-0418", received: "2026-10-16", plate: "NCX 4730", violation: "Obstruction", when: "2026-10-12 11:10", where: "Roxas Blvd", fine: 1_000, evidence: "No trip assigned to NCX 4730 at that time. Truck should have been in the yard.", status: "Unmatched" },
  { id: "NC-0399", received: "2026-10-02", plate: "NCX 4723", violation: "Overspeeding", when: "2026-09-28 14:31", where: "SLEX Sta. Rosa", fine: 1_000, matchedTripId: "TRP-0928-02", matchedDriverId: "D03", evidence: "Vectra speed 94 km/h at 14:31. Driver acknowledged.", status: "Settled" },
]

export interface TruckBanNotice {
  id: string
  lgu: string
  roads: string
  vehicles: string
  window: string
  effective: string
  until: string
  source: string
  receivedVia: string
  status: "Active" | "Upcoming" | "Expired"
}

export const truckBans: TruckBanNotice[] = [
  { id: "TB-031", lgu: "Calamba City", roads: "Real St., Crossing Rotonda", vehicles: "6-wheelers and up", window: "6:00–9:00 AM, 5:00–8:00 PM, Mon–Sat", effective: "2026-10-12", until: "2026-12-31", source: "LGU notice (PDF) via SCSM", receivedVia: "MOU notice, 14 days ahead", status: "Active" },
  { id: "TB-032", lgu: "Dasmariñas City", roads: "Aguinaldo Hwy (Pala-Pala to Salitran)", vehicles: "Gross weight over 4,500 kg", window: "5:00–8:00 PM daily", effective: "2026-11-03", until: "2027-01-15", source: "LGU notice (photo) via SCSM", receivedVia: "MOU notice, 18 days ahead", status: "Upcoming" },
  { id: "TB-029", lgu: "Parañaque City", roads: "Dr. A. Santos Ave (Sucat Rd)", vehicles: "6-wheelers and up", window: "7:00–9:00 AM weekdays", effective: "2026-09-01", until: "2026-12-31", source: "LGU ordinance excerpt", receivedVia: "MOU notice, 21 days ahead", status: "Active" },
  { id: "TB-024", lgu: "Pasig City", roads: "C. Raymundo Ave", vehicles: "10-wheelers and up", window: "6:00 AM–9:00 PM", effective: "2026-06-01", until: "2026-09-30", source: "LGU notice (PDF)", receivedVia: "MOU notice, 10 days ahead", status: "Expired" },
]

export const users = [
  { name: "Christian B.", email: "gm@cxbc.example", role: "General Manager", mfa: "Passkey", lastLogin: "Today 06:02" },
  { name: "Operations 1", email: "ops1@cxbc.example", role: "Dispatcher", mfa: "Passkey", lastLogin: "Today 05:41" },
  { name: "Operations 2", email: "ops2@cxbc.example", role: "Dispatcher", mfa: "TOTP", lastLogin: "Today 05:55" },
  { name: "Billing Admin", email: "billing@cxbc.example", role: "Billing", mfa: "Passkey", lastLogin: "Yesterday 17:20" },
  { name: "Compliance", email: "hr@cxbc.example", role: "HR / Compliance", mfa: "TOTP", lastLogin: "Today 08:10" },
  { name: "Mechanic", email: "shop@cxbc.example", role: "Maintenance", mfa: "TOTP", lastLogin: "Today 07:03" },
]

export const auditLog = [
  { time: "10:36:12", actor: "system", action: "Stage verdict Conflicting", target: "TRP-1016-02 · Arrival · SM Hyper Dasmariñas", hash: "9f2c…a71e" },
  { time: "10:02:44", actor: "Operations 1", action: "Viewed location history", target: "NCX 4722 · purpose: dispatch", hash: "4be0…19c3" },
  { time: "09:58:03", actor: "Compliance", action: "Issuer check: mismatch", target: "Efren Navarro · Police Clearance", hash: "c311…08aa" },
  { time: "09:31:50", actor: "Compliance", action: "Opened crew document", target: "Ricky Mendoza · NBI Clearance", hash: "77d1…be42" },
  { time: "08:12:09", actor: "Christian B.", action: "Signed in (passkey)", target: "Office dashboard", hash: "1a9e…f003" },
  { time: "06:00:00", actor: "system", action: "Hourly hash anchored to S3 Object Lock", target: "Anchor #4,812", hash: "e5c8…2d19" },
]

export const onboarding = [
  { name: "Ariel Bernardo", role: "Helper", stage: "Documents", progress: 50, missing: "NBI Clearance, Drug Test" },
  { name: "Joel Cabrera", role: "Driver", stage: "Issuer checks", progress: 70, missing: "Police clearance check pending" },
  { name: "Dennis Uy", role: "Helper", stage: "Orientation", progress: 90, missing: "Safety briefing sign-off" },
]

export const timesheets = crew.slice(0, 11).map((c, i) => ({
  crewId: c.id,
  days: [10.5, 11, 9.5, 12, 10, 0][i % 6],
  week: [52, 49.5, 47, 55, 51, 38, 44, 50, 46, 41, 53][i],
  overtime: Math.max(0, [52, 49.5, 47, 55, 51, 38, 44, 50, 46, 41, 53][i] - 48),
  source: trucks.find((t) => t.driverId === c.id)?.gps === "vectra" ? "Time In/Out, corroborated" : "Time In/Out, phone",
}))

export const hrDocuments = [
  { title: "Employment contract 2026 (drivers)", to: "11 drivers", signed: 9, total: 11, sent: "2026-10-01" },
  { title: "Data Privacy consent and notice", to: "All crew", signed: 19, total: 21, sent: "2026-09-20" },
  { title: "Safety policy: truck bans and NCAP", to: "All crew", signed: 14, total: 21, sent: "2026-10-10" },
  { title: "Payslip, Oct 1–15", to: "All crew", signed: 21, total: 21, sent: "2026-10-15" },
]

export const reviews = [
  { crewId: "D01", period: "Q3 2026", rating: "Exceeds", note: "Zero conflicting stages; 96% on-time." },
  { crewId: "D02", period: "Q3 2026", rating: "Needs review", note: "One conflicting arrival under investigation; fuel variance on Oct 14." },
  { crewId: "D03", period: "Q3 2026", rating: "Meets", note: "One overspeeding NCAP settled." },
  { crewId: "D08", period: "Q3 2026", rating: "Meets", note: "NCAP dispute open; long dwell at Prime Foods is vendor-caused." },
]

// Location history for playback (placeholder track, Taguig cross-dock to Bicutan)
export const playbackTrack: [number, number][] = [
  [14.5232, 121.0563], [14.5191, 121.0549], [14.5143, 121.0531], [14.5096, 121.0517], [14.5051, 121.0502],
  [14.5008, 121.0489], [14.4969, 121.0472], [14.4932, 121.0459], [14.4901, 121.0450], [14.4876, 121.0446],
]

export const DRIVER_TRIP_ID = "TRP-1016-01"
