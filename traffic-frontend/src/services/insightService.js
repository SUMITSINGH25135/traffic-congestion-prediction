import axios from 'axios';

const ML_API_URL = 'http://127.0.0.1:8000'; 

// Rough bounding box for Bangalore (Geofencing)
const BLR_BOUNDS = {
  minLat: 12.73, maxLat: 13.14,
  minLon: 77.38, maxLon: 77.84
};

const isInsideBangalore = (lat, lon) => {
  return lat >= BLR_BOUNDS.minLat && lat <= BLR_BOUNDS.maxLat &&
         lon >= BLR_BOUNDS.minLon && lon <= BLR_BOUNDS.maxLon;
};

export const getPredictiveInsights = async (srcLat, srcLon, destLat, destLon, hod, isWeekend) => {
  // 1. Geofencing Check
  if (!isInsideBangalore(srcLat, srcLon) || !isInsideBangalore(destLat, destLon)) {
      throw new Error("Predictive insights are only available within Bangalore.");
  }

  // 2. Weekend Check (Model is trained on weekdays only)
  if (isWeekend) {
      throw new Error("Predictive model currently only supports weekday traffic.");
  }

  // 3. Call the Python Microservice
  try {
    const { data } = await axios.post(`${ML_API_URL}/predict`, {
        src_lat: parseFloat(srcLat),
        src_lon: parseFloat(srcLon),
        dest_lat: parseFloat(destLat),
        dest_lon: parseFloat(destLon),
        hod: parseInt(hod)
    });

    return data;
  } catch (error) {
    console.error("Error fetching AI prediction:", error);
    throw new Error("AI Prediction service is currently unavailable.");
  }
};