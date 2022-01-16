// import socketAuth from "../middlewares/socketAuth";
// import User from "../model/User";
import { Server } from "socket.io";
import notificationSocket from "./notification";

export default (io: Server) => {
    // io.use(socketAuth);
    io.on("connection", (socket: any) => {
            socket.join("u/" + socket.userId);
            notificationSocket(io, socket);
        }
    );
};