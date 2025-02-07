
//modules imports 
const express = require("express");
const router = express.Router();


//controllers imports

const validateObjectId = require("../middlewares/validateObjectId");
const { verifyTokenUser, verifyToken } = require("../middlewares/verifyToken");
const { sendNewMessage, replyMessage, getMessagesWithUser, getSpecificMessage, getAllMessages, getUnreadedMessages, setMessagesReaded } = require("../controllers/messagesController");


// /api/messages

router.route("/")
    .get(verifyToken, getAllMessages)
    .post(verifyToken, sendNewMessage);

router.route("/unreaded-messages")
    .get(verifyToken, getUnreadedMessages);

// /api/messages/:id
router.route("/:id")
    .get(validateObjectId, verifyToken, getMessagesWithUser)
    .put(validateObjectId, verifyToken, replyMessage);

router.route("/message/:id")
    .get(validateObjectId, verifyToken, getSpecificMessage);

router.route("/readed/:id")
    .put(validateObjectId,verifyToken,setMessagesReaded);

module.exports = router;