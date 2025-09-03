import React, { useContext, useEffect, useRef, useState } from "react";
import noteContext from "../context/notes/noteContext";
import Noteitem from "./Noteitem";
import { useNavigate } from "react-router-dom";
import "./Notes.css";

function Notes(props) {
  const navigate = useNavigate();
  const NoteContext = useContext(noteContext);
  const { notes, getNotes, editNote, addNote } = NoteContext;

  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    tag: "",
  });

  useEffect(() => {
    if (localStorage.getItem("authtoken")) {
      getNotes();
      // eslint-disable-next-line
    } else {
      navigate("/login");
    }
  }, []);

  const ref = useRef(null);
  const refClose = useRef(null);
  const refOpen = useRef(null);

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({
      id: currentNote._id,
      etitle: currentNote.title,
      edescription: currentNote.description,
      etag: currentNote.tag,
    });
  };

  const [modal, setModal] = useState({
    btitle: "",
    bdescription: "",
    btag: "",
  });

  const openText = (currentNote) => {
    refOpen.current.click();
    setModal({
      btitle: currentNote.title,
      bdescription: currentNote.description,
      btag: currentNote.tag,
    });
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    refClose.current.click();
    editNote(note.id, note.etitle, note.edescription, note.etag);
    props.showAlert("Note Updated Successfully", "success");
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    addNote(newNote.title, newNote.description, newNote.tag);
    setNewNote({ title: "", description: "", tag: "" });
    props.showAlert("Note Added Successfully", "success");
  };

  const onEditChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const onAddChange = (e) => {
    setNewNote({ ...newNote, [e.target.name]: e.target.value });
  };

  return (
    <div className="notes-container animate-fadeIn">
      <div className="notes-header">
        <h1>Your Notes Collection</h1>
        <p className="notes-subtitle">Create, organize, and manage your thoughts</p>
      </div>

      <div className="notes-content">
        <div className="notes-add-section">
          <div className="add-note-card">
            <div className="add-note-header">
              <h2><i className="fas fa-plus-circle me-2"></i> Create New Note</h2>
            </div>
            <div className="add-note-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-heading"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      placeholder="Enter note title"
                      value={newNote.title}
                      onChange={onAddChange}
                      required
                    />
                  </div>
                  <small className="form-text text-muted">
                    Minimum 3 characters required
                  </small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-align-left"></i>
                    </span>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      placeholder="Enter note description"
                      value={newNote.description}
                      onChange={onAddChange}
                      required
                    ></textarea>
                  </div>
                  <small className="form-text text-muted">
                    Minimum 5 characters required
                  </small>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="tag" className="form-label">Tag</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-tag"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="tag"
                      name="tag"
                      placeholder="Add a tag (optional)"
                      value={newNote.tag}
                      onChange={onAddChange}
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={newNote.title.length < 3 || newNote.description.length < 5}
                  onClick={handleAddClick}
                >
                  <i className="fas fa-plus me-2"></i> Add Note
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="notes-list-section">
          <div className="notes-list-header">
            <h2><i className="fas fa-sticky-note me-2"></i> Your Notes</h2>
            {notes.length === 0 && (
              <p className="text-muted">No notes to display. Create your first note!</p>
            )}
          </div>

          <div className="notes-grid">
            {notes.map((note) => (
              <Noteitem
                key={note._id}
                note={note}
                showAlert={props.showAlert}
                updateNote={updateNote}
                openText={openText}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#editNoteModal"
      >
        Edit Modal
      </button>

      <div
        className="modal fade"
        id="editNoteModal"
        tabIndex="-1"
        aria-labelledby="editNoteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editNoteModalLabel">
                <i className="fas fa-edit me-2"></i> Edit Note
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="etitle" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="etitle"
                    name="etitle"
                    value={note.etitle}
                    onChange={onEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="edescription"
                    name="edescription"
                    rows="4"
                    value={note.edescription}
                    onChange={onEditChange}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="etag" className="form-label">Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    id="etag"
                    name="etag"
                    value={note.etag}
                    onChange={onEditChange}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                ref={refClose}
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                onClick={handleEditClick}
                type="button"
                className="btn btn-primary"
              >
                <i className="fas fa-save me-2"></i> Update Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Note Modal */}
      <button
        ref={refOpen}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#viewNoteModal"
      >
        View Modal
      </button>

      <div
        className="modal fade"
        id="viewNoteModal"
        tabIndex="-1"
        aria-labelledby="viewNoteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewNoteModalLabel">
                {modal.btitle}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="note-tag mb-3">
                <span className="badge bg-secondary">
                  <i className="fas fa-tag me-1"></i> {modal.btag}
                </span>
              </div>
              <div className="note-content">
                <p>{modal.bdescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notes;
