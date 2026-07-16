from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import CustomerData

from app.predict import predict_churn

app = FastAPI(title="Customer Churn Prediction API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Customer Churn Prediction API is Running"}


@app.post("/predict")
def predict(data: CustomerData):
    result = predict_churn(data.model_dump())
    return result