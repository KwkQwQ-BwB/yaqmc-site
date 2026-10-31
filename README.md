# YAQMC website preview

A proposed redesign of the [YAQMC](https://github.com/YAQMC/YAQMC) project website, kept here until it is ready to send upstream as a pull request. This is an unofficial preview, not the project's site.

The whole page is the real YAQMC lyrics view. The renderer is compiled in its offline fake-provider mode and embedded full screen, playing a song written for this page: a tour of the app's features sung to the public-domain tune of Twinkle, Twinkle, Little Star, with Chinese lyrics, pinyin and English translation, timed word by word. A small Web Audio synth plays the melody in step with the player once a visitor turns sound on. Everything else in the demo is the synthetic fixture data that ships in YAQMC. The page's colors and type come from the app's own `src/styles/tokens.css`.

## Layout

Every file sits at the same path it will have in YAQMC, so the pull request is a straight copy:

| Path | What it is |
| --- | --- |
| `site/` | The bilingual landing page (`index.html` zh-CN, `en/index.html`, `styles.css`) |
| `src/development/website-demo.tsx` | Demo entry: the fake app plus the demo song, auto-playing with `?autoplay`, and the melody synth |
| `src/development/website-song.ts` | The demo song: melody, word timings, lyrics, pinyin and translation (with a test) |
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
