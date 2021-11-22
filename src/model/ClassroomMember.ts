import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import { User } from "./User";
import { now } from "sequelize/types/lib/utils";
import { Classroom } from "./Classroom";

export const ClassroomMember = sequelize.define("classroom_member", {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            classroomId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            role: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        }, {
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'classroom_id']
                }
            ]
        }
    )
;

ClassroomMember.belongsTo(User, {foreignKey: "userId"});

export async function checkValidTeacher(classroomId: any, userId: any): Promise<boolean> {
    try {
        const classroom = await ClassroomMember.findOne({
            where: {
                classroomId: classroomId,
                userId: userId,
                role: 2
            }
        })
        return classroom !== null;
    } catch (e) {
        return false;
    }
}