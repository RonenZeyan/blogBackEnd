const { createCategory, getAllCategories, deleteCategory } = require("../controllers/categoriesController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/comments
router.route("/")
    .post(verifyTokenAdmin,createCategory)
    .get(getAllCategories)


router.route("/:id")
    .delete(validateObjectId,verifyTokenAdmin,deleteCategory)

module.exports = router;