

function sendMsgNotif(recipientSocketId, req, _message) {
    const io = req.app.get("socketio");
    if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", {
            data: _message,
            message: "A new Message Received!",
        });
    } else {
        console.log(`User ${recipientSocketId} is not connected`);
    }
}

function sendNotif(recipientSocketId, req, notification) {
    const io = req.app.get("socketio");
    if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", {
            data: notification,
            message: "A new comment was posted on your post!",
        });
    } else {
        console.log(`User ${recipientSocketId} is not connected`);
    }
}

module.exports={
    sendMsgNotif,
    sendNotif,
}