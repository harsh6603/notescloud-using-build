const noteModel = require("../models/noteModel");
const { validationResult } = require('express-validator');
// const aws = require('aws-sdk');
const aws = require("@aws-sdk/client-s3");
const REGION = "ap-south-1";
const s3Client = new aws.S3Client({ region: REGION });
const path = require("path");
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");



exports.readNotes = async (req, res) => {
    try {
        let fetch = req.query.fetch;
        let archiveStatus, deleteStatus, labelStatus;
        if (fetch == "archive") {
            archiveStatus = true;
            deleteStatus = false;
            labelStatus = "false"
        }
        else if (fetch == "Home") {
            archiveStatus = false;
            deleteStatus = false;
            labelStatus = "false";
        }
        else if (fetch == "trash") {
            archiveStatus = false;
            deleteStatus = true;
        }
        else {
            archiveStatus = false;
            deleteStatus = false;
            labelStatus = fetch;
        }
        console.log(fetch + " " + archiveStatus + " " + deleteStatus);
        if (fetch === "trash") {
            const result = await noteModel.Note.find({ userID: req.userID, deleted: true }).sort({ restoreDate: -1 });
            res.json(result);
        }
        else if (fetch == "archive") {
            const result = await noteModel.Note.find({ userID: req.userID, archive: archiveStatus, deleted: deleteStatus, label: labelStatus }).sort({ restoreDate: -1 });
            res.json(result);
        }
        else {
            const result = await noteModel.Note.find({ userID: req.userID, archive: archiveStatus, deleted: deleteStatus, label: labelStatus }).sort({ restoreDate: -1 });
            res.json(result);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

//read archive notes of label
exports.readLabelArchiveNotes = async (req, res) => {
    try {
        let fetch = req.query.fetch;
        let archiveStatus, deleteStatus, labelStatus;
        archiveStatus = true;
        deleteStatus = false;
        labelStatus = fetch;
        console.log(fetch + " " + archiveStatus + " " + deleteStatus);
        const result = await noteModel.Note.find({ userID: req.userID, archive: archiveStatus, deleted: deleteStatus, label: labelStatus }).sort({ restoreDate: -1 });
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

//function for store notes in database
exports.createNotes = async (req, res) => {

    //Validation error checking
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let newErr = errors.array();
        // console.log(newErr);
        // console.log(newErr[0].msg)
        return res.status(400).json({ errors: newErr[0].msg });
    }

    try {
        //storing the note in database
        userNote = req.body;
        userNote.userID = req.userID;
        const doc = new noteModel.Note(userNote);
        const result = await doc.save();
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

//update note
exports.updateNotes = async (req, res) => {
    try {
        const result = await noteModel.Note.findById(req.params.id);
        //if note not found then do not allow user to go further
        if (!result)
            return res.status(404).send("Note not found");

        //if user is not logged in then do not permit user to update note
        if (result.userID.toString() !== req.userID)
            return res.status(401).send("Not allowed to update.");

        data = req.body;
        // const updateData =await noteModel.Note.updateOne({_id:req.params.id},data,{new:true});
        const updateData = await noteModel.Note.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
        res.json(updateData);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

//delete note
exports.deleteNote = async (req, res) => {
    try {
        const result = await noteModel.Note.findById(req.params.id);
        //if note not found then do not allow user to go further
        if (!result)
            return res.status(404).send("Note not found.");

        //if user is not logged in then do not permit user to delete note
        if (result.userID.toString() !== req.userID)
            return res.status(401).send("Not allowed to delete.");

        const deleteData = await noteModel.Note.findByIdAndDelete(req.params.id)
        res.json(deleteData);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

exports.updateManyNotes = async (req, res) => {
    try {
        const dataOfUpdate = req.body.data;
        const filter = req.body.labelName;

        const updateLabel = await noteModel.Note.updateMany({ label: filter }, { $set: dataOfUpdate });
        res.json(updateLabel);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Some error occure.");
    }
}

const uploadInBucket = (file) => {
    const s3 = new S3({
        region: "ap-south-1",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })

    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise();
}

exports.uploadImage = async (req, res) => {
    const file = req.file
    console.log(file);
    uploadInBucket(file)
        .then((result) => {
            console.log(result);
            res.send(result);
        }).catch((err) => {
            res.send(err);
        })
}
