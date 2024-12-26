const mongoose = require("mongoose");

module.exports = (req, res, next) => {
    //check if id is legal or illegal 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "invalid id" });
    }
    next();
}