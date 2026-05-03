import React, { useState, useRef } from "react";
import { autocompleteSearch } from "../services/searchService";
import "../styles/SearchBar.css";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await autocompleteSearch(value);
        setSuggestions(results);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 350);
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder="Search for a place..."
        className="search-input"
        value={query}
        onChange={handleChange}
      />

      {suggestions.length > 0 && (
        <div className="suggestions-box">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="suggestion-item"
              onClick={() => {
                setQuery(item.address?.freeformAddress || "");
                setSuggestions([]);
                onSelect(item);
              }}
            >
              {item.address?.freeformAddress}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
