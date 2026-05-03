import { fetchTrafficFlow } from "../services/tomtomService.js";

export const getTrafficFlow = async (req, res) => {
  const { lat, lon } = req.query;

  console.log("Received request for lat =", lat, "lon =", lon);

  try {
    const data = await fetchTrafficFlow(lat, lon);

    //console.log("TomTom API Response:", data);

    res.json(data);
  } catch (err) {
    console.log("ERROR in controller:", err.response?.data || err.message);
    res.status(500).json({ message: "Error fetching traffic data" });
  }
};
