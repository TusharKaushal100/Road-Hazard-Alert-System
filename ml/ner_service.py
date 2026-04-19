# ml/ner_service.py
# FastAPI service that uses spaCy to extract location names from text.
#
# HOW TO RUN:
#   pip install fastapi uvicorn spacy
#   python -m spacy download en_core_web_trf   # best accuracy (uses transformer)
#   python -m spacy download en_core_web_sm    # fallback if trf is too slow
#   uvicorn ner_service:app --port 8000
#
# The service tries the transformer model first, falls back to small model
# so it always starts even if en_core_web_trf is not installed.

from fastapi import FastAPI
import spacy
import re

app = FastAPI()

# Try to load the transformer model first (much better accuracy for mixed-language text).
# Fall back to the small model if it's not installed.
try:
    nlp = spacy.load("en_core_web_trf")
    print("NER: loaded en_core_web_trf (transformer model)")
except OSError:
    nlp = spacy.load("en_core_web_sm")
    print("NER: loaded en_core_web_sm (small model — run 'python -m spacy download en_core_web_trf' for better results)")


# Common Hindi/Hinglish words that spaCy sometimes tags as GPE by mistake.
# If the extracted location matches one of these, we reject it.
FALSE_POSITIVE_WORDS = {
    "aaj", "kal", "raat", "din", "subah", "shaam", "ek", "do", "teen",
    "koi", "kuch", "bahut", "wahan", "yahan", "idhar", "udhar", "abhi",
    "pehle", "baad", "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday", "january", "february", "march",
    "april", "may", "june", "july", "august", "september", "october",
    "november", "december", "india", "indian", "bharat",
}


def clean_location(text: str) -> str:
    """Remove noise from extracted location strings."""
    # Remove hashtags
    text = re.sub(r"#\S+", "", text)
    # Remove Hindi connecting words at the end
    text = re.sub(r"\s+(mein|pe|ka|ki|ke|aur|se|ko|tha|thi|the)\b.*", "", text, flags=re.IGNORECASE)
    # Remove leading/trailing punctuation and whitespace
    text = text.strip(" ,.-:")
    return text


@app.get("/extract-location")
def extract_location(text: str):
    doc = nlp(text)

    locations = []

    for ent in doc.ents:
        # GPE = cities, countries, states
        # LOC = natural locations (rivers, mountains)
        # FAC = facilities (roads, stations, bridges)
        if ent.label_ in ["GPE", "LOC", "FAC"]:
            cleaned = clean_location(ent.text)

            # Skip if it's a known false positive or too short
            if cleaned.lower() in FALSE_POSITIVE_WORDS:
                continue
            if len(cleaned) < 3:
                continue

            locations.append(cleaned)

    if not locations:
        return {"location": None}

    # If we found multiple locations, prefer the most specific one.
    # Heuristic: longer names are usually more specific (e.g. "North Lakhimpur" > "Assam")
    # But also deduplicate — if one name contains another, keep the longer one.
    locations = list(dict.fromkeys(locations))  # remove duplicates, preserve order

    best = max(locations, key=len)

    return {"location": best}