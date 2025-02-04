import React from 'react';
import Image from 'next/image';
import styles from '../styles/SongCard.module.css';

const SongCard = ({ song, onEdit }) => {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image
          src={song.imageUrl}
          alt={song.title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className={styles.bottomContent}>
        <div className={styles.musicInfo}>
          <h1>{song.title}</h1>
          <p>Artist: {song.artist}</p>
          <p>Year: {song.year}</p>
        </div>
        <button className={styles.editButton} onClick={() => onEdit(song)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default SongCard;