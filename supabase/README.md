# Enabling Supabase

Out of the box the site runs in **demo mode**: all data is stored in the visitor's browser and synced between tabs on the same device. That is perfect for showing the product, but guests on different phones will not see each other's photos.

To share photos, blessings and scores across every guest and the venue screen, connect a free Supabase project.

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free tier is enough for a wedding).
2. Open **SQL Editor → New query**, paste the contents of [`schema.sql`](./schema.sql) and click **Run**.
   This creates the tables, indexes, row-level security policies, a public `photos` storage bucket, and turns on Realtime.
3. If you changed the predictions in `src/config/wedding.config.ts`, update the `insert into predictions` block at the bottom of the file to match.

## 2. Add environment variables

From **Project Settings → API**, copy the values into `.env.local` (locally) or your Vercel project settings:

| Variable | Where it is used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (safe to expose, protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, used by `/api/admin` for moderation |
| `ADMIN_PASSCODE` | Server only, the passcode for the admin panel |

Redeploy. The "Demo mode" badge disappears once the two public variables are present.

## How access works

- Guests have no accounts. They can **add** photos, blessings, RSVPs, capsule messages, votes and quiz scores.
- New photos and blessings are stored as `pending` by a database trigger unless **auto-approve** is switched on in the admin panel.
- The public can only **read** approved photos and blessings, scores, predictions and settings.
- RSVPs and time-capsule messages are never readable with the public key. The admin panel reads them through `/api/admin`, which checks `ADMIN_PASSCODE` on the server and uses the service role key.
- Challenge points and prediction points are awarded on the server when the family approves a photo or reveals an answer.

## Housekeeping

- Photos are stored in the `photos` bucket. Download them from the Supabase dashboard or use **Admin → Downloads** for a list of links.
- To start over after a rehearsal, use **Admin → Game control → Reset scores**, and delete test rows from the Table Editor.
