# ml/test.py
# Simple script to test your trained model with any text/tweet

import pickle
from pathlib import Path

# Load the trained pipeline
model_path = Path(__file__).parent / "models" / "hazard_classifier.pkl"

if not model_path.exists():
    print("❌ Model not found! Please run `python train.py --train` first.")
    exit()

with open(model_path, 'rb') as f:
    pipeline = pickle.load(f)

print("✅ Model loaded successfully!\n")
print("Enter a tweet/text to classify (type 'exit' to quit)\n")

while True:
    text = input("Tweet: ").strip()
    
    if text.lower() in ['exit', 'quit', 'q']:
        print("Goodbye!")
        break
    
    if not text:
        print("Please enter some text.\n")
        continue
    
    # Predict
    prediction = pipeline.predict([text])[0]
    probabilities = pipeline.predict_proba([text])[0]
    confidence = round(float(max(probabilities)), 4) * 100   # in percentage
    
    print(f"Prediction : {prediction}")
    print(f"Confidence : {confidence:.1f}%\n")