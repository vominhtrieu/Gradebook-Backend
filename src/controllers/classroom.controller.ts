import { Request, Response } from "express";
import {
    createClassroom,
    getClassroomDetailById,
    getAllClassrooms,
    getClassroomsByTeacherId,
    getClassroomDetailByCode
} from "../model/Classroom";
import { enrollClassroom } from "../model/Classroom";

export const enrollClassroomHandler = async (req: Request, res: Response) => {
    try {
        const user = req.headers["userData"] as any;
        let type = 0;
        if (req.body.studentInvitationCode && req.body.studentInvitationCode.length > 0) {
            type = 1;
        } else if (req.body.teacherInvitationCode && req.body.teacherInvitationCode.length > 0) {
            type = 2;
        }
        if (type === 0) {
            return res.status(400).json("Invalid code!");
        }
        const classroom = await getClassroomDetailByCode(req.body.studentInvitationCode, req.body.teacherInvitationCode, user.id);
        if (classroom === null) {
            return res.status(400).json("Invalid code!")
        }
        const classroomMember = await enrollClassroom(user.id, classroom.id, type);
        if (classroomMember !== null) {
            res.json(classroomMember);
            return;
        }
        res.status(400).json("Failed to enroll classroom!")
    } catch (err: any) {
        res.status(400).json("Failed to enroll classroom!")
    }
};

export const getClassroomDetailHandler = async (req: Request, res: Response) => {
    try {
        const user = req.headers["userData"] as any;
        const classrooms = await getClassroomDetailById(req.params.id, user.id);
        if (classrooms != null) {
            res.json(classrooms);
            return;
        }
        res.status(400).json("Something went wrong!");
    } catch (err: any) {
        res.status(400).json("Something went wrong!");
    }
}

export const getAllClassroomsHandler = async (req: Request, res: Response) => {
    try {
        const user = req.headers["userData"] as any;
        const teacherId = parseInt(req.query.id as string);
        let classrooms;
        if (teacherId > 0) {
            classrooms = await getClassroomsByTeacherId(teacherId, user.id);
        } else {
            classrooms = await getAllClassrooms(user.id);
        }
        if (classrooms != null) {
            res.json(classrooms);
            return;
        }
        res.status(400).json("Something went wrong!");
    } catch (err: any) {
        res.status(400).json("Something went wrong!");
    }
};

export const createClassroomHandler = async (req: Request, res: Response) => {
    try {
        const user = req.headers["userData"] as any;
        req.body.teacherId = user.id;
        const classroom = await createClassroom(user.id, req.body);
        if (classroom.id > 0) {
            res.json(classroom);
            return;
        }
        res.status(400).json("Failed to create classroom!")
    } catch (err: any) {
        res.status(400).json("Failed to create classroom!")
    }
};