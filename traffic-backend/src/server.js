import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


import express from "express";
import cors from "cors";
import trafficRoutes from "./routes/trafficRoutes.js";

const app = express();
app.use(cors());

app.use("/api/traffic", trafficRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
