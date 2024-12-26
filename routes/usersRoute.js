//modules imports 
const express = require("express");
const router = express.Router();

//CONTROLLERS Import
const { getAllUsers, getUser, updateUser, getUsersCount, profilePhotoUpload, deleteUser } = require("../controllers/usersController");
const { verifyTokenAdmin, verifyTokenUser, verifyToken, verifyTokenUserOrAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");


// /api/users/profile
router.route("/profile").get(verifyTokenAdmin, getAllUsers);

// /api/users/count
router.route("/count").get(verifyTokenAdmin, getUsersCount);

// /api/users/profile/:id
router.route("/profile/:id")
    .get(validateObjectId, getUser)
    .put(validateObjectId, verifyTokenUser, updateUser)
    .delete(validateObjectId,verifyTokenUserOrAdmin,deleteUser);

router.route("/profile/profile-photo-upload")
    .post(verifyToken,photoUpload.single("image"), profilePhotoUpload);

module.exports = router;
