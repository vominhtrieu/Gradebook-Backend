// Add support for error detect
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();
// Load environment variables
import { config } from "dotenv";

config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import classroomRouter from "./routes/classroom.route";
import { sequelize } from "./model/db";
import jwt from "jsonwebtoken";
import { getUserById } from "./model/User";
import fs from "fs";

const app = express();

app.use("/public", express.static("public"));
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(cors());
app.use((_: Request, res, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});
app.use("/", authRouter);
app.use((req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader?.substr(7);
        jwt.verify(token, process.env.TOKEN_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                res.sendStatus(401);
            } else {
                if (await getUserById(decoded.id)) {
                    req.headers["userData"] = decoded;
                    next();
                } else {
                    res.sendStatus(401);
                }
            }
        });
    } else {
        res.sendStatus(401);
    }
});
app.use("/users", userRouter);
app.use("/classrooms", classroomRouter);
if (!fs.existsSync("./public")) {
    fs.mkdirSync("./public");
}

app.listen(process.env.PORT, () => {
    sequelize
        .sync({ alter: true })
        .then((err: any) => {
            console.log(`Server is listening at PORT ${process.env.PORT}`);
        })
        .catch((err) => {
            console.log("Cannot sync database!")
            console.log(err);
        });
});
