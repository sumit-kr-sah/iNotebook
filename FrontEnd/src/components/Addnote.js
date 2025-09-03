import React, { useContext, useState } from "react";
import noteContext from "../context/notes/noteContext";

const Addnote = (props) => {
  //initalization of context api
  const NoteContext = useContext(noteContext);
  //destructring just like done in props
  let { addNote } = NoteContext;

  const [note, setnote] = useState({
    title: "",
    description: "",
    tag: "",
  });

  const handleClick = (e2) => {
    //prevents  refresh of page
    e2.preventDefault();
    //pushes data back to NoteSate
    addNote(note.title, note.description, note.tag);
    setnote({ title: "", description: "", tag: "" });
    props.showAlert("Note Added Successfully", "success");
  };

  const onChange1 = (e) => {
    //sets the value of the screen typed content to variables
    setnote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <div className="accordion" id="accordionExample">
      {/* <div className="accordion-item"> */}
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <h2>
              <strong style={{ color: "red" }}>Add</strong> New Note
            </h2>
          </button>
        </h2>
        <div
          id="collapseOne"
          className="accordion-collapse collapse show"
          data-bs-parent="#accordionExample"
        >
          {/* <div className="accordion-body"> */}
            <form className="shadow-lg p-3 mb-5 bg-white rounded">
              <div className="form-group my-2">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  onChange={onChange1}
                  name="title"
                  placeholder="Minimun 3 Letters required"
                  value={note.title}
                />
              </div>
              <div className="form-group my-2">
                <label htmlFor="description">Description</label>
                <textarea
                  type="text"
                  className="form-control "
                  id="description"
                  rows="3"
                  onChange={onChange1}
                  name="description"
                  placeholder="Minimun 5 Letters required"
                  value={note.description}
                ></textarea>
              </div>
              <div className="form-group my-2">
                <label htmlFor="tag">Tag</label>
                <input
                  type="text"
                  className="form-control"
                  id="tag"
                  onChange={onChange1}
                  name="tag"
                  placeholder="Default-tag"
                  value={note.tag}
                />
              </div>
              <button
                disabled={note.title.length < 3 || note.description.length < 5}
                type="submit"
                className="btn btn-success my-2"
                onClick={handleClick}
              >
                Add-note
              </button>
            </form>
          {/* </div> */}
        </div>
      {/* </div> */}
    </div>
  );
};

export default Addnote;
