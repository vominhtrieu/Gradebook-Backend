import { sequelize } from "./db";
import { DataTypes, where } from "sequelize";
import { User } from "./User";
import { ClassroomMember } from "./ClassroomMember";

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
        }
    },
    {
        underscored: true,
    }
);

export async function ImportGradeDetail(gradeStructureId: any, studentId: any, grade: any) {
    const gradeDetail: any = await GradeDetail.findOne({
        where: {
            studentId: studentId + "",
            gradeStructureId: gradeStructureId,
        }
    })
    if (gradeDetail) {
        gradeDetail.grade = grade
        gradeDetail.save();
    } else {
        await GradeDetail.create({
            studentId: studentId,
            gradeStructureId: gradeStructureId,
            grade: grade,
        })
    }
}

export async function GetGradeBoard(gradeStructureId: any): Promise<any> {
    try {
        const gradeDetails = await GradeDetail.findAll({
            where: {
                gradeStructureId: gradeStructureId
            },
            order: [
                ["student_id", "asc"],
            ],
        })

        let result: any = [];
        gradeDetails.forEach(detail => {
            result.push(detail.toJSON())
        })
        return result
    } catch (e) {
        return []
    }
}