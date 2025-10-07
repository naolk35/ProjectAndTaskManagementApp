import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/sequelize";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  project_id: number; // FK → Project.id
  assigned_to: number; // FK → User.id
  order_index?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: TaskStatus;
  public project_id!: number;
  public assigned_to!: number;
  public order_index!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    assigned_to: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    order_index: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    timestamps: true,
  }
);
