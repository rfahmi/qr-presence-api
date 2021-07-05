import { Router } from "express";
import DivisionController from "../controllers/DivisionController";
const router = Router();

router.get("/", DivisionController.index);
router.post("/", DivisionController.create);
router.get("/:id", DivisionController.get);
router.put("/:id", DivisionController.update);
router.delete("/:id", DivisionController.delete);

export default router;
