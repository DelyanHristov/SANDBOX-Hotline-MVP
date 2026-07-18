import re

# Combining marks (harakat) and other diacritics we strip before matching.
DIACRITICS = re.compile(r"[ؐ-ًؚ-ٟۖ-ۭ]")
TATWEEL = "ـ"


def normalize_arabic(text: str) -> str:
    if not text:
        return text
    result = text.replace(TATWEEL, "")
    result = DIACRITICS.sub("", result)
    result = re.sub(r"[آأإ]", "ا", result)  # unify alef variants
    result = re.sub(r"ى", "ي", result)               # alef maqsura -> ya
    result = re.sub(r"(.)\1{2,}", r"\1\1", result)             # collapse elongated letters
    result = re.sub(r"\s+", " ", result).strip()
    return result
