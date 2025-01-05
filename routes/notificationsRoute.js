
//modules imports 
const express = require("express");
const router = express.Router();


//controllers imports
const { getAllNotifications, setNotificationReaded } = require("../controllers/notificationsController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken } = require("../middlewares/verifyToken");


// /api/notifications

router.route("/")
    .get(verifyToken, getAllNotifications);

// /api/notifications/:id
router.route("/:id")
    .post(validateObjectId, setNotificationReaded);




module.exports = router;