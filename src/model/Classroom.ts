import { sequelize } from "./db";
import { DataTypes, QueryTypes } from "sequelize";
import fs from "fs";
import * as util from "util";
import { User } from "./User";
import { ClassroomMember } from "./ClassroomMember";

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
}, {underscored: true});

Classroom.belongsTo(User, {foreignKey: "creator_id"});
Classroom.hasMany(ClassroomMember, {foreignKey: "classroom_id"});

export async function createClassroom(userId: number, classroom: any): Promise<any> {
    try {
        if (classroom.cover) {
            const fileName = `/public/${new Date().getTime()}-${Math.random()}.jpg`;
            let data = classroom.cover;
            data = data.replace("data:image/jpeg;base64,", "");
            await writeFile(`.${fileName}`, data, "base64");
            classroom.cover = fileName;
        }
        const result = await Classroom.create({
            name: classroom.name,
            description: classroom.description,
            image: classroom.cover,
        });
        await enrollClassroom(userId, (result.toJSON() as any).id)
        return result.toJSON();
    } catch (err) {
        return null;
    }
}

function getClassroomData(data: any, userId: number) {
    const result: object[] = [];
    if (!data.forEach) {
        data = [data];
    }
    data.forEach((value: any) => {
        let classroom: any;
        if (value.toJSON) {
            classroom = value.toJSON();
        } else {
            classroom = value;
        }
        let enrolled = false;
        classroom.classroom_members.forEach((member: any) => {
            if (member.id === userId) {
                enrolled = true;
            }
        })
        result.push(classroom);
    })
    return data;
}

export async function getAllClassrooms(userId: number): Promise<any> {
    try {
        const data = await Classroom.findAll({
            include: ClassroomMember,
        })
        return getClassroomData(data, userId);
    } catch (err) {
        return null;
    }
}

export async function getClassroomsByTeacherId(userId: number, teacherId: number): Promise<any> {
    try {
        const classrooms = await sequelize.query(
            `SELECT *
             FROM classrooms
             WHERE EXISTS(
                           SELECT *
                           FROM classroom_members
                           WHERE classroom_members.classroom_id = classrooms.id
                             AND classroom_members.user_id = ${teacherId}
                       )`, {type: QueryTypes.SELECT})
        return getClassroomData(classrooms, userId);
    } catch (err) {
        return null;
    }
}


export async function enrollClassroom(userId: any, classId: any): Promise<any> {
    try {
        const classroomData = await Classroom.findOne({
            where: {
                id: classId
            }
        })
        const classroom: any = classroomData?.toJSON();
        if (classroom == null) {
            return null;
        }
        const result = await ClassroomMember.create({
            classroomId: classroom.id,
            userId: userId,
            role: 0,
        });
        return result.toJSON();
    } catch (err) {
        return null;
    }
}