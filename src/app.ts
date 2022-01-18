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
import adminRouter from "./routes/admin.route";
import classroomRouter from "./routes/classroom.route";
import notificationRouter from "./routes/notification.route";
import { sequelize } from "./model/db";
import passport from "passport";
import passportJWT from "passport-jwt";
import jwt from "jsonwebtoken";
import { getUserById } from "./model/User";
import fs from "fs";
import { Server } from "socket.io";
import mySocket from "./socket/socket";
import http from "http";

const app = express();
const server = new http.Server(app);

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const strategy = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
}, async function (jwt_payload: any, next: any) {
    const user = await getUserById(jwt_payload.id);
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

mySocket(io);

app.set("io", io);
app.use("/public", express.static("public"));
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json({limit: "1mb"}));
app.use(cors());
app.use((_: Request, res, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    next();
});
app.use(passport.initialize());
app.use("/", authRouter);
app.use(passport.authenticate("jwt", {session: false}))
app.use((req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user.blocked) {
        return res.status(402).json("This account has been blocked");
    }
    // @ts-ignore
    req.headers["userData"] = req.user;
    next();
});
app.use("/users", userRouter);
app.use("/classrooms", classroomRouter);
app.use("/admin", adminRouter);
app.use("/notifications", notificationRouter);

if (!fs.existsSync("./public")) {
    fs.mkdirSync("./public");
}

server.listen(process.env.PORT, () => {
    sequelize
        .sync({alter: true})
        .then((err: any) => {
            console.log(`Server is listening at PORT ${process.env.PORT}`);
        })
        .catch((err) => {
            console.log("Cannot sync database!")
            console.log(err);
        });
});
