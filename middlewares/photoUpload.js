const path = require("path");
const multer = require("multer");

//Photo Storage 
const photoStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, file.originalname + new Date().toISOString().replace(/:/g, ","))
        } else {  //if there is no file sended
            cb(null, false);
        }
    }
});


//photo upload middleware 

const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported File Format" }, false);
        }
    },
    limits: { fileSize: 1024 * 1024 * 2 } //photo until 2MB size 
});


module.exports = photoUpload;