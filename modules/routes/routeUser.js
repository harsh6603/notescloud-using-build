const { body } = require('express-validator');
const userControl = require("../controller/userControl");
const authentication = require("../middleware/authentication");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Helloooo");
})

//post request for new user with validation 
router.post("/signup", [
    body('name', "Please enter name.").exists().isLength({min:1}),
    body('email', "Please enter email.").exists().isLength({min:1}),
    body('email', "Please enter valid email.").isEmail(),
    body('password', "Please enter password.").exists().isLength({min:1}),
    body('password', "Please enter strong password").isStrongPassword(),
    body('email', "Please enter valid email.").custom(value => {
        return userControl.findUserByEmail(value).then(user => {
            if (user.length!=0) {
                // console.log(user);
                return Promise.reject('E-mail already exist.');
            }
        });
    }),
], userControl.createUser);

router.post("/login",[
    body('email', "Please enter email.").exists().isLength({min:1}),
    body('email', "Please enter valid email.").isEmail(),
    body('password', "Please enter password.").exists(),
],userControl.login)

router.patch("/createLabel",authentication.authenticateUser,userControl.createLabel);

router.get("/getuser",authentication.authenticateUser,userControl.getUser)
module.exports = router;