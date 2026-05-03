import axios from "axios";

export async function fetchTrafficIncidents(bbox) {
  try {
    const response = await axios.get(
      "https://api.tomtom.com/traffic/services/5/incidentDetails",
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          bbox
        }
      }
    );

    return response.data;
  } catch (err) {
    console.error("TomTom Incidents Error:", err.response?.data || err);
    throw err;
  }
}
