import { Request, Response } from "express";
import { createClassroom, getAllClassrooms, getClassroomsByTeacherId } from "../model/Classroom";
import { enrollClassroom } from "../model/Classroom";

export const enrollClassroomHandler = async (req: Request, res: Response) => {
    try {
        const user = req.headers["userData"] as any;
        const classroomMember = await enrollClassroom(user.id, req.query.id);
        if (classroomMember !== null) {
            res.json(classroomMember);
            return;
        }
        res.status(400).json("Failed to enroll classroom!")
    } catch (err: any) {
        res.status(400).json("Failed to enroll classroom!")
    }
};
export const getClassroomHandler = async (req: Request, res: Response) => {
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