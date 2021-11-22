import express from "express";
import {
    getClassroomDetailHandler,
    getAllClassroomsHandler,
    createClassroomHandler,
    enrollClassroomHandler, sendInviteLinkHandler
} from "../controllers/classroom.controller";

const router = express.Router();

router.post("/:id/enroll", enrollClassroomHandler);
router.get("/:id", getClassroomDetailHandler);
router.get("/", getAllClassroomsHandler);
router.post("/send-invitation-link", sendInviteLinkHandler);
router.post("/", createClassroomHandler);

export default router;
