const mongoose = require("mongoose");

const singleMessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    isSendBySender: {
        type: Boolean,
        required: true,
    }
})

//message Schema
const messageSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 200,
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    messages: {
        type: [singleMessageSchema],
        default: [],
    },
    isRead: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    });


//Message Model
const Message = mongoose.model("Message", messageSchema);


module.exports = {
    Message,
}