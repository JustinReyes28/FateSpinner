# FateSpinner

A small, private decision wheel. Add your options, spin, and let chance choose.

[Live demo](https://justinreyes28.github.io/FateSpinner/)

## Features

- A responsive wheel and choice editor, with a quick jump to the editor on phones.
- Add several choices at once, one per line. Use the button or Ctrl/Cmd + Enter.
- Choices saved in your browser, with a usable fallback when storage is blocked.
- Remove individual entries, undo clearing the list, or remove a winner for another round.
- Equal probability per entry, using the browser's random-number generator when available. Duplicate entries each receive a separate chance.
- Results land inside the selected segment, away from ambiguous borders.
- Keyboard-accessible result dialog, visible focus indicators, and reduced-motion support.
- No dependencies, remote fonts, accounts, analytics, or third-party requests.

The wheel supports 2–60 entries, with up to 80 characters per choice. Long labels are shortened on the wheel; the complete text remains in the list and result. Wheels with 13–24 entries use list numbers, and larger wheels show segments without labels to avoid overlap.

## Run locally

Open `index.html` in a modern browser. No build step is required. Browser storage for local files varies by browser; use a local server for consistent persistence:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000`.

Choices are stored only in the current browser profile. Clearing site data removes them; private browsing may retain them only until the session ends.

## Checks

The pure wheel logic uses Node's built-in test runner, with no packages to install:

```sh
node --test tests/spinner-core.test.js
node --check script.js
```

The tests cover bulk-input validation, stored-data validation, unbiased random selection, and pointer alignment for every supported wheel size.

`tests/browser_smoke.py` additionally checks the UI using an **already installed** Python Playwright package and Microsoft Edge or Google Chrome. With the local server above running:

```sh
python tests/browser_smoke.py --base-url http://127.0.0.1:8000
```

The browser checks block external page requests and do not download a browser or dependencies. Screenshots go to the system temporary directory. Coverage includes persistence, unsafe-looking input rendered as plain text, keyboard operation, result handling, reduced motion, storage failures, and narrow-screen layouts.

## Built with

HTML, CSS, and vanilla JavaScript. `spinner-core.js` keeps input rules and selection math independent of the DOM.

## License

[MIT](LICENSE) · [Justin Reyes](https://github.com/JustinReyes28)
