# FateSpinner — Marketing Materials

Marketing materials for the recent FateSpinner updates and cleanup refactor, ready to publish across Twitter, Reddit, and LinkedIn.

---

## 🐦 Twitter / X Post

**Option 1: Short & Punchy**
> Just updated **FateSpinner** 🎯 — a clean, ultra-lightweight decision wheel built with zero dependencies!
>
> ✨ What’s new:
> 🔹 Streamlined, distraction-free UI
> 🔹 Cryptographically unbiased RNG selection
> 🔹 Bulk option import (up to 60 choices!)
> 🔹 Full keyboard & screen reader accessibility
> 🔹 100% private & client-side (no tracking/ads)
>
> 🕹️ Try it live: https://justinreyes28.github.io/FateSpinner/
> 📦 GitHub: https://github.com/JustinReyes28/FateSpinner
>
> #webdev #javascript #buildinpublic #opensource #html5

---

## 🤖 Reddit Post (Ideal for r/webdev, r/javascript, or r/SideProject)

**Title:** *I built FateSpinner: A lightweight, open-source decision wheel with zero dependencies, unbiased RNG, and clean accessibility*

**Body:**
> Hey everyone! 👋
>
> I wanted to share a recent overhaul and cleanup of my side project, **FateSpinner** — a private, fast, and customizable decision-making wheel built using plain HTML, CSS, and Vanilla JavaScript.
>
> ### 💡 Why build another decision wheel?
> Most wheel spinner sites online are bloated with third-party tracking, ads, slow loading assets, and biased landing math. I wanted a tool that is **instant, completely private, zero-dependency, and accessible**.
>
> ### 🚀 Key Features & Recent Updates:
> - **Cleaner, Compact UI:** Removed filler copy and slogans to keep the focus entirely on the wheel and option list.
> - **Unbiased Random Selection:** Uses `crypto.getRandomValues` when available with bias rejection math so every option has an exact equal chance.
> - **Precision Landing:** Landing math ensures the pointer always stops comfortably inside the slice away from ambiguous border edges.
> - **Bulk Import & Undo:** Paste multiple options at once (up to 60 choices, 80 chars each), remove winners, or undo accidental clears.
> - **Accessibility & Mobile First:** Native dialog focus handling, full keyboard navigation (Esc, Ctrl+Enter), reduced motion support, and responsive layouts down to 320px.
> - **100% Local & Private:** Runs entirely in your browser with local storage fallback; zero external fonts, analytics, or network requests.
>
> 🔗 **Live Demo:** [https://justinreyes28.github.io/FateSpinner/](https://justinreyes28.github.io/FateSpinner/)
> 💻 **GitHub Repo:** [https://github.com/JustinReyes28/FateSpinner](https://github.com/JustinReyes28)
>
> I’d love to hear your thoughts, feedback, or suggestions for improvement!

---

## 💼 LinkedIn Post

**Post Copy:**
> I’m excited to share a major update and code refactor for **FateSpinner** 🎯 — an open-source, ultra-lightweight decision wheel application built with pure Vanilla JavaScript, HTML, and CSS.
>
> In this latest release, the focus was on **UI decluttering, performance optimization, and robust accessibility**:
>
> 🛠️ **Key Technical & UX Highlights:**
> • **Streamlined Interface:** Stripped out filler text and condensed controls for a faster, distraction-free user experience across mobile and desktop.
> • **Decoupled Architecture:** Separated core decision math into a standalone module (`spinner-core.js`) covered by Node.js native unit tests.
> • **Fair & Cryptographically Unbiased RNG:** Implemented rejection sampling with Web Crypto API (`crypto.getRandomValues`) to eliminateModulo bias.
> • **Accessibility First:** Integrated native modal focus management, visible keyboard focus rings, and `prefers-reduced-motion` support.
> • **Zero External Dependencies:** No frameworks, remote fonts, third-party libraries, or tracking scripts — 100% client-side privacy.
>
> Check out the live project and source code below!
>
> 🌐 **Live Application:** https://justinreyes28.github.io/FateSpinner/
> 📂 **GitHub Repository:** https://github.com/JustinReyes28/FateSpinner
>
> #SoftwareEngineering #WebDevelopment #JavaScript #OpenSource #UserExperience #Frontend
