
const asyncHandler = require("express-async-handler")
const { Category, validateCreateCategory } = require("../models/Category")

/**
 * @description Create New Category
 * @router /api/categories
 * @method POST
 * @access private (only admin)
 */

module.exports.createCategory = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const category = await Category.create({
        user: req.user,
        title: req.body.title,
    })
    res.status(201).json(category)
})


/**
 * @description Get All Categories
 * @router /api/categories
 * @method GET
 * @access public
 */

module.exports.getAllCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find();

    res.status(200).json(categories)
})



/**
 * @description Delete Category
 * @router /api/categories/:id
 * @method DELETE
 * @access private (only Admin)
 */

module.exports.deleteCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category Not Founded' })
    }
    await Category.findByIdAndDelete(req.params.id)
    res.status(200).json({
        message: "Category has Been Deleted Sucessfully",
        categoryId: category._id,

    })
})



