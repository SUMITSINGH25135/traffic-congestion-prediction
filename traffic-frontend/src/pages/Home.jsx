import { useState } from "react";
import { getTrafficFlow } from "../services/api";

export default function Home() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [result, setResult] = useState(null);

  const fetchData = async () => {
    try {
      const data = await getTrafficFlow(lat, lon);
      setResult(data.flowSegmentData);
    } catch (err) {
      alert("Error fetching traffic data");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Traffic Flow Checker</h2>

      <input
        type="text"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        type="text"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <button onClick={fetchData}>Check Traffic</button>

      {result && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray" }}>
          <h3>Traffic Data:</h3>
          <p><b>Current Speed:</b> {result.currentSpeed} km/h</p>
          <p><b>Free Flow Speed:</b> {result.freeFlowSpeed} km/h</p>
          <p><b>Road Closure:</b> {result.roadClosure ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}
