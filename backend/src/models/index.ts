import { sequelize } from "../config/sequelize";
import { User } from "./User";
import { Project } from "./Project";
import { Task } from "./Task";

// Associations
// A User can own many Projects (via owner_id)
User.hasMany(Project, { foreignKey: "owner_id", as: "ownedProjects" });
Project.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

// A Project has many Tasks (via project_id)
Project.hasMany(Task, { foreignKey: "project_id", as: "tasks" });
Task.belongsTo(Project, { foreignKey: "project_id", as: "project" });

// A Task is assigned to a User (assigned_to)
Task.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

// A User can have many assigned Tasks
User.hasMany(Task, { foreignKey: "assigned_to", as: "assignedTasks" });

export { sequelize, User, Project, Task };







