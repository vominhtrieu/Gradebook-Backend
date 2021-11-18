import express from "express";
import {
    getClassroomDetailHandler,
    getAllClassroomsHandler,
    createClassroomHandler,
    enrollClassroomHandler
} from "../controllers/classroom.controller";
const router = express.Router();

router.post("/:id/enroll", enrollClassroomHandler);
router.get("/:id", getClassroomDetailHandler);
router.get("/", getAllClassroomsHandler)
router.post("/", createClassroomHandler);

export default router;
