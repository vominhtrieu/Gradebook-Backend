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
        staffId: {
            type: DataTypes.INTEGER,
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

export function ImportGradeDetail() {
``
}