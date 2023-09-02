const express = require("express")
const router = express.Router()

const userController = require("../controllers/userController.js")
const userLogin = require("../controllers/userController.js")

// Public Route
router.use(express.json())
// router.post("/register",userController)
// router.post("/login",userLogin)
module.exports = router