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



ENGLISH_DATA = [

   
    ("i am feeling very good today", "none"),
    ("good morning everyone have a great day", "none"),
    ("just had lunch at a great place", "none"),
    ("beautiful weather today went for a walk", "none"),
    ("had a great day at work", "none"),
    ("happy sunday everyone enjoy the day", "none"),
    ("smooth drive this morning no issues at all", "none"),
    ("reached office on time roads were clear", "none"),
    ("nice day for a road trip", "none"),
    ("amazing food at the restaurant near my house", "none"),
    ("visited the national park today beautiful experience", "none"),
    ("cricket match was amazing yesterday what a game", "none"),
    ("new movie was great enjoyed every bit", "none"),
    ("working from home today weather is lovely", "none"),
    ("festival mood everywhere everyone is happy", "none"),
    ("morning walk was refreshing today near the lake", "none"),
    ("roads are clear today no jams anywhere", "none"),
    ("everything is fine on the road today", "none"),
    ("had a smooth drive from delhi to agra", "none"),
    ("road trip was amazing this weekend", "none"),
    ("no problems on the road today", "none"),
    ("traffic is light today reached early", "none"),
    ("drive was comfortable and smooth", "none"),
    ("enjoying the weekend with family", "none"),
    ("great evening at the park today", "none"),
    ("just arrived home safely", "none"),
    ("roads are good in this area", "none"),
    ("highway was empty and smooth today", "none"),
    ("no accidents no jams all clear", "none"),
    ("just wanted to say good morning", "none"),
    ("feeling happy today everything is fine", "none"),

   
    ("roads flooded due to heavy rain in mumbai", "flood"),
    ("road is flooded cant drive through", "flood"),
    ("waterlogging near andheri east mumbai", "flood"),
    ("waterlogged roads near the underpass", "flood"),
    ("heavy rain flooded the streets completely", "flood"),
    ("road is underwater near the bridge", "flood"),
    ("knee deep water on the main road", "flood"),
    ("water on road cant drive", "flood"),
    ("flood near the river bank road submerged", "flood"),
    ("standing water on the expressway dangerous", "flood"),
    ("roads submerged after heavy downpour", "flood"),
    ("cars stuck in flood water near the junction", "flood"),
    ("road completely submerged no way to pass", "flood"),
    ("heavy rain caused flooding on the highway", "flood"),
    ("low lying area flooded after the rain", "flood"),
    ("water logging on the highway avoid this route", "flood"),
    ("flash flood on the road near the dam", "flood"),
    ("severe flooding on the main road", "flood"),
    ("road is under water please avoid", "flood"),
    ("roads r flooded af cant even walk", "flood"),
    ("road completely washed out after heavy rain", "flood"),
    ("river overflowed and flooded the road", "flood"),
    ("entire road is submerged in rain water", "flood"),
    ("waist deep water on road near village", "flood"),
    ("water level rising on the road near river", "flood"),
    ("highway inundated with water after the rain", "flood"),
    ("road washed away by flood water", "flood"),
    ("stranded due to flooded roads", "flood"),
    ("heavy rain water collected on road", "flood"),
    ("puddles everywhere road flooded after rain", "flood"),

   
    ("huge pothole on nh 44 near bangalore", "pothole"),
    ("road full of potholes near andheri mumbai", "pothole"),
    ("giant pothole damaged my car suspension", "pothole"),
    ("dangerous potholes on the road near delhi airport", "pothole"),
    ("bike fell into pothole near silk board", "pothole"),
    ("tyre burst due to pothole on the expressway", "pothole"),
    ("pothole ate my tyre terrible roads", "pothole"),
    ("road has holes everywhere be careful", "pothole"),
    ("deep hole on the highway near the bridge", "pothole"),
    ("road full of craters and holes", "pothole"),
    ("crater sized pothole near school needs repair", "pothole"),
    ("big hole in the middle of the road", "pothole"),
    ("road is bumpy and has many potholes", "pothole"),
    ("potholes damaged my car axle today", "pothole"),
    ("multiple potholes causing accidents on main road", "pothole"),
    ("road is completely broken with potholes", "pothole"),
    ("so many potholes its like a warzone", "pothole"),
    ("tyre burst because of pothole on highway", "pothole"),
    ("scooter tipped over due to pothole", "pothole"),
    ("bike rider fell after hitting a pothole", "pothole"),
    ("pothole near the signal is very deep", "pothole"),
    ("road has deep craters that damage vehicles", "pothole"),
    ("infrastructure terrible roads full of potholes", "pothole"),
    ("road is dug up and has big holes", "pothole"),
    ("road is bad full of pits and holes", "pothole"),
    ("huge pit on the road near my colony", "pothole"),
    ("water filled pothole on the highway", "pothole"),

   
    ("major accident on mumbai pune expressway", "accident"),
    ("car accident near the signal please avoid", "accident"),
    ("accident just happened at mg road bangalore", "accident"),
    ("car crash reported on nh 48 near delhi", "accident"),
    ("two vehicles collided on the highway", "accident"),
    ("two bikes crashed near the market", "accident"),
    ("bike accident near silk board junction", "accident"),
    ("truck overturned on the expressway", "accident"),
    ("fatal accident on nh 44 multiple vehicles", "accident"),
    ("bus collided with truck near pune highway", "accident"),
    ("vehicle skidded on wet road causing accident", "accident"),
    ("chain collision on highway low visibility", "accident"),
    ("hit and run accident reported on main road", "accident"),
    ("drunk driver caused accident near mumbai", "accident"),
    ("head on collision on the expressway this morning", "accident"),
    ("car went off road near the mountain highway", "accident"),
    ("motorcycle hit by truck near the toll booth", "accident"),
    ("serious road accident near the flyover", "accident"),
    ("pedestrian hit by vehicle near the school zone", "accident"),
    ("accident just happened pls avoid this road omg", "accident"),
    ("huge accident on highway many vehicles involved", "accident"),
    ("crash on highway blocking all lanes", "accident"),
    ("vehicle overturned on the highway this morning", "accident"),
    ("collision reported near the signal multiple injuries", "accident"),
    ("scooter fell into ditch after avoiding pothole", "accident"),
    ("collision between two trucks on the highway", "accident"),
    ("road accident three people injured", "accident"),
    ("accident on ring road causing traffic", "accident"),
    ("ambulance stuck due to accident on main road", "accident"),
    ("biker seriously hurt after accident near junction", "accident"),

   
    ("heavy traffic jam near silk board bangalore", "traffic"),
    ("traffic jam near rajiv chowk metro station", "traffic"),
    ("massive traffic congestion on the highway today", "traffic"),
    ("bumper to bumper traffic on the expressway", "traffic"),
    ("bumper to bumper no movement on the road", "traffic"),
    ("signal timing issue causing traffic jam at junction", "traffic"),
    ("traffic moving very slow near airport road", "traffic"),
    ("road blocked due to construction causing traffic", "traffic"),
    ("peak hour traffic on outer ring road terrible", "traffic"),
    ("traffic standstill on the highway due to vip convoy", "traffic"),
    ("long queue at toll booth causing traffic backup", "traffic"),
    ("traffic diversion due to road work causing chaos", "traffic"),
    ("rush hour traffic near metro station unbearable", "traffic"),
    ("no movement on the road stuck for two hours", "traffic"),
    ("traffic is insane today avoid this route", "traffic"),
    ("stuck in traffic for two hours someone save me", "traffic"),
    ("cars not moving on highway for past one hour", "traffic"),
    ("gridlock near the flyover due to construction", "traffic"),
    ("road blocked by protest causing traffic backup", "traffic"),
    ("slow moving traffic near the toll plaza", "traffic"),
    ("highway choked due to accident ahead", "traffic"),
    ("complete standstill near the junction", "traffic"),
    ("3 km long traffic jam on the expressway", "traffic"),
    ("road blocked nothing moving at all", "traffic"),
    ("traffic jam extending for several kilometres", "traffic"),
    ("congestion on national highway avoid if possible", "traffic"),
    ("road is blocked by a vehicle breakdown", "traffic"),
    ("vip movement causing traffic jam on main road", "traffic"),
    ("traffic jam due to waterlogging on road", "traffic"),

    
    ("road is broken and cracked near the bridge", "road_damage"),
    ("road completely broken near residential area", "road_damage"),
    ("flyover has visible cracks needs inspection", "road_damage"),
    ("flyover cracks are dangerous please check", "road_damage"),
    ("bridge damaged vehicles cannot pass safely", "road_damage"),
    ("bridge damaged and is about to collapse", "road_damage"),
    ("road surface caved in near old bridge", "road_damage"),
    ("road collapsed near the river bank", "road_damage"),
    ("road has collapsed due to soil erosion", "road_damage"),
    ("sinkhole appeared on main road dangerous", "road_damage"),
    ("sinkhole on highway vehicles at risk", "road_damage"),
    ("road is eroded and falling apart after rain", "road_damage"),
    ("guard rail missing on highway dangerous at night", "road_damage"),
    ("divider broken on the highway", "road_damage"),
    ("retaining wall collapsed blocking the road", "road_damage"),
    ("road quality terrible broke down after monsoon", "road_damage"),
    ("road is crumbling near the overpass", "road_damage"),
    ("road surface damaged by heavy vehicles", "road_damage"),
    ("pavement broken completely after the rains", "road_damage"),
    ("road badly damaged no repairs being done", "road_damage"),
    ("side wall of bridge has fallen down", "road_damage"),
    ("newly built road already cracked in 3 months", "road_damage"),
    ("concrete road crumbled under truck weight", "road_damage"),
    ("road markings faded no lanes visible", "road_damage"),
    ("expansion joint failed on bridge bumpy ride", "road_damage"),
    ("road is literally broken wtf is happening", "road_damage"),
    ("road has deep cracks all over the surface", "road_damage"),
    ("road has broken badly needs urgent repair", "road_damage"),
    ("road is damaged badly after the floods", "road_damage"),
    ("road edge has broken off dangerous", "road_damage"),
    ("road is uneven and broken after heavy rain", "road_damage"),
    ("broken road causing accidents every day", "road_damage"),
    ("the road surface is completely gone", "road_damage"),
    ("road has massive cracks and is sinking", "road_damage"),
    ("road is eroding into the river", "road_damage"),

    ("elephant on the road near the highway", "animal"),
    ("wild elephant blocking traffic on nh 37", "animal"),
    ("elephant herd crossing the highway near forest", "animal"),
    ("there was an elephant on the doiwala road today", "animal"),
    ("elephant spotted on the road near mysore", "animal"),
    ("wild elephant on the road please avoid", "animal"),
    ("cow sitting in the middle of the road", "animal"),
    ("cow on road causing traffic jam", "animal"),
    ("stray cow blocking highway near the village", "animal"),
    ("herd of cows crossing the road", "animal"),
    ("bull standing in the middle of the road", "animal"),
    ("dog sitting in the middle of highway", "animal"),
    ("stray dogs on highway dangerous for bikers", "animal"),
    ("dog ran in front of my car on highway", "animal"),
    ("monkey on the road near the temple", "animal"),
    ("monkeys sitting on the highway blocking vehicles", "animal"),
    ("snake spotted crossing the road near fields", "animal"),
    ("large snake on the road stopped traffic", "animal"),
    ("deer crossed the road in front of my car", "animal"),
    ("nilgai spotted crossing the highway", "animal"),
    ("wild boar crossed the road near jungle", "animal"),
    ("buffalo herd crossing the road blocking traffic", "animal"),
    ("camel on the highway in rajasthan", "animal"),
    ("horse running loose on road near village", "animal"),
    ("goat herd on the road blocking vehicles", "animal"),
    ("peacock sitting on the road near highway", "animal"),
    ("tiger spotted crossing road near national park", "animal"),
    ("leopard seen on highway near forest zone", "animal"),
    ("rhino crossing highway near kaziranga", "animal"),
    ("wild animal on the road drive carefully", "animal"),
    ("stray animals on road hazard at night", "animal"),
    ("animal on road please slow down", "animal"),
    ("there was an elephant in kurukshetra haryana nh road", "animal"),
    ("cattle on the highway blocking movement", "animal"),
    ("pig on the road near the village", "animal"),
    ("stray cattle roaming on the highway", "animal"),
]


def clean_text(text):
    
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'@\w+', '', text)
    # Keep English letters, Devanagari script, spaces
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

    # Add English augmentation
    aug_df = pd.DataFrame(ENGLISH_DATA, columns=["text", "label"])
    df     = pd.concat([df, aug_df], ignore_index=True)
    print(f"  {len(aug_df)} English augmentation rows added")
    print(f"  {len(df)} total rows")

    print("\nLabel distribution after augmentation:")
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
            max_features=15000,
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True,
            analyzer='word',
        )),
        ('clf', LogisticRegression(
            max_iter=3000,
            C=5,
            class_weight='balanced',
            random_state=42,
            solver='lbfgs',
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

    
    print("\n── Sanity check on short English inputs ──")
    test_cases = [
      
        ("i am feeling very good today",                               "none"),
        ("good morning everyone have a great day",                     "none"),
        ("roads are clear today no jams",                              "none"),
        ("smooth drive this morning",                                  "none"),
        ("i feel happy today",                                         "none"),
        
        ("roads flooded due to heavy rain",                            "flood"),
        ("waterlogging near andheri",                                  "flood"),
        ("road is underwater",                                         "flood"),
        ("knee deep water on road",                                    "flood"),
        ("water on road cant drive",                                   "flood"),
        
        ("big pothole on mg road damaged my car",                      "pothole"),
        ("road has holes everywhere",                                   "pothole"),
        ("tyre burst due to pothole",                                   "pothole"),
        
        ("car accident near the signal",                               "accident"),
        ("two bikes crashed near market",                              "accident"),
        ("collision on the expressway",                                "accident"),
        ("truck overturned on highway",                                "accident"),
        
        ("heavy traffic jam on highway",                               "traffic"),
        ("bumper to bumper no movement",                               "traffic"),
        ("road blocked stuck in traffic",                              "traffic"),
       
        ("road is broken and cracked",                                 "road_damage"),
        ("flyover has cracks dangerous",                               "road_damage"),
        ("bridge damaged vehicles cannot pass",                        "road_damage"),
        ("road collapsed near river",                                  "road_damage"),
        ("road is damaged badly",                                      "road_damage"),
        
        ("there was an elephant on the doiwala road today",            "animal"),
        ("wild elephant blocking traffic on highway",                  "animal"),
        ("cow sitting in the middle of road",                          "animal"),
        ("dog sitting in the middle of highway",                       "animal"),
        ("snake spotted on road near fields",                          "animal"),
    ]
    correct = 0
    for text, expected in test_cases:
        cleaned = clean_text(text)
        pred    = pipeline.predict([cleaned])[0]
        proba   = pipeline.predict_proba([cleaned])[0]
        conf    = round(float(max(proba)), 3)
        ok      = "tick" if pred == expected else "Cross"
        if pred == expected:
            correct += 1
        print(f"  {ok} [{expected:>11}] pred={pred:<11} conf={conf:.3f}  \"{text[:55]}\"")

    print(f"\n  Result: {correct}/{len(test_cases)} correct")


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

        all_probs = {cls: round(float(p), 3) for cls, p in zip(classes, proba)}

        return jsonify({
            'label':      label,
            'confidence': confidence,
            'all_scores': all_probs,
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