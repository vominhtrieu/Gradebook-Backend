import express from "express";
import {
  getClassroomDetailHandler,
  getAllClassroomsHandler,
  createClassroomHandler,
  enrollClassroomHandler,
  sendInviteLinkHandler,
  getClassroomsWithRoleStudentHandler,
  getClassroomsWithRoleTeacherHandler,
} from "../controllers/classroom.controller";

const router = express.Router();

router.post("/:id/enroll", enrollClassroomHandler);
router.get("/:id", getClassroomDetailHandler);
router.get("/role/student", getClassroomsWithRoleStudentHandler);
router.get("/role/teacher", getClassroomsWithRoleTeacherHandler);
router.get("/", getAllClassroomsHandler);
router.post("/send-invitation-link", sendInviteLinkHandler);
router.post("/", createClassroomHandler);

export default router;
