import { Router } from "express";
import UserController from "../controllers/UserController";
import PresenceController from "../controllers/PresenceController";
const router = Router();

router.post("/login", UserController.login);
router.get("/", UserController.index);
router.post("/", UserController.create);
router.get("/:id", UserController.get);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

//User Presence
router.get("/:id/presence", PresenceController.get);
router.post("/:id/presence/:type", PresenceController.create);

export default router;
