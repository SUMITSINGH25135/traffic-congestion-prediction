// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// 1. TRAFFIC FLOW
export const getTrafficFlow = async (lat, lon) => {
  // backend expects lat, lon query params
  const { data } = await axios.get(
    `${API_BASE}/traffic/flow?lat=${lat}&lon=${lon}`
  );
  return data;
};

// 2. TRAFFIC INCIDENTS
export const getTrafficIncidents = async (bbox) => {
  const { data } = await axios.get(`${API_BASE}/traffic/incidents`, {
    params: { bbox },
  });
  return data;
};

// 3. ROUTING (NEW)
export const getRoute = async (startLat, startLon, endLat, endLon) => {
  const { data } = await axios.get(`${API_BASE}/traffic/route`, {
    params: {
      startLat,
      startLon,
      endLat,
      endLon,
    },
  });
  return data;
};
