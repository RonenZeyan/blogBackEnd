const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { cloudinaryRemoveImage, cloudinaryUploadImage } = require("../utils/cloudinary");
const { Post, validateUpdatePost, validateCreatePost } = require("../models/Post");
const { Comment } = require("../models/Comment");

/**
 * @description Create New Post
 * @router /api/posts
 * @method POST
 * @access private (only loggedin User)
 */

module.exports.createPost = asyncHandler(async (req, res) => {
    // validation for image
    if (!req.file) {
        return res.status(400).json({
            message: "No Image Provided!"
        });
    }
    // validation for data
    const { error } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    //upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath);

    //create new post and save it to DB
    //another way to save post in db (without new and save)
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id,
        }
    });
    //send response to FrontEnd
    res.status(201).json(post);
    //remove image from Server
    fs.unlinkSync(imagePath);
});



/**
 * @description Get All Posts
 * @router /api/posts
 * @method GET
 * @access public
 */

module.exports.getAllPosts = asyncHandler(async (req, res) => {
    const POST_PER_PAGE = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if (pageNumber) {
        posts = await Post.find()
            .skip((pageNumber - 1) * POST_PER_PAGE)
            .limit(POST_PER_PAGE)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"]);
    } else if (category) {
        posts = await Post.find({ category: category }).sort({ createdAt: -1 }).populate("user", ["-password"]);

    } else { //if not recieve any query 
        posts = await Post.find().sort({ createdAt: -1 }).populate("user", ["-password"]); //get the newest post at the first 
    }

    res.status(200).json(posts);


});


/**
 * @description Get post
 * @router /api/posts/:id
 * @method GET
 * @access public
 */

module.exports.getPost = asyncHandler(async (req, res) => {

    const post = await Post.findById(req.params.id)
        .populate("user", ["-password"])
        .populate("comments");
    if (post) {
        return res.status(200).json(post);
    }
    res.status(404).json({ message: "Requested Post not Exist!" });

});

/**
 * @description Get Post Counts
 * @router /api/posts/count
 * @method GET
 * @access public
 */

module.exports.getPostsCount = asyncHandler(async (req, res) => {

    const postCount = await Post.countDocuments();
    res.status(200).json(postCount);

});



/**
 * @description Delete Post
 * @router /api/posts/:id
 * @method DELETE
 * @access private (admin & user himself)
 */

module.exports.deletePost = asyncHandler(async (req, res) => {

    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Requested Post not Exist!" });
    }

    //delete all comments before delete the post 
    await Comment.deleteMany({ postId: post._id });

    if (req.user.isAdmin || req.user.id === post.user.toString())  //the verify in middleware check with the id recieved from params and we cant use here 
    {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId) //delete image in cloudinary
        return res.status(200).json({ message: "Post Deleted Successfully!", postId: post._id });
    } else {
        res.status(403).json({ message: "access denided" });
    }


});



/**
 * @description Update Post
 * @router /api/posts/:id
 * @method PUT
 * @access private (admin & user himself)
 */

module.exports.updatePost = asyncHandler(async (req, res) => {

    //validation
    const { error } = validateUpdatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    //check post Existing
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "Requested Post not Exist!" });
    }

    //check if the user himself or admin update the post
    if (!(req.user.isAdmin || req.user.id === post.user.toString())) {
        return res.status(403).json({ message: "access denided" })
    }
    //update the post 
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
        }
    }, { new: true }).populate("user", ["-password"])

    res.status(200).json(updatedPost)
});


/**
 * @description Update Post Image
 * @router /api/posts/upload-image/:id
 * @method PUT
 * @access private (admin & user himself)
 */

module.exports.updatePostImage = asyncHandler(async (req, res) => {

    //validation
    if (req.file) {
        return res.status(400).json({ message: "No Image Provided" })
    }

    //check post Existing
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "Requested Post not Exist!" });
    }

    //check if the user himself or admin update the post
    if (!(req.user.isAdmin || req.user.id === post.user.toString())) {
        return res.status(403).json({ message: "access denided" })
    }

    //remove old image
    cloudinaryRemoveImage(post.image.publicId);

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    //update the post 
    const updatedPostImage = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id,
            }
        }
    }, { new: true })

    res.status(200).json(updatedPostImage);

    fs.unlinkSync(imagePath); //remove picture from images file 
});


/**
 * @description Toggle Like
 * @router /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
 */

module.exports.toggleLike = asyncHandler(async (req, res) => {

    const loggedInUser = req.user.id;
    const { id: postId } = req.params;
    let post = await Post.findById(postId); //id of the post 
    if (!post) {
        return res.status(400).json({ message: "Post not Founded" });
    }

    const isPostAlreadyLiked = post.likes.find(
        (user) => user.toString() === loggedInUser);
    if (isPostAlreadyLiked) {
        post = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loggedInUser, }  //if user already liked then we make unliked 
        }, { new: true });
    } else {
        post = await Post.findByIdAndUpdate(postId, {
            $push: { likes: loggedInUser, }
        }, { new: true });
    }
    res.status(200).json(post);
});


