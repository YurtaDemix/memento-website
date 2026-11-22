# MEMENTO 3.4 — Original Stories + Studio 3.3 Editor

This edition deliberately combines the TWO ZIP files provided by the project team:

- **First ZIP (`MEMENTO-SmallStuffPotato`)**: the original React home page, its "Открыть историю дня" link, the 3 illustrated story folders (School life, Family time, Horses), and **all 6 original memory stories**, photos, videos, and audio. React source: `src/pages/Home.jsx`, `src/pages/Demo.jsx`, `src/media/demo.js`, `src/i18n.js` and `src/style.css`.
- **Second ZIP (`MEMENTO Studio 3.3`)**: the `#/create`, `#/archive`, and `#/edit/:id` screens with video trimming, up-to-40-second videos, folders, editing, MP4 export and server conversion. Source: `public/studio3/` + `server/`.

Navigation uses one browser hash URL but **different page owners**: the original React root is displayed for `#/`, `#/stories`, `#/stories/:folder`, and `#/demo/:story`, while the Studio 3.3 client runs for create/archive/edit. Do not replace this with two simultaneous visible routers.

## Run on Mac / Windows / Linux

Install Node.js (LTS recommended). Open a terminal inside the `memento` directory, then run:

```
npm run start
```

Open http://127.0.0.1:4173 . The ZIP already includes a compiled `dist` so `npm install` is **not** required for this command. To change React sources, run `npm ci` and `npm run build`, followed by `npm run start`.

For actual MP4 conversion when the browser only records WebM, install `ffmpeg` on the computer hosting the local server (e.g. `brew install ffmpeg` on macOS with Homebrew). Without FFmpeg the WebM fallback is offered. Original user memories persist in the browser's IndexedDB `memento` database at the same origin (`127.0.0.1:4173`); changing the address or browser can display a separate archive.

### Feature verification

Run `npm test` after installing dependencies to check navigation/media inventory, story routes, timeline limits, archive functions, and MP4 conversion contract. Automatic tests are not a substitute for checking actual H.264/MP4 export from a real Chrome session with footage and music.
