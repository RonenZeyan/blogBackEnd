const { createComment, getAllComments, deleteComment, updateComment } = require("../controllers/commentsController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/comments
router.route("/")
    .post(verifyToken,createComment)
    .get(verifyTokenAdmin,getAllComments);


// /api/comments/:id
router.route("/:id")
    .delete(validateObjectId,verifyToken,deleteComment)
    .put(validateObjectId,verifyToken,updateComment);

module.exports = router;