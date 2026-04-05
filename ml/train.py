# ml/train.py
import sys
import os
import pickle
import re
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-Z\u0900-\u097F\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train():
    data_path = Path(__file__).parent / "data" / "dataset_final.csv"
    model_dir = Path(__file__).parent / "models"
    model_dir.mkdir(exist_ok=True)
    
    print("📂 Loading dataset...")
    df = pd.read_csv(data_path)
    
    print("🔤 Cleaning text...")
    df['clean'] = df['text'].apply(clean_text)
    
    X = df['clean']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("🧠 Training Logistic Regression with Pipeline...")
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=8000, ngram_range=(1, 2), min_df=2)),
        ('clf', LogisticRegression(max_iter=2000, C=8, class_weight='balanced', random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    print("\n✅ Classification Report:")
    print(classification_report(y_test, y_pred))
    print(f"Overall Accuracy: {accuracy_score(y_test, y_pred):.2%}")
    
    # Save the entire pipeline
    model_path = model_dir / "hazard_classifier.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(pipeline, f)
    
    print(f"💾 Model saved successfully at: {model_path}")

def serve():
    # (We will use this later)
    print("Serve function coming soon...")

if __name__ == '__main__':
    if '--train' in sys.argv:
        train()
    elif '--serve' in sys.argv:
        serve()
    else:
        print("Usage: python train.py --train")