
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateLoginUser, validateRegisterUser } = require("../models/User");
const { Notification } = require("../models/Notification");


/**
 * @description Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
 */
const register = asyncHandler(async (req, res) => {
    //validation of request data
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    //check if user already registered
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User Already Exist" })
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //add new User to DB

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    });

    await user.save();

    //return response to Client/FrontEnd
    res.status(201).json({ message: "You Registered Successfully,Please SignIn" });
});


/**
 * @description Login User
 * @router /api/auth/login
 * @method POST
 * @access public
 */
const login = asyncHandler(async (req, res) => {
    //validation of request data
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    //check if user already registered
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "Email or Password Invalid" })
    }

    //compare hashed the password with sended password
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
    if (!isPasswordCorrect) {
        return res.status(404).json({ message: "Email or Password Invalid" });
    }
    //generate Token
    const token = user.generateAuthToken();

    //get fields without password
    const { password, ...otherFieldsUser } = user._doc;

    //return response to Client/FrontEnd        
    res.status(200).json({ ...otherFieldsUser, token });
});


module.exports = {
    register,
    login,
}

