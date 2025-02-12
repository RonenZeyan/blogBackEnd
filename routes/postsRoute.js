const { createPost, getAllPosts, getPost, getPostsCount, deletePost, updatePost, updatePostImage, toggleLike } = require("../controllers/postsController");
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

const router = require("express").Router();


// /api/posts
router.route("/")
    .post(verifyToken, photoUpload.single("image"), createPost)
    .get(getAllPosts);


// /api/posts/count
router.route("/count")
    .get(getPostsCount);


// /api/posts/:id
router.route("/:id")
    .get(validateObjectId, getPost)
    .delete(validateObjectId, verifyToken, deletePost)
    .put(validateObjectId, verifyToken, updatePost);


// /api/posts/upload-image/:id
router.route("/upload-image/:id")
    .put(validateObjectId, verifyToken, photoUpload.single("image"), updatePostImage);


// /api/posts/like/:id
router.route("/like/:id")
    .put(validateObjectId, verifyToken, toggleLike);

module.exports = router;

