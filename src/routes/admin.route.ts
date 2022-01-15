import express from "express";
import {
    blockUserHandler,
    getAllClassroomsHandler,
    getAllUserHandler,
    unBlockUserHandler
} from "../controllers/admin.controller";

const router = express.Router();

router.get("/users", getAllUserHandler);
router.post("/users/block", blockUserHandler);
router.post("/users/unblock", unBlockUserHandler);
router.get("/classrooms", getAllClassroomsHandler);

export default router;