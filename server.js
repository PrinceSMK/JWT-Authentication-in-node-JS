const express = require("express")
require('dotenv').config()
const PORT = process.env.PORT
const cors = require("cors")
require("./config/connection")
const UserModel = require("./models/User")
// const router = require("./routes/userRoutes.js")
const router = require("./controllers/userController")
const app = express()


app.use(cors())

app.get("/",(req,res)=>{
    res.json("Working")
})
app.use("/api/user", router)
app.listen(PORT,async(req,res)=>{
    try {
       console.log(`Your PORT is running on ${PORT}`); 
    } catch (error) {
        console.log("ERROR Happened" + error);
    }
})