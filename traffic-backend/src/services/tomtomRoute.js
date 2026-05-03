// src/services/tomtomRoute.js
import axios from "axios";

export async function fetchRoute(startLat, startLon, endLat, endLon) {
  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) throw new Error("Missing TOMTOM_API_KEY env variable");

  // TomTom expects: {lat},{lon}:{lat},{lon}
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json
    ?traffic=true
    &routeRepresentation=polyline
    &computeTravelTimeFor=all
    &key=${apiKey}`
    .replace(/\s+/g, "");


  const resp = await axios.get(url);
  return resp.data;
}
