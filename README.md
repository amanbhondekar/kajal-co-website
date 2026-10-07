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
├── index.html                   # Home
├── about.html                   # Story, principles, team, press, workshop
├── services.html                # Overview of all three services
├── website-design.html          # Service page
├── performance-marketing.html   # Service page
├── seo.html                     # Service page
├── portfolio.html               # Case-study grid with service filters (generated)
├── contact.html                 # Contact + discovery call
├── build.js                     # Case-study generator — see below
├── data/
│   └── projects.json            # Every case study, as content
├── templates/
│   ├── case-website-design.html         # One template per service
│   ├── case-seo.html
│   ├── case-performance-marketing.html
│   └── partials/                # Shared chrome + shared case-study blocks
├── work/                        # 18 generated case-study pages
└── assets/
    ├── css/style.css            # Tokens + all components
    ├── js/main.js               # Interactions
    └── img/                     # Logos + collateral icons
```

---

## Case studies

Case studies are generated, not hand-written. One content file drives three
service templates:

```
data/projects.json  +  templates/*.html   ->   work/<slug>.html
                                          ->   the card grid in portfolio.html
                                          ->   the featured rail in index.html
```

To add, edit or remove a project: change `data/projects.json`, then run

```bash
node build.js
```

Nothing else needs touching. The generator writes a page per project, refreshes
the portfolio grid and the home-page rail, and deletes the page of any project
you removed. Netlify runs the same command on deploy, so a push that edits the
content file but forgets the build still ships correctly.

**The three templates are deliberately separate.** Each follows its own
narrative from the case-study framework, and they do not share section order:

| Service | Narrative | Balance |
| --- | --- | --- |
| Website Design | Challenge → Strategy → Experience → Design system → Implementation → Results → Showcase | 60% visual |
| SEO | Challenge → Strategy → What changed → Search growth → Business impact → Results | 30% visual |
| Performance Marketing | Challenge → Campaign strategy → Execution → Optimisation → Before/after → Business result → Results | 40% visual |

Every section is conditional on its data. A project with no design-system work
simply has no `designSystem` key, and that section does not render — rather
than rendering empty. This is how the framework's "remove sections that have no
meaningful information" rule is enforced in practice.

`build.js` carries a ~70-line mustache-shaped template engine and no
dependencies. It validates the content file first: an unknown service or a
duplicate slug fails the build with a message rather than producing a broken
page.

Copy in `projects.json` is written as HTML, so it can carry entities
(`&times;`, `&#8377;`). Page titles and meta descriptions are converted to
plain text first, so they do not publish a literal `&amp;times;`.

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

**One accent** — `#742aff` purple, on every surface. `--accent` and
`--on-accent` (white) travel together, so text on an accent fill stays legible
without per-surface variants. There is no lime anywhere in the stylesheet.

The accent is used in seven places only, so it stays an accent rather than a
second brand colour:

1. step / phase badges (`.badge`)
2. the hero badge chip (`.hero__badge i`)
3. checkmarks in feature lists and chips
4. the top rule on numbered process steps (`.proc`)
5. the active slider dot (`.rail-dots .is-active`)
6. the pre-footer marquee band field (`.band--accent`)
7. the two-tone heading half (`.hl`), italic

Headings, stat numbers and buttons stay black/white deliberately.

**Contrast:** purple on white is about 6:1 and passes AA for any size. Purple
on the near-black sections is about 3.3:1 — fine for the large bold `.hl`
headings it is used on, but it should not be used for body text on dark.

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

**Logo** — five SVGs in `assets/img/`.

| File | Artboard | Used on |
| --- | --- | --- |
| `logo-bold.svg` | 188 × 44 (4.2727:1), purple | **header** — 32px tall at every breakpoint |
| `logo-white.svg` | 369 × 84 (4.3929:1), white | footer, 40px tall |
| `logo-black.svg` | 369 × 84, black | unused |
| `logo-default.svg` | 369 × 84, lime | unused |
| `logo-symbol.svg` | 181 × 65, black + lime dot | unused |

Always sized by height with `width: auto`, so the ratio stays locked.
`.brand img` also sets `max-width: none` — the global `img { max-width: 100% }`
cap would otherwise squash the mark whenever its grid track is narrower than
its natural width, which is what happened at mobile widths.

**Collateral icons** — `icon-1` … `icon-4` sit on the four "How we work"
cards. They run a purple-to-white gradient, so `.svc-card__icon` is a dark
tile; on a light fill the white end of the gradient disappears.

**Contact** — `kajalandani.co@gmail.com` is the only contact point. There is no
phone number and no WhatsApp link anywhere on the site.

---

## Interactions (`assets/js/main.js`)

Scroll reveals · seamless marquees (track content is duplicated at runtime) ·
work-rail dot pagination · portfolio filters · one-open-at-a-time accordions ·
mobile sheet nav · sticky header shrink · year stamp.

All animation respects `prefers-reduced-motion`.

---

## Mock content

There are **no placeholder markers left** — every slot is filled so the site
reads as finished. That means nothing on the page tells you what is real.

**`CONTENT-TO-REPLACE.md` is the only record of what is invented**, and almost
all of the proof is: eighteen case studies, three testimonials, seven client
logos, every headline number, the pricing, and two of the three team bios.
Read it before showing this to anyone.

The case-study copy all lives in `data/projects.json`, which is the one file to
work through when real client data arrives.

The site is currently indexable, so those invented claims are crawlable.

---

## Before launch

- [ ] **Replace every invented claim** listed in `CONTENT-TO-REPLACE.md`, or cut the sections that carry them.
- [ ] **Write real Privacy Policy and Terms pages.** Both link to `#`; no legal copy has been drafted, deliberately.
- [ ] **Point the Book Discovery Call CTAs at a real booking link** (Google Calendar / Cal.com). They currently go to the contact form.
- [ ] **Add the real Instagram and LinkedIn URLs** — both are `#`.
- [ ] **Swap the initials blocks for real photos** — founder on home, three on about.
- [ ] **Add project imagery.** `.work-card__media` takes an `<img>` with no layout change; the CSS grid artwork is a stand-in. On case-study pages the same applies to `.shot__frame` — every labelled grey panel is a slot waiting for a real screenshot.
- [ ] **Add hero collage imagery.** `.tile` elements are CSS-drawn stand-ins for real screenshots.
- [ ] **Wire the form.** Front-end only — it submits nowhere. Netlify Forms is not enabled on the project.
- [ ] Update the announcement bar month (home only), or delete the `.announce` block.
- [ ] Consider re-adding `noindex` until the mock content is replaced.

## Folded in, not standalone

The copy deck specifies routes that live inside the five pages rather than on
their own: `/faq` (home + services), `/clients` (portfolio), `/how-we-work`
(home + contact), `/audit` (contact), `/workshop` (about), plus `/insights`,
the four service spoke pages, and the utility pages.
