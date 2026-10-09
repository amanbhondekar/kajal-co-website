# Content that is still unverified

The site carries **no visible placeholder markers** — every slot is filled so
it reads as finished. That makes this file the only record of what is sourced
and what is not.

The eighteen invented case studies this file used to list are **gone**. They
were replaced with sixteen real client engagements in `data/projects.json`,
and the fictional names (Aarna Jewels, Northline Interiors, Veda Wellness and
the rest) no longer appear anywhere in the HTML.

What follows is what has **not** been sourced yet.

---

## 1. Case studies — real ✅

Sixteen engagements across the three services: 6 website design,
5 performance marketing, 5 SEO. They live in `data/projects.json`, with
working notes in `case-studies/`, and generate the pages under `work/`.

Six are flagged `"featured": true` and appear in the home-page carousel —
two full slides of three, all six distinct clients.

**Still worth a pass:** the numbers in each case study came from the client
engagements, but only two SEO cases (Blythe Living, KishKin Digital) carry
GA4-verified figures. The rest lead with scope rather than outcome
("12 Months", "LocalBusiness schema", "3 Rooms"). That is honest, but it
means the portfolio shows comparatively little hard evidence of results.

## 2. Testimonials — real names, unverified quotes

Muhilan Nalarajah, Ajmal Najath, Saleem Nadaf, Ravi Ranjan, Shikha Agrawal,
Shubham Agrawal. Confirm each person is happy with the wording attributed to
them, and that they are content to be named publicly.

## 3. Client logo marquee — real ✅

HP, Hostinger, OneCard, Kommo, Superprofile, AiSensy, BriskPe, CreatorX, in
`assets/img/logos/`. Shown in the home trust strip and the portfolio wall.

**Open:** permission to display each mark. Using a client logo as a
credential is normal practice, but some contracts require sign-off and HP
publishes brand-usage terms.

## 4. Numbers quoted as fact — still unsourced

| Where | Claim |
| --- | --- |
| Home hero, founder graphic | `₹1 Cr+` client revenue |
| Home hero, trust strip | `60+` brands |
| About, home stats | `400+` people trained |
| `website-design.html`, `services.html` | `38` sites shipped, median load `1.8s` |
| `performance-marketing.html`, `services.html` | `₹68 lakh` tracked paid revenue |
| Founder graphic | `37K+` Instagram followers |

The SEO proof line on `seo.html` and `services.html` was the one fabricated
claim tied to a deleted client; it now quotes KishKin Digital's real GA4
figures instead. **The website-design and performance-marketing proof lines
above have had no such treatment and remain invented.**

> **Conflict still open.** `about-graphic.webp` says **20+ trusted brands**,
> while the hero stat and trust strip say **60+ brands**, on the same page.
> The graphic is baked artwork, so fixing it means a re-export.

## 5. Press — unverified

Mid-Day and YourStory appear as press logos on the about page. They are text
stand-ins, not real marks, and the coverage has not been linked.

## 6. Pricing and commitments

- Websites from ₹1,20,000
- Retainers from ₹45,000 / month
- Suggested ad budget floor ₹75,000 / month
- Start window 1–2 weeks; websites 4–8 weeks
- Reply within two working days

## 7. People

- Kajal Andani — real; the founder story paragraphs are still invented
- Harsh Vora (SEO) — surname and bio invented
- Aman Shetty (Website Design) — surname and bio invented
- Kajal's portrait is now the real photo, used for the favicon as well

## 8. Dead links

Four `href="#"` on each of index, about and contact:

- Instagram, LinkedIn
- Privacy Policy, Terms of Use — **no legal pages exist.** No legal copy has
  been drafted, deliberately.

## 9. Canonical URL

`templates/partials/head.html` sets `rel="canonical"` to
`https://kajalandani.co/work/<slug>.html`. **Confirm that domain** before
launch, then re-run `node build.js`, or every case-study page points its
canonical somewhere the site does not live.

## 10. Repo hygiene

`scratch/` and `case-studies/` are untracked and not in `.gitignore`. Netlify
publishes from the repo root, so committing them makes the working notes
publicly fetchable. Decide whether the markdown sources belong in the repo
before adding them.

---

## Before this goes public

- [ ] Source or cut the headline numbers in §4, including the two remaining invented proof lines
- [ ] Re-export `about-graphic.webp`, or change the hero stat, so 20+ and 60+ agree
- [ ] Confirm testimonial wording and naming with each person
- [ ] Confirm logo display permission, HP especially
- [ ] Replace or remove the Mid-Day / YourStory press strip
- [ ] Write real Privacy Policy and Terms pages
- [ ] Point the Book Discovery Call CTAs at a real booking link
- [ ] Add the real Instagram and LinkedIn URLs
- [ ] Set the real domain in `templates/partials/head.html`, then rebuild
- [ ] Wire the form — it currently posts nowhere
- [ ] Decide on `scratch/` and `case-studies/` before committing them
