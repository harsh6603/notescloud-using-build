const authentication = require("../middleware/authentication");
const noteControl = require("../controller/noteControl");
const { body } = require('express-validator');
const express = require("express");
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.get("/", (req, res) => {
    res.send("Hello from note.");
})

//read all notes of loged in user
router.get("/readnote", authentication.authenticateUser, noteControl.readNotes)

//read archive notes of label
router.get("/readArchiveNote", authentication.authenticateUser, noteControl.readLabelArchiveNotes)

//create note for loged in user
router.post("/createnote", authentication.authenticateUser, [
    body('title', "Title is very sort, please enter title perfectly.").isLength({ min: 5 }),
    body('description', "Description is very sort, please enter discription perfectly.").isLength({ nin: 8 }),
    body('tag', "Please enter tag")
], noteControl.createNotes);

//update note for loged in user
router.patch("/updatenote/:id", authentication.authenticateUser, noteControl.updateNotes)

//update label(make label attribute false) in multiple notes
router.patch("/updateManyNote", authentication.authenticateUser, noteControl.updateManyNotes)

//delete note for loged in user
router.delete("/deletenote/:id", authentication.authenticateUser, noteControl.deleteNote);

router.post("/images",upload.single('image'),noteControl.uploadImage)

module.exports = router;