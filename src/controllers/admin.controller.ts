import { Request, Response } from "express";
import { BlockUser, getAllUser, registerUser, UnBlockUser, updateUserStudentId } from "../model/User";
import { getAllClassrooms, getAllClassroomsByUserId } from "../model/Classroom";
import { Op } from "sequelize";

export const getAllUserHandler = async (req: Request, res: Response) => {
    try {
        let condition: any = {};
        let query: any = req.query;
        if (query.q) {
            condition = {
                ...condition,
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: "%" + query.q + "%"
                        }
                    },
                    {
                        email: {
                            [Op.like]: "%" + query.q + "%"
                        }
                    },
                ]
            }
        }
        if (query.role) {
            // @ts-ignore
            condition.role = +query.role;
        }
        const users = await getAllUser(condition);
        if (users !== null) {
            res.json(users);
            return;
        }
        res.status(400).json("User not found!");
    } catch
        (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const createNewAdminHandler = async (req: Request, res: Response) => {
    try {
        await registerUser({...req.body, role: 2})
        res.status(200).json("Ok");
    } catch
        (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const blockUserHandler = async (req: Request, res: Response) => {
    try {
        await BlockUser(req.body.id)
        res.status(200).json("OK");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const unBlockUserHandler = async (req: Request, res: Response) => {
    try {
        await UnBlockUser(req.body.id)
        res.status(200).json("OK");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const getAllClassroomsHandler = async (req: Request, res: Response) => {
    try {
        let query: any = req.query;
        let condition: any = {};
        if (query.q) {
            condition = {
                ...condition,
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: "%" + query.q + "%"
                        }
                    },
                ]
            }
        }
        const classrooms = await getAllClassrooms(condition);
        res.status(200).json(classrooms);
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}

export const changeStudentIDHandler = async (req: Request, res: Response) => {
    try {
        await updateUserStudentId(req.body.id, req.body.studentId);
        res.status(200).json("OK");
    } catch (err) {
        res.status(400).json("Something went wrong!");
    }
}