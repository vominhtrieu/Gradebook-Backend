import { Request, Response } from "express";
import { BlockUser, getAllUser, UnBlockUser } from "../model/User";
import { getAllClassrooms, getAllClassroomsByUserId } from "../model/Classroom";

export const getAllUserHandler = async (req: Request, res: Response) => {
    try {
        const users = await getAllUser();
        if (users !== null) {
            res.json(users);
            return;
        }
        res.status(400).json("User not found!");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const blockUserHandler = async (req: Request, res: Response) => {
    try {
        await BlockUser(req.body.id)
        res.sendStatus(200);
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const unBlockUserHandler = async (req: Request, res: Response) => {
    try {
        await UnBlockUser(req.body.id)
        res.sendStatus(200);
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const getAllClassroomsHandler = async (req: Request, res: Response) => {
    try {
        const classrooms = await getAllClassrooms();
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}