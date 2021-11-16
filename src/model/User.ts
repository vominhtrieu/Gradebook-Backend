import { sequelize } from "./db";
import bcrypt from "bcrypt";
import Model, { DataTypes } from "sequelize";

export const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    avatar: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {underscored: true});

export async function registerUser(user: any): Promise<any> {
    user.password = bcrypt.hashSync(user.password, 10);
    try {
        const result = await User.create({
            name: user.name,
            email: user.email.toLowerCase(),
            password: user.password,
        });
        return result.toJSON();
    } catch (err) {
        return null;
    }
}

export async function signUserIn(email: string, password: string): Promise<any> {
    email = email.toLowerCase()
    const data = await User.findOne({
        where: {
            email: email
        }
    })
    if (data === null) {
        return null
    }
    const user = (<any>data.toJSON())
    if (bcrypt.compareSync(password, user.password)) {
        return user;
    }
    return null;
}

export async function getUserById(id: any): Promise<any> {
    try {
        const data = await User.findOne({
            where: {
                id: id
            }
        });
        if (data == null) {
            return null;
        }
        return data.toJSON()
    } catch (e) {
        return null;
    }
}

export async function updateUserAvatar(id: any, avatar: string): Promise<any> {
    try {
        const result = await User.update({
            avatar: avatar,
        }, {
            where: {
                id: id
            }
        });
        console.log(result);
        return result
    } catch {
        return null
    }
}

export async function getAllUser(): Promise<null> {
    return null;
}
