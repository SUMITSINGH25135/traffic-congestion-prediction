import "../styles/MapView.css"; // keep same styles
import SearchBar from "../components/SearchBar";
import TrafficSidebar from "../components/TrafficSidebar";
import { getTrafficFlow, getTrafficIncidents } from "../services/api";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

import React, { useEffect, useRef, useState } from "react";

export default function TrafficOverview() {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);
  const incidentsRef = useRef([]);


  const [status, setStatus] = useState("Map loading...");
  const [sidebarData, setSidebarData] = useState(null);
  const [sidebarLocation, setSidebarLocation] = useState("");


  useEffect(() => {
    if (!process.env.REACT_APP_TOMTOM_API_KEY) {
      setStatus("Missing REACT_APP_TOMTOM_API_KEY in .env");
      return;
    }

    // Initialize map
    mapRef.current = tt.map({
      key: process.env.REACT_APP_TOMTOM_API_KEY,
      container: mapElement.current,
      center: [77.23, 28.61], // lon, lat (TomTom expects [lng, lat])
      zoom: 12
    });

    // Add zoom control
    mapRef.current.addControl(new tt.NavigationControl());

    mapRef.current.on("load", () => {
      setStatus("Map loaded. Click anywhere to get traffic flow for that point.");
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // click handler: place marker & fetch flow data from backend
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;

    setStatus(`Fetching traffic flow for ${lat.toFixed(5)}, ${lng.toFixed(5)}...`);

    // CLEAR previous sidebar content
    setSidebarData(null);

    try {
      const data = await getTrafficFlow(lat, lng);

      // Update sidebar (SUCCESS)
      setSidebarData(data);
      setSidebarLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);

      setStatus("Traffic data loaded.");
    } catch (err) {
      console.error("Error fetching traffic flow:", err);

      // Update sidebar (ERROR mode)
      setSidebarData({
        flowSegmentData: {
          currentSpeed: "N/A",
          freeFlowSpeed: "N/A",
          roadClosure: "N/A",
        }
      });

      setSidebarLocation("Error fetching traffic data");
      setStatus("Error fetching traffic data.");
    }
  };

  map.on("click", handleMapClick);

  return () => map.off("click", handleMapClick);
}, []);


const handleSelectPlace = async (item) => {
  const pos = item.position;
  const { lat, lon } = pos;

  // Move map to the selected location
  mapRef.current.flyTo({
    center: [lon, lat],
    zoom: 14,
    speed: 1
  });

  // Create marker
  const marker = new tt.Marker()
    .setLngLat([lon, lat])
    .addTo(mapRef.current);

  markersRef.current.push(marker);

  setStatus(`Fetching traffic for ${item.address.freeformAddress}...`);

  try {
    const data = await getTrafficFlow(lat, lon);

    // Update sidebar with traffic info
    setSidebarData(data);
    setSidebarLocation(item.address.freeformAddress);

    setStatus(`Traffic data loaded for ${item.address.freeformAddress}`);
  } catch (err) {
    console.error("Traffic fetch error:", err);

    // Show fallback error in sidebar
    setSidebarData({
      flowSegmentData: {
        currentSpeed: "N/A",
        freeFlowSpeed: "N/A",
        roadClosure: "N/A"
      }
    });

    setSidebarLocation("Error fetching traffic data");
    setStatus("Error fetching traffic data.");
  }
};

const clearMarkers = () => {
  markersRef.current.forEach(marker => marker.remove());
  markersRef.current = []; // reset array
  setStatus("All markers cleared.");
};

// getting incident category
function getIncidentType(category) {
  const map = {
    1: "Accident",
    2: "Fog",
    3: "Dangerous Conditions",
    4: "Rain",
    5: "Ice",
    6: "Traffic Jam",
    7: "Roadwork",
    8: "Road Closure",
    9: "Lane Closure",
    10: "Road Hazard",
    11: "Weather Hazard",
    14: "Flooding",
    16: "Other"
  };
  return map[category] || "Unknown";
}


//loading traffic incidents
const loadIncidents = async () => {
  console.log("loadIncidents called");

  if (!mapRef.current) return;

  setStatus("Loading incidents...");

  // Clear old markers
  incidentsRef.current.forEach(marker => marker.remove());
  incidentsRef.current = [];

  // Get map center
  const center = mapRef.current.getCenter();
  const lat = center.lat;
  const lon = center.lng;

  // Create a safe bbox around center (±0.05 degree)
  const offset = 0.02; // approx 5–6 km
  const bbox = [
    lon - offset, // minLon
    lat - offset, // minLat
    lon + offset, // maxLon
    lat + offset  // maxLat
  ].join(",");

    try {
      console.log("Fetching:", bbox);

      const data = await getTrafficIncidents(bbox);
      const incidents = data.incidents || [];
      
    console.log("API incidents:", incidents);

      incidents.forEach(inc => {
    let incidentLon = null;
    let incidentLat = null;
    const geom = inc.geometry;

    const category = inc.properties?.iconCategory;
    const incidentType = getIncidentType(category);

    if (geom.type === "Point") {
      [incidentLon, incidentLat] = geom.coordinates;
    } else if (geom.type === "LineString") {
      [incidentLon, incidentLat] = geom.coordinates[0];
    } else if (geom.type === "MultiLineString") {
      [incidentLon, incidentLat] = geom.coordinates[0][0];
    } else if (geom.type === "Polygon") {
      [incidentLon, incidentLat] = geom.coordinates[0][0];
    } else if (geom.type === "MultiPolygon") {
      [incidentLon, incidentLat] = geom.coordinates[0][0][0];
    }

    if (incidentLon == null || incidentLat == null) return;

    const marker = new tt.Marker({ color: "#d32f2f" })
      .setLngLat([incidentLon, incidentLat])
      .addTo(mapRef.current);

    marker.getElement().style.cursor = "pointer";

    
    marker.getElement().addEventListener("click", (e) => {
      e.stopPropagation();   // ← stops map click from firing
      e.preventDefault();

      console.log("incidentType:", incidentType);

      setSidebarData({
        ...inc,
        incidentType
      });

      setSidebarLocation(incidentType);
    });



    incidentsRef.current.push(marker);
  });


    setStatus(`Loaded ${incidents.length} incidents.`);
  } catch (err) {
    console.error("Error loading incidents:", err);
    setStatus("Failed to load incidents.");
  }
};

//for clearing road incidents
const clearIncidents = () => {
  incidentsRef.current.forEach(marker => marker.remove());
  incidentsRef.current = [];
  setStatus("Incidents cleared.");
};



return (
  <div className="map-page">
    <h2 className="map-heading">Traffic Flow & Incidents</h2>

    <button className="clear-btn" onClick={clearMarkers}>
      Clear Markers
    </button>

    <button className="clear-btn" onClick={loadIncidents}>
      Load Traffic Incidents
    </button>

    <button className="clear-btn" onClick={clearIncidents}>
    Clear Incidents
    </button>



    <div className="map-container">

      <div id="map" ref={mapElement} className="map-box" />

      <div className="searchbar-wrapper">
        <SearchBar onSelect={handleSelectPlace} />
      </div>

      <TrafficSidebar
        data={sidebarData}
        locationName={sidebarLocation}
        onClose={() => setSidebarData(null)}
      />

    </div>

    <p>{status}</p>
  </div>
);
}
