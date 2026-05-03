import axios from "axios";

console.log("SERVICE KEY =", process.env.TOMTOM_API_KEY);

export const fetchTrafficFlow = async (lat, lon) => {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&key=${process.env.TOMTOM_API_KEY}`;

  const { data } = await axios.get(url);
  return data;
};
