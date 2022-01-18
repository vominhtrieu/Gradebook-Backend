import { sequelize } from "./db";
import { DataTypes } from "sequelize";
import { ClassroomMember } from "./ClassroomMember";
import { GradeReview } from "./GradeReview";

export const GradeReviewConversation = sequelize.define(
  "gradeReviewConversation",
  {
    classroomId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gradeDetailId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    commentOrder: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment: {
      type: DataTypes.STRING,
    },
    classroomMemberId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    underscored: true,
  }
);

GradeReviewConversation.belongsTo(ClassroomMember, {
  foreignKey: "classroomMemberId",
});
GradeReviewConversation.belongsTo(GradeReview, {
  as: "classroom",
  foreignKey: "classroomId",
});
GradeReviewConversation.belongsTo(GradeReview, {
  as: "gradeDetail",
  foreignKey: "gradeDetailId",
});

export async function AddGradeReviewComment(
  classroomId: any,
  gradeDetailId: any,
  classroomMemberId: any,
  comment: any
): Promise<boolean> {
  try {
    await GradeReviewConversation.create({
      classroomId,
      gradeDetailId,
      classroomMemberId,
      comment,
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function GetGradeReviewComments(
  classroomId: any,
  gradeDetailId: any
): Promise<any> {
  try {
    const comments = await GradeReviewConversation.findAll({
      where: {
        classroomId,
        gradeDetailId,
      },
      order: [["created_at", "asc"]],
    });

    let result: any = [];
    comments.forEach(comment => {
      result.push(comment.toJSON());
    });
    return result;
  } catch (e) {
    return [];
  }
}
