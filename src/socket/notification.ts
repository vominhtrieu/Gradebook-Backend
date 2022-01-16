import { Server } from "socket.io";

export default (io: Server, socket: any) => {
    socket.on("subscribeToNotifications", () => {
        socket.join("n/" + socket.userId);
    });

    socket.on("unsubscribeToNotifications", () => {
        socket.leave("n/" + socket.userId);
    });
};