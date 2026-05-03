// src/controllers/routeController.js
import { fetchRoute } from "../services/tomtomRoute.js";

export async function getRoute(req, res) {
  try {
    const { startLat, startLon, endLat, endLon } = req.query;

    if (!startLat || !startLon || !endLat || !endLon) {
      return res.status(400).json({ message: "startLat/startLon/endLat/endLon are required" });
    }

    const data = await fetchRoute(startLat, startLon, endLat, endLon);

    const route = data.routes && data.routes[0];
    if (!route) return res.status(500).json({ message: "No route returned from TomTom", raw: data });

    // TomTom response structure can vary; attempt to extract points and summary
    const leg = route.legs && route.legs[0];
    const points = leg?.points || []; // each point: {latitude, longitude}
    const summary = route.summary || {};

    return res.json({ points, summary, raw: undefined }); // don't include raw by default
  } catch (err) {
    console.error("RouteController error:", err?.response?.data ?? err.message ?? err);
    // If TomTom gives an error object, include it for debugging
    const detailed = err?.response?.data || err.message || err;
    return res.status(500).json({ message: "Route error", detailed });
  }
}
