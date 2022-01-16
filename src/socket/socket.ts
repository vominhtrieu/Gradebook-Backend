// import socketAuth from "../middlewares/socketAuth";
// import User from "../model/User";
import { Server, Socket } from "socket.io";
import notificationSocket from "./notification";
import jwt from "jsonwebtoken";
import { getUserById } from "../model/User";

export default (io: Server) => {
    io.use((socket: any, next: any) => {
        const token = socket.handshake.auth.token;
        jwt.verify(
            token,
            process.env.TOKEN_SECRET as string,
            async (err: any, decoded: any) => {
                if (err) {
                    return
                } else {
                    const user: any = await getUserById(decoded.id);
                    if (user) {
                        socket.userId = user.id;
                        next();
                    }
                }
            }
        );
    });

    io.on("connection", (socket: any) => {
            socket.join("u/" + socket.userId);
            notificationSocket(io, socket);
        }
    );
};