import { sequelize } from "./db";
import { DataTypes, where } from "sequelize";
import { User } from "./User";
import { ClassroomMember } from "./ClassroomMember";
import { GradeReview } from "./GradeReview";
import { sendNotificationToUser } from "./Notification";

export const GradeDetail = sequelize.define(
    "gradeDetail",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: DataTypes.STRING,
        },
        gradeStructureId: {
            type: DataTypes.INTEGER,
        },
        grade: {
            type: DataTypes.FLOAT,
        },
        reviewState: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        underscored: true,
    }
);

export async function ImportGradeDetail(
    gradeStructureId: any,
    studentId: any,
    grade: any
) {
    const gradeDetail: any = await GradeDetail.findOne({
        where: {
            studentId: studentId + "",
            gradeStructureId: gradeStructureId,
        },
    });
    if (gradeDetail) {
        gradeDetail.grade = grade;
        gradeDetail.save();
    } else {
        await GradeDetail.create({
            studentId: studentId,
            gradeStructureId: gradeStructureId,
            grade: grade,
        });
    }
}

export async function GetGradeBoard(gradeStructureId: any): Promise<any> {
    try {
        const gradeDetails = await GradeDetail.findAll({
            where: {
                gradeStructureId: gradeStructureId,
            },
            order: [["student_id", "asc"]],
        });

        let result: any = [];
        gradeDetails.forEach(detail => {
            result.push(detail.toJSON());
        });
        return result;
    } catch (e) {
        return [];
    }
}

export async function GetGradeDetailById(gradeDetailId: any): Promise<any> {
    try {
        const gradeDetail = await GradeDetail.findOne({
            where: {
                id: gradeDetailId,
            },
        });

        let result: any = gradeDetail?.toJSON();
        return result;
    } catch (e) {
        return [];
    }
}

export async function GetStudentGradeDetail(
    studentId: any,
    gradeStructureId: any
): Promise<any> {
    try {
        const gradeDetail = await GradeDetail.findOne({
            where: {
                studentId: studentId,
                gradeStructureId: gradeStructureId,
            },
        });

        const result = gradeDetail?.toJSON();
        return result;
    } catch (e) {
        return null;
    }
}

export async function UpdateGradeForGradeDetailById(
    id: any,
    newGrade: any
): Promise<boolean> {
    try {
        await GradeDetail.update(
            {
                grade: newGrade,
            },
            {
                where: {
                    id,
                },
            }
        );

        return true;
    } catch (e) {
        return false;
    }
}

export async function UpdateGradeDetailIsRequested(id: any): Promise<boolean> {
    try {
        await GradeDetail.update(
            {
                reviewState: 1,
            },
            {
                where: {
                    id,
                },
            }
        );

        return true;
    } catch (e) {
        return false;
    }
}

export async function UpdateGradeDetailIsInReview(id: any): Promise<boolean> {
    try {
        await GradeDetail.update(
            {
                reviewState: 2,
            },
            {
                where: {
                    id,
                },
            }
        );

        return true;
    } catch (e) {
        return false;
    }
}

export async function UpdateGradeDetailIsCompleteReview(classroomId: any, id: any, io: any): Promise<boolean> {
    try {
        await GradeDetail.update(
            {
                reviewState: 3,
            },
            {
                where: {
                    id,
                },
            }
        );

        const gradeDetail: any = await GradeDetail.findOne({
            where: {
                id: id
            },
            raw: true,
        });
        const user: any = await User.findOne({
            where: {
                student_id: gradeDetail.studentId,
            },
            raw: true,
        });
        await sendNotificationToUser(user.id, "Teacher has make final decision", "Click to view your final score", `/classrooms/${classroomId}/grades`, io)

        return true;
    } catch (e) {
        return false;
    }
}
