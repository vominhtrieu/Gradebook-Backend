import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import { ClassroomMember } from "./ClassroomMember";
import { GradeReview } from "./GradeReview";
import { GradeDetail } from "./GradeDetail";
import { User } from "./User";
import { sendNotificationToUser } from "./Notification";

export const GradeReviewConversation = sequelize.define(
    "gradeReviewConversation",
    {
        classroomId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        gradeDetailId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        commentOrder: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        comment: {
            type: DataTypes.STRING,
        },
        classroomMemberId: {
            type: DataTypes.INTEGER,
        },
    },
    {
        underscored: true,
    }
);

GradeReviewConversation.belongsTo(ClassroomMember, {
    foreignKey: "classroomMemberId",
});
GradeReviewConversation.belongsTo(GradeReview, {
    as: "classroom",
    foreignKey: "classroomId",
});
GradeReviewConversation.belongsTo(GradeReview, {
    as: "gradeDetail",
    foreignKey: "gradeDetailId",
});

export async function AddGradeReviewComment(
    classroomId: any,
    gradeDetailId: any,
    classroomMemberId: any,
    comment: any,
    io: any,
): Promise<boolean> {
    try {
        const gradeDetail: any = await GradeDetail.findOne({
            where: {
                id: gradeDetailId
            },
            raw: true,
        });
        const gradeReview: any = await GradeReview.findOne({
            where: {
                gradeDetailId: gradeDetail.id
            },
            raw: true,
        });
        const user: any = await User.findOne({
            where: {
                student_id: gradeDetail.studentId,
            },
            raw: true,
        });
        const teacher: any = await User.findOne({
            where: {
                id: gradeReview.teacherId,
            },
            raw: true,
        });

        await GradeReviewConversation.create({
            classroomId,
            gradeDetailId,
            classroomMemberId,
            comment,
        });
        const classroomMember: any = await ClassroomMember.findOne({
            where: {
                id: classroomMemberId
            },
            raw: true,
        });
        if (classroomMember.userId === user.id) {
            await sendNotificationToUser(teacher.id, `${user.name} sent you a message`, "Click here to view this message", `/classrooms/${classroomId}/review/conversation/${gradeReview.gradeDetailId}`, io);
        } else if (classroomMember.userId === teacher.id) {
            await sendNotificationToUser(user.id, `${teacher.name} sent you a message`, "Click here to view this message", `/classrooms/${classroomId}/review/conversation/${gradeReview.gradeDetailId}`, io);
        }
        io.to(`u/${teacher.id}`).emit("newMessage");
        io.to(`u/${user.id}`).emit("newMessage");
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function GetGradeReviewComments(
    classroomId: any,
    gradeDetailId: any,
): Promise<any> {
    try {
        const comments = await GradeReviewConversation.findAll({
            where: {
                classroomId,
                gradeDetailId,
            },
            order: [["created_at", "asc"]],
        });

        let result: any = [];
        comments.forEach(comment => {
            result.push(comment.toJSON());
        });
        return result;
    } catch (e) {
        return [];
    }
}
