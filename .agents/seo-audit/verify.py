#!/usr/bin/env python3
"""SEO regression checks for the Kajal & Co. static site.

Run from the repo root, after `node build.js`:

    python3 -I .agents/seo-audit/verify.py

Stdlib only. Exits 1 if any check fails. Each check maps to a finding ID in
.agents/seo-audit/AUDIT-2026-10-16.md.
"""
import glob
import html
import json
import os
import re
import sys
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

PAGES = sorted(glob.glob('*.html') + glob.glob('work/*.html'))
fails = []


def fail(check, msg):
    fails.append(f'[{check}] {msg}')


def read(path):
    with open(path, encoding='utf8') as fh:
        return fh.read()


# SEO-01  every internal href/src resolves to a file in the repo
checked = 0
for f in PAGES:
    s = read(f)
    base = os.path.dirname(f)
    for m in re.finditer(r'(?:href|src)="([^"#?]+)', s):
        u = m.group(1)
        if re.match(r'(https?:|mailto:|tel:|data:|javascript:)', u) or u.startswith('//'):
            continue
        p = u.lstrip('/') if u.startswith('/') else os.path.normpath(os.path.join(base, u))
        if p in ('', '.'):
            p = 'index.html'
        if os.path.isdir(p):
            p = os.path.join(p, 'index.html')
        checked += 1
        if not os.path.exists(unquote(p)):
            fail('SEO-01', f'{f}: broken internal reference {u}')

# SEO-03  redundant nav/form label is gone
for f in PAGES:
    if 'SEO Search Engine Optimization' in read(f):
        fail('SEO-03', f'{f}: still contains "SEO Search Engine Optimization"')

# SEO-04  nothing links to /index.html (canonical is "/")
for f in PAGES:
    if re.search(r'href="(?:\.\./)?index\.html"', read(f)):
        fail('SEO-04', f'{f}: links to index.html; use "./" or "../"')

# SEO-05  sitemap has no fake lastmod/priority, and lists every page on disk
sm = read('sitemap.xml')
if re.search(r'<lastmod>|<priority>', sm):
    fail('SEO-05', 'sitemap.xml carries <lastmod>/<priority>; only add lastmod with a true date')
locs = set(re.findall(r'<loc>https://kajalandani\.co/([^<]*)</loc>', sm))
for f in glob.glob('work/*.html'):
    if f.replace(os.sep, '/') not in locs:
        fail('SEO-05', f'{f} is missing from sitemap.xml')

# SEO-06  case-study titles <= 60 chars, descriptions <= 160
for f in sorted(glob.glob('work/*.html')):
    s = read(f)
    t = html.unescape(re.search(r'<title>(.*?)</title>', s).group(1))
    d = html.unescape(re.search(r'name="description" content="([^"]*)"', s).group(1))
    if len(t) > 60:
        fail('SEO-06', f'{f}: title is {len(t)} chars: {t}')
    if len(d) > 160:
        fail('SEO-06', f'{f}: description is {len(d)} chars')

# SEO-07  robots.txt advertises only what is actually served
rb = read('robots.txt')
for gone in ('/case-studies/', '/tools/', '/content/'):
    if gone in rb:
        fail('SEO-07', f'robots.txt still names {gone}, which is not deployed')
if 'Sitemap: https://kajalandani.co/sitemap.xml' not in rb:
    fail('SEO-07', 'robots.txt lost its Sitemap line')

# SEO-08  every JSON-LD block parses; required entity pages carry the right type
ld_types = {}
for f in PAGES:
    types = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', read(f), re.S):
        try:
            types.append(json.loads(m.group(1)).get('@type'))
        except Exception as e:
            fail('SEO-08', f'{f}: invalid JSON-LD ({e})')
    ld_types[f] = types
for page, want in (('index.html', 'ProfessionalService'), ('about.html', 'Person'),
                   ('seo.html', 'Service'), ('website-design.html', 'Service'),
                   ('performance-marketing.html', 'Service')):
    if want not in ld_types.get(page, []):
        fail('SEO-08', f'{page}: missing {want} JSON-LD')
for f in glob.glob('work/*.html'):
    if 'BreadcrumbList' not in ld_types.get(f, []):
        fail('SEO-08', f'{f}: missing BreadcrumbList JSON-LD')

# SEO-02  production-host safety: noindex must be host-scoped, never global
vj = json.loads(read('vercel.json'))
robots_rules = [h for h in vj.get('headers', [])
                if any(k.get('key', '').lower() == 'x-robots-tag' for k in h.get('headers', []))]
for h in robots_rules:
    if not any(c.get('type') == 'host' for c in h.get('has', [])):
        fail('SEO-02', 'X-Robots-Tag rule in vercel.json is not host-scoped; it would deindex production')
for f in PAGES:
    if re.search(r'<meta name="robots"[^>]*noindex', read(f)) and f != '404.html':
        fail('SEO-02', f'{f}: page-level noindex; only 404.html may carry one')

print(f'{len(PAGES)} pages, {checked} internal references checked')
if fails:
    print(f'{len(fails)} problem(s):')
    for line in fails:
        print('  ' + line)
    sys.exit(1)
print('all checks passed')
