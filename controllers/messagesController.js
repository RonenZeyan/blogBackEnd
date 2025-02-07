
const asyncHandler = require("express-async-handler");
const { Message } = require("../models/message");
const { userSocketMap } = require("../config/connectToSocket");
const { sendMsgNotif } = require("../services/socketServices");


// /**
//  * @description get all messages of user
//  * @router /api/messages/:id
//  * @method get
//  * @access private (only user himself)
//  */
module.exports.getAllMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({
        $or: [
            { senderId: req.user.id },
            { receiverId: req.user.id },
        ],
    })
        .sort({ createdAt: -1 })
        .populate("senderId", "username")
        .populate("receiverId", "username");
    // .select("title senderId receiverId _id");

    // no messages founded
    if (!messages || messages.length === 0) {
        res.status(404).json({
            message: "no messages founded"
        })
    }
    //send results
    res.status(200).json(
        messages,
    );
})


// /**
//  * @description get unreaded messages
//  * @router /api/messages/:id
//  * @method get
//  * @access private (only user himself)
//  */
module.exports.getUnreadedMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find(
        { receiverId: req.user.id, isRead: false })
        .sort({ createdAt: -1 })
        .populate("senderId", "username")
        .populate("receiverId", "username");

    // no messages founded
    if (!messages || messages.length === 0) {
        res.status(404).json({
            message: "no messages founded"
        })
    }
    //send results
    res.status(200).json(
        messages,
    );
})

// /**
//  * @description Set Messages Readed
//  * @router /api/messages
//  * @method put
//  * @access private (only user himself)
//  */
module.exports.setMessagesReaded = asyncHandler(async (req, res) => {
    
    const message = await Message.findById(req.params.id);
    // no message founded
    if (!message) {
        return res.status(404).json({
            message: "no messages founded"
        })
    }

    //set messages Readed

    await message.updateOne({ $set: { isRead: true } })
    const updatedMessage = await Message.findById(req.params.id);


    //send results
    res.status(200).json(
        updatedMessage,
    );
})


// /**
//  * @description all messages between you and another user 
//  * @router /api/messages/:id
//  * @method get
//  * @access private (only user himself)
//  */
module.exports.getMessagesWithUser = asyncHandler(async (req, res) => {


    const messages = await Message.find({
        $or: [
            { senderId: req.params.id },
            { receiverId: req.params.id },
        ],
    }).select("senderId receiverId _id");;

    // no messages founded
    if (!messages || messages.length === 0) {
        res.status(404).json({
            message: "no messages founded between you and the other user"
        })
    }
    //send results
    res.status(200).json({
        messages,
    });
});

// /**
//  * @description get messages of specific message you choose between you and another user 
//  * @router /api/messages/message/:id
//  * @method get
//  * @access private (only user himself)
//  */
module.exports.getSpecificMessage = asyncHandler(async (req, res) => {


    const message = await Message.findById(req.params.id);

    // no messages founded
    if (!message) {
        res.status(404).json({
            message: "no messages founded between you and the other user"
        })
    }
    message.isRead = true;
    await message.save();

    //send results
    res.status(200).json({
        message,
    });
});



// /**
//  * @description send new message to user 
//  * @router /api/messages
//  * @method post
//  * @access private (only user himself)
//  */
module.exports.sendNewMessage = asyncHandler(async (req, res) => {
    const timestamp = new Date(); //get time now

    const newMessage = new Message({
        title: req.body.title,
        senderId: req.body.senderId,
        receiverId: req.body.receiverId,
        messages: [
            {
                content: req.body.content,
                timestamp,
                isSendBySender: true,
            },
        ],
    });

    await newMessage.save();

    sendMsgNotif(userSocketMap[req.body.receiverId], req, newMessage);

    //send result that send success 
    res.status(201).json({
        message: "Your message sent successfully.",
        data: newMessage,
    });
});

// /**
//  * @description reply for message
//  * @router /api/messages/:id
//  * @method put
//  * @access private (only user himself)
//  */
module.exports.replyMessage = asyncHandler(async (req, res) => {
    const timestamp = new Date(); //get time now

    const message = await Message.findOne({ _id: req.params.id });

    //if no message founded
    if (!message) {
        res.status(400).json({ message: "message not found" });
    }
    // set read false and add reply for message
    message.isRead = false;
    message.messages.push({
        content: req.body.content,
        timestamp,
        isSendBySender: String(message.senderId) === req.user.id,
    });

    await message.save();

    //send RealTime msg notification
    sendMsgNotif(userSocketMap[req.body.receiverId], req, message);


    //send result that send success 
    res.status(201).json({
        message: "Your reply was sent successfully.",
        data: message,
    });
});


// function sendMsgNotif(recipientSocketId, req, _message) {
//     const io = req.app.get("socketio");
//     if (recipientSocketId) {
//         io.to(recipientSocketId).emit("newMessage", {
//             data: _message,
//             message: "A new Message Received!",
//         });
//     } else {
//         console.log(`User ${recipientSocketId} is not connected`);
//     }
// }