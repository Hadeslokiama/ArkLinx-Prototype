# ArkLinx front-end prototype

Front end only, with sample data. See `../PLAN.md` for the full plan and module map.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Entry points

| URL | Who |
| --- | --- |
| `/` | Portal: pick office role, driver, or partner; public tracking box |
| `/office` | Office staff. Switch role from the top-right menu to see role-based access |
| `/driver` | Driver / helper phone view (stage buttons, camera, delay report) |
| `/partner` | SCSM / AAI partner view |
| `/track/AXL-7Q4M-21` | Public tracking with 30-minute delayed location |

## Deploy on Vercel

1. Push this folder to a GitHub repository (or run `npx vercel` from this folder).
2. In Vercel, import the repository. If the repository root is above this folder, set **Root Directory** to `System Prototype/arklinx-web`.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (defaults).
4. `vercel.json` already rewrites every path to `index.html`, so deep links such as `/office/evidence` work.

The camera on the driver view needs HTTPS, which Vercel provides.

## Notes

- GPS positions, tracks and integration statuses are placeholders. Map tiles come from OpenStreetMap.
- Data lives in `src/data/mock.ts`.
- UI: shadcn/ui (base-nova style on Base UI), Tailwind CSS v4, Recharts, Leaflet, Poppins.
