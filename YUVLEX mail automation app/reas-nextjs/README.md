# Yuvlex — Next.js port

Faithful, same-UI/UX port of the Yuvlex (formerly Reas) prototype into a Next.js (App Router) app.

## Run it

```
cd reas-nextjs
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `app/layout.js` — HTML shell, Google Fonts link.
- `app/globals.css` — the few things that can't be inline styles: `@keyframes` for every animation and the global hover/press effect (scale + glow) applied via a `[style*="pointer"]` attribute selector, matching the original design.
- `app/page.js` — the whole app (marketing landing page, Support page, Login, and the adviser Dashboard/App) as a single client component. Layout uses inline styles via a small `sx()` helper that parses the same CSS-string values the original design used, so visuals are pixel-identical. State is a single object updated with a `setState` merge helper mirroring the original component's class-style `setState`.
- Real spreadsheet parsing: uses the `xlsx` npm package (SheetJS) to read uploaded `.xlsx`/`.xls`/`.csv` files. Any column that isn't Name/Email/GPA/Document/Note is treated as its own course/subject with its own letter grade, numeric score, or pass/fail text — this drives the real Pass Rate breakdown (no student data is retained, only aggregate counts).

## Notes / things a developer should follow up on

- The adviser-photo and sidebar-illustration `<image-slot>` placeholders from the original were replaced with: a plain placeholder box for the photo, and an inline animated SVG (paper folds → paper airplane flies → lands as a checked envelope) for the sidebar, matching the live design.
- Email sending is mocked: "Send" and "Resend failed" simulate progress with `setInterval` and a couple of hardcoded failure indices, matching the original demo behavior. Replace with a real backend call.
- Login is a demo check (email contains `@`, password length ≥ 4) — replace with real auth.
- The `--reas-*` CSS custom properties on the root element drive light/dark theming (Settings → Dark mode toggle).
- Pass Rate colors (Passed/Failed/Pending) are editable in-place via the small pencil icon on the Pass Rate card; this is local UI state, not persisted.
- "Download data" on the Pass Rate card exports a CSV with Year/Semester/Course/Passed/Failed/Pending/Pass Rate% plus a yearly average row — never any student names.
