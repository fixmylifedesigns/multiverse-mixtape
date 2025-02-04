import React from "react";
import SongCard from "./SongCard";
import styles from "../styles/SongList.module.css";

const SongList = ({ songs, onEdit }) => {
  return (
    <div className={styles.songList}>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default SongList;