import { Request, Response } from "express";
import {
  activeUserAccount,
  getUserByActivationCode,
  getUsersByEmail,
  googleSignUserIn,
  registerUser,
  signUserIn, updateUserPassword,
} from "../model/User";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import {getActivationMail, getResetPasswordMail} from "./mailContent";
import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
        studentId: user.student_id,
        email: user.email,
        name: user.name,
        role: user.role,
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
        studentId: user.student_id,
        email: user.email,
        name: user.name,
        role: user.role,
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
      const activationLink = `${process.env.CLIENT_HOST}/activation/${user.activationCode}`
      transporter
          .sendMail({
            from: `Gradebook System <${process.env.EMAIL_ACCOUNT}>`,
            to: user.email,
            subject: "Account Activation",
            html: getActivationMail(
                user.name,
                activationLink,
            ),
          })
          .then(() => {
            res.json(user);
          })
          .catch(err => {
            console.log(err);
            res.sendStatus(400);
          });
      return;
    }
    res.status(400).json("Email is registered!");
  } catch (err) {
    res.status(400).json(err);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const userData = await getUsersByEmail(req.body.email);
    if (userData !== null) {
      const newPass = randomstring.generate({
        length: 15
      });
      const result = await updateUserPassword(userData[0].id, userData[0].password, newPass);
      if (result.length > 0) {
        transporter
            .sendMail({
              from: `Gradebook System <${process.env.EMAIL_ACCOUNT}>`,
              to: req.body.email,
              subject: "Reset user password",
              html: getResetPasswordMail(
                  userData[0].name,
                  newPass,
              ),
            })
            .then(() => {
              res.status(200).json("Password has been sent");
            })
            .catch(err => {
              res.sendStatus(400);
            });
      }
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.status(400).json(err);
  }
}

export const activeAccountHandler = async (req: Request, res: Response) => {
  try {
    const user = await getUserByActivationCode(req.body.activationCode);
    if (user !== null) {
      const result = await activeUserAccount(user.id);
      // @ts-ignore
      if (result.length > 0) {
        res.status(200).json("Account activated");
      } else {
        res.status(400).send("Can't activate");
      }
    }
  } catch (err) {
    res.status(400).json(err);
  }
}
