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
    getGradeBoard, markFinalizedGradeStructure,
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
const uploader = multer({storage: storage});

// General
router.post("/:id/enroll", enrollClassroomHandler);
router.get("/role/student", getClassroomsWithRoleStudentHandler);
router.get("/role/teacher", getClassroomsWithRoleTeacherHandler);
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

export default router;
