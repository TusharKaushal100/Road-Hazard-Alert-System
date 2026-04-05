# ml/train_and_serve.py
#
# Run ONCE to train:   python train_and_serve.py --train
# Run to serve API:    python train_and_serve.py --serve
#
# This exposes ONE endpoint:
#   POST /classify   body: { "text": "some post" }
#   returns:         { "label": "pothole", "confidence": 0.87 }

import sys
import os
import pickle
import re

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Text cleaning ────────────────────────────────────────────────
def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+', '', text)          # remove URLs
    text = re.sub(r'#\w+', '', text)             # remove hashtags
    text = re.sub(r'@\w+', '', text)             # remove mentions
    text = re.sub(r'[^a-zA-Z\u0900-\u097F\s]', '', text)  # keep letters only
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ── Train ────────────────────────────────────────────────────────
def train():
    DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dataset_final.csv')
    df = pd.read_csv(DATA_PATH)
    df['clean'] = df['text'].apply(clean_text)

    X = df['clean']
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=1000, C=5)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    print("\n── Classification Report ──")
    print(classification_report(y_test, y_pred))

    # Save
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    print("Saved model.pkl and vectorizer.pkl")

# ── Serve ────────────────────────────────────────────────────────
def serve():
    from flask import Flask, request, jsonify
    from flask_cors import CORS

    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)

    app = Flask(__name__)
    CORS(app)  # allow Express backend to call this

    @app.route('/classify', methods=['POST'])
    def classify():
        data = request.get_json()
        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'no text provided'}), 400

        cleaned = clean_text(text)
        vec     = vectorizer.transform([cleaned])
        label   = model.predict(vec)[0]
        proba   = model.predict_proba(vec)[0]
        confidence = round(float(max(proba)), 3)

        return jsonify({
            'label':      label,
            'confidence': confidence
        })

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'})

    print("ML API running on http://localhost:5001")
    app.run(port=5001, debug=False)

# ── Entry point ───────────────────────────────────────────────────
if __name__ == '__main__':
    if '--train' in sys.argv:
        train()
    elif '--serve' in sys.argv:
        serve()
    else:
        print("Usage:")
        print("  python train_and_serve.py --train    (train the model)")
        print("  python train_and_serve.py --serve    (start the ML API)")
