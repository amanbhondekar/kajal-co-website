#!/usr/bin/env node
/* ==========================================================================
   Kajal & Co. — case-study generator
   --------------------------------------------------------------------------
   data/projects.json  +  templates/*.html   ->   work/<slug>.html
                                             ->   the card grid in portfolio.html
                                             ->   the featured rail in index.html

   One content file, three service templates. Add or remove a project by
   editing data/projects.json and re-running `node build.js` — nothing else
   in the repo needs touching.

   No dependencies. Generated pages are committed, so the site still serves
   as plain static HTML whether or not this ever runs again.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TPL = path.join(ROOT, 'templates');
const OUT = path.join(ROOT, 'work');

/* The canonical host. Absolute URLs are required by canonical tags, Open
   Graph and the sitemap, so they all read it from here. */
const SITE = 'https://kajalandani.co';

/* --------------------------------------------------------------------------
   1. Template engine — mustache-shaped, ~70 lines, no dependency

   {{key}}            escaped value          {{{key}}}  raw value
   {{a.b}}            dotted path            {{> name}} include a partial
   {{! … }}           comment, dropped
   {{#key}}…{{/key}}  array: loop · truthy: render once · empty: skip
   {{^key}}…{{/key}}  render only when key is empty/false

   Inside a loop the item becomes the scope, `{{.}}` is the item itself,
   `{{_i}}` is its 1-based index and `{{_n}}` that index zero-padded. Lookups
   fall through to enclosing scopes, so {{client}} still resolves inside one.
   -------------------------------------------------------------------------- */

const partials = new Map();

function partial(name) {
  if (!partials.has(name)) {
    partials.set(name, fs.readFileSync(path.join(TPL, 'partials', name + '.html'), 'utf8'));
  }
  return partials.get(name);
}

const esc = v => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* walk the scope chain outward until the path resolves */
function lookup(stack, key) {
  if (key === '.') return stack[stack.length - 1];
  const parts = key.split('.');
  for (let i = stack.length - 1; i >= 0; i--) {
    let v = stack[i];
    if (v === null || typeof v !== 'object') continue;
    let ok = true;
    for (const p of parts) {
      if (v !== null && typeof v === 'object' && p in v) v = v[p];
      else { ok = false; break; }
    }
    if (ok) return v;
  }
  return undefined;
}

const empty = v =>
  v === undefined || v === null || v === false || v === '' ||
  (Array.isArray(v) && v.length === 0);

function render(tpl, stack) {
  tpl = tpl.replace(/\{\{!([\s\S]*?)\}\}/g, '');   // {{! template comment }}

  /* sections first: the regex is non-greedy but keyed on a matching close
     tag, so nesting works as long as a section is not reopened inside itself */
  const section = /\{\{([#^])\s*([\w.]+)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/;
  let m;
  while ((m = section.exec(tpl))) {
    const [all, kind, key, body] = m;
    const val = lookup(stack, key);
    let out = '';
    if (kind === '^') {
      if (empty(val)) out = render(body, stack);
    } else if (Array.isArray(val)) {
      out = val.map((item, i) => {
        let scope = item;
        if (typeof item === 'string' || typeof item === 'number') {
          scope = new String(item);
        }
        if (scope !== null && typeof scope === 'object') {
          scope = Object.assign(scope, { _i: i + 1, _n: String(i + 1).padStart(2, '0') });
        }
        return render(body, stack.concat([scope]));
      }).join('');
    } else if (!empty(val)) {
      out = render(body, stack.concat([val]));
    }
    tpl = tpl.slice(0, m.index) + out + tpl.slice(m.index + all.length);
  }

  return tpl
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => render(partial(n), stack))
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => {
      const v = lookup(stack, k);
      return empty(v) ? '' : String(v);
    })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
      const v = lookup(stack, k);
      return empty(v) ? '' : esc(v);
    });
}

/* --------------------------------------------------------------------------
   2. Content
   -------------------------------------------------------------------------- */

/* Copy in projects.json is written as HTML, so it can carry entities. A <title>
   or a meta description needs the character itself — pushing "&times;" through
   the escaper would publish a literal "&amp;times;". */
const ENTITIES = {
  '&amp;': '&', '&times;': '×', '&minus;': '−', '&mdash;': '—',
  '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&middot;': '·',
  '&rarr;': '→', '&hellip;': '…', '&nbsp;': ' ',
};
const text = s => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&[a-z]+;/gi, e => (e in ENTITIES ? ENTITIES[e] : e))
  .replace(/<[^>]+>/g, '');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
const { services, projects } = data;

const problems = [];
projects.forEach((p, i) => {
  if (!p.slug) problems.push(`project #${i + 1} has no slug`);
  if (!services[p.service]) problems.push(`${p.slug}: unknown service "${p.service}"`);
  if (!Array.isArray(p.meta) || p.meta.length !== 4) problems.push(p.slug + ": must contain EXACTLY 4 meta blocks (got " + (p.meta ? p.meta.length : 0) + ")");
  if (!Array.isArray(p.results) || p.results.length !== 3) problems.push(p.slug + ": must contain EXACTLY 3 result blocks (got " + (p.results ? p.results.length : 0) + ")");
  if (Array.isArray(p.showcase) && p.showcase.length > 3) problems.push(p.slug + ": showcase holds at most 3 blocks (got " + p.showcase.length + ")");
});
const slugs = projects.map(p => p.slug);
slugs.forEach((s, i) => {
  if (slugs.indexOf(s) !== i) problems.push(`duplicate slug "${s}"`);
});
if (problems.length) {
  console.error('data/projects.json:\n  ' + problems.join('\n  '));
  process.exit(1);
}

/* --------------------------------------------------------------------------
   3. Case-study pages
   -------------------------------------------------------------------------- */

fs.mkdirSync(OUT, { recursive: true });

/* prev/next walk the project's own service, so the pager stays on-topic */
const byService = {};
for (const p of projects) (byService[p.service] = byService[p.service] || []).push(p);

/* the pager names the neighbouring client — the headline is too long to sit
   in a card, and the client is what a reader is actually scanning for */
const pagerCard = p => (p ? { slug: p.slug, client: p.client, headline: p.headline } : null);

const written = new Set();

for (const p of projects) {
  const svc = services[p.service];
  const siblings = byService[p.service];
  const at = siblings.indexOf(p);

  // Enforce structural requirement: EXACTLY 4 blocks in project metadata
  const metaBlocks = (p.meta || []).slice(0, 4);
  if (metaBlocks.length !== 4) throw new Error(p.slug + " must have exactly 4 meta blocks!");

  const scope = Object.assign({}, p, {
    meta: metaBlocks,
    site: SITE,
    showcasePair: Array.isArray(p.showcase) && p.showcase.length > 0 && p.showcase.every(s => s.src),
    base: '../',
    serviceLabel: svc.label,
    serviceShort: svc.short || svc.label,
    serviceHref: svc.page,
    title: text(`${p.headline} | ${p.client} | Kajal & Co.`),
    description: text(p.statement),
    prev: pagerCard(siblings[at - 1]),
    next: pagerCard(siblings[at + 1]),
  });

  const html = render(fs.readFileSync(path.join(TPL, svc.template), 'utf8'), [scope]);
  const file = path.join(OUT, p.slug + '.html');
  fs.writeFileSync(file, html);
  written.add(p.slug + '.html');
  console.log('  work/' + p.slug + '.html');
}

/* sweep pages whose project was removed from the content file */
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.html') && !written.has(f)) {
    fs.unlinkSync(path.join(OUT, f));
    console.log('  removed work/' + f);
  }
}

/* --------------------------------------------------------------------------
   4. Card markup injected back into the hand-written pages

   Only the span between the two markers is replaced; everything around it
   stays exactly as authored.
   -------------------------------------------------------------------------- */

function inject(file, marker, markup) {
  const full = path.join(ROOT, file);
  const src = fs.readFileSync(full, 'utf8');
  const open = `<!-- build:${marker} -->`;
  const close = `<!-- /build:${marker} -->`;
  const a = src.indexOf(open);
  const b = src.indexOf(close);
  if (a === -1 || b === -1) {
    console.error(`${file}: missing <!-- build:${marker} --> markers`);
    process.exit(1);
  }
  const next = src.slice(0, a + open.length) + '\n' + markup + '\n' + src.slice(b);
  if (next !== src) fs.writeFileSync(full, next);
  console.log('  ' + file + ' (' + marker + ')');
}

/* The home rail pages one service at a time, so it carries three cards from
   each in service order. Featured projects lead, then the rest in file order. */
const RAIL_PER_SERVICE = 3;
const thin = Object.keys(services).filter(k => (byService[k] || []).length < RAIL_PER_SERVICE);
if (thin.length) {
  console.error(`index.html rail: ${thin.join(', ')} has fewer than ${RAIL_PER_SERVICE} projects`);
  process.exit(1);
}
const railCards = Object.keys(services).flatMap(key => {
  const of = byService[key];
  return of.filter(p => p.featured).concat(of.filter(p => !p.featured)).slice(0, RAIL_PER_SERVICE);
});

const cardTpl = fs.readFileSync(path.join(TPL, 'partials', 'work-card.html'), 'utf8');

const card = (p, base) => render(cardTpl, [Object.assign({}, p, {
  base,
  serviceLabel: services[p.service].label,
})]);

inject('portfolio.html', 'work-grid', projects.map(p => card(p, '')).join('\n'));
inject('index.html', 'work-rail', railCards.map(p => card(p, '')).join('\n'));

/* --------------------------------------------------------------------------
   5. sitemap.xml

   The hand-written pages are listed explicitly rather than globbed, so a
   stray .html in the root never reaches the sitemap. Case studies come from
   the content file, so adding a project adds its URL here too.
   -------------------------------------------------------------------------- */

const STATIC_PAGES = [
  ['', '1.0'],
  ['about.html', '0.8'],
  ['services.html', '0.8'],
  ['website-design.html', '0.8'],
  ['seo.html', '0.8'],
  ['performance-marketing.html', '0.8'],
  ['portfolio.html', '0.9'],
  ['contact.html', '0.7'],
  ['privacy-policy.html', '0.3'],
  ['terms-of-use.html', '0.3'],
  ['cookie-policy.html', '0.3'],
  ['disclaimer.html', '0.3'],
];

const absent = STATIC_PAGES
  .map(([page]) => page)
  .filter(page => page && !fs.existsSync(path.join(ROOT, page)));
if (absent.length) {
  console.error('sitemap: listed page does not exist: ' + absent.join(', '));
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const urlEntry = (loc, priority) => [
  '  <url>',
  '    <loc>' + SITE + '/' + loc + '</loc>',
  '    <lastmod>' + today + '</lastmod>',
  '    <priority>' + priority + '</priority>',
  '  </url>',
].join('\n');

const sitemapUrls = STATIC_PAGES.map(([page, priority]) => urlEntry(page, priority))
  .concat(projects.map(p => urlEntry('work/' + p.slug + '.html', '0.7')));

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapUrls.join('\n'),
  '</urlset>',
  '',
].join('\n'));
console.log('  sitemap.xml (' + sitemapUrls.length + ' urls)');

console.log(`\n${projects.length} projects across ${Object.keys(byService).length} services.`);
