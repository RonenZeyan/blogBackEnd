const mongoose = require("mongoose");
const joi = require("joi")
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 100,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 200,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null,
        }
    },
    bio: String, //if field have one property then we can write without { }
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true,
        toJSON: {virtuals:true},
        toObject: {virtuals:true},
    });

//populate posts that belong to the user 
userSchema.virtual("posts",{
    ref:"Post",
    foreignField: "user",
    localField:"_id",
})

//generate token 
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET_KEY);
}

const User = mongoose.model("User", userSchema);



//validate register user
function validateRegisterUser(obj) {
    const schema = joi.object({
        username: joi.string().min(2).max(200).trim().required(),
        email: joi.string().min(5).max(100).trim().required().email(),
        password: joi.string().min(8).trim().required(),
    })
    return schema.validate(obj);
}

//validate login user
function validateLoginUser(obj) {
    const schema = joi.object({
        email: joi.string().min(5).max(100).trim().required().email(),
        password: joi.string().min(8).trim().required(),
    })
    return schema.validate(obj);
}

//validate update user
function validateUpdateUser(obj) {
    const schema = joi.object({
        username: joi.string().min(2).max(200).trim(),
        password: joi.string().min(8).trim(),
        bio: joi.string(),
    })
    return schema.validate(obj);
}



module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
};