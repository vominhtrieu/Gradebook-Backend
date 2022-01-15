import { sequelize } from "./db";
import bcrypt from "bcrypt";
import Model, { DataTypes, Op } from "sequelize";

export const User = sequelize.define(
    "user",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        student_id: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
            allowNull: true,
        },
        blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        external_type: {
            type: DataTypes.STRING,
        },
        external_id: {
            type: DataTypes.STRING,
        },
    },
    {underscored: true}
);

export async function registerUser(user: any): Promise<any> {
    user.password = bcrypt.hashSync(user.password, 10);
    try {
        const result = await User.create({
            student_id: user.studentId,
            name: user.name,
            email: user.email.toLowerCase(),
            password: user.password,
            role: user.role ? user.role : 1,
        });
        return result.toJSON();
    } catch (err) {
        return null;
    }
}

export async function signUserIn(
    email: string,
    password: string
): Promise<any> {
    email = email.toLowerCase();
    const data = await User.findOne({
        where: {
            email: email,
        },
    });
    if (data === null) {
        return null;
    }
    const user = <any>data.toJSON();
    if (bcrypt.compareSync(password, user.password)) {
        return user;
    }
    return null;
}

export async function googleSignUserIn(
    externalType: string,
    externalId: string,
    email: string,
    name: string
): Promise<any> {
    const data = await User.findOne({
        where: {
            email: email,
        },
    });

    if (data === null) {
        try {
            const result = await User.create({
                name,
                email,
                external_type: externalType,
                external_id: externalId,
            });
            return result.toJSON();
        } catch (err) {
            return null;
        }
    } else {
        const user = <any>data.toJSON();

        try {
            await User.update(
                {
                    name,
                    email,
                    external_type: externalType,
                    external_id: externalId,
                },
                {
                    where: {
                        id: user.id,
                    },
                }
            );

            return {...user, name, email};
        } catch {
            return null;
        }
    }
}

export async function getUserById(id: any): Promise<any> {
    try {
        const data = await User.findOne({
            where: {
                id: id,
            },
        });
        if (data == null) {
            return null;
        }
        return data.toJSON();
    } catch (e) {
        return null;
    }
}

export async function getUsersByEmail(email: any): Promise<any> {
    try {
        const data = await User.findAll({
            where: {
                email: {
                    [Op.like]: `${email}%`
                }
            },
        });
        if (data == null) {
            return null;
        }
        return JSON.parse(JSON.stringify(data));
    } catch (e) {
        return null;
    }
}

export async function updateUserAvatar(id: any, avatar: string): Promise<any> {
    try {
        const result = await User.update(
            {
                avatar: avatar,
            },
            {
                where: {
                    id: id,
                },
            }
        );
        return result;
    } catch {
        return null;
    }
}

export async function updateUserStudentId(
    id: any,
    studentId: string
): Promise<any> {
    try {
        const result = await User.update(
            {
                student_id: studentId,
            },
            {
                where: {
                    id: id,
                },
            }
        );
        return result;
    } catch {
        return null;
    }
}

export async function updateUserName(id: any, name: string): Promise<any> {
    try {
        const result = await User.update(
            {
                name: name,
            },
            {
                where: {
                    id: id,
                },
            }
        );
        return result;
    } catch {
        return null;
    }
}

export async function updateUserPassword(
    id: any,
    oldPassword: string,
    newPassword: string
): Promise<any> {
    try {
        const data = await User.findOne({
            where: {
                id,
            },
        });
        if (data === null) {
            return null;
        }
        const user = <any>data.toJSON();
        if (!user.password || bcrypt.compareSync(oldPassword, user.password)) {
            const result = await User.update(
                {
                    password: bcrypt.hashSync(newPassword, 10),
                },
                {
                    where: {
                        id: id,
                    },
                }
            );
            return result;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}

export async function getAllUser(condition: any): Promise<any> {
    const data: any = await User.findAll({
        where: condition,
        raw: true,
        order: [["created_at", "desc"]]
    });

    for (let i = 0; i < data.length; i++) {
        data[i] = {
            id: data[i].id,
            createdAt: data[i].createdAt.toLocaleDateString("vi"),
            name: data[i].name,
            email: data[i].email,
            studentId: data[i].student_id,
            role: data[i].role,
            blocked: data[i].blocked,
        }
    }
    return data;
}

export async function BlockUser(id: any) {
    await User.update({
        blocked: true,
    }, {
        where: {
            id,
        }
    });
}


export async function UnBlockUser(id: any) {
    await User.update({
        blocked: false,
    }, {
        where: {
            id,
        }
    });
}