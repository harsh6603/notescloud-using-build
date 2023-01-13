const mongoose =require("mongoose");

const deletedNoteSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tag:{
        type:String,
        default:"Genral"
    },
    date:{
        type:Date,
        default:Date.now
    }
})

exports.DeletedNote = new mongoose.model("DeletedNote",deletedNoteSchema);