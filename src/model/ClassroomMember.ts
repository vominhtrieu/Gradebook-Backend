import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import { User } from "./User";
import { now } from "sequelize/types/lib/utils";

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
}, {underscored: true});

ClassroomMember.belongsTo(User, {foreignKey: "userId"});