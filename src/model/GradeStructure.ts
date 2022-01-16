import { sequelize } from "./db";
import { DataTypes, where } from "sequelize";
import { User } from "./User";
import { ClassroomMember } from "./ClassroomMember";
import { sendNotificationToStudent, sendNotificationToUser } from "./Notification";

export const GradeStructure = sequelize.define(
    "gradeStructure",
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
        classroomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        grade: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        isFinal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        underscored: true,
    }
);

export async function createGradeStructure(data: any): Promise<any> {
    try {
        const result: any = await GradeStructure.create({
            name: data.name,
            classroomId: data.classroomId,
            order: data.order,
            grade: data.grade,
        });
        return result;
    } catch (err) {
        return null;
    }
}

export async function updateGradeStructure(data: any): Promise<boolean> {
    try {
        await GradeStructure.update(
            {
                name: data.name,
                grade: data.grade,
            },
            {
                where: {
                    id: data.id,
                    classroomId: data.classroomId,
                },
            }
        );
        return true;
    } catch (err) {
        return false;
    }
}

export async function updateGradeStructureOrder(data: any): Promise<boolean> {
    try {
        await GradeStructure.update(
            {
                order: data.destinationIndex,
            },
            {
                where: {
                    id: data.sourceId,
                    classroomId: data.classroomId,
                },
            }
        );
        await GradeStructure.update(
            {
                order: data.sourceIndex,
            },
            {
                where: {
                    id: data.destinationId,
                    classroomId: data.classroomId,
                },
            }
        );
        return true;
    } catch (err) {
        return false;
    }
}

export async function deleteGradeStructure(data: any): Promise<boolean> {
    try {
        await GradeStructure.destroy({
            where: {
                id: data.id,
                classroomId: data.classroomId,
            },
        });
        return true;
    } catch (err) {
        return false;
    }
}

export async function getGradeStructureByClassroomId(
    classroomId: any
): Promise<any> {
    const data = await GradeStructure.findAll({
        where: {
            classroomId: classroomId,
        },
        order: [["order", "DESC"]],
    });

    let result: any[] = [];
    data.forEach(item => {
        const data: any = item.toJSON();
        result.push({
            id: data.id,
            name: data.name,
            grade: data.grade,
            isFinal: data.isFinal
        });
    });
    return result;
}

export async function markFinal(gradeStructureId: any): Promise<boolean> {
    try {
        await GradeStructure.update({
            isFinal: true,
        }, {
            where: {
                id: gradeStructureId
            }
        })
        return true;
    } catch (e) {
        return false
    }
}

