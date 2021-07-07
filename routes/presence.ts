import { Router } from "express";
import PresenceController from "../controllers/PresenceController";
import auth from "../middlewares/auth";
const router = Router();

router.get("/generateqr", PresenceController.generateQR);
router.post("/report", auth, PresenceController.downloadReport);
export default router;
