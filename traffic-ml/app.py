from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="Traffic AI Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    model = joblib.load('traffic_model.pkl')
    print("ML Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


class TrafficQuery(BaseModel):
    src_lat: float
    src_lon: float
    dest_lat: float
    dest_lon: float
    hod: int

def haversine(lat1, lon1, lat2, lon2):
    """Calculates the straight-line distance between two coordinates."""
    R = 6371 # Earth radius in km
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    
    a = np.sin(dphi/2)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

@app.post("/predict")
def predict_travel_time(query: TrafficQuery):
    if model is None:
        raise HTTPException(status_code=500, detail="Model failed to load on server start.")

    try:
        distance_km = haversine(query.src_lat, query.src_lon, query.dest_lat, query.dest_lon)
        
        # Order: ['src_lat', 'src_lon', 'dest_lat', 'dest_lon', 'distance_km', 'hod']
        features = [[
            query.src_lat, query.src_lon, 
            query.dest_lat, query.dest_lon, 
            distance_km, query.hod
        ]]
        
        prediction_seconds = model.predict(features)[0]
        
        return {
            "predicted_travel_time_seconds": round(prediction_seconds, 2),
            "distance_km": round(distance_km, 2),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")