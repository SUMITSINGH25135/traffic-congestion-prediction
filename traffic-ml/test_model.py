import joblib
import pandas as pd
import numpy as np

# ==========================================
# 1. SETUP: Distance Calculation
# ==========================================
def calculate_haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    
    # Convert degrees to radians
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    
    a = np.sin(dphi/2)**2 + \
        np.cos(phi1) * np.cos(phi2) * np.sin(dlambda/2)**2
    
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

# ==========================================
# 2. LOAD THE TRAINED MODEL
# ==========================================
print("⏳ Loading 'traffic_model.pkl'...")
try:
    model = joblib.load('traffic_model.pkl')
    print("Model loaded successfully!\n")
except FileNotFoundError:
    print("Error: Model file not found. Run 'train_model.py' first.")
    exit()

# ==========================================
# 3. DEFINE TEST SCENARIOS
# ==========================================
# We test 3 typical Bangalore routes
test_cases = [
    {
        "name": "Scenario A: Short Trip (Majestic -> Koramangala)",
        "src":  (12.9716, 77.5946), # Majestic
        "dest": (12.9352, 77.6245), # Koramangala
        "hod": 22,                   # 9:00 AM (Peak Traffic)
        "description": "City center to South during morning rush."
    },
    {
        "name": "Scenario B: Long Trip (Hebbala -> Electronic City)",
        "src":  (13.0354, 77.5988), # Hebbala
        "dest": (12.8452, 77.6602), # Electronic City
        "hod": 12,                  # 2:00 PM (Afternoon Lull)
        "description": "North to Far South via Highway."
    },
    {
        "name": "Scenario C: Night Trip (Whitefield -> Majestic)",
        "src":  (12.9698, 77.7500), # Whitefield
        "dest": (12.9716, 77.5946), # Majestic
        "hod": 3,                   # 3:00 AM (Empty Roads)
        "description": "East to Center at late night."
    }
]

# ==========================================
# 4. RUN TESTS
# ==========================================
print("="*60)
print(f"{'ROUTE NAME':<45} | {'DIST':<8} | {'PREDICTION'}")
print("="*60)

for case in test_cases:
    src_lat, src_lon = case['src']
    dest_lat, dest_lon = case['dest']
    hour = case['hod']
    
    # 1. Calculate Distance
    dist_km = calculate_haversine(src_lat, src_lon, dest_lat, dest_lon)
    
    # 2. Prepare Data (Must match training columns exactly!)
    input_data = pd.DataFrame([[
        src_lat, src_lon, dest_lat, dest_lon, dist_km, hour
    ]], columns=['src_lat', 'src_lon', 'dest_lat', 'dest_lon', 'distance_km', 'hod'])
    
    # 3. Predict
    pred_seconds = model.predict(input_data)[0]
    pred_minutes = pred_seconds / 60
    
    # 4. Print Result
    print(f"{case['name']:<45} | {dist_km:.1f} km  | {pred_minutes:.1f} mins")

print("="*60)