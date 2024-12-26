
const jwt = require("jsonwebtoken");

//Verify Token 

function verifyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if (authToken) {
        const token = authToken.split(" ")[1];  //token sended Bearer token21425 then we split and take the token without bearer word
        try {
            //verify the token 
            const decodedTokenPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decodedTokenPayload;
            next(); //send to next middleware
        } catch (error) {
            return res.status(401).json({ message: "invalid token, access denied" })
        }
    } else {
        return res.status(401).json({ message: "no token provided, access denied" });
    }
}

//Verify Token & Admin
function verifyTokenAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            //if not Admin
            return res.status(403).json({ message: "not allowed, only admin can access" })
        }
    })
}

function verifyTokenUser(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id) {
            next();
        }
        else {
            return res.status(403).json({ message: "not allowed, only user can access" })
        }
    })
}

function verifyTokenUserOrAdmin(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        }else{
            return res.status(403).json({message:"not Allowed, Only User himself or Admin"})
        }
    })
}


module.exports = {
    verifyToken,
    verifyTokenAdmin,
    verifyTokenUser,
    verifyTokenUserOrAdmin,
}