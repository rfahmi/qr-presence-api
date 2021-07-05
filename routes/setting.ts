import { Router } from "express";
import SettingController from "../controllers/SettingController";
const router = Router();

router.get("/", SettingController.get);
router.put("/", SettingController.update);
router.get("/init", SettingController.init);

export default router;
