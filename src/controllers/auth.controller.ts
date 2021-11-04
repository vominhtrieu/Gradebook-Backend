import { Request, Response } from "express";
import { getUserById, registerUser, signUserIn } from "../model/User";
import jwt from "jsonwebtoken";

export const signInHandler = async (req: Request, res: Response) => {
    try {
        const user = await signUserIn(req.body.email, req.body.password);
        if (user !== null) {
            const token = jwt.sign({
                id: user.id
            }, process.env.TOKEN_SECRET + "")
            res.json({
                email: user.email,
                name: user.name,
                token: token,
            });
            return;
        }
        res.status(400).json("Wrong email or password!");
    } catch (err: any) {
        res.status(400).json("Wrong email or password!");
    }
};

export const signUpHandler = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);
        if (user !== null) {
            res.json(user);
            return;
        }
        res.status(400).json("Email is registered!");
    } catch (err) {
        res.status(400).json(err);
    }
};