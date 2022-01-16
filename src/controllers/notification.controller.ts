import { getAllNotificationByUserId } from "../model/Notification";
import { Request, Response } from "express";

export async function getAllNotifications(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const notifications = await getAllNotificationByUserId(user.id);
        if (notifications != null) {
            res.json(notifications);
            return;
        }
        res.status(500).json("Something went wrong!");
    } catch (err: any) {
        res.status(500).json("Something went wrong!");
    }
}