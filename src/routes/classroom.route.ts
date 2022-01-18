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
  getGradeDetails,
  importGradeDetails,
  importStudents,
  updateGradeDetails,
  getGradeBoard,
  markFinalizedGradeStructure,
  getGradeBoardStudentHandler,
  getStudentGradeDetails,
  requestGradeReview,
  getGradeReviews,
  makeFinalDecisionForGradeReview,
  acceptGradeReview,
  getGradeReviewConversation,
  addGradeReviewComment,
} from "../controllers/classroom.controller";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().getTime()}-${Math.random()}.xlsx`);
  },
});
const uploader = multer({ storage: storage });

// General
router.post("/:id/enroll", enrollClassroomHandler);
router.get("/role/student", getClassroomsWithRoleStudentHandler);
router.get("/role/teacher", getClassroomsWithRoleTeacherHandler);
router.get("/:id/grade-board-student", getGradeBoardStudentHandler);
router.get("/", getAllClassroomsHandler);
router.post("/send-invitation-link", sendInviteLinkHandler);
router.post("/", createClassroomHandler);
router.get("/:id", getClassroomDetailHandler);

// Grade structures
router.get("/:id/grade-structures", getGradeStructuresHandler);
router.post("/:id/grade-structures", createGradeStructuresHandler);
router.put("/:id/grade-structures", updateGradeStructuresHandler);
router.put("/:id/grade-structures/order", updateGradeStructuresOrderHandler);
router.delete("/:id/grade-structures", deleteGradeStructuresHandler);

// Grade
router.get("/:id/grades", getGradeDetails);
router.post("/:id/grades/import", uploader.single("file"), importGradeDetails);
router.put("/:id/grades", updateGradeDetails);
router.put("/:id/mark-final", markFinalizedGradeStructure);
router.post("/:id/students/import", uploader.single("file"), importStudents);
router.get("/:id/grade-board", getGradeBoard);

// Student grade
router.get("/:id/student/grades", getStudentGradeDetails);
router.post("/:id/student/grades/request-review", requestGradeReview);

// Teacher review
router.get("/:id/grade-reviews", getGradeReviews);
router.post("/:id/grade-reviews/accept-review", acceptGradeReview);
router.post(
  "/:id/grade-reviews/make-final-decision",
  makeFinalDecisionForGradeReview
);

// Grade review conversation
router.post(
  "/:id/review/conversation/:gradeDetailId/add-comment",
  addGradeReviewComment
);
router.get(
  "/:id/review/conversation/:gradeDetailId",
  getGradeReviewConversation
);

export default router;
