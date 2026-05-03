import { fetchTrafficIncidents } from "../services/tomtomIncidents.js";

export const getTrafficIncidents = async (req, res) => {
  try {
    const { bbox } = req.query; // minLon,minLat,maxLon,maxLat

    if (!bbox) {
      return res.status(400).json({ message: "bbox is required" });
    }

    const data = await fetchTrafficIncidents(bbox);
    res.json(data);

  } catch (err) {
    console.error("Incident Controller Error:", err);
    res.status(500).json({ message: "Error fetching incidents" });
  }
};
