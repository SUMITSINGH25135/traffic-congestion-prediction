import pandas as pd
import numpy as np
import geopandas as gpd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ==========================================
# 1. OPTIMIZED DISTANCE FUNCTION (Haversine)
# ==========================================
def haversine_vectorized(lat1, lon1, lat2, lon2):
    # This calculates distance for ALL 800k rows at once using Math (NumPy)
    # instead of looping. It's 1000x faster.
    R = 6371  # Earth radius in kilometers
    
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    
    a = np.sin(dphi/2)**2 + \
        np.cos(phi1) * np.cos(phi2) * np.sin(dlambda/2)**2
    
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    
    return R * c

# ==========================================
# 2. LOAD & PREPROCESS
# ==========================================
print("Loading 8 Lakh rows... (This requires RAM)")
csv_path = 'bangalore-wards-2019-3-OnlyWeekdays-HourlyAggregate.csv' 
json_path = 'bangalore_wards.json'       

traffic_df = pd.read_csv(csv_path)
zones_gdf = gpd.read_file(json_path)

# Prepare Location Data
print("Mapping Zones...")
zones_gdf['MOVEMENT_ID'] = zones_gdf['MOVEMENT_ID'].astype(int)
zones_gdf['centroid'] = zones_gdf['geometry'].centroid
zones_gdf['lat'] = zones_gdf['centroid'].y
zones_gdf['lon'] = zones_gdf['centroid'].x
location_lookup = zones_gdf[['MOVEMENT_ID', 'lat', 'lon']]

# Merge (This uses RAM, might take 10-20 seconds)
df = traffic_df.merge(location_lookup, left_on='sourceid', right_on='MOVEMENT_ID').rename(columns={'lat': 'src_lat', 'lon': 'src_lon'}).drop(columns=['MOVEMENT_ID'])
df = df.merge(location_lookup, left_on='dstid', right_on='MOVEMENT_ID').rename(columns={'lat': 'dest_lat', 'lon': 'dest_lon'}).drop(columns=['MOVEMENT_ID'])

# ==========================================
# 3. FAST FEATURE ENGINEERING
# ==========================================
print("Calculating distances using Vectorization...")
# This line replaces the slow loop
df['distance_km'] = haversine_vectorized(df['src_lat'], df['src_lon'], df['dest_lat'], df['dest_lon'])

# Filter essential columns
model_data = df[['src_lat', 'src_lon', 'dest_lat', 'dest_lon', 'distance_km', 'hod', 'mean_travel_time']].dropna()

# ==========================================
# 4. TRAIN (With Constraints)
# ==========================================
print(f"Training on {len(model_data)} rows...")

X = model_data[['src_lat', 'src_lon', 'dest_lat', 'dest_lon', 'distance_km', 'hod']]
y = model_data['mean_travel_time']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# RANDOM FOREST CONFIGURATION
# n_estimators=50: Enough trees to learn, but not too slow.
# max_depth=15: PREVENTS OVERFITTING. Crucial for 800k rows.
# n_jobs=-1: Uses ALL your CPU cores to train faster.
model = RandomForestRegressor(
    n_estimators=50, 
    max_depth=15,       
    n_jobs=-1,          
    random_state=42
)

model.fit(X_train, y_train)

# ==========================================
# 5. VALIDATE
# ==========================================
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("="*30)
print(f"Training Complete.")
print(f"Average Error (MAE): {mae:.2f} seconds")
print(f"Accuracy Score (R2): {r2:.2f} (Closer to 1.0 is better)")
print("="*30)

joblib.dump(model, 'traffic_model.pkl')
print("Model Saved.")