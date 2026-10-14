# Our Story, Live: Digital Wedding Album

A wedding website that lives on the QR code printed on your invitation. It welcomes guests before the wedding, brings them together on the day, and stays online afterwards as a permanent digital album.

Built for South Indian weddings, where many guests know the couple only through family. The site helps them feel part of it: who is who, what is happening, and what each ritual means.

The demo ships with a fictional couple, **Karthik & Anjali**, marrying in Kochi on 15 November 2026.

## Features

**Before the wedding**
- Lamp loading screen and a "Tap to open" invitation with drifting jasmine
- Countdown to the muhurtham (switches to "Today!" and "Just married")
- Story timeline and a "How we met" chat that reveals one message per tap
- Meet the families, with a "Who's who" search
- Events with dress hints, "Add to calendar" (.ics) and "Open in Maps"
- Swipeable ritual guide (Haldi, Muhurtham, Kanyadanam, Thali, Saptapadi, Sadya…)
- Venue guide: parking, restrooms, accessibility, food timings, helplines
- RSVP form

**On the wedding day**
- Guest photo uploads with no login: compressed in the browser, queued, retried automatically on slow networks, with offline support
- Gallery with couple's photos and guest moments, masonry grid, swipeable lightbox, downloads, likes and "Crowd favourites"
- Blessings wall with card styles, moderation and a profanity filter
- **Bride vs Groom** team game: couple quiz, photo challenges, predictions, match-the-family, live tug-of-war scoreboard, leaderboards and unlockable gifts
- **Live venue screen** (`/live`) for the TV at the hall: countdown or "now happening", photo slideshow with new uploads spotlighted, scrolling blessings, scoreboard, winner announcement and an always-visible QR code

**After the wedding**
- Thank-you note, best photos, films page and a printable memory book
- Story film preview: a Ken Burns slideshow of the couple's photos with generated music
- Time capsule: messages sealed until the first anniversary

**For the family**
- Admin panel (`/admin`) with large, plain-language controls: approve photos and blessings (in bulk), RSVP table with CSV export, game control, site settings and downloads
- English, Malayalam and Tamil, with Noto fonts for Malayalam, Tamil, Telugu and Kannada
- Two themes: **Kasavu** (ivory, gold, maroon) and **Blush** (pink and rose gold)
- Installable to the home screen. No tracking scripts.

## Screenshots

_Add screenshots here: intro, home, gallery, game and live screen._

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed; the site runs in demo mode with sample data.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check |
| `npm run seed:supabase` | Load the sample data into Supabase (`-- --clear` empties it) |
| `node scripts/generate-demo-assets.mjs` | Regenerate the placeholder artwork in `public/demo/` |

## Setting up a wedding

Everything specific to one couple lives in **`src/config/wedding.config.ts`**:

- Names, nicknames, short bios and portraits
- Date, muhurtham time, venue, address, map link and coordinates
- Events with times, dress hints and descriptions
- Family members for each side (name, relation, one-line note, optional photo)
- Story timeline and the "How we met" chat script
- Ritual cards, quiz questions, photo challenges, predictions and gift thresholds
- Venue guide (parking, food timings, helplines)
- Themes, languages, admin passcode, auto-approve default and feature flags (`modules`)
- `phase`: `"auto"` (decided from the dates), or force `"before"`, `"during"` or `"after"`

Text fields can be a plain string or `{ en, ml, ta }` for translations. UI strings live in `src/lib/i18n.ts`; to add a language, add a column there, add its code to `Lang` in the config, and add a Noto font in `src/app/fonts.ts`.

If you use Supabase, also update the predictions at the bottom of `supabase/schema.sql`.

### Replacing placeholder photos and videos

The demo uses generated SVG artwork in `public/demo/`:

| Folder | Used for |
| --- | --- |
| `public/demo/couple/` | Bride and groom portraits |
| `public/demo/story/` | Story timeline images (also used in the story film) |
| `public/demo/photos/` | Sample gallery photos (seeded into demo mode) |
| `public/demo/films/` | Film poster frames |

Drop real JPG or WebP files into `public/` (any folder) and point the paths in `wedding.config.ts` at them. For family member photos, set the optional `photo` field.

### Background music

Music starts softly when a guest taps "open" on the invitation, with a floating button to pause it, and it pauses automatically while a film plays. Set `music` in the config:

- `youtubeId`: the part after `watch?v=` in a YouTube link (played through a hidden player; `start` skips seconds)
- `file`: an mp3 in `public/`, e.g. `/music/wedding.mp3`
- neither: a gentle instrumental melody (raga Mohanam) is generated in the browser

For films, put the video files in `public/films/` (or any video URL, e.g. from a CDN) and set `src` on the entries in `films` in the config. Set `storyMusic` to an audio file to replace the generated background music in the story preview.

## Demo mode and the presenter menu

Without Supabase, all data is stored in the browser (`localStorage`) and synced live between tabs on the same device. A small **Demo mode** badge shows in the corner.

The **Demo** button (bottom-left) is a presenter helper for showing the product to couples:

- Switch between **Before / During / After** to preview each stage of the site
- Open the **Live screen** in a new tab
- **Simulate guests**: adds photos, blessings and points every few seconds, so the live screen visibly updates
- Switch **theme** and **language**
- **Replay intro** and **Reset demo data**

Query parameters:

| Parameter | Effect |
| --- | --- |
| `?presenter=0` | Hides the presenter menu for this browser session (`?presenter=1` brings it back) |
| `?phase=before\|during\|after` | Previews a stage on this device without changing the setting |
| `/live?scenes=countdown,photos,blessings,scores,winner` | Chooses which scenes the live screen rotates through |

On the live screen, press **F** for fullscreen and the arrow keys to change scene. The cursor is hidden and the screen is kept awake where the browser supports it.

**Admin passcode (demo): `1511`**. In demo mode the passcode is checked in the browser, which is fine for a demo but not for a real wedding. With Supabase enabled, the passcode is checked on the server (`ADMIN_PASSCODE`) and never ships to the browser. The presenter menu is not shown when Supabase is configured.

## Enabling Supabase (shared, real-time data)

For a real wedding, guests on different phones need to see each other's photos. Connect a free Supabase project and the site switches automatically, using Supabase Realtime for the live wall and scoreboard. See **[supabase/README.md](supabase/README.md)** for the step-by-step guide.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository. The defaults are correct for Next.js.
3. Deploy. No environment variables are required.

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Turn on shared Supabase storage |
| `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSCODE` | Server-side admin actions in Supabase mode |
| `NEXT_PUBLIC_SITE_URL` | The public address used in QR codes and link previews (defaults to the Vercel URL) |

Then open `/share` to download the QR code for the invitation.

## Privacy and safety

- No analytics or tracking scripts.
- Guest text is sanitised and checked by a basic profanity filter; posts are rate-limited per device.
- Uploads accept JPG, PNG, WebP and HEIC (where the browser can read it), up to 20 MB, compressed to about 1600 px before upload.
- Photos and blessings wait for approval unless auto-approve is switched on. The family can hide or delete anything.
- RSVPs and time-capsule messages are private to the family.

## Project structure

```
src/
  app/            routes: /, gallery, upload, blessings, play, live, films, capsule, share, admin, memory-book, api/admin
  components/     UI by feature (intro, story, chat, families, events, rituals, gallery, blessings, game, live, films, admin…)
  config/         wedding.config.ts
  data/           DataStore interface, LocalStore, SupabaseStore, seed data, hooks
  lib/            compression, upload queue, i18n, calendar, text safety, wake lock, simulation
  state/          per-device and session state
public/demo/      placeholder artwork
supabase/         schema.sql and setup guide
```

## Roadmap

- Face-based photo search ("find photos of me")
- Story films edited automatically from guest photos
- Printed memory books delivered to the couple
- More languages: Telugu, Kannada and Hindi UI
- Per-guest invitations with family-side detection
