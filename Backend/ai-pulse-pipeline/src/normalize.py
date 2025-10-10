# -*- coding: utf-8 -*-
import re
_DIAC = re.compile(r"[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]")
_TATWEEL = "\u0640"
def normalize_arabic(text: str) -> str:
    if not text:
        return text
    t = text.replace(_TATWEEL, "")
    t = _DIAC.sub("", t)
    t = re.sub(r"[\u0622\u0623\u0625]", "\u0627", t)  # ALEF variants -> ا
    t = re.sub(r"\u0649", "\u064A", t)                # ى -> ي
    t = re.sub(r"(.)\1{2,}", r"\1\1", t)              # collapse elongations
    t = re.sub(r"\s+", " ", t).strip()
    return t
