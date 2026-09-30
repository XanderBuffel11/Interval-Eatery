# Interval Eatery

A minimal one-page website for **Interval Eatery**, a café at 1241 Hinemoa Street, Rotorua.

It's plain HTML, CSS and JavaScript with no build step and no dependencies.

```
index.html   page content (menu, reviews, contact details)
styles.css   all styling, including dark mode
script.js    opening hours, live open/closed status, scroll effects
favicon.svg  site icon

interval-eatery-standalone.html   the whole site in one file, for sharing or
                                  opening straight from your computer
```

## Preview locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Editing

- **Opening hours:** edit the `HOURS` object at the top of `script.js`. The hero timeline,
  the "Open now" badge, the hours table and the footer all update from it. Times are
  in 24-hour format, e.g. `[7, 15]` for 7am–3pm, `[7.5, 15]` for 7:30am–3pm, or `null` for
  a closed day. The open/closed status always uses Rotorua time (`Pacific/Auckland`).
- **Menu, reviews and copy:** edit the text in `index.html`.
- **Colours and fonts:** edit the variables at the top of `styles.css`.
- **Standalone file:** `interval-eatery-standalone.html` is a copy of the site with the
  styles and script built in. It doesn't update itself, so after editing the main files,
  delete it or ask for it to be regenerated.

## Deploying

The site is static, so any static host works: GitHub Pages (Settings → Pages → deploy
from branch), Netlify, Vercel, or Cloudflare Pages. Just publish the repository root.
