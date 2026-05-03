import axios from "axios";

const SEARCH_URL = "https://api.tomtom.com/search/2/search";

export const autocompleteSearch = async (query) => {
  const key = process.env.REACT_APP_TOMTOM_API_KEY;

  const url = `${SEARCH_URL}/${encodeURIComponent(query)}.json?key=${key}&typeahead=true&limit=5`;

  const { data } = await axios.get(url);
  return data.results || [];
};
