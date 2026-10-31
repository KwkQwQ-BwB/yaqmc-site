# YAQMC website preview

A proposed redesign of the [YAQMC](https://github.com/YAQMC/YAQMC) project website, kept here until it is ready to send upstream as a pull request. This is an unofficial preview, not the project's site.

The page is built around the real app: the YAQMC renderer is compiled in its offline fake-provider mode and embedded live, already playing a fixture song with lyrics open. All songs, artists, artwork and lyrics in the demo are the synthetic fixtures that ship in the YAQMC repository. The site's colors and type come from the app's own `src/styles/tokens.css`.

## Layout

Every file sits at the same path it will have in YAQMC, so the pull request is a straight copy:

| Path | What it is |
| --- | --- |
| `site/` | The bilingual landing page (`index.html` zh-CN, `en/index.html`, `styles.css`) |
| `src/development/website-demo.tsx` | Demo entry: the fake app, auto-playing with `?autoplay` |
| `vite.demo.config.ts` | Builds that entry into `dist/pages/demo` with relative asset paths |
| `scripts/build-pages.mjs` | Existing Pages build, now also copies the app's design tokens |
| `upstream.patch` | The small edits to `package.json`, `tsconfig.node.json` and `pages.yml` for the PR |

## Deploy

`.github/workflows/deploy.yml` checks out YAQMC at the pinned `YAQMC_REF`, copies these files over it, builds, and publishes to GitHub Pages on every push to `main`.

## Local build

```bash
git clone https://github.com/YAQMC/YAQMC.git && cd YAQMC
cp -r ../yaqmc-site/{site,src,scripts,vite.demo.config.ts} .
npm ci --ignore-scripts
node scripts/build-pages.mjs && npx vite build -c vite.demo.config.ts
```

Then serve `dist/pages` with any static server.

## License

GPL-3.0-or-later, the same as YAQMC. An unofficial project, not affiliated with Tencent or QQ Music.
