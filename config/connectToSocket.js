// config/socket.js
const { Server } = require("socket.io");

let userSocketMap = {};

const initSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",  // או כל מקור שקשור ללקוח
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {

        socket.on("setUserId", (userId) => {
            // console.log(`User ${userId} connected with socket ID: ${socket.id}`);
            // userSocketMap[userId] = socket.id;
            if (userSocketMap[userId]) {
                console.log(`User ${userId} is already connected with socket ID: ${userSocketMap[userId]}`);
            } else {
                // חבר את המשתמש אם הוא לא מחובר עדיין
                userSocketMap[userId] = socket.id;
                console.log(`User ${userId} connected with socket ID: ${socket.id}`);
            }
        });

        socket.on("disconnect", () => {
            for (const userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) {
                    delete userSocketMap[userId];
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

module.exports = {initSocketIO,userSocketMap};
