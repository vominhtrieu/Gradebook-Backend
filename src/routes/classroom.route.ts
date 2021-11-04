import express from "express";
import { getClassroomHandler, createClassroomHandler } from "../controllers/classroom.controller";
const router = express.Router();

router.get("/", getClassroomHandler)
router.post("/", createClassroomHandler);

export default router;
