import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Excel from "exceljs";
import {
    createClassroom,
    getClassroomDetailById,
    getAllClassroomsByUserId,
    getClassroomsByUserId,
    getClassroomDetailByCode,
    getClassroomsByUserIdWithRoleStudent,
    getClassroomsByUserIdWithRoleTeacher,
} from "../model/Classroom";
import { enrollClassroom } from "../model/Classroom";
import {
    checkValidMember,
    checkValidStudent,
    checkValidTeacher,
    getClassroomMemberById,
    getClassroomMemberByUserId,
    getClassroomTeacherId,
    getClassroomTeacherIds,
    getGradeBoardStudent,
    importClassroomMember,
} from "../model/ClassroomMember";
import { getInvitationMail } from "./mailContent";
import { getUserById } from "../model/User";
import {
    createGradeStructure,
    deleteGradeStructure,
    getGradeStructureByClassroomId,
    getGradeStructureById,
    markFinal,
    updateGradeStructure,
    updateGradeStructureOrder,
} from "../model/GradeStructure";
import {
    GetGradeBoard,
    GetGradeDetailById,
    GetStudentGradeDetail,
    GradeDetail,
    ImportGradeDetail,
    UpdateGradeDetailIsCompleteReview,
    UpdateGradeDetailIsInReview,
    UpdateGradeDetailIsRequested,
    UpdateGradeForGradeDetailById,
} from "../model/GradeDetail";
import { sendNotificationToStudent, sendNotificationToUser } from "../model/Notification";
import {
    AddGradeReview,
    GetRequestedReviews,
    GetReviewById,
    UpdateReviewIsComplete,
    UpdateReviewIsInProgress,
} from "../model/GradeReview";
import {
    AddGradeReviewComment,
    GetGradeReviewComments,
} from "../model/GradeReviewConversation";
import socket from "../socket/socket";

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
        const students = await getGradeBoardStudent(req.params.id);
        if (students !== null) {
            res.json(students);
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
                    html: getInvitationMail(
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
        req.body.classroomId = parseInt(req.params.id);
        if (await updateGradeStructureOrder(req.body)) {
            return res.json("Success");
        }
        return res.sendStatus(500);
    } catch (err: any) {
        console.log(err);
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

export async function getGradeDetails(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function getStudentGradeDetails(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidStudent(params.id, user.id);

        if (!ok) {
            return res.sendStatus(400);
        }

        const classroomGradeStructures = await getGradeStructureByClassroomId(
            params.id
        );

        const result: any = [];

        for (let i = 0; i < classroomGradeStructures.length; i++) {
            if (classroomGradeStructures[i].isFinal) {
                const gradeDetail = await GetStudentGradeDetail(
                    user["student_id"],
                    classroomGradeStructures[i].id
                );

                if (gradeDetail) {
                    const resultItem = {
                        gradeStructureName: classroomGradeStructures[i].name,
                        gradeStructureGrade: classroomGradeStructures[i].grade,
                        grade: gradeDetail.grade,
                        gradeDetailId: gradeDetail.id,
                        reviewState: gradeDetail.reviewState,
                        updatedDate: gradeDetail.updatedAt,
                    };

                    result.push(resultItem);
                }
            }
        }

        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function importGradeDetails(req: Request, res: Response) {
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
        await workbook.xlsx
            .readFile(req.file.path)
            .then(() => {
                let worksheet = workbook.getWorksheet(1);
                worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {
                    if (rowNumber === 1) {
                        return;
                    }
                    const values: any = row.values;
                    ImportGradeDetail(req.body.gradeStructureId, values[1], values[2]);
                });
            })
            .then(() => {
                res.sendStatus(200);
            })
            .catch(err => {
                res.sendStatus(400);
            });
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function updateGradeDetails(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);
        if (!ok) {
            return res.sendStatus(400);
        }
        await ImportGradeDetail(
            req.body.gradeStructureId,
            req.body.studentId,
            req.body.grade
        );
        res.status(200).json(req.body.grade);
    } catch (e) {
        return res.sendStatus(400);
    }
}

export async function markFinalizedGradeStructure(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);
        if (!ok) {
            return res.sendStatus(400);
        }
        await markFinal(req.body.gradeStructureId);
        await sendNotificationToStudent(
            params.id,
            "Score has been finalized",
            "Teachers have mark all score as finalized, click to view",
            "/classrooms/" + params.id,
            req.app.get("io")
        );
        res.status(200).json("OK");
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
}

export async function importStudents(req: Request, res: Response) {
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
        await workbook.xlsx
            .readFile(req.file.path)
            .then(() => {
                let worksheet = workbook.getWorksheet(1);
                worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {
                    if (rowNumber === 1) {
                        return;
                    }
                    const values: any = row.values;
                    importClassroomMember(params.id, values[1], values[2]);
                });
            })
            .then(() => {
                res.sendStatus(200);
            })
            .catch(err => {
                res.sendStatus(400);
            });
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function getGradeBoard(req: Request, res: Response) {
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

export async function requestGradeReview(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidStudent(params.id, user.id);

        if (!ok) {
            return res.sendStatus(400);
        }

        const classroomTeacherIds = await getClassroomTeacherIds(params.id);

        const result = await AddGradeReview(
            params.id,
            classroomTeacherIds[req.body.teacherIndex],
            req.body.gradeDetailId,
            req.body.expectationGrade,
            req.body.explanationMessage
        );

        await sendNotificationToUser(classroomTeacherIds[req.body.teacherIndex], "A student request a grade review", `${user.name} request a grade review. Click to view more details.`, `/classrooms/${params.id}/grade_review`, req.app.get("io"));

        const isGradeDetailRequested = await UpdateGradeDetailIsRequested(
            req.body.gradeDetailId
        );

        if (result && isGradeDetailRequested) {
            return res.json(true);
        }

        return res.sendStatus(400);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function getGradeReviews(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);

        if (!ok) {
            return res.sendStatus(400);
        }

        const classroomGradeStructures = await getGradeStructureByClassroomId(
            params.id
        );

        const classroomTeacherId = await getClassroomTeacherId(params.id, user.id);

        const reviews = await GetRequestedReviews(classroomTeacherId);

        let result: any = [];

        for (let i = 0; i < classroomGradeStructures.length; i++) {
            if (classroomGradeStructures[i].isFinal) {
                for (let j = 0; j < reviews.length; j++) {
                    const gradeDetail = await GetGradeDetailById(
                        reviews[j].gradeDetailId
                    );

                    if (
                        gradeDetail &&
                        gradeDetail.gradeStructureId === classroomGradeStructures[i].id
                    ) {
                        const resultItem = {
                            ...reviews[j],
                            gradeStructureName: classroomGradeStructures[i].name,
                            gradeStructureGrade: classroomGradeStructures[i].grade,
                            studentId: gradeDetail.studentId,
                            currentGrade: gradeDetail.grade,
                        };

                        result.push(resultItem);
                    }
                }
            }
        }

        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function acceptGradeReview(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        const ok = await checkValidTeacher(params.id, user.id);

        if (!ok) {
            return res.sendStatus(400);
        }

        const review = await GetReviewById(params.id, req.body.gradeDetailId);
        const isReviewAccepted = await UpdateReviewIsInProgress(
            params.id,
            req.body.gradeDetailId
        );
        const isGradeDetailInReview = await UpdateGradeDetailIsInReview(
            review.gradeDetailId
        );

        const result = isReviewAccepted && isGradeDetailInReview;

        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function makeFinalDecisionForGradeReview(
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

        const gradeReview = await GetReviewById(params.id, req.body.gradeDetailId);
        const isReviewComplete = await UpdateReviewIsComplete(
            params.id,
            req.body.gradeDetailId
        );
        const isGradeUpdated = await UpdateGradeForGradeDetailById(
            gradeReview.gradeDetailId,
            req.body.finalGrade
        );
        const isGradeDetailCompletedReview =
            await UpdateGradeDetailIsCompleteReview(params.id, gradeReview.gradeDetailId, req.app.get("io"));
        const result =
            isReviewComplete && isGradeUpdated && isGradeDetailCompletedReview;
        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function addGradeReviewComment(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        let gradeDetail;
        const classroomMember = await getClassroomMemberByUserId(
            params.id,
            user.id
        );

        if (classroomMember) {
            if (classroomMember.role === 1) {
                gradeDetail = await GetGradeDetailById(params.gradeDetailId);

                if (gradeDetail.studentId !== user["student_id"]) {
                    return res.sendStatus(400);
                }
            } else {
                const review = await GetReviewById(params.id, params.gradeDetailId);

                if (review.teacherId !== classroomMember.id) {
                    return res.sendStatus(400);
                }
            }
        } else {
            return res.sendStatus(400);
        }

        const result = await AddGradeReviewComment(
            params.id,
            params.gradeDetailId,
            classroomMember.id,
            req.body.comment,
            req.app.get("io"),
        );

        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}

export async function getGradeReviewConversation(req: Request, res: Response) {
    try {
        const user = req.headers["userData"] as any;
        const params: any = req.params;
        let gradeDetail = null;
        let review = null;
        const classroomMember = await getClassroomMemberByUserId(
            params.id,
            user.id
        );

        if (classroomMember) {
            if (classroomMember.role === 1) {
                gradeDetail = await GetGradeDetailById(params.gradeDetailId);

                if (gradeDetail.studentId !== user["student_id"]) {
                    return res.sendStatus(400);
                }
            } else {
                review = await GetReviewById(params.id, params.gradeDetailId);

                if (review.teacherId !== classroomMember.id) {
                    return res.sendStatus(400);
                }
            }
        } else {
            return res.sendStatus(400);
        }

        if (!gradeDetail) {
            gradeDetail = await GetGradeDetailById(params.gradeDetailId);
        }

        if (!review) {
            review = await GetReviewById(params.id, params.gradeDetailId);
        }

        const gradeStructure = await getGradeStructureById(
            gradeDetail.gradeStructureId
        );

        const comments = await GetGradeReviewComments(
            params.id,
            params.gradeDetailId,
        );
        const commenterIdSet = new Set();

        comments.forEach((comment: any) => {
            commenterIdSet.add(comment.classroomMemberId);
        });

        const result = {
            userRole: classroomMember.role,
            information: {
                compositionName: gradeStructure.name,
                compositionStructure: gradeStructure.grade,
                gradeDetailId: gradeDetail.id,
                studentId: gradeDetail.studentId,
                currentGrade: gradeDetail.grade,
                expectationGrade: review.expectationGrade,
                explanationMessage: review.explanationMessage,
                isFinal: review.reviewState === 3,
            },
            comments: [] as any,
            commenters: [] as any,
        };

        const commenters: any = [];

        for (let id of commenterIdSet) {
            const commenter = await getClassroomMemberById(id);
            commenters.push(commenter);
        }

        for (let i = 0; i < comments.length; i++) {
            for (let j = 0; j < commenters.length; j++) {
                if (comments[i].classroomMemberId === commenters[j].id) {
                    comments[i]["commenterIndex"] = j;
                    break;
                }
            }

            result.comments.push({
                commenterIndex: comments[i].commenterIndex,
                content: comments[i].comment,
                date: comments[i].createdAt,
            });
        }

        result.commenters = [
            ...commenters.map((commenter: any) => commenter.classroomName),
        ];

        return res.json(result);
    } catch (err: any) {
        return res.sendStatus(400);
    }
}
