import React, { useState } from "react";
import styles from "../styles/Modal.module.css";

const AddSongModal = ({ onSave, onClose }) => {
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    year: "",
    style: "",
    story: "",
    country: "",
    imageUrl: "",
    mp3Url: "",
    videoUrl: "",
    screenshotUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSong({ ...newSong, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newSong);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Add New Song</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={newSong.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Artist:
            <input
              type="text"
              name="artist"
              value={newSong.artist}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Year:
            <input
              type="text"
              name="year"
              value={newSong.year}
              onChange={handleChange}
            />
          </label>
          <label>
            Style:
            <input
              type="text"
              name="style"
              value={newSong.style}
              onChange={handleChange}
            />
          </label>
          <label>
            Story:
            <textarea
              name="story"
              value={newSong.story}
              onChange={handleChange}
            />
          </label>
          <label>
            Country:
            <input
              type="text"
              name="country"
              value={newSong.country}
              onChange={handleChange}
            />
          </label>
          <label>
            Image URL:
            <input
              type="url"
              name="imageUrl"
              value={newSong.imageUrl}
              onChange={handleChange}
            />
          </label>
          <label>
            MP3 URL:
            <input
              type="url"
              name="mp3Url"
              value={newSong.mp3Url}
              onChange={handleChange}
            />
          </label>
          <label>
            Video URL:
            <input
              type="url"
              name="videoUrl"
              value={newSong.videoUrl}
              onChange={handleChange}
            />
          </label>
          <label>
            Screenshot URL:
            <input
              type="url"
              name="screenshotUrl"
              value={newSong.screenshotUrl}
              onChange={handleChange}
            />
          </label>
          <div className={styles.buttonGroup}>
            <button type="submit">Add Song</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal;
