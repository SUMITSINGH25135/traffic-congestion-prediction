import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // loads the .env file

const testTraffic = async () => {
  const lat = 28.6129;   // India Gate latitude
  const lon = 77.2295;   // India Gate longitude

  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point=${lat},${lon}&key=${process.env.TOMTOM_API_KEY}`;

  console.log("Requesting:", url);

  try {
    const { data } = await axios.get(url);
    console.log("\n=== TRAFFIC DATA RECEIVED ===\n");
    console.log(data);
  } catch (err) {
    console.log("\n=== ERROR OCCURRED ===\n");
    console.log(err.response?.data || err.message);
  }
};

testTraffic();
