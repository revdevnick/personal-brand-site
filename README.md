# personal-brand-site

Public doorway for [Nick Perkins](https://github.com/revdevnick) — pastor, writer, builder. The site introduces him so people can find the work. It is here to serve the Lord.

**Line:** I love solving problems. Some of them take code. The deepest ones take Jesus.

## Local development (Docker)

You do not need Node on the Mac. Docker Desktop (or Engine + Compose) is enough.

```bash
docker compose up
```

Then open [http://localhost:3000](http://localhost:3000). The app hot-reloads when you edit files, including MDX in `content/`.

Optional: preview the static export the way S3 + CloudFront will serve it:

```bash
docker compose --profile preview up --build
```

That serves `out/` on [http://localhost:8080](http://localhost:8080).

Without Docker, if you have Node 22:

```bash
npm ci
npm run dev
```

## Content

After Sunday, add a sermon file. One slug, as many recordings as you have:

`content/sermons/2026-04-12-title.mdx`

Writing lives in `content/writing/`. Work case studies in `content/work/`. The About timeline is a hand-kept LinkedIn mirror in `content/experience.yml` — paste changes there when LinkedIn changes. Do not scrape LinkedIn.

Contact posts to Formspree when `NEXT_PUBLIC_FORMSPREE_ID` is set in `.env.local`. The public site never shows an email address.

## Deploy later (not yet)

Static export (`npm run build` → `out/`) to **S3 + CloudFront**. No new EC2, RDS, ALB, or NAT. Target about $0–2/month.

Tag every new AWS resource:

- **Key:** `Project`
- **Value:** `personal-brand-site`

Do not put that tag on the existing WordPress EC2 unless you want old spend mixed in. Activate `Project` as a cost allocation tag in Billing at cutover.

## Links

- GitHub: [revdevnick](https://github.com/revdevnick)
- Current live site: [nickperkins.dev](https://nickperkins.dev)
- Story Rocket: [storyrocket.io](https://www.storyrocket.io/)
