import pandas as pd
import geopandas as gpd

# ==========================================
# 1. SETUP FILE PATHS
# ==========================================
# Make sure these filenames match exactly what is in your folder
json_path = 'bangalore_wards.json'
csv_path = 'bangalore-wards-2019-3-OnlyWeekdays-HourlyAggregate.csv'

print(f"Testing merge with file: {csv_path}...")

# ==========================================
# 2. LOAD MAP DATA (JSON)
# ==========================================
try:
    zones_gdf = gpd.read_file(json_path)
except Exception as e:
    print(f"❌ Error loading JSON: {e}")
    exit()

# Convert Shapes to Points (Lat/Lon)
# CRITICAL: We ensure MOVEMENT_ID is an integer so it matches the CSV
zones_gdf['MOVEMENT_ID'] = zones_gdf['MOVEMENT_ID'].astype(int)
zones_gdf['centroid'] = zones_gdf['geometry'].centroid
zones_gdf['lat'] = zones_gdf['centroid'].y
zones_gdf['lon'] = zones_gdf['centroid'].x

# Create a clean lookup table
# We keep WARD_NAME just to verify visually that it's the right place
location_lookup = zones_gdf[['MOVEMENT_ID', 'WARD_NAME', 'lat', 'lon']]
print(f"✅ Map loaded. Found {len(location_lookup)} zones.")

# ==========================================
# 3. LOAD TRAFFIC DATA (Limit to 5 rows)
# ==========================================
try:
    # nrows=5 forces pandas to only read the top 5 lines
    df_sample = pd.read_csv(csv_path, nrows=5)
    print("\nOriginal CSV Sample (First 5 rows):")
    print(df_sample[['sourceid', 'dstid', 'hod', 'mean_travel_time']])
except Exception as e:
    print(f"❌ Error loading CSV: {e}")
    exit()

# ==========================================
# 4. EXECUTE THE MERGE
# ==========================================
print("\nMerging data...")

# Merge Source Location
merged_sample = df_sample.merge(
    location_lookup, 
    left_on='sourceid', 
    right_on='MOVEMENT_ID',
    how='left' # 'left' keeps the row even if match fails (so we can see errors)
).rename(columns={'lat': 'src_lat', 'lon': 'src_lon', 'WARD_NAME': 'src_name'}).drop(columns=['MOVEMENT_ID'])

# Merge Destination Location
merged_sample = merged_sample.merge(
    location_lookup, 
    left_on='dstid', 
    right_on='MOVEMENT_ID',
    how='left'
).rename(columns={'lat': 'dest_lat', 'lon': 'dest_lon', 'WARD_NAME': 'dest_name'}).drop(columns=['MOVEMENT_ID'])

# ==========================================
# 5. RESULTS & DIAGNOSTICS
# ==========================================
print("\n" + "="*40)
print("FINAL MERGED OUTPUT")
print("="*40)

# Select key columns to display
cols = ['sourceid', 'src_name', 'src_lat', 'dstid', 'dest_name', 'dest_lat', 'mean_travel_time']
print(merged_sample[cols])

print("\n" + "="*40)
print("DIAGNOSTICS")
print("="*40)

# Check for "NaN" (Not a Number) which indicates a failed merge
if merged_sample['src_lat'].isnull().any():
    print("❌ FAILURE: Source Coordinates are missing.")
    print("Reason: The 'sourceid' in your CSV does not exist in the JSON 'MOVEMENT_ID'.")
elif merged_sample['dest_lat'].isnull().any():
    print("❌ FAILURE: Destination Coordinates are missing.")
    print("Reason: The 'dstid' in your CSV does not exist in the JSON 'MOVEMENT_ID'.")
else:
    print("✅ SUCCESS: All IDs matched perfectly!")
    print("You are ready to run the full training script.")