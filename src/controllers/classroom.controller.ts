import { Request, Response } from "express";
import nodemailer from "nodemailer";
import {
  createClassroom,
  getClassroomDetailById,
  getAllClassrooms,
  getClassroomsByUserId,
  getClassroomDetailByCode,
  getClassroomsByUserIdWithRoleStudent,
  getClassroomsByUserIdWithRoleTeacher,
} from "../model/Classroom";
import { enrollClassroom } from "../model/Classroom";
import { checkValidTeacher } from "../model/ClassroomMember";
import getMailContent from "./mailContent";
import { getUserById } from "../model/User";
import {
  createGradeStructure,
  deleteGradeStructure,
  getGradeStructureByClassroomId,
  updateGradeStructure,
  updateGradeStructureOrder,
} from "../model/GradeStructure";

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const enrollClassroomHandler = async (req: Request, res: Response) => {
  try {
    const user = req.headers["userData"] as any;
    let type = 0;
    if (
      req.body.studentInvitationCode &&
      req.body.studentInvitationCode.length > 0
    ) {
      type = 1;
    } else if (
      req.body.teacherInvitationCode &&
      req.body.teacherInvitationCode.length > 0
    ) {
      type = 2;
    }
    if (type === 0) {
      return res.status(400).json("Invalid code!");
    }
    const classroom = await getClassroomDetailByCode(
      req.body.studentInvitationCode,
      req.body.teacherInvitationCode,
      user.id
    );
    if (classroom === null) {
      return res.status(400).json("Invalid code!");
    }
    const classroomMember = await enrollClassroom(user.id, classroom.id, type);
    if (classroomMember !== null) {
      res.json(classroomMember);
      return;
    }
    res.status(400).json("Failed to enroll classroom!");
  } catch (err: any) {
    res.status(400).json("Failed to enroll classroom!");
  }
};

export const getClassroomDetailHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.headers["userData"] as any;
    const classrooms = await getClassroomDetailById(req.params.id, user.id);
    if (classrooms != null) {
      res.json(classrooms);
      return;
    }
    res.status(400).json("Something went wrong!");
  } catch (err: any) {
    res.status(400).json("Something went wrong!");
  }
};

export const getAllClassroomsHandler = async (req: Request, res: Response) => {
  try {
    const user = req.headers["userData"] as any;
    const teacherId = parseInt(req.query.id as string);
    let classrooms;
    if (teacherId > 0) {
      classrooms = await getClassroomsByUserId(teacherId, user.id);
    } else {
      classrooms = await getClassroomsByUserId(user.id, user.id);
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

export const getClassroomsWithRoleStudentHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.headers["userData"] as any;
    const classrooms = await getClassroomsByUserIdWithRoleStudent(user.id);
    if (classrooms !== null) {
      res.json(classrooms);
      return;
    }
    res.status(400).json("Something went wrong!");
  } catch (err: any) {
    res.status(400).json("Something went wrong!");
  }
};

export const getClassroomsWithRoleTeacherHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.headers["userData"] as any;
    const classrooms = await getClassroomsByUserIdWithRoleTeacher(user.id);
    if (classrooms !== null) {
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
    res.status(400).json("Failed to create classroom!");
  } catch (err: any) {
    res.status(400).json("Failed to create classroom!");
  }
};

export const sendInviteLinkHandler = async (req: Request, res: Response) => {
  try {
    const user = req.headers["userData"] as any;

    req.body.teacherId = user.id;
    const userData: any = await getUserById(user.id);
    const valid = await checkValidTeacher(req.body.classroomId, user.id);
    if (!valid) {
      return res.sendStatus(400);
    }
    const classroom = await getClassroomDetailById(
      req.body.classroomId,
      user.id
    );

    let inviteLink = `${process.env.CLIENT_HOST}/classrooms/${classroom.id}?`;
    inviteLink +=
      req.body.role == "teacher"
        ? `teacherInvitationCode=${classroom.teacherInvitationCode}`
        : `studentInvitationCode=${classroom.studentInvitationCode}`;
    if (classroom.id > 0) {
      transporter
        .sendMail({
          from: `Gradebook System <${process.env.EMAIL_ACCOUNT}>`,
          to: req.body.email,
          subject: "Classroom invitation",
          html: getMailContent(
            userData.name,
            inviteLink,
            req.body.role,
            classroom.name
          ),
        })
        .then(() => {
          res.status(200).json("Invitation has been sent");
        })
        .catch(err => {
          res.sendStatus(400);
        });
    }
  } catch (err: any) {
    return res.sendStatus(400);
  }
};

export async function getGradeStructuresHandler(req: Request, res: Response) {
  try {
    const user = req.headers["userData"] as any;
    const params: any = req.params;
    const ok = await checkValidTeacher(params.id, user.id);
    if (!ok) {
      return res.sendStatus(400);
    }
    const responses = await getGradeStructureByClassroomId(params.id);
    return res.json(responses);
  } catch (err: any) {
    return res.sendStatus(400);
  }
}

export async function createGradeStructuresHandler(
  req: Request,
  res: Response
) {
  try {
    const user = req.headers["userData"] as any;
    const params: any = req.params;
    const ok = await checkValidTeacher(params.id, user.id);
    if (!ok) {
      return res.sendStatus(400);
    }
    req.body.classroomId = req.params.id;
    const result = await createGradeStructure(req.body);
    if (result) {
      return res.json(result);
    }
    return res.sendStatus(400);
  } catch (err: any) {
    return res.sendStatus(400);
  }
}

export async function updateGradeStructuresHandler(
  req: Request,
  res: Response
) {
  try {
    const user = req.headers["userData"] as any;
    const params: any = req.params;
    const ok = await checkValidTeacher(params.id, user.id);
    if (!ok) {
      return res.sendStatus(400);
    }
    req.body.classroomId = req.params.id;
    if (await updateGradeStructure(req.body)) {
      return res.json("Success");
    }
    return res.sendStatus(500);
  } catch (err: any) {
    return res.sendStatus(400);
  }
}

export async function updateGradeStructuresOrderHandler(
  req: Request,
  res: Response
) {
  try {
    const user = req.headers["userData"] as any;
    const params: any = req.params;
    const ok = await checkValidTeacher(params.id, user.id);
    if (!ok) {
      return res.sendStatus(400);
    }

    const gradeStructures = req.body.gradeStructures;
    gradeStructures.map(async (gradeStructure: any, index: any) => {
      await updateGradeStructureOrder(params.id, gradeStructure, index);
    });
  } catch (err: any) {
    return res.sendStatus(400);
  }
}

export async function deleteGradeStructuresHandler(
  req: Request,
  res: Response
) {
  try {
    const user = req.headers["userData"] as any;
    const params: any = req.params;
    const ok = await checkValidTeacher(params.id, user.id);
    if (!ok) {
      return res.sendStatus(400);
    }
    req.body.classroomId = req.params.id;
    if (await deleteGradeStructure(req.body)) {
      return res.json("Success");
    }
    return res.sendStatus(500);
  } catch (err: any) {
    return res.sendStatus(400);
  }
}
