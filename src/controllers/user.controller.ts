import { Request, Response } from "express";
import {
    getUserById,
    getUsersByEmail,
    updateUserAvatar,
    updateUserName,
    updateUserPassword,
    updateUserStudentId,
} from "../model/User";
import { getClassroomsByUserId } from "../model/Classroom";

export const getProfileHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const user = await getUserById(userData.id);
        const classrooms = await getClassroomsByUserId(userData.id, userData.id);
        const classroomCount = classrooms.length;
        if (user !== null) {
            res.json({
                id: user.id,
                name: user.name,
                studentId: user.student_id,
                email: user.email,
                avatar: user.avatar,
                joinedDate: user.createdAt,
                classroomCount: classroomCount,
                passwordPresent: user.password && user.password.length > 0,
            });
            return;
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const getUsersByEmailHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const users = await getUsersByEmail(req.body.email);
        if (users !== null) {
            res.json(users);
            return;
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
};

export const updateStudentIdHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const result = await updateUserStudentId(userData.id, req.body.studentId);
        if (result.length > 0) {
            return res.json({studentId: result.student_id});
        }
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
};

export const updateNameHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const result = await updateUserName(userData.id, req.body.name);
        if (result.length > 0) {
            return res.json({name: result.name});
        }
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
};

export const updatePasswordHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const result = await updateUserPassword(
            userData.id,
            req.body.oldPassword,
            req.body.newPassword
        );
        if (result.length > 0) {
            return res.status(200).json("Success");
        }
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
};

export const updateAvatarHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.headers["userData"] as any;
        const result = await updateUserAvatar(
            userData.id,
            "/public/" + req.file?.filename
        );
        if (result.length > 0) {
            return res.json({avatar: `${req.file?.filename}`});
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Some thing went wrong!");
    }
};
