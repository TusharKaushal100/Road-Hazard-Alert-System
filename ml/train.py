# ml/train.py
# Run: python train.py --train
# Run: python train.py --serve

import sys
import re
import pickle
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline


# ── English augmentation data ─────────────────────────────────────
# The original dataset is Assam Hinglish only.
# These English sentences teach the model to generalise to English input.
ENGLISH_DATA = [
    # ── accident ──
    ("Major accident on Mumbai Pune Expressway", "accident"),
    ("Accident just happened at MG Road Bangalore please avoid", "accident"),
    ("Car crash reported on NH 48 near Delhi", "accident"),
    ("Two vehicles collided on the highway near Hyderabad", "accident"),
    ("Bike accident near Silk Board junction Bangalore", "accident"),
    ("Hit and run accident reported on Outer Ring Road", "accident"),
    ("Truck overturned on the expressway blocking traffic", "accident"),
    ("Fatal accident on NH 44 multiple vehicles involved", "accident"),
    ("Bus collided with truck near Pune highway", "accident"),
    ("Accident at Rajiv Chowk Delhi biker seriously injured", "accident"),
    ("Vehicle skidded on wet road causing accident near Chennai", "accident"),
    ("Chain collision on highway due to low visibility", "accident"),
    ("Ambulance blocked due to accident on main road", "accident"),
    ("Road accident reported near Charminar Hyderabad", "accident"),
    ("Drunk driver caused accident near Marine Lines Mumbai", "accident"),

    # ── pothole ──
    ("Huge pothole on NH 44 near Bangalore causing traffic", "pothole"),
    ("Road full of potholes near Andheri Mumbai", "pothole"),
    ("Giant pothole on the highway damaged my car suspension", "pothole"),
    ("Dangerous potholes on the road near Delhi airport", "pothole"),
    ("Bike fell into pothole near Silk Board Bangalore", "pothole"),
    ("Multiple potholes on the main road causing accidents", "pothole"),
    ("Road is completely broken with potholes near my area", "pothole"),
    ("Pothole near railway station injured a biker today", "pothole"),
    ("Deep pothole on the highway swallowed a scooter wheel", "pothole"),
    ("Road is bad near Sector 62 Noida full of craters", "pothole"),
    ("Potholes on BTM Layout road Bangalore need urgent repair", "pothole"),
    ("Road is damaged and full of holes near my house", "pothole"),
    ("Tyre burst due to pothole on the expressway", "pothole"),
    ("Infrastructure is terrible roads are full of potholes", "pothole"),
    ("Potholes everywhere on this highway nobody cares", "pothole"),

    # ── flood ──
    ("Severe flooding reported near Yamuna river in Delhi", "flood"),
    ("OMG roads are flooded near Andheri East Mumbai", "flood"),
    ("Roads flooded due to heavy rain in Bangalore", "flood"),
    ("Waterlogging in Kurla Mumbai knee deep water on roads", "flood"),
    ("Flooding near MG Road Mumbai road completely submerged", "flood"),
    ("Heavy rain caused flooding in BTM Layout Bangalore", "flood"),
    ("Chennai roads flooded again during monsoon season", "flood"),
    ("Flood water entered homes near Yamuna banks Delhi", "flood"),
    ("Low lying areas flooded in Hyderabad after heavy rain", "flood"),
    ("Roads underwater in Sector 18 Noida avoid travelling", "flood"),
    ("Flash flood warning issued for coastal areas", "flood"),
    ("River overflow causing flooding in nearby villages", "flood"),
    ("Basement parking flooded in Gurgaon residential area", "flood"),
    ("Flood like situation in city after 3 hours of rain", "flood"),
    ("Underpass submerged cars stuck in flood water", "flood"),

    # ── traffic ──
    ("Heavy traffic jam near Silk Board Bangalore", "traffic"),
    ("Traffic jam near Rajiv Chowk Metro Station Delhi", "traffic"),
    ("Massive traffic congestion on the highway today", "traffic"),
    ("Bumper to bumper traffic on the expressway avoid", "traffic"),
    ("Signal timing issue causing traffic jam at junction", "traffic"),
    ("Traffic moving very slow near airport road", "traffic"),
    ("Road blocked due to construction causing heavy traffic", "traffic"),
    ("So much traffic near Cyber Hub Gurgaon today", "traffic"),
    ("Peak hour traffic on Outer Ring Road Bangalore terrible", "traffic"),
    ("Waterlogging and traffic jam near Sector 62 Noida", "traffic"),
    ("Traffic standstill on the highway due to VIP convoy", "traffic"),
    ("Long queue at toll booth causing traffic backup", "traffic"),
    ("Traffic diversion due to road work causing chaos", "traffic"),
    ("Rush hour traffic near metro station is unbearable", "traffic"),
    ("No movement on the road stuck in traffic for 2 hours", "traffic"),

    # ── road_damage ──
    ("Road completely broken near residential area", "road_damage"),
    ("Newly built road already cracked in just 3 months", "road_damage"),
    ("Bridge approach damaged vehicles cannot pass safely", "road_damage"),
    ("Guard rail missing on the highway dangerous for drivers", "road_damage"),
    ("Road surface caved in near old bridge dangerous", "road_damage"),
    ("Concrete road crumbled under heavy truck weight", "road_damage"),
    ("Road markings faded completely no lanes visible", "road_damage"),
    ("Divider broken on the highway causing accidents", "road_damage"),
    ("Sinkhole appeared on main road vehicles at risk", "road_damage"),
    ("Road has been eroded by rain and is falling apart", "road_damage"),
    ("Flyover has visible cracks needs immediate inspection", "road_damage"),
    ("Retaining wall collapsed blocking the road", "road_damage"),
    ("Street lights broken on the highway dangerous at night", "road_damage"),
    ("Road quality pathetic it broke down in one monsoon", "road_damage"),
    ("Expansion joint failed on bridge causing bumpy ride", "road_damage"),

    # ── none ──
    ("Nice weather in Mumbai today perfect for a walk", "none"),
    ("Great food at this restaurant in Bangalore", "none"),
    ("Morning jog near the lake was refreshing today", "none"),
    ("Visited a new cafe in Connaught Place Delhi", "none"),
    ("Beautiful sunset at Marine Drive Mumbai", "none"),
    ("Going to the mall this weekend excited", "none"),
    ("Cricket match was amazing yesterday", "none"),
    ("New movie releasing this Friday cannot wait", "none"),
    ("Traffic seems fine today reached office on time", "none"),
    ("Roads are clear today driving is smooth", "none"),
    ("Happy Independence Day everyone", "none"),
    ("Working from home today enjoying the weather", "none"),
    ("Festival season brings joy to everyone", "none"),
    ("Just had amazing biryani at the local restaurant", "none"),
    ("University results declared today students happy", "none"),

    # ── Mixed / messy social media English ──
    ("accident just happened pls avoid this road omg", "accident"),
    ("roads r flooded af cant even walk", "flood"),
    ("pothole ate my tyre lol terrible roads", "pothole"),
    ("stuck in traffic for 2hrs someone save me", "traffic"),
    ("road is literally broken wtf is happening", "road_damage"),
    ("flood water everywhere in our area help", "flood"),
    ("huge accident on highway many vehicles involved", "accident"),
    ("so many potholes on this road its a warzone", "pothole"),
    ("traffic is insane today avoid this route", "traffic"),
    ("road completely washed out after heavy rain", "road_damage"),
]


def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'@\w+', '', text)
    # Keep letters, Devanagari, spaces — remove everything else
    text = re.sub(r'[^a-zA-Z\u0900-\u097F\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def train():
    data_path = Path(__file__).parent / "data" / "dataset_final.csv"
    model_dir  = Path(__file__).parent / "models"
    model_dir.mkdir(exist_ok=True)

    print("Loading dataset...")
    df = pd.read_csv(data_path)
    print(f"  {len(df)} rows from CSV")

    # Add English augmentation data
    aug_df = pd.DataFrame(ENGLISH_DATA, columns=["text", "label"])
    df     = pd.concat([df, aug_df], ignore_index=True)
    print(f"  {len(aug_df)} English augmentation rows added")
    print(f"  {len(df)} total rows")

    print("\nLabel distribution:")
    print(df['label'].value_counts().to_string())

    df['clean'] = df['text'].apply(clean_text)
    X = df['clean']
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nTraining model...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 3),     # up to trigrams for better phrase matching
            min_df=1,               # include rare terms (important for English aug)
            sublinear_tf=True,      # dampen high-frequency terms
            analyzer='word',
        )),
        ('clf', LogisticRegression(
            max_iter=3000,
            C=5,
            class_weight='balanced',
            random_state=42,
            solver='lbfgs',
            multi_class='multinomial',
        ))
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\n── Classification Report ──")
    print(classification_report(y_test, y_pred))
    print(f"Overall Accuracy: {accuracy_score(y_test, y_pred):.2%}")

    model_path = model_dir / "hazard_classifier.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(pipeline, f)
    print(f"\nModel saved to: {model_path}")

    # Quick sanity check on the problem cases
    print("\n── Sanity check on English inputs ──")
    test_cases = [
        ("Major accident on Mumbai Pune Expressway",      "accident"),
        ("OMG roads are flooded af near Andheri East",    "flood"),
        ("Heavy traffic jam near Silk Board Bangalore",   "traffic"),
        ("Huge pothole on NH 44 near Bangalore",          "pothole"),
        ("Severe flooding near Yamuna river Delhi",       "flood"),
        ("Road completely broken near residential area",  "road_damage"),
        ("Nice weather in Mumbai today",                  "none"),
    ]
    for text, expected in test_cases:
        cleaned = clean_text(text)
        pred    = pipeline.predict([cleaned])[0]
        proba   = pipeline.predict_proba([cleaned])[0]
        conf    = round(float(max(proba)), 3)
        status  = "✓" if pred == expected else "✗"
        print(f"  {status} [{expected:>11}] pred={pred:<11} conf={conf:.3f}  \"{text[:50]}\"")


def serve():
    from flask import Flask, request, jsonify
    from flask_cors import CORS

    model_path = Path(__file__).parent / "models" / "hazard_classifier.pkl"
    if not model_path.exists():
        print("Model not found. Run: python train.py --train")
        sys.exit(1)

    with open(model_path, 'rb') as f:
        pipeline = pickle.load(f)

    print("Model loaded successfully")

    app = Flask(__name__)
    CORS(app)

    @app.route('/classify', methods=['POST'])
    def classify():
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON body required'}), 415

        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'no text provided'}), 400

        cleaned    = clean_text(text)
        label      = pipeline.predict([cleaned])[0]
        proba      = pipeline.predict_proba([cleaned])[0]
        classes    = pipeline.classes_
        confidence = round(float(max(proba)), 3)

        # Return all class probabilities so frontend can show breakdown
        all_probs = {cls: round(float(p), 3) for cls, p in zip(classes, proba)}

        return jsonify({
            'label':       label,
            'confidence':  confidence,
            'all_scores':  all_probs,
        })

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'})

    print("ML API running on http://localhost:5001")
    app.run(port=5001, debug=False)


if __name__ == '__main__':
    if '--train' in sys.argv:
        train()
    elif '--serve' in sys.argv:
        serve()
    else:
        print("Usage:")
        print("  python train.py --train")
        print("  python train.py --serve")
