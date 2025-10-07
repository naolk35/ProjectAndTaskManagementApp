"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_js_1 = require("../config/database.js");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
}, {
    sequelize: database_js_1.sequelize,
    tableName: 'users',
    underscored: true,
});
//# sourceMappingURL=User.js.map