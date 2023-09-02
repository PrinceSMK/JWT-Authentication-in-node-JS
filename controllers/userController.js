const express = require("express")
const UserModel = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const checkUserAuth = require("../middlewares/authmiddleware")
const { transporter } = require("../config/emailconfig")

const router = express.Router()
router.use(express.json()) 
// router.use("/changepassword", checkUserAuth)

router.post("/userpost",async(req,res)=>{
    const {name,email,password,password_confirmation,tc} = req.body
    const user = await UserModel.findOne({email:email})
    if (user) {
        res.send({"status":"failed", "message":"Email is already exist"})

    } else {
        if (name && email && password && password_confirmation) {
            if (password === password_confirmation) {
                try {
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password,salt)
                const doc = new UserModel({
                    name:name,
                    email:email,
                    password:hashPassword,
                    tc:tc
                })
                await doc.save()
                const saved_user = await UserModel.findOne({email:email})
                //  Generrating JWT
                const token = jwt.sign({userID:saved_user._id}, process.env.JWT_SECRET_KEY,{ expiresIn: '1h' })

                res.send({"status":"success", "message":"Data saved sucessfully", "token":token}) 
                } catch (error) {
                    console.log("Error in Password"+error)
                    res.json("Error in Password"+error)
                }
            } else{
                res.send({"status":"failed", "message":"Password doesn't match"}) 
            }
        }else{
            res.send({"status":"failed", "message":"All fields are required"})
        }
    }
}

)


router.post("/login",async(req,res)=>{
    try {
        const {email,password} = req.body
        if (email && password) {
            const user = await UserModel.findOne({email:email})
        if (user!=null) {
            const isMatch = await bcrypt.compare(password,user.password)
            if ((user.email=== email) && isMatch) {
                 //  Verify JWT
                 const token = jwt.sign({userID:user._id}, process.env.JWT_SECRET_KEY,{ expiresIn: '1h' })

                res.send({"status":"success", "message":"Login success", "token":token })
                
            }else{
                res.send({"status":"failed", "message":"Password does not Match"})

            }
        } else {
            res.send({"status":"failed", "message":"You are not a registered User" + error})

        }
        }
    } catch (error) {
        res.send({"status":"failed", "message":"Both fields are required"})

    }
})

router.post("/changepassword",checkUserAuth, async(req,res)=>{
        const {password,password_confirmation} = req.body
        if (password && password_confirmation) {
            if (password === password_confirmation) {
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password,salt)
                await UserModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}})
                res.send({"status":"success", "message":"Password changed Successfully"})

            } else {
                res.send({"status":"failed", "message":"Password does not match"})

            }
        } else {
            res.send({"status":"failed", "message":"All fields are required"})

        }
}) 

router.get("/loggeduser",checkUserAuth, async(req,res)=>{
    res.send({"status":"Success", "user":req.user })
})


router.post("/send-reset-password-email",async(req,res)=>{
    const {email}= req.body
    if(email){
        const user = await UserModel.findOne({email:email})
        if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({userID:user._id}, secret,{ expiresIn: '1h' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link);
            let info = await transporter.sendMail({
                from:process.env.EMAIL_FROM,
                to:user.email,
                subject:"Password - Reset Link",
                html:`<a href=${link}>Click Here</a> to Reset Your Password`
            })
            res.send({"status":"sucess", "message":"Password reset Email Sent, Please check your Email immediately", "info":info})

        } else {
            res.send({"status":"failed", "message":"Email is not exist"})

        }
    } else {
            res.send({"status":"failed", "message":"Email is required"})

        }
})


router.post("/reset-password/:id/:token",async(req,res)=>{
    const {password , password_confirmation} = req.body
    const {id,token} = req.params
    const user = await UserModel.findById(id)
    const newsecrettoken = user._id + process.env.JWT_SECRET_KEY
    try {
        jwt.verify(token,newsecrettoken)
        if (password && password_confirmation) {
           if (password === password_confirmation) {
               const salt = await bcrypt.genSalt(10)
               const newHashPassword = await bcrypt.hash(password,salt)
               await UserModel.findByIdAndUpdate(user._id, {$set:{password:newHashPassword}})
               res.send({"status":"sucess", "message":"Password reset successfully"})

           } else {
            res.send({"status":"failed", "message":"Password does not match"})

           } 
        } else {
            res.send({"status":"failed", "message":"All fields are required"})

        }
    } catch (error) {
        res.send({"status":"failed", "message":"Invalid Token" , "error": error})

    }
})




// module.exports = userController
// module.exports = userLogin
module.exports = router
