# Smile Station

A responsive one-page dental practice site and owner portal.

## Run locally

Use the bundled zero-dependency server from this folder:

```powershell
npm start
```

Open `http://localhost:4173`. The portal is available at `/#admin`.

## Offline review package

Run `npm run offline` to create a self-contained review copy in `outputs/Smile-Station-Offline-Review`. Share the generated ZIP from `outputs`; your reviewer can unzip it and run `npm start`. The clinic directions button still requires an internet connection to open Google Maps.

**Demo owner login**

- Email: `owner@smilestation.pk`
- Password: `SmileStation2026!`

## Included functionality

- One-page responsive public website, appointment requests, smooth navigation, promotion announcement/popup, WhatsApp & call actions, gallery lightbox and accessible semantics.
- Owner portal with content editing, service/gallery/testimonial management, appointment statuses, section visibility, contact settings and promotion draft/schedule/go-live/disable flow.
- Demo data persists in browser LocalStorage so the application works without a server while reviewing it.

## Production deployment notes

The current data adapter is intentionally isolated at the top of `app.js` (`get` / `save`). Replace it with a Supabase/Postgres API before deployment. Recommended tables: users, site_settings, homepage_content, doctor_profile, services, gallery, testimonials, appointments, promotions, social_links. Use server-side validation, a managed password-hash authentication provider, row-level security, secure object storage, image processing, rate limits, CSRF protection for cookie sessions, and secret environment variables. Do not ship the review demo account or LocalStorage adapter in production.

Promotion display checks status and end date at render time, and popup dismissal is stored per browser session.
