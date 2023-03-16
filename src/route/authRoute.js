const {registerController, loginController} = require('../controller/authController')
// const check = require('../middleware/check')

const express = require("express");
const authRoute = express.Router();

authRoute.post("/register", 
// registerController
    registerController
)

authRoute.post("/login", loginController)

module.exports = {authRoute}
