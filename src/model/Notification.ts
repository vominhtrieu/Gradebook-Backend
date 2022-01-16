import { sequelize } from "./db";
import { DataTypes } from "sequelize";

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

export async function getAllNotificationByUserId(userId: number) {
    return await Notification.findAll({
        where: {
            userId
        },
        order: [["created_at", "DESC"]],
    })
}