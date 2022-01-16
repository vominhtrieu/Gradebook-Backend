import express from "express";
import { getAllNotifications } from "../controllers/notification.controller";

const router = express.Router();

router.get("/notifications/", getAllNotifications);