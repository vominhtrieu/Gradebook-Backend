import { Request, Response } from "express";
import { getUserById, updateUserAvatar } from "../model/User";
import { getClassroomsByTeacherId } from "../model/Classroom";

export const getProfileHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        let id = userData.id;
        if (req.query.id) {
            id = req.query.id;
        }
        const user = await getUserById(id);
        const classrooms = await getClassroomsByTeacherId(userData.id, userData.id);
        const classroomCount = classrooms.length;
        if (user !== null) {
            res.json({
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                joinedDate: user.createdAt,
                classroomCount: classroomCount,
                classrooms: classrooms,
            });
            return;
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Some thing went wrong!");
    }
};

export const updateAvatarHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const result = await updateUserAvatar(userData.id, "/public/" + req.file?.filename);
        if (result.length > 0) {
            return res.json({avatar: `${req.file?.filename}`})
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Some thing went wrong!");
    }
};