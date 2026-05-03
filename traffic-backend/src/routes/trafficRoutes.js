import express from "express";
import { getTrafficFlow } from "../controllers/trafficController.js";
import { getTrafficIncidents } from "../controllers/incidentController.js";
import { getRoute } from "../controllers/routeController.js";

const router = express.Router();

// Traffic flow
router.get("/flow", getTrafficFlow);

// Traffic incidents (NEW)
router.get("/incidents", getTrafficIncidents);

router.get("/route", getRoute);

export default router;
