import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Excel from "exceljs";
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
import {
    checkValidMember,
    checkValidTeacher, getGradeBoardStudent,
    importClassroomMember
} from "../model/ClassroomMember";
import getMailContent from "./mailContent";
import { getUserById } from "../model/User";
import {
    createGradeStructure,
    deleteGradeStructure,
    getGradeStructureByClassroomId, markFinal,
    updateGradeStructure,
    updateGradeStructureOrder,
} from "../model/GradeStructure";
import { GetGradeBoard, GradeDetail, ImportGradeDetail } from "../model/GradeDetail";

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
            user.id,
        );
        if (classroom === null) {
            return res.status(400).json("Invalid code!");
        }
        const classroomMember = await enrollClassroom(user, classroom.id, type);
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
        const classrooms = await getClassroomsByUserIdWithRoleStudent(user);
        if (classrooms !== null) {
            res.json(classrooms);
            return;
        }
        res.status(400).json("Something went wrong!");
    } catch (err: any) {
        res.status(400).json("Something went wrong!");
    }
};

export const getGradeBoardStudentHandler = async (
    req: Request,
    res: Response
) => {
    try {
        // const user = req.headers["userData"] as any;
        const classrooms = await getGradeBoardStudent(req.params.id);
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
        const classroom = await createClassroom(user, req.body);
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
        // const ok = await checkValidTeacher(params.id, user.id);
        // if (!ok) {
        //     return res.sendStatus(400);
        // }
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
        req.body.classroomId = req.params.id;
        if (await updateGradeStructureOrder(req.body)) {
            return res.json("Success");
        }
        return res.sendStatus(500);
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

export async function getGradeDetails(
    req: Request,
    res: Response
) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);

    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function importGradeDetails(
    req: Request,
    res: Response
) {
    try {
        if (!req.file) {
            return res.sendStatus(400);
        }
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);
        if (!ok) {
            return res.sendStatus(400);
        }
        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(req.file.path).then(() => {
            let worksheet = workbook.getWorksheet(1);
            worksheet.eachRow({includeEmpty: false,}, function (row, rowNumber) {
                if (rowNumber === 1) {
                    return;
                }
                const values: any = row.values;
                ImportGradeDetail(req.body.gradeStructureId, values[1], values[2])
            });
        }).then(() => {
            res.sendStatus(200);
        }).catch((err) => {
            res.sendStatus(400);
        })
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function updateGradeDetails(
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
        await ImportGradeDetail(req.body.gradeStructureId, req.body.studentId, req.body.grade);
        res.status(200).json(req.body.grade);
    } catch (e) {
        return res.sendStatus(400);
    }
}


export async function markFinalizedGradeStructure(
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
        await markFinal(req.body.gradeStructureId)
        res.sendStatus(200)
    } catch (e) {
        return res.sendStatus(400);
    }
}

export async function importStudents(
    req: Request,
    res: Response
) {
    try {
        if (!req.file) {
            return res.sendStatus(400);
        }
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);
        if (!ok) {
            return res.sendStatus(400);
        }
        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(req.file.path).then(() => {
            let worksheet = workbook.getWorksheet(1);
            worksheet.eachRow({includeEmpty: false,}, function (row, rowNumber) {
                if (rowNumber === 1) {
                    return;
                }
                const values: any = row.values;
                importClassroomMember(params.id, values[1], values[2])
            });
        }).then(() => {
            res.sendStatus(200);
        }).catch((err) => {
            res.sendStatus(400);
        })
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function getGradeBoard(
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

        const result = await GetGradeBoard(req.query.gradeStructureId);
        if (result) {
            return res.json(result);
        }
        res.sendStatus(400);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

