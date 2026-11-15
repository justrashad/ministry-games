"""Checks one era file against the NWT (English and Spanish).

usage: python3 tools/packs/check.py era1 [report.txt]
Every item needs its check terms (or one of its answers) inside the cited verses, in both languages.
Writes the verse text for every item to the report for reading.
"""
import importlib, sys, unicodedata, re
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nwt_verses as N
from books import es_ref, fetch_ref

def norm(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]+', ' ', s.lower())

def verses(ref, lang):
    en = fetch_ref(ref)
    r = en if lang == 'en' else fetch_ref(es_ref(ref))
    return N.lines_for(r, lang, en)

def items(m):
    out = []
    for cat_en, cat_es, rows in m.THEO:
        for lv, qe, ae, xe, qs, as_, xs, ref, chk in rows:
            out.append(('theo', f'{cat_en} {lv}', qe, [ae]+xe, qs, [as_]+xs, ref, [chk] if chk else None, 'any'))
    for i, (qe, ae, xe, qs, as_, xs, ref, chk) in enumerate(m.THEO_FINALS):
        out.append(('theo', f'final {i}', qe, [ae]+xe, qs, [as_]+xs, ref, [chk] if chk else None, 'any'))
    for cat_en, cat_es, rows in m.KS:
        for lv, se, t, ce, ss, cs, ref, chk in rows:
            out.append(('ks', f'{cat_en} {lv}', se + (' [TRUE]' if t else ' [FALSE] ' + ce), [], ss + (' [V]' if t else ' [F] ' + cs), [], ref, [chk], 'any'))
    for i, (lv, subj, qe, ae, xe, qs, as_, xs, ref, chk) in enumerate(m.BABE):
        out.append(('babe', f'{lv}/{subj}/{i}', qe, [ae]+xe, qs, [as_]+xs, ref, [chk] if chk else None, 'any'))
    for i, (qe, ae, xe, qs, as_, xs, ref, chk) in enumerate(m.BABE_BONUS):
        out.append(('babe', f'bonus {i}', qe, [ae]+xe, qs, [as_]+xs, ref, [chk] if chk else None, 'any'))
    for i, (cat, qe, ae, qs, as_, ref, fl) in enumerate(m.MS):
        out.append(('ms', f'{i}', qe, ae, qs, as_, ref, fl.get('check'), 'all'))
    return out

def main():
    m = importlib.import_module(sys.argv[1])
    rep = []; bad = 0
    for game, key, qe, ae, qs, as_, ref, chk, mode in items(m):
        en = verses(ref, 'en'); es = verses(ref, 'es')
        strip = lambda ls: ' '.join(re.sub(r'^\s*\S.*?\d+:\d+\s\s', '', l) for l in ls)
        ten, tes = norm(strip(en)), norm(strip(es))
        probs = []
        if 'VERSE NOT FOUND' in ' '.join(en + es): probs.append('verse missing')
        if chk:
            for ce, cs in chk:
                if norm(ce) not in ten: probs.append(f'EN lacks "{ce}"')
                if norm(cs) not in tes: probs.append(f'ES lacks "{cs}"')
        else:
            def hit(ans, txt): return [a for a in ans if norm(a).strip() and re.search(r'\b' + re.escape(norm(a).strip()) + r'\b', txt)]
            if mode == 'all':
                for a in ae:
                    if not hit([a], ten): probs.append(f'EN lacks "{a}"')
                for a in as_:
                    if not hit([a], tes): probs.append(f'ES lacks "{a}"')
            else:
                if not hit(ae, ten): probs.append(f'EN lacks any of {ae}')
                if not hit(as_, tes): probs.append(f'ES lacks any of {as_}')
        if game == 'theo':
            if '"' in qe or '"' in qs or '“' in qs: probs.append('quote in clue')
            if len(qe) > 130 or len(qs) > 130: probs.append(f'too long {len(qe)}/{len(qs)}')
            if norm(ae[0]).strip() in norm(qe) or norm(as_[0]).strip() in norm(qs): probs.append('answer in prompt')
        bad += bool(probs)
        rep.append('=' * 90)
        rep.append(f'{game} {key} [{ref}] ' + ('PROBLEM: ' + '; '.join(probs) if probs else 'ok'))
        rep.append(f'  EN: {qe} -> {ae}'); rep.append(f'  ES: {qs} -> {as_}')
        rep += en + ['  --'] + es
    open(sys.argv[2] if len(sys.argv) > 2 else f'/tmp/{sys.argv[1]}_report.txt', 'w').write('\n'.join(rep) + '\n')
    print('items', len(items(m)), 'problems', bad)
    for i, l in enumerate(rep):
        if 'PROBLEM' in l: print(l)

main()
