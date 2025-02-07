const mongoose = require("mongoose");


//token schema
const verificationTokenSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    token:{
        type:String,
        required:true,
    },

},
{
    timestamps:true,
});

//Verification Token Model
const VerificationTokenModel = mongoose.model("VerificationToken",verificationTokenSchema);


module.exports =VerificationTokenModel;
