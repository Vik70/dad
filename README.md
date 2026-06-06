# Rajesh's Light

A warm, premium digital memorial for Rajesh — a place to remember, honour, and
celebrate his life. Family and friends can read his story, view photos, share
memories, leave messages, and light a digital diya.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**,
**Firebase** (Auth / Firestore / Storage), and **Framer Motion**.

## Features

- **Home** – emotional hero, recent memories, gallery preview, and a live diya count.
- **His Story** – an animated timeline of life chapters.
- **Gallery** – responsive masonry of photos with category filters and a lightbox modal.
- **Memory Wall** – approved memories with hearts, replies, and "I remember this too".
- **Share a Memory** – a friendly form with optional photo upload (saved as `pending`).
- **Light a Diya** – a glowing wall of messages with a running total.
- **Admin Dashboard** – protected moderation for memories, gallery, and diyas.

## Runs out of the box

If Firebase is **not** configured, the site automatically uses warm placeholder
data so you can preview and deploy immediately. The admin dashboard runs in a
"demo" mode in this case. Wire up Firebase to make everything persistent and
secure.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuring Firebase

1. Create a Firebase project and enable **Authentication** (Google and/or
   Email/Password), **Firestore**, and **Storage**.
2. Copy the env template and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Comma-separated admin emails allowed into /admin
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com
ADMIN_EMAILS=you@example.com
```

> The admin gate is checked client-side against `NEXT_PUBLIC_ADMIN_EMAILS`.
> For real security, also enforce access with Firestore Security Rules.

### Firestore collections

- `memories` — `{ name, relationship, title, message, category, imageUrl, visibility, status, hearts, rememberCount, createdAt }`
- `comments` — `{ memoryId, name, message, createdAt }`
- `diyas` — `{ name, message, createdAt }`
- `gallery` — `{ imageUrl, caption, category, uploadedBy, createdAt, status }`

Public users see only memories where `status == "approved"` and
`visibility == "public"`, and gallery items where `status == "approved"`.

## Deploying to Firebase Hosting

```bash
npm run build
# Configure Firebase Hosting (with the Next.js web framework integration)
firebase init hosting
firebase deploy
```

## Project structure

```
src/
  app/            # routes: /, /story, /gallery, /memories, /share, /diya, /admin
  components/     # Navbar, Footer, Hero, MemoryCard, GalleryGrid, DiyaWall, ...
  hooks/          # useAuth
  lib/            # firebase, firestore helpers, storage, auth, types, placeholder data
```

Made with love by his family.
