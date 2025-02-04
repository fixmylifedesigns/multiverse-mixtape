"use client";
import { useState, useEffect } from "react";
import SongList from "../../components/SongList";
import AddSongModal from '../../components/AddSongModal';
import EditModal from "../../components/EditModal";
import styles from "../page.module.css";

export default function MultiverseMixtape() {
  const [songs, setSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(null);
  const [isAddingSong, setIsAddingSong] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs');
        const data = await response.json();
        console.log('Fetched songs data:', data);
        setSongs(data.songs);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  const addSong = async (newSong) => {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSong),
    });
    if (response.ok) {
      fetchSongs();
      setIsAddingSong(false);
    }
  };

  const updateSong = async (updatedSong) => {
    const response = await fetch(`/api/songs/${updatedSong.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSong),
    });
    if (response.ok) {
      fetchSongs();
      setEditingSong(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Music Browser</h1>
      <button onClick={() => setIsAddingSong(true)}>Add New Song</button>
      <SongList songs={songs} onEdit={setEditingSong} />
      {isAddingSong && (
        <AddSongModal
          onSave={addSong}
          onClose={() => setIsAddingSong(false)}
        />
      )}
      {editingSong && (
        <EditModal
          song={editingSong}
          onSave={updateSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}