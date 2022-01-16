import { sequelize } from "./db";
import { DataTypes, Op, where } from "sequelize";
import { GradeDetail } from "./GradeDetail";
import { ClassroomMember } from "./ClassroomMember";

export const GradeReview = sequelize.define(
  "gradeReview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
    },
    gradeDetailId: {
      type: DataTypes.INTEGER,
    },
    isReviewed: {
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
  teacherId: any,
  gradeDetailId: any,
  expectationGrade: any,
  explanationMessage: any
): Promise<boolean> {
  try {
    await GradeReview.create({
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
        isReviewed: 1,
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

export async function GetReviewById(id: any): Promise<any> {
  try {
    const gradeReview = await GradeReview.findOne({
      where: {
        id,
      },
    });

    let result: any = gradeReview?.toJSON();
    return result;
  } catch (e) {
    return [];
  }
}

export async function UpdateReviewIsComplete(id: any): Promise<boolean> {
  try {
    await GradeReview.update(
      {
        isReviewed: 2,
      },
      {
        where: {
          id,
        },
      }
    );

    return true;
  } catch (e) {
    return false;
  }
}
