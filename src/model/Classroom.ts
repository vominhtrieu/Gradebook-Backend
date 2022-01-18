import { sequelize } from "./db";
import Sequelize, { DataTypes, Op } from "sequelize";
import fs from "fs";
import randomstring from "randomstring";
import * as util from "util";
import { User } from "./User";
import { ClassroomMember } from "./ClassroomMember";

const writeFile = util.promisify(fs.writeFile);

export const Classroom = sequelize.define(
    "classroom",
    {
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
        },
        studentInvitationCode: {
            type: DataTypes.STRING,
            unique: true,
        },
        teacherInvitationCode: {
            type: DataTypes.STRING,
            unique: true,
        },
    },
    {underscored: true}
);

//

Classroom.hasMany(ClassroomMember, {foreignKey: "classroomId"});

export async function createClassroom(
    user: any,
    classroom: any
): Promise<any> {
    try {
        if (classroom.cover) {
            const fileName = `/public/${new Date().getTime()}-${Math.random()}.jpg`;
            let data = classroom.cover;
            data = data.replace("data:image/jpeg;base64,", "");
            await writeFile(`.${fileName}`, data, "base64");
            classroom.cover = fileName;
        }

        const studentInvitationCode = randomstring.generate(10);
        const teacherInvitationCode = randomstring.generate(10);

        const result = await Classroom.create({
            name: classroom.name,
            description: classroom.description,
            image: classroom.cover,
            studentInvitationCode: studentInvitationCode,
            teacherInvitationCode: teacherInvitationCode,
        });
        await enrollClassroom(user, (result.toJSON() as any).id, 2);
        return result.toJSON();
    } catch (err) {
        return null;
    }
}

export async function getClassroomDetailByCode(
    studentInvitationCode: any,
    teacherInvitationCode: any,
    userId: any
): Promise<any> {
    const condition = [];
    if (studentInvitationCode && studentInvitationCode.length > 0) {
        condition.push({
            studentInvitationCode: studentInvitationCode,
        });
    } else {
        condition.push({
            teacherInvitationCode: teacherInvitationCode,
        });
    }
    const data = await Classroom.findOne({
        where: {
            [Op.or]: condition,
        },
        include: [
            {
                model: ClassroomMember,
                include: [User],
            },
        ],
    });
    return getClassroomData(data, userId);
}

export async function getClassroomDetailById(
    id: any,
    userId: any
): Promise<any> {
    const data = await Classroom.findOne({
        where: {
            id: id,
        },
        include: [
            {
                model: ClassroomMember,
                include: [User],
            },
        ],
    });
    return getClassroomData(data, userId);
}

function getClassroomData(value: any, userId: any): any {
    let classroom: any;
    if (value.toJSON) {
        classroom = value.toJSON();
    } else {
        classroom = value;
    }
    let enrolled = false;
    let isTeacher = false;
    classroom.teachers = [];
    classroom.students = [];
    classroom.classroom_members.forEach((member: any) => {
        if (!member.user) {
            return;
        }
        if (member.userId === userId) {
            if (member.role === 2) {
                isTeacher = true;
            }
            enrolled = true;
        }
        const data: any = {
            name: member.user.name,
            studentId: member.user.student_id,
            avatar: member.user.avatar,
            role: member.role,
        };
        if (member.role === 2) {
            classroom.teachers.push(data);
        } else {
            classroom.students.push(data);
        }
    });
    classroom.enrolled = enrolled;
    classroom.isTeacher = isTeacher;
    if (!isTeacher) {
        classroom.studentInvitationCode = "";
        classroom.teacherInvitationCode = "";
    }

    delete classroom.classroom_members;
    return classroom;
}

function getClassroomsData(data: any, userId: number) {
    const result: object[] = [];
    if (!data.forEach) {
        data = [data];
    }
    data.forEach((value: any) => {
        result.push(getClassroomData(value, userId));
    });
    return result;
}

export async function getAllClassroomsByUserId(userId: number): Promise<any> {
    try {
        const data = await Classroom.findAll({
            include: [
                {
                    model: ClassroomMember,
                    include: [User],
                },
            ],
        });
        return getClassroomsData(data, userId);
    } catch (err) {
        return null;
    }
}

export async function getAllClassrooms(condition: any): Promise<any> {
    try {
        let data: any = await Classroom.findAll({
            where: condition,
            include: [
                {
                    model: ClassroomMember,
                    include: [{
                        model: User,
                    }],
                    where: {
                        role: 2
                    },
                },
            ],
        });

        return getClassroomsData(data, 0);
    } catch (err) {
        return null;
    }
}

export async function getClassroomsByUserId(
    userId: number,
    teacherId: number
): Promise<any> {
    try {
        const classrooms = await Classroom.findAll({
            where: Sequelize.literal(`
                    EXISTS(
                        SELECT *
                        FROM classroom_members
                    WHERE classroom_members.classroom_id = classroom.id
                    AND classroom_members.user_id = ${teacherId}
                  )
                `),
            include: [
                {
                    model: ClassroomMember,
                    include: [User],
                },
            ],
        });
        return getClassroomsData(classrooms, userId);
    } catch (err) {
        return null;
    }
}

async function getClassroomsByUserIdWithRole(
    userId: number,
    studentId: any,
    role: 1 | 2
): Promise<any> {
    try {
        const classrooms = await Classroom.findAll({
            where: Sequelize.literal(`
                          EXISTS(
                              SELECT *
                              FROM classroom_members
                          WHERE classroom_members.classroom_id = classroom.id
                          AND 
                          (
                          classroom_members.user_id = ${userId}
                          OR
                          classroom_members.student_id = '${studentId}'
                          )
                          AND classroom_members.role = ${role}
                        )
                      `),
            include: [
                {
                    model: ClassroomMember,
                    include: [User],
                },
            ],
        });
        return getClassroomsData(classrooms, userId);
    } catch (err) {
        return null;
    }
}

export async function getClassroomsByUserIdWithRoleStudent(
    user: any
): Promise<any> {
    try {
        const result = await getClassroomsByUserIdWithRole(user.id, user.student_id, 1);
        return result;
    } catch (err) {
        return null;
    }
}

export async function getClassroomsByUserIdWithRoleTeacher(
    userId: number
): Promise<any> {
    try {
        const result = await getClassroomsByUserIdWithRole(userId, null, 2);
        return result;
    } catch (err) {
        return null;
    }
}

export async function enrollClassroom(
    user: any,
    classId: any,
    role: any
): Promise<any> {
    try {
        const classroomData = await Classroom.findOne({
            where: {
                id: classId,
            },
        });
        const classroom: any = classroomData?.toJSON();
        if (classroom == null) {
            return null;
        }
        const result = await ClassroomMember.create({
            classroomId: classroom.id,
            userId: user.id,
            studentId: user.student_id,
            classroomName: user.name,
            role: role,
        });
        return result.toJSON();
    } catch (err) {
        return null;
    }
}