import express, { Request, Response } from "express";
import { signInHandler, signUpHandler } from "../controllers/auth.controller";

const router = express.Router();

router.post("/signin", signInHandler);
router.post("/signup", signUpHandler);
router.get("/status", (_: Request, res: Response) => {
    res.sendStatus(200);
});

export default router;
