import { Router } from "express";
import DivisionController from "../controllers/DivisionController";
import auth from "../middlewares/auth";
const router = Router();

router.get("/", auth, DivisionController.index);
router.post("/", auth, DivisionController.create);
router.get("/:id", auth, DivisionController.get);
router.put("/:id", auth, DivisionController.update);
router.delete("/:id", auth, DivisionController.delete);

export default router;
