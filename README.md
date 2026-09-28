# Heart Beat Hospital

A multi-page hospital website with a small Node.js/Express backend that
handles appointment requests.

## Pages

- `public/index.html` — home page (About, Departments, Doctors overview)
- `public/doctors/*.html` — a dedicated profile page per doctor
- `public/appointment.html` — appointment/contact form

## Backend

- `server.js` — Express server that serves the `public/` folder and exposes:
  - `POST /api/appointments` — saves a new appointment request to
    `data/appointments.json`, and sends an email notification if SMTP is
    configured (optional — see below).
  - `GET /api/appointments` — lists saved requests. Protected by a header:
    `x-admin-token: <your token from .env>`.

## Setup

1. Install [Node.js](https://nodejs.org) (v18+ recommended).
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. (Optional) Fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env` if you
   want an email sent for every appointment request — for example, using a
   Gmail account with an
   [app password](https://support.google.com/accounts/answer/185833).
   Leave these blank and the form still works; requests are just saved to
   `data/appointments.json` without an email being sent.
5. Change `ADMIN_TOKEN` in `.env` to something private — it protects the
   `GET /api/appointments` list.
6. Start the server:
   ```
   npm start
   ```
7. Visit **http://localhost:3000**

## Viewing submitted appointments

Either open `data/appointments.json` directly, or query the API:

```
curl -H "x-admin-token: your-token-here" http://localhost:3000/api/appointments
```

## Adding your images

Drop your existing images into `public/Images/` using the same filenames
already referenced in the HTML (`dental.jpeg`, `heart.jpeg`, `art.png`,
etc).

## Deploying

Any Node-friendly host works (Render, Railway, Fly.io, a VPS, etc). Since
appointments are saved to a local JSON file, make sure the host keeps a
persistent disk — on platforms with ephemeral filesystems, swap
`data/appointments.json` for a small hosted database instead.
