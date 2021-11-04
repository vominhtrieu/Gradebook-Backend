import { Request, Response } from "express";
import { createClassroom, getAllClassrooms, getClassroomsByTeacherId } from "../model/Classroom";

export const getClassroomHandler = async (req: Request, res: Response) => {
    try {
        req.body.teacherId = req.headers["id"];
        const teacherId = parseInt(req.query.teacherId as string)
        let classrooms;
        if (teacherId > 0) {
            classrooms = await getClassroomsByTeacherId(teacherId);
        } else {
            classrooms = await getAllClassrooms();
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
        const classroom = await createClassroom(req.body);
        if (classroom.id > 0) {
            res.json(classroom);
            return;
        }
        res.status(400).json("Failed to create classroom!")
    } catch (err: any) {
        res.status(400).json("Failed to create classroom!")
    }
};