import { Router } from "express";
import SettingController from "../controllers/SettingController";
import auth from "../middlewares/auth";
const router = Router();

router.get("/", auth, SettingController.get);
router.put("/", auth, SettingController.update);
router.get("/init", auth, SettingController.init);

export default router;
