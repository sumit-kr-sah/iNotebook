const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route 1 :
//Gwt all notes using: get: /api/notes/fetchallnotes   Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    //find notes realted to one userid and fetch it
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Code error in Route 1 Of notes.js ");
  }
});

//Route 2 :
//add a note using : post :/api/notes/addnote   Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "enter valid title").isLength({ min: 3 }),
    body("description", "enter valid description").isLength({ min: 3 }),
  ],

  async (req, res) => {
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // fetch data from body of thunderclinte
      const { title, description, tag } = req.body;
      //crete a new note of Note.js schema
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      //save a note on db
      const savednote = await note.save();
      //print it on thnderclinte response
      res.json(savednote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Code error in Route 2 of notes.js");
    }
  }
);

//Route 3
//Update an existing note using Put: at /api/notes/updatenonte  Login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  try {
    //find a note in db with matching id as of given aka params
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    //match the user id to the token user id
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("user not allowed");
    }

    //update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Code error in Route 2 of notes.js");
  }
});

//Route 4
//delete a note using delete: at /api/notes/deletenonte  Login required

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //find a note in db with matching id as of given aka params
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    //match the user id to the token user id
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("user not allowed");
    }

    //update the note
    note = await Note.findByIdAndDelete(req.params.id);

    res.json({ success: "Below Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Code error in Route 2 of notes.js");
  }
});

module.exports = router;
