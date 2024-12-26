const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { cloudinaryRemoveImage, cloudinaryUploadImage, cloudinaryRemoveManyImages } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");

/**
 * @description Get All Users Profile
 * @router /api/users/profile
 * @method GET
 * @access private (only Admin)
 */

module.exports.getAllUsers = asyncHandler(async (req, res) => {

    //Get All Users From DB & return a response
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);

});

/**
 * @description Get users Count
 * @router /api/users/count
 * @method GET
 * @access private (only Admin)
 */

module.exports.getUsersCount = asyncHandler(async (req, res) => {

    //Get All Users From DB & return a response
    const usersCount = await User.countDocuments();
    res.status(200).json(usersCount);

});

/**
 * @description Get User Profile
 * @router /api/users/profile/:id
 * @method GET
 * @access public
 */

module.exports.getUser = asyncHandler(async (req, res) => {

    //Get All Users From DB & return a response
    const user = await User.findById(req.params.id).select("-password").populate("posts");

    //check User Exist
    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }

    //user Exist
    res.status(200).json(user);

});


/**
 * @description update User Profile
 * @router /api/users/profile/:id
 * @method PUT
 * @private (only user himself)
 */

module.exports.updateUser = asyncHandler(async (req, res) => {

    //validate req.body
    const { error } = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    //if req.body.password updated then hash
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    //update User in DB
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio,
        }
    }, { new: true }).select("-password").populate("posts");

    return res.status(200).json(updatedUser);

});



/**
 * @description Profile Photo Upload
 * @router /api/users/profile/profile-photo-upload
 * @method POST
 * @access only logged in User
 */

module.exports.profilePhotoUpload = asyncHandler(async (req, res) => {
    //validation 
    if (!req.file) {
        return res.status(400).json({ message: "no file provided" });
    }

    //get the path to the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    //upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);

    //get the user from the db 
    const user = await User.findById(req.user.id); //get the id of user (verifyToken middleware work and add req.user to req)

    //delete the old profile photo if exist 
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    //change profile photo field in the db
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,
    }
    await user.save();

    //res to client
    res.status(200).json({
        message: "Your Profile Photo Uploaded Successfully.",
        profilePhoto: { url: result.secure_url, publicId: result.public_id }
    });

    //remove image from the server 
    fs.unlinkSync(imagePath)
});



/**
 * @description Delete User Profile
 * @router /api/users/profile/:id
 * @method DELETE
 * @access private (only Admin and user himself)
 */

module.exports.deleteUser = asyncHandler(async (req, res) => {

    //get the user from the db and check if he exist

    const user = await User.findById(req.params.id);
    if (!user) {
        return res(404).json({ message: "User not Found" });
    }

    //get all posts belong to the user
    const posts = await Post.findById({ user: user._id });

    const publicIds = posts?.map((idx, post) => {
        return post.image.publicId;
    })

    if (publicIds?.length > 0) {
        await cloudinaryRemoveManyImages(publicIds);
    }

    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    //delete posts and comments
    await Post.deleteMany({ user: user._id });
    await Comment.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Your Profile Has Been Deleted" })

});