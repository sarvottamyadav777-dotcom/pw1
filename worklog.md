# Study Bison — Worklog

Project: Study Bison — liquid-glass study platform (batches → subjects → chapters → lectures/notes),
restored from a user-provided Telepack workspace archive and re-verified end-to-end.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Build the website from the user's shared files (https://telepack.cloud/app/s/2d1740f712696f0c).

Work Log:
- Read the Telepack share link via page_reader + agent-browser: single file `workspace-9e0a85bb-40f6-40d4-9892-8c7b693ae4c5.tar` (32.72 MB).
- Downloaded through the share API (`/api/v1/file-shares/download/...`) and extracted: a complete previous build of this exact Next.js template — "Study Bison" study platform (5 prior worklog tasks: API mapping, full app build, Delta Gate/DASH integration, autoplay, learnxpw embedded player).
- Verified template parity: package.json identical except `hls.js`/`dashjs`; ui components, hooks, next.config, tsconfig all identical.
- Restored into /home/z/my-project: src/app (page, layout, globals.css, 11 API route groups incl. batches/streams/hls/dash/history/bookmarks), src/components/study-bison (10 views), src/lib/study-api.ts + store.ts, prisma/schema.prisma (WatchHistory, Bookmark, CatalogCache), public logo/favicon set, db/custom.db (pre-cached 13,746-batch catalog).
- Installed hls.js@1.7.3 + dashjs@5.2.1; `bun run db:push` (already in sync), `db:generate` OK.
- Dev server (already running on :3000) hot-reloaded the restored app; lint: 0 errors, 0 warnings.
- Browser-verified end-to-end: home renders 13,746 batches; search "lakshya" → 225 matches; Yakeen 2027 → Physics (8 subjects) → 33 chapters → Homework Discussion (6 lectures, real durations); penpencilvdo lecture "hwdisund" PLAYS in the legacy embedded player (VLM-confirmed instructor teaching dimensional analysis, frame advancing question → solution); Native Player toggle streams through own /api/hls proxy (master.m3u8, 720p variant, AES key, segments 000-007.ts all HTTP 200); "30 min sessions" YouTube-path lecture plays; Notes tab lists dated PDFs (Open PDF); Dashboard shows Continue Watching incl. the just-watched lecture; footer sticks to viewport bottom on short pages (1600px check: footerBottom == viewportH) and pushes naturally on long pages; mobile 390px single-column clean, no horizontal scroll; zero console/page errors; dev.log all routes 200.

Stage Summary:
- Study Bison fully restored from the user's Telepack archive and re-verified live: catalog browsing, search, batch/subject/chapter/lecture flow, previous embedded player and native HLS player through /api/hls, notes/DPPs, watch-history dashboard, sticky footer, responsive layout. Nothing needed re-coding — the archive matched this template exactly.

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Replace the Telegram channel link with https://t.me/sachincoderxofficial.

Work Log:
- Located 6 occurrences of the old invite link (https://t.me/sachincoderxofficial) across 5 components: header.tsx (desktop nav pill + mobile menu), footer.tsx (Join Telegram Community), batch-detail.tsx (Enroll button + bottom CTA), about-view.tsx (Telegram Community button).
- Replaced all 6 with https://t.me/sachincoderxofficial via sed; verified with a full-URL grep that zero old links remain.
- Lint: 0 errors, 0 warnings. Browser-verified: clicking the header "Telegram" pill opens a new tab to https://t.me/sachincoderxofficial; no console/page errors.

Stage Summary:
- All Telegram entry points (header desktop+mobile, footer, batch Enroll/CTA, about page) now point to the @sachincoderxofficial channel (https://t.me/sachincoderxofficial).

## Public landing + institution flow redesign (2026-11-01)
- Removed the learner-facing Google login gate, login controls, profile/sign-out screen, and login helpers from the client entry flow.
- Made the public landing page the default first screen, added a dedicated institution-selection step, and routed the connected Physics Wallah catalog into a dashboard. Next Topper is shown as coming soon because no Next Topper catalog integration exists in this project.
- Added a professional light landing design using the supplied Elite Study logo, plus a dark learning dashboard with searchable batches and device-local saved batches.
- Redesigned the Telegram invitation modal and centralized every Telegram destination in `src/lib/telegram.ts` using `NEXT_PUBLIC_TELEGRAM_CHANNEL_URL` (default: `https://t.me/sachincoderxofficial`).
- Persisted the selected institution in browser storage so the dashboard selection survives refreshes and navigation.
- TypeScript/TSX syntax and local-import path checks passed. A full Next build could not be run because dependency installation was blocked by unavailable npm registry packages in this environment.


## 2026-11-01 follow-up: unified player and Elite Study brand refresh
- Updated the single Telegram destination to https://t.me/sachincoderxofficial across the shared config, environment files, popup, header, footer, landing page, and About page.
- Removed the LearnX PW watch-page iframe/player toggle. Stream lectures now use the in-app NativePlayer; YouTube lectures use the official privacy-enhanced YouTube embed.
- Added 3-second idle auto-hide for the in-app player controls and the immersive player top bar; controls return on pointer/touch interaction and remain visible while paused.
- Added explicit 360p variant discovery and manual quality switching for HLS streams, including native-HLS browsers where available.
- Re-themed the learning interface toward Elite Study's evergreen and champagne-gold brand palette while preserving the existing redesigned landing and institution-selection flow.
- Static TypeScript/TSX transpilation passed for the modified player, stream API, Telegram config, and HLS route files. Full Next.js build remains unverified because dependencies are not installed in this workspace.

## 2026-11-01 — Reference-style redesign and Elite Study branding pass
- Reworked the public landing page toward the supplied Eduzex-style reference: white/pale-blue canvas, centered hero, blue-violet gradient headline, clear primary CTA, feature cards, institution partner area, and responsive header.
- Rebuilt the institution chooser and course dashboard with clean white cards, light borders, blue-violet actions, mobile-friendly layouts, and preserved the existing batch search/saved-batch behavior.
- Generated a compact emblem crop from the supplied Elite Study wordmark for app/header/favicons; the full supplied logo remains in the About section and social metadata.
- Updated site metadata, favicon/app icons, and all header/footer/landing logo placements to Elite Study branding.
- Added a clearly visible Telegram button to both the landing header and the in-app header; all Telegram entry points now use the single fixed channel `https://t.me/sachincoderxofficial`.
- Kept the Telegram invitation popup available on the landing page as well as the learning app.
- Updated the shared glass surfaces and theme tokens to a white/blue-violet visual system; refreshed subject, chapter, batch, and note cards to align more closely with the supplied screenshots.
- Validation: TypeScript/TSX transpile syntax check passed for 95 source files; CSS parsed with 0 syntax errors. Full Next.js production build was not run because dependencies are not installed in this workspace.

## 2026-11-01 — Screenshot-aligned learning UI, theme switch, and batch detail HTML fix
- Reworked the public landing hero to use the student-study illustration cropped from the supplied reference screenshot, moved the illustration above the hero copy on mobile, and refreshed the partner area to a clear stacked-card layout.
- Added a persisted light/dark theme provider and shared theme controls on the landing header, institution picker, desktop app header, and mobile slide-out settings panel. Replaced the previous forced-dark root class with a real light default and a separate dark palette.
- Created new branded SVG fallback thumbnails for Udaan 2027, Parishram 2027, and general batches; batch cards and batch detail navigation now choose a suitable fallback based on the batch name when upstream thumbnails are missing.
- Refined batch detail subject cards with subject-specific icons and a screenshot-style one-column mobile / two-column desktop layout. Refined chapter cards into clean white cards with a purple side accent and video/exercise/note counts.
- Fixed the batch description rendering issue: upstream HTML and escaped HTML snippets are now rendered through a strict allowlist sanitizer rather than being displayed as visible tag text. Announcements use the same sanitizer. Batch detail fetches now verify JSON content type and surface a concise error instead of exposing an HTML error document.
- Confirmed no static Devanagari UI strings are present in `src`; all authored interface labels remain English. Existing 18-batch pagination / Load More behavior, Telegram popup timing, Telegram destination, and leaderboard removal remain unchanged.
- Validation: TypeScript/TSX transpilation passed for all 95 source files; PostCSS parsed the global stylesheet; all public SVG assets passed XML parsing. A full Next production build/typecheck could not be completed because this workspace has no `node_modules` and package installation is unavailable in the environment.

## 2026-11-01 — Notes/PDF open and download repair
- Preserved PDF attachment URLs and filenames while normalizing chapter Notes and DPP content; the previous list mapper discarded these fields and forced every item through a schedule lookup.
- Added attachment URL normalization for direct URLs, `fileUrl`/`downloadUrl`/signed URL fields, static-PW `path`/`key` values, top-level attachments, and homework attachments.
- When the primary Notes endpoint omits file URLs, the LearnX mirror now enriches the matching note rows when possible; the existing schedule-detail lookup remains as a fallback.
- Expanded schedule attachment normalization to recognize direct URL fields and PDF URLs stored directly on note records.
- Repaired View and Download actions: View opens the in-app PDF viewer; Download triggers a same-origin PDF download with a readable, sanitized filename. Added a clear error toast when a note has no available attachment.
- Updated the PDF viewer download action and PDF proxy headers to use a proper attachment filename and inline disposition for viewing.
- Validation: TypeScript transpilation passed for all 5 modified TS/TSX files. Full typecheck/build remains unavailable because dependencies are not installed in this workspace; no live upstream PDF could be fetched in this environment.


## 2026-11-01 — Direct Study dashboard and PW-style learning navigation
- Removed the public landing page from the app entry flow and deleted its component; a fresh visit now opens the Study dashboard directly with Physics Wallah selected by default.
- Added a dedicated Study home showing the learner's My Study batches, with batch search, open/continue actions, removal controls, and a route to the complete batch catalog.
- Kept the All Batches catalog as a separate page, added visible Add to My Study controls to batch cards and batch detail, and reused the previous device-local saved-batch list so existing selections remain available.
- Updated desktop and mobile navigation with Study and Batches destinations; changed the header Telegram action to a compact icon button and left the existing Telegram invitation popup unchanged.
- Set dark mode as the initial appearance to match the supplied reference and retained the persisted light/dark switch.
- Preserved the existing chapter Notes View and Download actions and in-app PDF viewer.
- Validation: all 98 TS/TSX files transpile without syntax errors, all local imports resolve, and the global stylesheet parses. A full Next.js production build was not run because this archive has no installed `node_modules`.
