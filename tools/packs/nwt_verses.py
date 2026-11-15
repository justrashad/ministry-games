"""Prints the New World Translation text (English and Spanish) behind every clue and statement.

usage: nwt_verses.py <en.json> <es.json> <out.txt>
Chapters are cached under /tmp/nwt_cache.
"""
import html
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request

BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
         "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
         "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
         "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
         "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
         "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
         "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
         "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
         "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
CACHE = "/tmp/nwt_cache"


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slug(name: str) -> str:
    return strip_accents(name).lower().replace(" ", "-")


def parse(ref: str):
    """'Exodus 4:14-16; 7:1, 2' -> [(book, chapter, [verses])]"""
    out, book = [], None
    for part in [p.strip() for p in ref.split(";") if p.strip()]:
        m = re.match(r"^(.*?)\s*(\d+):(.+)$", part)
        if not m:
            raise ValueError(ref)
        if m.group(1):
            book = m.group(1).strip()
        verses = []
        for chunk in m.group(3).split(","):
            chunk = chunk.strip()
            if "-" in chunk:
                a, b = chunk.split("-")
                verses.extend(range(int(a), int(b) + 1))
            else:
                verses.append(int(chunk))
        out.append((book, int(m.group(2)), verses))
    return out


def fetch(url: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, re.sub(r"[^a-z0-9]+", "_", url.lower()) + ".html")
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            body = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
            open(path, "w", encoding="utf-8").write(body)
            time.sleep(0.4)
            return body
        except Exception as exc:  # noqa: BLE001
            err = exc
            time.sleep(2)
    raise RuntimeError(f"{url}: {err}")


def verse_text(page: str, book_no: int, chap: int, verse: int) -> str:
    vid = f"v{book_no}{chap:03d}{verse:03d}"
    m = re.search(r'<span class="verse" id="' + vid + r'">(.*?)</span>\s*</span>\s*(?=<span class="verse"|</p>|<p|$)',
                  page, re.S)
    if not m:
        i = page.find(f'id="{vid}"')
        if i < 0:
            return "(VERSE NOT FOUND)"
        frag = page[i:i + 4000]
        frag = frag[:frag.find('<span class="verse"', 10)] if '<span class="verse"' in frag[10:] else frag
        raw = frag
    else:
        raw = m.group(1)
    raw = re.sub(r'<sup class="verseNum">.*?</sup>', "", raw, flags=re.S)
    raw = re.sub(r'<a class="(?:xrefLink|footnoteLink)[^"]*"[^>]*>.*?</a>', "", raw, flags=re.S)
    raw = re.sub(r"<[^>]+>", "", raw)
    text = html.unescape(raw).replace("·", "").replace("ʹ", "")
    return re.sub(r"\s+", " ", text).strip().lstrip('id="').strip()


def lines_for(ref: str, lang: str, en_ref: str):
    out = []
    en_parts = parse(en_ref)
    parts = parse(ref) if lang == "es" else en_parts
    for (book, chap, verses), (en_book, _, _) in zip(parts, en_parts):
        book_no = BOOKS.index(en_book) + 1
        if lang == "en":
            url = f"https://www.jw.org/en/library/bible/nwt/books/{slug(book)}/{chap}/"
        else:
            url = f"https://www.jw.org/es/biblioteca/biblia/nwt/libros/{slug(book)}/{chap}/"
        page = fetch(url)
        for v in verses:
            out.append(f"  {book} {chap}:{v}  {verse_text(page, book_no, chap, v)}")
    return out


def main() -> None:
    en = json.load(open(sys.argv[1], encoding="utf-8"))
    es = {i["id"]: i for i in json.load(open(sys.argv[2], encoding="utf-8"))}
    out = []
    for item in en:
        e = es[item["id"]]
        out.append("=" * 100)
        out.append(f"{item['id']}  [{item['reference'] or 'no reference'}]")
        for label, it in (("EN", item), ("ES", e)):
            if it["kind"] == "clue":
                out.append(f"  {label} CLUE: {it['prompt']}  ->  {it['answer']}  accept={it['accept']}")
            else:
                verdict = "TRUE" if it["isTrue"] else f"FALSE -> {it['correction']}"
                out.append(f"  {label} STATEMENT: {it['prompt']}  ->  {verdict}")
        if item["reference"]:
            out.append("  -- NWT English")
            out.extend(lines_for(item["reference"], "en", item["reference"]))
            out.append("  -- NWT Español")
            out.extend(lines_for(e["reference"], "es", item["reference"]))
    open(sys.argv[3], "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("items", len(en))


if __name__ == "__main__":
    main()
