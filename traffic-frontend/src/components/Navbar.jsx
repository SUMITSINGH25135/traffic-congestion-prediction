import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <NavLink to="/traffic" className="nav-item">Traffic Overview</NavLink>
      <NavLink to="/route" className="nav-item">Shortest Route</NavLink>
    </div>
  );
}
