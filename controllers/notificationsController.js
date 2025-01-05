
const asyncHandler = require("express-async-handler");
const { Notification } = require("../models/Notification");


// /**
//  * @description Get All notifications belong to user
//  * @router /api/notifications
//  * @method GET
//  * @access private (only user himself)
//  */
module.exports.getAllNotifications = asyncHandler(async (req, res) => {

    let notifications = await Notification.find({ userId: req.user.id, isRead: false }).populate("senderId", "username");

    res.status(200).json(notifications);

});

// /**
//  * @description Set notification readed
//  * @router /api/notifications/:id
//  * @method POST
//  * @access private (only user himself)
//  *
module.exports.setNotificationReaded = asyncHandler(async (req, res) => {

    await Notification.updateOne({ _id: req.params.id }, {
        $set: {
            isRead: true,
        }
    })
    res.status(200).json({ message: "notification reader successfully" })
})