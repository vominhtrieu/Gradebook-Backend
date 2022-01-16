import { sequelize } from "./db";
import { DataTypes, Op } from "sequelize";
import { GradeDetail } from "./GradeDetail";
import { ClassroomMember } from "./ClassroomMember";

export const GradeReview = sequelize.define(
  "gradeReview",
  {
    classroomId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gradeDetailId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
    },
    reviewState: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    expectationGrade: {
      type: DataTypes.FLOAT,
    },
    explanationMessage: {
      type: DataTypes.STRING,
    },
  },
  {
    underscored: true,
  }
);

GradeReview.belongsTo(GradeDetail, { foreignKey: "gradeDetailId" });
GradeReview.belongsTo(ClassroomMember, { foreignKey: "teacherId" });

export async function AddGradeReview(
  classroomId: any,
  teacherId: any,
  gradeDetailId: any,
  expectationGrade: any,
  explanationMessage: any
): Promise<boolean> {
  try {
    await GradeReview.create({
      classroomId,
      teacherId,
      gradeDetailId,
      expectationGrade,
      explanationMessage,
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function GetRequestedReviews(teacherId: any): Promise<any> {
  try {
    const gradeReviews = await GradeReview.findAll({
      where: {
        teacherId,
        [Op.or]: [{ reviewState: 1 }, { reviewState: 2 }],
      },
      order: [["updated_at", "desc"]],
    });

    let result: any = [];
    gradeReviews.forEach(review => {
      result.push(review.toJSON());
    });
    return result;
  } catch (e) {
    return [];
  }
}

export async function GetReviewById(
  classroomId: any,
  gradeDetailId: any
): Promise<any> {
  try {
    const gradeReview = await GradeReview.findOne({
      where: {
        classroomId,
        gradeDetailId,
      },
    });

    let result: any = gradeReview?.toJSON();
    return result;
  } catch (e) {
    return null;
  }
}

export async function UpdateReviewIsInProgress(
  classroomId: any,
  gradeDetailId: any
): Promise<boolean> {
  try {
    await GradeReview.update(
      {
        reviewState: 2,
      },
      {
        where: {
          classroomId,
          gradeDetailId,
        },
      }
    );

    return true;
  } catch (e) {
    return false;
  }
}

export async function UpdateReviewIsComplete(
  classroomId: any,
  gradeDetailId: any
): Promise<boolean> {
  try {
    await GradeReview.update(
      {
        reviewState: 3,
      },
      {
        where: {
          classroomId,
          gradeDetailId,
        },
      }
    );

    return true;
  } catch (e) {
    return false;
  }
}
