const jwt = require("jsonwebtoken")
const UserModel = require("../models/User")

const checkUserAuth = async(req,res,next)=>{
    let token
    //  Getting Token from header
    const {authorization} = req.headers
    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(' ')[1]

            // Verify Token
            const {userID} = jwt.verify(token,process.env.JWT_SECRET_KEY)
            req.user = await UserModel.findById(userID).select("-password")
            next()
        } catch (error) {
            res.status(401).send({"status":"Failed", "message":"Unauthorized User", "error":error})
        }
    } else {
        
    }
}


module.exports = checkUserAuth