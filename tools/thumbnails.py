#!/usr/bin/env python3
"""
Kajal & Co. — project art pipeline
--------------------------------------------------------------------------
Visual Assets/  (design masters, gitignored)  ->  assets/img/work/  (served)

The masters are full-resolution exports — roughly 34MB in total, far past
what any slot on the site renders. This resamples them to the sizes the
pages actually use and writes webp, which is what gets committed.

    python tools/thumbnails.py

Then `node build.js` to regenerate the pages.

Needs Pillow (`pip install Pillow`) — the only thing in this repo that does,
which is why it sits here rather than in the build. The build itself stays
dependency-free, and re-running this is only necessary when a master changes.

Every source is listed explicitly below, so a renamed or missing export fails
loudly instead of quietly leaving the old art in place.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is not installed — run: pip install Pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'img', 'work')

THUMB_SRC = os.path.join(ROOT, 'Visual Assets', 'Projects Thumbnails')
SHOT_SRC = os.path.join(ROOT, 'Visual Assets', 'Project Visuals')

# Card and case-study hero art. "<service folder>/<name>" -> project slug.
THUMBS = {
    'Website Design/Aarshaveda':            'aarshaveda',
    'Website Design/Deage':                 'deage',
    'Website Design/MKPS & Associates':     'mkps-associates',
    'Website Design/Sacred Lotus Retreat':  'sacred-lotus-retreat',
    'Website Design/Shap Infotech':         'shap-infotech',
    'Website Design/Swastha Healthcare':    'swastha-healthcare',

    'SEO/Jungle World':                     'jungle-world-seo',
    'SEO/Blythe Living':                    'blythe-living-seo',
    'SEO/Little Mowgli Nursery':            'little-mowgli-nursery',
    'SEO/South Ribble Taxis':               'south-ribble-taxis',
    'SEO/Kishkin Digital':                  'kishkin-digital-seo',

    'Performance Marketing/Blythe Living':      'blythe-living-performance',
    'Performance Marketing/MD Cargo & Movers':  'md-cargo-movers',
    'Performance Marketing/4s Realty Ventures': '4s-realty-ventures',
    'Performance Marketing/Kishkin Digital':    'kishkin-performance',
    'Performance Marketing/AK Followers':       'ak-followers',
}
THUMB_WIDTH = 1600          # renders at most ~620 CSS px

# "The finished site" pair, for the Website Design case studies.
SHOTS = {
    'Project - Aarshaveda':           'aarshaveda',
    'Project - Deage':                'deage',
    'Project - MKPS & Associates':    'mkps-associates',
    'Project - Sacred Lotus Retreat': 'sacred-lotus-retreat',
    'Project - Shap Infotech':        'shap-infotech',
    'Project - Swastha Healthcare':   'swastha-healthcare',
}
# file stem -> (output suffix, width). The phone never renders wider than
# ~290 CSS px, so 720 is already past 2x.
SHOT_KINDS = {'Desktop': ('desktop', 1600), 'Mobile': ('mobile', 720)}

QUALITY = 82


def resolve(*parts, exts=('.webp', '.png', '.jpg', '.jpeg')):
    """First existing file matching the path with any of `exts`, else None."""
    base = os.path.join(*parts)
    for ext in exts:
        if os.path.exists(base + ext):
            return base + ext
    return None


def convert(src, dst, width):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    im = im.resize((width, round(h * width / w)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=QUALITY, method=6)
    return im.size, os.path.getsize(src), os.path.getsize(dst)


def main():
    jobs, missing = [], []

    for key, slug in THUMBS.items():
        src = resolve(THUMB_SRC, key + ' - Project Thumbnail', exts=('.webp', '.png', '.jpg'))
        if src:
            jobs.append((src, os.path.join(OUT, slug + '.webp'), THUMB_WIDTH))
        else:
            missing.append('Projects Thumbnails/' + key + ' - Project Thumbnail.*')

    for folder, slug in SHOTS.items():
        for stem, (suffix, width) in SHOT_KINDS.items():
            src = resolve(SHOT_SRC, folder, stem)
            if src:
                jobs.append((src, os.path.join(OUT, '%s-%s.webp' % (slug, suffix)), width))
            else:
                missing.append('Project Visuals/%s/%s.*' % (folder, stem))

    if missing:
        sys.exit('missing masters:\n  ' + '\n  '.join(sorted(missing)))

    os.makedirs(OUT, exist_ok=True)
    total_in = total_out = 0
    for src, dst, width in sorted(jobs, key=lambda j: j[1]):
        (w, h), a, b = convert(src, dst, width)
        total_in += a
        total_out += b
        print('%-34s %4dx%-5d %7.0fKB -> %5.0fKB' % (
            os.path.basename(dst), w, h, a / 1024, b / 1024))

    print('\n%d files  %.1fMB -> %.1fMB' % (len(jobs), total_in / 1048576, total_out / 1048576))
    print('\nShowcase images carry their dimensions in data/projects.json (w, h).')
    print('If an export changes aspect, update those too, then run: node build.js')


if __name__ == '__main__':
    main()
