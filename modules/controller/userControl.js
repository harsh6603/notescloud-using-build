const { validationResult } = require('express-validator');
const userModel = require("../models/userModel");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
SECRET = process.env.JWT_SECRET;

//To enter new user data in database
exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let newErr = errors.array();
        // console.log(newErr);
        // console.log(newErr[0].msg)
        return res.status(400).json({ success: false, errors: newErr[0].msg });
    }

    try {

        hashPassword = await bcryptjs.hash(req.body.password, 10)

        //new user created
        userModel.User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
        })
            .then((user) => {
                const data = {
                    id: user._id,
                    name:user.name
                }
                const result = jwt.sign(data, SECRET);
                const responce = {
                    success: true,
                    token: result,
                    name:user.name,
                    email:user.email
                }
                console.log(result);
                res.json(responce);
            })
    }
    //for database error
    catch (err) {
        console.log(err);
        res.status(500).json({
            success:false,
            errors:"Some error occure."
        });
    }
}

exports.findUserByEmail = (mail) => {
    return userModel.User.find({ email: mail });
}


exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let newErr = errors.array();
        // console.log(newErr);
        // console.log(newErr[0].msg)
        return res.status(400).json({success:false,errors: newErr[0].msg });
    }

    loginData = req.body;
    const result = await userModel.User.find({ email: loginData.email });
    if (result.length == 0) {
        res.status(400).json({
            success:false,
            errors :"Invalid login details."
        });
    }
    else {
        const checkPassword = await bcryptjs.compare(loginData.password, result[0].password);
        if (checkPassword == false)
            res.status(400).json({
                success:false,
                errors :"Invalid login details."
            });
        else {
            const load = {
                id: result[0]._id,
                name:result[0].name
            }
            const token = jwt.sign(load, SECRET)
            res.json({
                success:true,
                token: token,
                name:result[0].name,
                email:result[0].email,
                labels:result[0].labels
            })
        }
    }
}

exports.getUser = async (req, res) => {
    try {
        userID = req.userID;
        const result = await userModel.User.findOne({ _id: userID });
        res.json(result.labels);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success:false,
            errors:"Some error occure."
        });
    }
}

exports.createLabel = async (req, res) => {
    try{
        let labelName = req.body.labels;
        //when we want to upadte label at that time old name comes in oldName variable
        //When we want to delete that label at that time "Delete" come in oldName variable
        let oldName = req.body.oldName;
        const result = await userModel.User.findById(req.userID);
        if (result._id.toString() !== req.userID)
            return res.status(401).send("Not allowed to update.");

        if(oldName)
        {
            if(oldName === "Delete")
            {
                const deleteLabel =await userModel.User.updateMany(
                    { },
                    { $pull: { labels: { $in: [ labelName ] } } }
                )
                res.json(deleteLabel);
            }
            else
            {
                const updateLabel = await userModel.User.updateMany(
                    {labels:oldName},
                    {$set:{"labels.$":labelName}}
                )
                res.json(updateLabel);
            }
        }
        else
        {
            const addLabel = await userModel.User.findByIdAndUpdate(req.userID, { $push: { labels : labelName} }, { new: true });
            res.json(addLabel);
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            errors:"Some error occure."
        });
    }
}