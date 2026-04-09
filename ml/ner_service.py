from fastapi import FastAPI
import spacy

app = FastAPI()

# Use better model (install en_core_web_trf if possible)
nlp = spacy.load("en_core_web_sm")

@app.get("/extract-location")
def extract_location(text: str):
    doc = nlp(text)

    locations = []

    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC", "FAC"]:  
            # FAC = facilities (roads, buildings, stations)
            locations.append(ent.text)

    # If multiple, combine intelligently
    if len(locations) >= 2:
        combined = ", ".join(locations)
        return {"location": combined}

    if len(locations) == 1:
        return {"location": locations[0]}

    return {"location": None}