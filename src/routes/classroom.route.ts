import express from "express";
import {
  getClassroomDetailHandler,
  getAllClassroomsHandler,
  createClassroomHandler,
  enrollClassroomHandler,
  sendInviteLinkHandler,
  getClassroomsWithRoleStudentHandler,
  getClassroomsWithRoleTeacherHandler,
  getGradeStructuresHandler,
  updateGradeStructuresHandler,
  createGradeStructuresHandler,
  deleteGradeStructuresHandler,
  updateGradeStructuresOrderHandler,
} from "../controllers/classroom.controller";

const router = express.Router();

router.post("/:id/enroll", enrollClassroomHandler);
router.get("/:id/grade-structures", getGradeStructuresHandler);
router.post("/:id/grade-structures", createGradeStructuresHandler);
router.put("/:id/grade-structures", updateGradeStructuresHandler);
router.put("/:id/grade-structures/order", updateGradeStructuresOrderHandler);
router.delete("/:id/grade-structures", deleteGradeStructuresHandler);
router.get("/:id", getClassroomDetailHandler);
router.get("/role/student", getClassroomsWithRoleStudentHandler);
router.get("/role/teacher", getClassroomsWithRoleTeacherHandler);
router.get("/", getAllClassroomsHandler);
router.post("/send-invitation-link", sendInviteLinkHandler);
router.post("/", createClassroomHandler);

export default router;
