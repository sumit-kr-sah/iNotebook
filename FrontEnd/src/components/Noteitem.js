import React, { useContext } from "react";
import noteContext from "../context/notes/noteContext";
import "./NoteItem.css";

const Noteitem = (props) => {
  // Get deleteNote function from context
  const NoteContext = useContext(noteContext);
  const { deleteNote } = NoteContext;

  // Get props
  const { note, updateNote, openText } = props;

  // Handle delete function
  const handleDelete = () => {
    deleteNote(note._id);
    props.showAlert("Note Deleted Successfully", "success");
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="note-card">
      <div className="note-tag-badge">
        <span className="badge">
          <i className="fas fa-tag me-1"></i> {note.tag || "General"}
        </span>
      </div>

      <div className="note-card-body">
        <h5 className="note-title">{note.title}</h5>
        
        <div className="note-description">
          {note.description.length > 100 ? (
            <>
              <p>{note.description.slice(0, 100)}...</p>
              <button 
                className="read-more-btn"
                onClick={() => openText(note)}
              >
                Read More
              </button>
            </>
          ) : (
            <p>{note.description}</p>
          )}
        </div>
        
        <div className="note-footer">
          <div className="note-date">
            <i className="far fa-calendar-alt me-1"></i> {formatDate(note.date)}
          </div>
          
          <div className="note-actions">
            <button 
              className="action-btn edit-btn" 
              onClick={() => updateNote(note)}
              title="Edit note"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={handleDelete}
              title="Delete note"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Noteitem;
