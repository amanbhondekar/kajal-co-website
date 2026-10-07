# Content that is still invented

The site now carries **no visible placeholder markers** — every slot is filled
with mock copy so it reads as a finished page. That makes this file the only
record of what is real and what is not.

**Everything listed below is invented.** None of it should survive a public
launch, and right now the site is indexable.

---

## 1. Case studies — all eighteen are fictional

Clients, metrics, quotes and attributions were written to be plausible, not
true. They live in **`data/projects.json`**, which is the single file to work
through when real client data arrives. Each project also has a full case-study
page under `work/`, generated from that file.

The framework this follows is explicit that metrics must never be invented.
These are, so every one of them is a blocker rather than a nice-to-fix.

### Website Design

| # | Client | Metric claimed | Quote attributed to |
| --- | --- | --- | --- |
| 1 | Aarna Jewels | Enquiries up 3.2× in 90 days | Priya Nair, Founder |
| 2 | Studio Mehr | Project enquiries up 2.4× | Imran Qureshi, Principal |
| 3 | Tamara Living | Add-to-cart rate up 2.1× | Meera Iyer, Head of Retail |
| 4 | Sahana Academy | Course applications up 2.8× | Nikhil Raman, Director |
| 5 | Kavi Press | Direct sales up 3.4× | Aditi Banerjee, Publisher |
| 6 | Orva Clinics | Online bookings up 4.3× | Dr. Leela Nambiar, Medical Director |

### SEO

| # | Client | Metric claimed | Quote attributed to |
| --- | --- | --- | --- |
| 7 | Northline Interiors | Organic enquiries up 4.1× | Rohan Mehta, Director |
| 8 | Kesari Foods | Non-brand traffic up 5.8× | Divya Shah, Growth Lead |
| 9 | Brij Legal | Consultations up 3.3× from search | Sanjay Puri, Managing Partner |
| 10 | Udaan Travel | Organic bookings up 3.9× | Farhan Sheikh, Founder |
| 11 | Nilaya Homes | Site visits up 4.6× | Anjali Deshpande, Marketing Head |
| 12 | Serai Hotels | Direct bookings up 2.9× | Ritu Malhotra, Commercial Director |

### Performance Marketing

| # | Client | Metric claimed | Quote attributed to |
| --- | --- | --- | --- |
| 13 | Veda Wellness | ROAS 4.6× on a doubled budget | Ananya Rao, Co-founder |
| 14 | Lumen Dental | ₹640 cost per booked consult | Dr. Sameer Joshi, Founder |
| 15 | Zafran Kitchens | Cost per qualified lead −56% | Vikram Shetty, Director |
| 16 | Mira Skincare | Repeat-purchase revenue up 3.1× | Tanvi Kulkarni, Founder |
| 17 | Arka Finserv | Cost per approved application −44% | Deepak Menon, Growth Head |
| 18 | Patang Toys | Peak-season ROAS 1.9× → 5.2× | Nandini Rao, Co-founder |

Beyond the headline metric, every case-study page also invents: the full
before/after tables, the search-growth figures, the keyword ranking tables, the
project detail blocks (platform, timeline, market), and the narrative of what
was done. Treat the whole of `data/projects.json` as unverified.

The first three (Aarna Jewels, Northline Interiors, Veda Wellness) are flagged
`"featured": true` and so also appear on the home-page rail.

## 2. Case-study imagery — every visual is a placeholder

Each `.shot__frame` renders a labelled grey panel where a screenshot, chart or
creative should be. The labels describe what belongs there ("Homepage —
desktop", "Blended ROAS — weekly"). There are roughly 90 of these across the
eighteen pages.

The SEO pages in particular lean on charts the framework expects to be real
evidence. The growth bars currently render from `beforePct` / `afterPct`
numbers written by hand in the content file.

## 3. Testimonials — three, all fictional

Reuse the names from Aarna Jewels, Northline Interiors and Veda Wellness. Same
warning: fabricated quotes attributed to fabricated people.

## 4. Client logo marquee — now real ✅

The seven invented brands (Northwind, Vertex, Lumen, Arcadia, Meridian,
Cobalt, Quill) have been replaced with eight supplied client marks: HP,
Hostinger, OneCard, Kommo, Superprofile, AiSensy, BriskPe and CreatorX.

They live in `assets/img/logos/` and appear in two places — the home-page
trust strip and the portfolio logo wall. **This is the one item on this list
that is no longer a launch blocker.**

Two things still worth settling:

- The home-page heading reads **"Brands I've Worked With"** (first person)
  while the portfolio says "The brands we work with" and the rest of the site
  uses "we". Pick one voice.
- Confirm you have permission to display each of these marks. Using a client
  logo as a credential is normal practice, but some contracts require sign-off
  and HP in particular has published brand-usage terms.

The press strip on the about page (Mid-Day, YourStory) is still invented and
still text stand-ins, not real marks.

## 5. Numbers quoted as fact

- `₹1 Cr+` revenue generated — hero, founder graphic
- `60+` brands — hero, trust strip
- `400+` people trained — about page
- `38` sites shipped, median load `1.8s` — website design page
- `₹68 lakh` tracked paid revenue — performance marketing page
- `37K+` Instagram followers — founder graphic
- Press logos: Mid-Day, YourStory

> **Conflict to resolve.** The supplied `about-graphic.webp` says
> **20+ trusted brands**, but the hero stat and the trust strip both say
> **60+ brands** — and they appear on the same page. One of the two is wrong.
> The graphic is baked artwork, so fixing it means a re-export.

## 6. Pricing and commitments

- Websites from ₹1,20,000
- Retainers from ₹45,000 / month
- Suggested ad budget floor ₹75,000 / month
- Start window 1–2 weeks; websites 4–8 weeks
- Reply within two working days

## 7. People

- Kajal Andani — real; her founder story paragraphs are invented
- Harsh Vora (SEO) — surname and bio invented
- Aman Shetty (Website Design) — surname and bio invented
- Kajal's portrait is an initials block; swap for a real image at
  `.founder__photo` on the home page and `.person__photo` on about

## 8. Dead links

These render normally but go nowhere (`href="#"`):

- Instagram, LinkedIn
- Privacy Policy, Terms of Use — **no legal pages exist.** I did not invent
  legal copy; these need writing properly before launch.

The "Read the case study" links now all resolve — to the generated pages above,
which carry the invented content.

## 9. Canonical URL

`templates/partials/head.html` sets `rel="canonical"` to
`https://kajalandani.co/work/<slug>.html`. **Change that domain** before
launch, or the canonical tags point somewhere the site does not live.

---

## Before this goes public

- [ ] Replace every project in `data/projects.json` with real client data, or cut the ones you cannot evidence
- [ ] Supply real imagery for the `.shot__frame` placeholders, or delete the sections that only hold them
- [ ] Set the real domain in `templates/partials/head.html`, then re-run `node build.js`
- [ ] Write real Privacy Policy and Terms pages
- [ ] Point the Book Discovery Call CTAs at a real booking link
- [ ] Wire the form — it currently posts nowhere
- [ ] Consider re-adding `noindex` until the mock content is gone
