import React, { useEffect, useRef, useState } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

// Importing exactly as defined in your actual service files
import { getRoute } from "../services/api"; 
import { autocompleteSearch } from "../services/searchService"; 

import RouteSidebar from "../components/RouteSidebar";
import { getPredictiveInsights } from "../services/insightService";

import "../styles/MapView.css";
import "../styles/MapRouting.css";

// Reusable Autocomplete Input Component
const AutocompleteInput = ({ label, placeholder, onSelect, onClear }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const isSelecting = useRef(false); // used so that the dropdown disappears once a place is selected

  // Debouncing: We wait 500ms after the user stops typing before calling the API
  // This prevents hitting the TomTom API limit on every single keystroke
useEffect(() => {
    // If the text changed because we clicked a dropdown item, skip the search!
    if (isSelecting.current) {
      isSelecting.current = false; // Reset the flag for the next time they type
      return; 
    }

    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const data = await autocompleteSearch(query);
          setResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Autocomplete error:", error);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place) => {
    // NEW: Set the flag to true BEFORE updating the query text
    isSelecting.current = true; 
    
    setQuery(place.address.freeformAddress || place.poi?.name || "Unknown Location");
    setShowDropdown(false);
    
    const { lat, lon } = place.position;
    onSelect(`${lat}, ${lon}`); 
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    onClear();
  };

  return (
    <div className="routing-input-box" style={{ position: "relative" }}>
      <label>{label}</label>
      <div style={{ display: "flex", gap: "5px" }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === "") handleClear();
          }}
          placeholder={placeholder}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {query && (
          <button onClick={handleClear} style={{ cursor: "pointer", background: "none", border: "none" }}>
            ✕
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="autocomplete-dropdown" style={{
          /* ... keep your existing inline CSS here ... */
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #ccc",
          listStyle: "none",
          margin: 0,
          padding: 0,
          maxHeight: "200px",
          overflowY: "auto",
          zIndex: 1000
        }}>
          {results.map((place) => (
            <li 
              key={place.id} 
              onClick={() => handleSelect(place)}
              style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee", color: "black" }}
            >
              <strong>{place.poi ? place.poi.name : place.address.streetName}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {place.address.freeformAddress}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Main Map Routing Component
const MapRouting = () => {
  const mapRef = useRef(null);
  const map = useRef(null);

  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  // States to hold the raw coordinate strings ("lat, lon") received from the autocomplete component
  const [startCoords, setStartCoords] = useState("");
  const [endCoords, setEndCoords] = useState("");
  const [resetKey, setResetKey] = useState(0); //to clear input fields

  const [routeInfo, setRouteInfo] = useState(null);
  const [sidebarData, setSidebarData] = useState(null);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());

  // Initialize the TomTom map only once when the component mounts
  useEffect(() => {
    map.current = tt.map({
      key: process.env.REACT_APP_TOMTOM_API_KEY,
      container: mapRef.current,
      center: [77.23, 28.61],
      zoom: 12,
    });
  }, []);

  const drawRoute = (routeData) => {
    const coords = routeData.points.map(p => [p.longitude, p.latitude]);

    // Clean up any existing routes before drawing a new one
    if (map.current.getLayer("route-line")) {
      map.current.removeLayer("route-line");
      map.current.removeSource("route-line");
    }

    map.current.addSource("route-line", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } },
    });

    map.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route-line",
      paint: { "line-color": "#4aa8ff", "line-width": 6 },
    });

    // Automatically zoom and pan the map so the entire route is visible
    let bounds = new tt.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    map.current.fitBounds(bounds, { padding: 50 });
  };

const calculateRoute = async () => {
    if (!startCoords || !endCoords) {
      alert("Please select valid start and end locations from the dropdown.");
      return;
    }

    const [startLat, startLon] = startCoords.split(",").map(s => s.trim());
    const [endLat, endLon] = endCoords.split(",").map(s => s.trim());

    // Check if today is a weekend (0 = Sunday, 6 = Saturday)
    // If you want users to predict for *future* days, you'd need a full Datepicker, 
    // but for now, we'll check the current real-world day.
    const isWeekend = [0, 6].includes(new Date().getDay());

    // FIRE BOTH APIS CONCURRENTLY
    const [routeResult, mlResult] = await Promise.allSettled([
      getRoute(startLat, startLon, endLat, endLon),
      getPredictiveInsights(startLat, startLon, endLat, endLon, selectedHour, isWeekend)
    ]);

    // Handle TomTom Failure (Critical)
    if (routeResult.status === "rejected" || !routeResult.value.points) {
      alert("Failed to calculate route from TomTom.");
      return;
    }

    const routeData = routeResult.value;
    placeMarkers(startLat, startLon, endLat, endLon);
    setRouteInfo(routeData);
    drawRoute(routeData);

    // Handle ML Success/Failure (Non-Critical)
    let aiPredictionMinutes = null;
    if (mlResult.status === "fulfilled") {
       // Convert Python's raw seconds prediction into rounded minutes
       aiPredictionMinutes = Math.round(mlResult.value.predicted_travel_time_seconds / 60);
    } else {
       console.warn("AI Insight not available:", mlResult.reason);
    }

    const summary = routeData.summary;
    
    // Update Sidebar with BOTH datasets
    setSidebarData({
          type: "route",
          distance: (summary.lengthInMeters / 1000).toFixed(2),
          trafficTime: Math.round(summary.travelTimeInSeconds / 60),
          delay: Math.round(summary.trafficDelayInSeconds / 60),
          
          // RE-ADD THESE TWO:
          freeFlowTime: Math.round(summary.noTrafficTravelTimeInSeconds / 60),
          trafficLength: (summary.trafficLengthInMeters / 1000).toFixed(2),
          
          aiPrediction: aiPredictionMinutes,
          selectedHour: selectedHour
        });
  };

  const clearRoute = () => {
    if (map.current.getLayer("route-line")) {
      map.current.removeLayer("route-line");
      map.current.removeSource("route-line");
    }

    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    setSidebarData(null);
    setStartCoords("");
    setEndCoords("");

    setResetKey(prev => prev + 1);
    
    // Reset map view to default coordinates
    map.current.flyTo({ center: [77.23, 28.61], zoom: 11, speed: 1.2 });
  };

  const placeMarkers = (startLat, startLon, endLat, endLon) => {
    if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
    if (endMarkerRef.current) { endMarkerRef.current.remove(); endMarkerRef.current = null; }

    const startEl = document.createElement("div");
    startEl.style.background = "#2f80ff";
    startEl.style.width = "16px";
    startEl.style.height = "16px";
    startEl.style.borderRadius = "50%";
    startEl.style.border = "2px solid white";

    startMarkerRef.current = new tt.Marker({ element: startEl })
      .setLngLat([parseFloat(startLon), parseFloat(startLat)])
      .addTo(map.current);

    const endEl = document.createElement("div");
    endEl.style.background = "#ff4d4d";
    endEl.style.width = "16px";
    endEl.style.height = "16px";
    endEl.style.borderRadius = "50%";
    endEl.style.border = "2px solid white";

    endMarkerRef.current = new tt.Marker({ element: endEl })
      .setLngLat([parseFloat(endLon), parseFloat(endLat)])
      .addTo(map.current);
  };

  return (
    <div className="map-wrapper">
      <h2 className="map-heading">Smart Routing (Traffic Aware)</h2>

      <div className="routing-input-wrapper">
        <AutocompleteInput 
          key={`start-${resetKey}`}
          label="Start Location" 
          placeholder="Search starting point..." 
          onSelect={(coords) => setStartCoords(coords)}
          onClear={() => setStartCoords("")}
        />

        <AutocompleteInput 
          key={`end-${resetKey}`}
          label="Destination" 
          placeholder="Search destination..." 
          onSelect={(coords) => setEndCoords(coords)}
          onClear={() => setEndCoords("")}
        />
    <div className="routing-input-box">
              <label>Departure Time</label>
              <select 
                value={selectedHour} 
                onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value={new Date().getHours()}>Leave Now</option>
                <option disabled>──────────</option>
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>

        <button className="route-btn" onClick={calculateRoute}>
          Find Route
        </button>

        <button className="route-btn" onClick={clearRoute}>
          Clear Route
        </button>
      </div>

      <div className="map-container">
        <div ref={mapRef} className="map-box"></div>
        {sidebarData && <RouteSidebar data={sidebarData} onClose={() => setSidebarData(null)} />}
      </div>
    </div>
  );
};

export default MapRouting;

//testing branch protection