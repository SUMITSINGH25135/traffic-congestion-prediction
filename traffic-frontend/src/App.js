import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import TrafficOverview from "./pages/TrafficOverview";
import MapRouting from "./pages/MapRouting";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<TrafficOverview />} />
          <Route path="/traffic" element={<TrafficOverview />} />
          <Route path="/route" element={<MapRouting />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
