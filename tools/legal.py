#!/usr/bin/env python3
"""
Kajal & Co. — legal pages
--------------------------------------------------------------------------
Builds privacy-policy.html, terms-of-use.html, cookie-policy.html and
disclaimer.html from one markdown source, so the four stay in the same voice
and the same shell as the rest of the site.

    python tools/legal.py <source.md>

The source is the drafting document supplied by the business. Section 5 of it
("Recommended Website Implementation") is guidance for us rather than page
copy, so it is not published.

Re-run it when the source changes. It rewrites the four pages outright, so do
not hand-edit them — edit the markdown and build again.
"""

import os
import re
import sys
import io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kajalandani.co'

# markdown H1 -> (output file, page title, meta description)
PAGES = {
    '1. Privacy Policy': (
        'privacy-policy.html', 'Privacy Policy',
        'What Kajal & Co. collects through this website, why, how long it is kept, '
        'and the choices available to you.'),
    '2. Terms of Use': (
        'terms-of-use.html', 'Terms of Use',
        'The terms that govern your access to and use of the Kajal & Co. website.'),
    '3. Cookie Policy': (
        'cookie-policy.html', 'Cookie Policy',
        'How Kajal & Co. may use cookies and similar technologies on this website, '
        'and how to manage them.'),
    '4. Disclaimer': (
        'disclaimer.html', 'Disclaimer',
        'Kajal & Co. makes no guarantee of specific marketing results. What the '
        'information on this website is, and is not.'),
}


def esc(text):
    """HTML-escape, then restore the inline markdown we support."""
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # the source marks a hard line break with a trailing backslash
    text = text.replace('\\', '')
    return text.replace("'", '&rsquo;')


def blocks(lines):
    """Yield ('h2'|'h3'|'p'|'ul', payload) for one document's lines."""
    buf, items = [], []

    def flush():
        if buf:
            yield ('p', ' '.join(buf))
            buf.clear()

    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()

        if line.startswith('### '):
            for b in flush():
                yield b
            if items:
                yield ('ul', list(items)); items.clear()
            yield ('h3', line[4:].strip())
        elif line.startswith('## '):
            for b in flush():
                yield b
            if items:
                yield ('ul', list(items)); items.clear()
            yield ('h2', line[3:].strip())
        elif line.startswith('-   ') or line.startswith('- '):
            for b in flush():
                yield b
            item = line.lstrip('- ').strip()
            # a wrapped bullet continues on the next indented line
            while i + 1 < len(lines) and lines[i + 1].startswith('    ') \
                    and not lines[i + 1].strip().startswith('-'):
                i += 1
                item += ' ' + lines[i].strip()
            items.append(item)
        elif not line:
            for b in flush():
                yield b
            if items:
                yield ('ul', list(items)); items.clear()
        else:
            if items:
                yield ('ul', list(items)); items.clear()
            buf.append(line)
        i += 1

    for b in flush():
        yield b
    if items:
        yield ('ul', list(items))


def body_html(lines):
    out, first_h2_dropped = [], False
    for kind, payload in blocks(lines):
        if kind == 'h2':
            # the source repeats the document title as its first H2; the page
            # already carries it as the H1
            if not first_h2_dropped:
                first_h2_dropped = True
                continue
            out.append('        <h2 class="h3">%s</h2>' % esc(payload))
        elif kind == 'h3':
            out.append('        <h3 class="h4">%s</h3>' % esc(payload))
        elif kind == 'ul':
            out.append('        <ul>')
            out += ['          <li>%s</li>' % esc(x) for x in payload]
            out.append('        </ul>')
        else:
            out.append('        <p>%s</p>' % esc(payload))
    return '\n'.join(out)


def shell():
    """Header, footer and script tag lifted from the live home page."""
    s = io.open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    header = s[s.index('<header class="header">'):s.index('</header>') + 9]
    footer = s[s.index('<footer class="footer'):s.index('</footer>') + 9]
    return header, footer


def page_html(fname, title, desc, updated, body):
    url = SITE + '/' + fname
    header, footer = shell()
    return '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Kajal &amp; Co.</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title} | Kajal &amp; Co.">
<meta property="og:description" content="{desc}">
<meta property="og:site_name" content="Kajal &amp; Co.">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title} | Kajal &amp; Co.">
<meta name="twitter:description" content="{desc}">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta name="theme-color" content="#742aff">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>

{header}

<main id="main">
<section class="section legal-page">
  <div class="container">
    <div class="legal">
      <span class="eyebrow">Legal</span>
      <h1 class="h2">{title}</h1>
      <p class="legal__meta">Last updated {updated}</p>
      <div class="legal__body">
{body}
      </div>
    </div>
  </div>
</section>
</main>

{footer}

<script src="assets/js/main.js"></script>
</body>
</html>
'''.format(title=title, desc=desc.replace('&', '&amp;'), url=url,
           header=header, footer=footer, updated=updated, body=body)


def main():
    if len(sys.argv) != 2:
        sys.exit('usage: python tools/legal.py <source.md>')
    src = sys.argv[1]
    if not os.path.exists(src):
        sys.exit('source not found: ' + src)
    text = io.open(src, encoding='utf-8').read()

    m = re.search(r'\*\*Last updated:\*\*\s*(.+)', text)
    updated = m.group(1).strip() if m else ''
    if not updated:
        sys.exit('source has no "Last updated:" line')

    # split on top-level H1s, keeping their titles
    parts = re.split(r'^# (.+)$', text, flags=re.M)[1:]
    sections = dict(zip(parts[0::2], parts[1::2]))

    missing = [k for k in PAGES if k not in sections]
    if missing:
        sys.exit('source is missing: ' + ', '.join(missing))

    for key, (fname, title, desc) in PAGES.items():
        lines = [ln.rstrip() for ln in sections[key].split('\n')]
        # drop the horizontal rules the source uses between documents
        lines = [ln for ln in lines if not set(ln.strip()) <= {'-'} or not ln.strip()]
        html = page_html(fname, title, desc, updated, body_html(lines))
        io.open(os.path.join(ROOT, fname), 'w', encoding='utf-8', newline='\n').write(html)
        print('  %-22s %5d chars   %s' % (fname, len(html), title))

    print('\n%d legal pages, last updated %s' % (len(PAGES), updated))
    print('Run `node build.js` to refresh the sitemap.')


if __name__ == '__main__':
    main()
