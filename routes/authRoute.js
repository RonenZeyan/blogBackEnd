
//modules imports 
const express = require("express");
const router = express.Router();


//controllers imports
const { register,login } = require("../controllers/authController");


// /api/auth/register

router.post("/register",register);
router.post("/login",login);



module.exports = router;