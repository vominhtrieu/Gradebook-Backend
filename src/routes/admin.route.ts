import express from "express";
import {
    blockUserHandler, changeStudentIDHandler, createNewAdminHandler,
    getAllClassroomsHandler,
    getAllUserHandler,
    unBlockUserHandler
} from "../controllers/admin.controller";

const router = express.Router();

router.get("/users", getAllUserHandler);
router.post("/users/admin", createNewAdminHandler);
router.post("/users/block", blockUserHandler);
router.post("/users/unblock", unBlockUserHandler);
router.put("/users/student-id", changeStudentIDHandler);
router.get("/classrooms", getAllClassroomsHandler);

export default router;