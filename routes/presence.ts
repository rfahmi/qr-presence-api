import { Router } from "express";
import PresenceController from "../controllers/PresenceController";
const router = Router();

router.get("/generateqr", PresenceController.generateQR);
router.get("/report", PresenceController.downloadReport);
export default router;
