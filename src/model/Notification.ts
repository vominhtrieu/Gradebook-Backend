import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import { ClassroomMember } from "./ClassroomMember";
import notification from "../socket/notification";

export const Notification = sequelize.define(
    "notification",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
        },
        title: {
            type: DataTypes.TEXT,
        },
        content: {
            type: DataTypes.STRING
        },
        href: {
            type: DataTypes.STRING
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {underscored: true}
);

export async function sendNotificationToUser(userId: number, title: string, content: string, href: string): Promise<any> {
    return await Notification.create({
        userId,
        title,
        content,
        href
    });
}

export async function sendNotificationToStudent(classroomId: number, title: string, content: string, href: string, io: any): Promise<any> {
    const notifications: any[] = [];
    const classroomMembers = await ClassroomMember.findAll({
        where: {
            classroomId: classroomId,
            role: 1,
        },
        raw: true,
    })
    classroomMembers.forEach((member: any) => {
        notifications.push({
            userId: member.userId,
            title,
            content,
            href,
        })
        io.to(`u/${member.userId}`).emit("unreadNotification");
        io.to(`u/${member.userId}`).emit("newNotification");
    })
    return await Notification.bulkCreate(notifications);
}

export async function getAllNotificationByUserId(userId: number, io: any) {
    const result: any = await Notification.findAll({
        where: {
            userId
        },
        order: [["created_at", "DESC"]],
        raw: true,
    });
    await Notification.update({read: true}, {
        where: {
            userId
        }
    });
    io.to(`u/${userId}`).emit("unreadNotification");

    return result;
}

export async function countUnreadNotification(userId: number) {
    return (await Notification.findAll({
        where: {
            userId,
            read: false,
        },
        order: [["created_at", "DESC"]],
        raw: true,
    })).length
}