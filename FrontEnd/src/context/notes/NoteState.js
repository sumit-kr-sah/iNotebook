import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
  const host = "http://localhost:5000";
  const note = [];
  const [notes, setNotes] = useState(note);

  //Get all Notes--------------------------------------------------------------------------------------
  const getNotes = async () => {
    //api call
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem("authtoken"),
      },
    });
    const json1 = await response.json();
    // console.log(json1);

    //code for setting all notes
    setNotes(json1);
  };

  //addNote----------------------------------------------------------------------------------------
  const addNote = async (title, description, tag) => {
    //api call
    const response = await fetch(`${host}/api/notes/addnote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem("authtoken"),
      },
      body: JSON.stringify({ title, description, tag }),
    });
    const json1 =await response.json();
    // console.log(json1);

    //code for adding
    // const note = {
    //   _id: "679a1561a8a3cf34523544ad292a41",
    //   user: "6799fea328ac31778bc9f3ec",
    //   title: title,
    //   description: description,
    //   tag: tag,
    //   date: "2025-01-29T11:47:45.653Z",
    //   __v: 0,
    // };
    // setNotes(notes.concat(note));

    setNotes(notes.concat(json1));
  };

  //deleteNote---------------------------------------------------------------------------------
  const deleteNote = async (id) => {
    //api calls

    const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem("authtoken"),
      },
    });
    // const json =await response.json();
    // console.log(json);

    //filters the entire notes array and removes the note with _id==id
    const newNotes = notes.filter((note) => {
      return note._id !== id;
    });
    setNotes(newNotes);
  };

  //editNote----------------------------------------------------------------------------------------------------
  const editNote = async (id, title, description, tag) => {
    //api call
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem("authtoken"),
      },
      body: JSON.stringify({ title, description, tag }),
    });
    // const json =await response.json();
    // console.log(json);

    let newNotes = JSON.parse(JSON.stringify(notes));
    //edit note content code
    for (let index = 0; index < notes.length; index++) {
      const element = newNotes[index];
      if (element._id === id) {
        newNotes[index].title = title;
        newNotes[index].description = description;
        newNotes[index].tag = tag;
        break;
      }
    }
    setNotes(newNotes);
  };

  //---------------------------------------------------------------------------------------------------------------------
  return (
    <NoteContext.Provider
      value={{ notes, deleteNote, addNote, editNote, getNotes }}
    >
      {props.children}
    </NoteContext.Provider>
  );
};
export default NoteState;
