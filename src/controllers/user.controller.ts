import { Request, Response } from "express";
import {
  getUserById,
  updateUserAvatar,
  updateUserName,
  updateUserPassword,
} from "../model/User";
import { getClassroomsByTeacherId } from "../model/Classroom";

export const getNameHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.headers["userData"] as any;
    const user = await getUserById(userData.id);
    if (user !== null) {
      res.json({
        name: user.name,
      });
      return;
    }
  } catch (err) {
    res.status(400).json("Some thing went wrong!");
  }
};

export const getProfileHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.headers["userData"] as any;
    const user = await getUserById(userData.id);
    const classrooms = await getClassroomsByTeacherId(userData.id, userData.id);
    const classroomCount = classrooms.length;
    if (user !== null) {
      res.json({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinedDate: user.createdAt,
        classroomCount: classroomCount,
        classrooms: classrooms,
      });
      return;
    }
    res.status(400).json("User not found!");
  } catch (err) {
    res.status(400).json("Something went wrong!");
  }
};

export const updateNameHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.headers["userData"] as any;
    const result = await updateUserName(userData.id, req.body.name);
    if (result.length > 0) {
      return res.json({ name: result.name });
    }
  } catch (err) {
    res.status(400).json("Something went wrong!");
  }
};

export const updatePasswordHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.headers["userData"] as any;
    const result = await updateUserPassword(
      userData.id,
      req.body.oldPassword,
      req.body.newPassword
    );
    if (result.length > 0) {
      return res.status(200).json("Success");
    }
  } catch (err) {
    res.status(400).json("Something went wrong!");
  }
};

export const updateAvatarHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.headers["userData"] as any;
    const result = await updateUserAvatar(
      userData.id,
      "/public/" + req.file?.filename
    );
    if (result.length > 0) {
      return res.json({ avatar: `${req.file?.filename}` });
    }
    res.status(400).json("User not found!");
  } catch (err) {
    res.status(400).json("Some thing went wrong!");
  }
};
