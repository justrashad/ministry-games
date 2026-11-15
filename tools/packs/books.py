"""English and Spanish (NWT) Bible book names, in order."""
BOOKS = [
 ("Genesis","Génesis"),("Exodus","Éxodo"),("Leviticus","Levítico"),("Numbers","Números"),("Deuteronomy","Deuteronomio"),
 ("Joshua","Josué"),("Judges","Jueces"),("Ruth","Rut"),("1 Samuel","1 Samuel"),("2 Samuel","2 Samuel"),("1 Kings","1 Reyes"),
 ("2 Kings","2 Reyes"),("1 Chronicles","1 Crónicas"),("2 Chronicles","2 Crónicas"),("Ezra","Esdras"),("Nehemiah","Nehemías"),
 ("Esther","Ester"),("Job","Job"),("Psalms","Salmos"),("Proverbs","Proverbios"),("Ecclesiastes","Eclesiastés"),
 ("Song of Solomon","El Cantar de los Cantares"),("Isaiah","Isaías"),("Jeremiah","Jeremías"),("Lamentations","Lamentaciones"),
 ("Ezekiel","Ezequiel"),("Daniel","Daniel"),("Hosea","Oseas"),("Joel","Joel"),("Amos","Amós"),("Obadiah","Abdías"),
 ("Jonah","Jonás"),("Micah","Miqueas"),("Nahum","Nahúm"),("Habakkuk","Habacuc"),("Zephaniah","Sofonías"),("Haggai","Ageo"),
 ("Zechariah","Zacarías"),("Malachi","Malaquías"),("Matthew","Mateo"),("Mark","Marcos"),("Luke","Lucas"),("John","Juan"),
 ("Acts","Hechos"),("Romans","Romanos"),("1 Corinthians","1 Corintios"),("2 Corinthians","2 Corintios"),("Galatians","Gálatas"),
 ("Ephesians","Efesios"),("Philippians","Filipenses"),("Colossians","Colosenses"),("1 Thessalonians","1 Tesalonicenses"),
 ("2 Thessalonians","2 Tesalonicenses"),("1 Timothy","1 Timoteo"),("2 Timothy","2 Timoteo"),("Titus","Tito"),("Philemon","Filemón"),
 ("Hebrews","Hebreos"),("James","Santiago"),("1 Peter","1 Pedro"),("2 Peter","2 Pedro"),("1 John","1 Juan"),("2 John","2 Juan"),
 ("3 John","3 Juan"),("Jude","Judas"),("Revelation","Apocalipsis"),
]
ONE_CHAPTER = {"Obadiah","Philemon","2 John","3 John","Jude"}
import re

def es_ref(ref: str) -> str:
    out = ref
    for en, es in sorted(BOOKS, key=lambda b: -len(b[0])):
        out = re.sub(r'(^|; )' + re.escape(en) + r'(?= \d)', lambda m: m.group(1) + es, out)
    return out

def fetch_ref(ref: str) -> str:
    """The NWT site lists one-chapter books as chapter 1."""
    for b in ONE_CHAPTER:
        ref = re.sub(r'(^|; )' + re.escape(b) + r' (\d+)(?=$|[;,-])', lambda m: f"{m.group(1)}{b} 1:{m.group(2)}", ref)
    return ref
