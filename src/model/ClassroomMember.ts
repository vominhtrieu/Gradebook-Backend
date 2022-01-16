import { sequelize } from "./db";
import { DataTypes, Op } from "sequelize";
import { User } from "./User";

export const ClassroomMember = sequelize.define(
  "classroom_member",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    studentId: {
      type: DataTypes.STRING,
    },
    classroomName: {
      type: DataTypes.STRING,
    },
    classroomId: {
      type: DataTypes.INTEGER,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "classroom_id", "student_id"],
      },
    ],
  }
);

ClassroomMember.belongsTo(User, { foreignKey: "userId" });

export async function checkValidTeacher(
  classroomId: any,
  userId: any
): Promise<boolean> {
  try {
    const classroomMember = await ClassroomMember.findOne({
      where: {
        classroomId: classroomId,
        userId: userId,
        role: 2,
      },
    });
    return classroomMember !== null;
  } catch (e) {
    return false;
  }
}

export async function checkValidStudent(
  classroomId: any,
  userId: any
): Promise<boolean> {
  try {
    const classroomMember = await ClassroomMember.findOne({
      where: {
        classroomId: classroomId,
        userId: userId,
        role: 1,
      },
    });
    return classroomMember !== null;
  } catch (e) {
    return false;
  }
}

export async function getGradeBoardStudent(classroomId: any): Promise<any> {
  const classroomMember = await ClassroomMember.findAll({
    where: {
      classroomId: classroomId,
      role: 1,
    },
    order: [["student_id", "asc"]],
  });

  let result: any[] = [];
  classroomMember.forEach(value => {
    const student: any = value.toJSON();
    result.push({
      studentId: student.studentId,
      name: student.classroomName,
    });
  });
  return result;
}

export async function checkValidMember(
  classroomId: any,
  userId: any
): Promise<boolean> {
  try {
    const classroom = await ClassroomMember.findOne({
      where: {
        classroomId: classroomId,
        [Op.or]: [
          {
            userId: userId,
          },
        ],
      },
    });
    return classroom !== null;
  } catch (e) {
    return false;
  }
}

export async function importClassroomMember(
  classroomId: any,
  studentId: any,
  name: string
): Promise<boolean> {
  try {
    if (!classroomId || !studentId || !name) {
      return false;
    }
    let classroomMember: any = await ClassroomMember.findOne({
      where: {
        classroomId: classroomId,
        studentId: studentId + "",
      },
    });
    if (classroomMember) {
      classroomMember.classroomName = name;
      classroomMember.save();
      return true;
    }
    await ClassroomMember.create({
      classroomId: classroomId,
      studentId: studentId + "",
      classroomName: name,
      role: 1,
    });
  } catch (e) {
    console.log(e);
  }
  return true;
}

export async function getClassroomMembers(classroomId: any) {
  return await ClassroomMember.findAll({
    where: {
      classroomId: classroomId,
      role: 1,
    },
    raw: true,
  });
}

export async function getClassroomTeacherIds(classroomId: any): Promise<any> {
  try {
    let classroomTeachers: any = await ClassroomMember.findAll({
      where: {
        classroomId: classroomId,
        role: 2,
      },
    });
    let result: any = [];
    classroomTeachers.forEach((teacher: any) => {
      result.push(teacher.toJSON().id);
    });

    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getClassroomTeacherId(
  classroomId: any,
  userId: any
): Promise<any> {
  try {
    let classroomTeacher: any = await ClassroomMember.findOne({
      where: {
        classroomId,
        userId,
        role: 2,
      },
    });
    const result: any = classroomTeacher.toJSON().id;
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}
