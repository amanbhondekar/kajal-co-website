# Kajal & Co. — Website

Static marketing site for Kajal & Co. — website design, SEO, and performance marketing.

Websites that convert. SEO that compounds. Ads that pay back.

---

## Running locally

No build step and no dependencies — plain HTML, CSS, and vanilla JS. Any static server works:

```bash
python -m http.server 4477
```

Then open <http://localhost:4477>.

---

## Structure

```
.
├── index.html          # Home
├── about.html          # Story, principles, team, press, workshop
├── services.html       # Website Design, SEO, Performance Marketing + FAQ
├── portfolio.html      # Case studies with service filters
├── contact.html        # Free growth audit form
└── assets/
    ├── css/style.css   # Tokens + all components
    └── js/main.js      # Interactions
```

---

## Layout

The section architecture is reverse-engineered from the reference site
(shapinfotech.in), rebuilt with our own tokens. The recurring patterns are:

| Pattern | Where |
| --- | --- |
| Floating pill nav, blurred, inset from the top | every page |
| Split hero: copy left, drifting device collage right | home |
| Section head — title block left, action button right | everywhere |
| Dark full-bleed band between light sections | process, team, stats |
| Horizontal snap rail + dot pagination | home work slider |
| Sticky stacking cards | home "how we help" |
| Numbered 5-up process row | services, contact |
| Sticky aside + accordion | all FAQ blocks |
| Edge-to-edge marquee (logos, quotes, big type) | trust strip, testimonials, bands |
| Big-number stat card grid opposite a text column | home, about, portfolio |

**Note on the home page:** "How we help" and "How we work" have swapped both
position and theme. "How we help" now runs first, as **dark** sticky stacking
cards; "How we work" runs after the testimonials, as a **light** 2×2 card grid.
Each kept the layout it had — only placement and surface changed.

**Every page ends with the same three blocks:** `marquee → form → footer`.

- **Marquee** — full-bleed 88px strip, `#B5FF2A` field, black type and bullets.
- **Form** (`.contact-cta`) — centred pill eyebrow, two-tone heading, and a
  dark card holding Name / Email / WhatsApp, a four-way service checkbox grid
  (three services plus Other), and a message field. It has no bottom padding
  and the footer has no top border, so the two read as one continuous panel.
- **Footer** — brand column (logo, blurb, email, copyright) plus three short
  link columns: Services, Follow us, Legal. No Menu column. Closed by an
  oversized `Kajal & Co.` watermark at 5.5% white.

---

## Design system

All tokens are custom properties at the top of `assets/css/style.css`.

**Type** — two families, strictly divided.

| Family | Scope |
| --- | --- |
| Bricolage Grotesque (variable, 200–800) | everything: headings, body, buttons, links |
| Geist Mono (variable, 300–700) | eyebrows and overlines only |

The mono set is declared in one selector list at the top of the typography
block: `.eyebrow`, `.mono-tag`, `.hero__badge`, `.svc-card__num`, `.rule__n`,
`.badge`, `.proc span`, `.stat-card span`, `.stat-row span`, `.work-card__tags
span`, `.work-card__metric span`, `.footer h4`. Tracking drops to `.1em` there
— mono is already wide.

| Token | Range | Used for |
| --- | --- | --- |
| `--fs-stat` | 48 → 72px | stat numbers, work-card metrics |
| `--fs-display` / `--fs-h2` | 40 → 56px | h1, section headings |
| `--fs-h3` | 20 → 24px | card titles |
| `--fs-lead` | 16 → 18px | intro paragraphs |
| `--fs-body` | 16px | body |
| `--fs-sm` | 14px | card body, buttons, links |
| `--fs-xs` | 12px | eyebrows, tags, labels |

Headings run `-0.04em` tracking at `1.08` line-height; body runs `1.6`. Every size
is fluid via `clamp()`, so there are no per-breakpoint type overrides.

**Colour** — black, white, neutrals, plus one lime accent.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#0b0b0b` | dark sections |
| `--ink-2` / `--ink-3` | `#141414` / `#1c1c1c` | cards on dark |
| `--paper` | `#ffffff` | page |
| `--mist` | `#f3f3f1` | light grey sections, panels |
| `--text-2` / `--text-3` | `#55554f` / `#8e8e86` | body / meta |

Two-tone headings use `.hl` for the second phrase — a neutral grey on light,
40% white on dark. Dark sections are opted in with `.on-dark`, which re-maps
button, border, and text colours automatically.

**Lime accent** — `--accent` resolves per surface: `#B5FF2A` on light,
`#9FE815` on dark (swapped by `.on-dark`). Used in six places only, so it stays
an accent rather than a second brand colour:

1. step / phase badges (`.badge`)
2. the hero badge chip (`.hero__badge i`)
3. checkmarks in feature lists and chips
4. the top rule on numbered process steps (`.proc`)
5. the active slider dot (`.rail-dots .is-active`)
6. marquee band bullets (`.band__item i`)

Headings, stat numbers, and buttons stay black/white deliberately. Lime is never
used for body text — at these values it fails contrast on white.

**CTAs** — one pair site-wide: **Book Discovery Call** (primary, solid, carries
the Google Meet mark on the left) and **Contact Us** (secondary, outline, arrow
right). The Meet mark is inline SVG with class `.ico-meet`; `.btn svg` sizing is
overridden for it so the logo keeps its 87.5×72 ratio and doesn't inherit the
arrow's hover nudge.

**Shape** — `--r-card: 20px`, `--r-panel: 16px`, `--r-sm: 10px`, pills at `999px`.

**Space** — three stepped tokens, set in media queries rather than `clamp()`:

| Token | Desktop | Tablet (≤1023) | Mobile (≤767) |
| --- | --- | --- | --- |
| `--margin` — page edge to content | 80px | 40px | 20px |
| `--gutter` — gap between columns | 28px | 20px | 12px |
| `--section` — space between sections | 100px | 72px | 56px |

The content frame is `width: min(var(--container), 100% - var(--margin) * 2)`
with `--container: 1280px`. `.header__inner` uses the same expression, so the
nav pill and the page content share one max-width and their edges line up.

**Nav** — About · Services ▾ · Our Works ▾, at 16px in `#222222`. Home is
reached through the logo, Contact through the Book Discovery Call button.
`.header__inner` is a `1fr auto 1fr` grid with 14px/16px padding, so the nav
stays optically centred whatever the logo and button widths do.

Both dropdowns list the three services; "Our Works" items deep-link to
`portfolio.html#<service>`, and `main.js` reads that hash to preselect the
matching filter. CSS drives the menus on hover/focus; the JS adds click and
Escape handling so they work on touch, where `:hover` never resolves.

**Logo** — four SVGs in `assets/img/`. The symbol is a 181 × 65 artboard
(2.7846:1); the three wordmarks are 369 × 84 (4.3929:1).

| File | Fill | Used on |
| --- | --- | --- |
| `logo-symbol.svg` | black + lime dot | **header** — 40px desktop / 36px tablet / 32px mobile |
| `logo-white.svg` | white | footer, 40px tall |
| `logo-black.svg` | black | unused wordmark |
| `logo-default.svg` | `#9FE815` | unused lime wordmark |

Always sized by height with `width: auto`, so the ratio stays locked.

There is no white version of the symbol, so the footer keeps the white
**wordmark** — the symbol's black fill would disappear on the dark panel.

**Contact** — `kajalandani.co@gmail.com` is the only contact point. There is no
phone number and no WhatsApp link anywhere on the site.

---

## Interactions (`assets/js/main.js`)

Scroll reveals · seamless marquees (track content is duplicated at runtime) ·
work-rail dot pagination · portfolio filters · one-open-at-a-time accordions ·
mobile sheet nav · sticky header shrink · year stamp.

All animation respects `prefers-reduced-motion`.

---

## Placeholder content

Anything still needing real client data carries the `.placeholder` class and
renders with a dotted underline. Counts as built: portfolio 41, home 33,
about 10, contact 7, services 6.

**Delete the single `.placeholder` rule in `style.css` to switch the markers off.**

See `CONTENT-TO-REPLACE.md` for the fill-in sheet.

---

## Before launch

- [ ] **Fill in the case studies.** All six slots are empty scaffolding — no invented client names remain.
- [ ] **Point the Book Discovery Call CTAs at a real booking link** (Google Calendar / Cal.com). They currently go to the contact form.
- [ ] **Add the LinkedIn URL** — the only contact placeholder left.
- [ ] **Confirm the pricing floor, start window, and minimum ad spend** left open in the FAQs.
- [ ] **Confirm team surnames** and swap the initials blocks for real photos.
- [ ] **Add client logos** — the trust marquee runs seven mock marks (Northwind, Vertex, Lumen, Arcadia, Meridian, Cobalt, Quill). They are invented placeholders, not real clients. The portfolio logo wall still repeats a "Client Logo" chip.
- [ ] **Add project imagery.** `.work-card__media` takes an `<img>` with no layout change; the CSS grid artwork is a stand-in.
- [ ] **Add hero collage imagery.** `.tile` elements are CSS-drawn stand-ins for real screenshots.
- [ ] **Wire the forms.** Front-end only — they submit nowhere.
- [ ] Update the announcement bar month (home only), or delete the `.announce` block.
- [ ] Add `/privacy` and `/terms`, currently linked as `#`.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` from all five pages.

## Folded in, not standalone

The copy deck specifies routes that live inside the five pages rather than on
their own: `/faq` (home + services), `/clients` (portfolio), `/how-we-work`
(home + contact), `/audit` (contact), `/workshop` (about), plus `/insights`,
the four service spoke pages, and the utility pages.
