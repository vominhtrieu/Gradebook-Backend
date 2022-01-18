import express, { Request, Response } from "express";
import {
  activeAccountHandler,
  googleSignInHandler, resetPasswordHandler,
  signInHandler,
  signUpHandler,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signin", signInHandler);
router.post("/signin/google", googleSignInHandler);
router.post("/signup", signUpHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/activation", activeAccountHandler);
router.get("/status", (_: Request, res: Response) => {
  res.sendStatus(200);
});

export default router;
