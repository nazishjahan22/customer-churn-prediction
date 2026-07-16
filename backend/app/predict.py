import os
import joblib
import pandas as pd

# Current file path
BASE_DIR = os.path.dirname(__file__)

# Load model, scaler and columns
model = joblib.load(os.path.join(BASE_DIR, "../../models/churn_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "../../models/scaler.pkl"))
columns = joblib.load(os.path.join(BASE_DIR, "../../models/columns.pkl"))


def predict_churn(customer_data):
    # Convert input dictionary to DataFrame
    df = pd.DataFrame([customer_data])

    # Apply One-Hot Encoding
    df = pd.get_dummies(df)

    # Match columns used during training
    df = df.reindex(columns=columns, fill_value=0)

    # Scale features
    df_scaled = scaler.transform(df)

    # Make prediction
    prediction = model.predict(df_scaled)[0]
    probability = model.predict_proba(df_scaled)[0][1]

    result = "Customer Will Churn" if prediction == 1 else "Customer Will Not Churn"

    return {
        "prediction": result,
        "probability": round(float(probability), 2)
    }