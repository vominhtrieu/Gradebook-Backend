import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import crypto from "crypto";
import fs from "fs";
import * as util from "util";
import { User } from "./User";

const writeFile = util.promisify(fs.writeFile);

export const Classroom = sequelize.define("classroom", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    }
});

Classroom.belongsTo(User, {foreignKey: "teacherId"});

export async function createClassroom(classroom: any): Promise<any> {
    try {
        if (classroom.cover) {
            const fileName = `/public/${new Date().getTime()}-${Math.random()}.jpg`;
            let data = classroom.cover;
            data = data.replace("data:image/jpeg;base64,", "");
            await writeFile(`.${fileName}`, data, "base64");
            classroom.cover = fileName;
        }
        const result = await Classroom.create({
            teacherId: classroom.teacherId,
            name: classroom.name,
            description: classroom.description,
            image: classroom.cover,
        });
        return result.toJSON();
    } catch (err) {
        return null;
    }
}

export async function getAllClassrooms(): Promise<any> {
    try {
        const data = await Classroom.findAll({
            include: User,
        })
        const result: object[] = [];
        data.forEach(value => {
            const classroom: any = value.toJSON();
            classroom.user = {
                id: classroom.user.id,
                name: classroom.user.name,
                avatar: classroom.user.avatar,
            }
            result.push(classroom);
        })
        return data;
    } catch (err) {
        return null;
    }
}

export async function getClassroomsByTeacherId(teacherId: number): Promise<any> {
    try {
        const data = await Classroom.findAll({
            where: {
                teacherId: teacherId
            },
        })
        const result = [];
        data.forEach(value => {
            result.push(value.toJSON())
        })
        return data;
    } catch (err) {
        return null;
    }
}