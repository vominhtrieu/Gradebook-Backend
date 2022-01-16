import express from "express";
import { getAllNotifications, getUnreadNotificationCount } from "../controllers/notification.controller";

const router = express.Router();

router.get("/unread", getUnreadNotificationCount);
router.get("/", getAllNotifications);

export default router;