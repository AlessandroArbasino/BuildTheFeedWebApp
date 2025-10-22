# Build The Feed Web App
## Overview
Build The Feed is a minimal Next.js web app that lets users submit a free‑form prompt, which is then sent to a backend endpoint for processing by an cron job. The UI includes basic validation, success/error feedback, and links to community and policy pages.

## Quick Links
- **Web App**: https://build-the-feed-app.vercel.app/
- **Instagram**: https://www.instagram.com/buildthefeed/
- **Telegram**: https://t.me/+wpyTw6ofnhMzMWI0
- **CronJobRepository**: https://github.com/AlessandroArbasino/Post-Agent

## Features
- **Prompt submission UI**: A textarea with a submit button to post prompts.
- **Feedback toast**: Quick, transient messages for success/error.
- **Result banner**: Displays the last operation outcome with an ID on success.
- **Social links**: Optional Telegram and Instagram links via environment variables.
- **Policy links**: Privacy and Cookie Policy via Iubenda.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Runtime**: Node.js 18+
- **Potential integrations**: `@neondatabase/serverless`, `@google/generative-ai` (present in dependencies; actual usage depends on backend implementation)

## Project Structure
- `app/layout.js`: Root layout, metadata, and Iubenda script injection.
- `app/page.js`: Client component with the prompt form, submission logic, and footer links.
- `app/globals.css`: Global styles imported by the layout.
- `next.config.js`: Next.js configuration.
- `public/`: Static assets (e.g., logos).

## Branding
- App name: Build The Feed.
- Suggested palette (from the logo): ink `#0F2A3A`, sky `#9FD7F3`, sun `#FFA726`, greenD `#2E7D32`, greenL `#66BB6A`, bg `#F6FAFC`.
- Logo asset path: `public/logo-btf.svg` (ensure your layout/header references the intended logo file in `public/`).

## Getting Started
### Prerequisites
- Node.js 18+ and npm or pnpm/yarn.

### Install
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
# defaults to http://localhost:5173
```

### Production Build
```bash
npm run build
npm start
# serves on http://localhost:5173
```

## Environment Variables
These variables are read on the client to conditionally show social links in the footer:
- `NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL` – e.g., https://t.me/your_channel
- `NEXT_PUBLIC_INSTAGRAM_URL` – e.g., https://instagram.com/your_page

Place them in `.env.local` for local development:
```
NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
```

## API Contract (expected)
The page submits to `POST /api/prompts` with JSON body:
```json
{ "prompt": "your text" }
```
Expected success response:
```json
{ "success": true, "id": "<generated-id>" }
```
Expected error response:
```json
{ "success": false, "error": "Reason message" }
```

Notes:
- The repository’s frontend assumes this API exists and returns the above shape. Implement an API route at `app/api/prompts/route.js` (App Router) or `pages/api/prompts.js` (Pages Router) that validates input, applies moderation as needed, and persists data (e.g., Neon/Postgres).

## Privacy and Policies
- Privacy Policy: https://www.iubenda.com/privacy-policy/66315879
- Cookie Policy: https://www.iubenda.com/privacy-policy/66315879/cookie-policy

## Scripts
- `npm run dev` – Start dev server on port 5173
- `npm run build` – Build production assets
- `npm start` – Start production server on port 5173

## Troubleshooting
- If the submit fails with “API error”, ensure your backend route `/api/prompts` is implemented and reachable from the browser.
- Check that environment variables starting with `NEXT_PUBLIC_` are defined and the browser has access to them (requires server restart after changes).
- Verify the logo path used in `app/layout.js` and `app/page.js` matches the file present in `public/`.

## License
MIT