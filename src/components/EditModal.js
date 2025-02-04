import React, { useState } from "react";
import styles from "../styles/Modal.module.css";

const EditModal = ({ song, onSave, onClose }) => {
  const [editedSong, setEditedSong] = useState(song);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSong({ ...editedSong, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedSong);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Edit Song</h2>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={editedSong.id} />
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={editedSong.title}
              onChange={handleChange}
            />
          </label>
          <label>
            Artist:
            <input
              type="text"
              name="artist"
              value={editedSong.artist}
              onChange={handleChange}
            />
          </label>
          <label>
            Year:
            <input
              type="text"
              name="year"
              value={editedSong.year}
              onChange={handleChange}
            />
          </label>
          <label>
            Style:
            <input
              type="text"
              name="style"
              value={editedSong.style}
              onChange={handleChange}
            />
          </label>
          {/* Add more fields as needed */}
          <div className={styles.buttonGroup}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;