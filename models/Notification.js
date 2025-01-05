const mongoose = require("mongoose");
const joi = require("joi");


//post Schema
const notificationSchema = new mongoose.Schema({

    postId: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
        required: true,
    },
    senderId:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    commentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
        required: true,
    },
    type: {
        type: String,
        enum: ["Comment", "Like"],
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    });


//Notification Model
const Notification = mongoose.model("Notification", notificationSchema);


//validate Create Notification 
function validateCreateNotifcation(obj) {
    const schema = joi.object({
        postId: joi.string().required(),
        type: joi.enum().required(),
        text: joi.string().trim().required(),
    });
    return schema.validate(obj);
}


module.exports = {
    Notification,
    validateCreateNotifcation,

}