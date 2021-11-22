import { Request, Response } from "express";
import {
  getUserById,
  googleSignUserIn,
  registerUser,
  signUserIn,
} from "../model/User";
import jwt from "jsonwebtoken";

export const signInHandler = async (req: Request, res: Response) => {
  try {
    const user = await signUserIn(req.body.email, req.body.password);
    if (user !== null) {
      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.TOKEN_SECRET + ""
      );
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

export const googleSignInHandler = async (req: Request, res: Response) => {
  try {
    const user = await googleSignUserIn(
      req.body.externalType,
      req.body.externalId,
      req.body.email,
      req.body.name
    );

    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.TOKEN_SECRET + ""
      );
      return res.json({
        email: user.email,
        name: user.name,
        token: token,
      });
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
      delete user.password;
      res.json(user);
      return;
    }
    res.status(400).json("Email is registered!");
  } catch (err) {
    res.status(400).json(err);
  }
};
