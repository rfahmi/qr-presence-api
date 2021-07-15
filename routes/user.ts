import { Router } from "express";
import UserController from "../controllers/UserController";
import PresenceController from "../controllers/PresenceController";
import auth from "../middlewares/auth";
const router = Router();

router.post("/login", UserController.login);
router.get("/", auth, UserController.index);
router.post("/", auth, UserController.create);
router.get("/:id", auth, UserController.get);
router.put("/:id", auth, UserController.update);
router.delete("/:id", auth, UserController.delete);
router.post("/:id/verifysign", auth, UserController.verifySign);

//User Presence
router.get("/:id/presence", auth, PresenceController.get);
router.post("/:id/presence/report/summary", auth, PresenceController.getReportSumary);
router.post("/:id/presence/:type", auth, PresenceController.create);

export default router;
