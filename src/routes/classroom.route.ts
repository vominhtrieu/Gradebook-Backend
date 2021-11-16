import express from "express";
import {
    getClassroomHandler,
    createClassroomHandler,
    enrollClassroomHandler
} from "../controllers/classroom.controller";
const router = express.Router();

router.post("/enroll", enrollClassroomHandler);
router.get("/", getClassroomHandler)
router.post("/", createClassroomHandler);

export default router;
