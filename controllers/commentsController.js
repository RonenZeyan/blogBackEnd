
const asyncHandler = require("express-async-handler");
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/Comment");
const { User } = require("../models/User");
const { Notification } = require("../models/Notification");
const { Post } = require("../models/Post");
const { Socket } = require("socket.io");
const { userSocketMap } = require("../config/connectToSocket");
const { sendNotif } = require("../services/socketServices");

module.exports.createComment = asyncHandler(async (req, res) => {

    const { error } = validateCreateComment(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const userProfile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: userProfile.username,
    });

    const post = await Post.findById(req.body.postId);

    const notification = new Notification({
        userId: post.user,
        senderId: req.user.id,
        postId: req.body.postId,
        commentId: comment._id,
        type: "Comment",
    });

    await notification.save();

    sendNotif(userSocketMap[post.user], req, notification);

    res.status(201).json(comment);

});

// function sendNotif(recipientSocketId, req, notification) {
//     const io = req.app.get("socketio");
//     if (recipientSocketId) {
//         io.to(recipientSocketId).emit("newNotification", {
//             data: notification,
//             message: "A new comment was posted on your post!",
//         });
//     } else {
//         console.log(`User ${recipientSocketId} is not connected`);
//     }
// }


/**
 * @description Get All Comments
 * @router /api/comments
 * @method GET
 * @access private (only admin)
 */

module.exports.getAllComments = asyncHandler(async (req, res) => {

    const comments = await Comment.find().populate("user");
    res.status(200).json(comments)
});


/**
 * @description Delete Comment
 * @router /api/comments/:id
 * @method DELETE
 * @access private (only admin & user himself)
 */

module.exports.deleteComment = asyncHandler(async (req, res) => {

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: "Comment Not Found!" });
    }

    if (req.user.isAdmin || req.user.id === comment.user._id.toString()) {
        await Comment.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Comment has Been Deleted" })
    }
    res.status(200).json({ message: "Access Denied, Not Allowed" });
});


/**
 * @description Update Comment
 * @router /api/comments/:id
 * @method PUT
 * @access private (only user himself)
 */

module.exports.updateComment = asyncHandler(async (req, res) => {

    const { error } = validateUpdateComment(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: "Comment Not Founded" });
    }

    if (req.user.id !== comment.user.toString()) {
        return res.status(403).json({ message: "access denied, only user himself can edit his comment" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text,
        }
    }, { new: true })  //new True that mean return the updated Comment
    res.status(200).json(updatedComment);
});
