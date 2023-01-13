const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:[true,"Please enter email."],
        // unique:[true,"email olready exist"]
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now,
        required:true
    },
    labels:{
        type:Array,
    }
})

exports.User = new mongoose.model("User",userSchema);
// User.createIndexes();
// module.exports =  User