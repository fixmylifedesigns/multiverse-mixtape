import fs from "fs/promises";
import path from "path";
import songsData from "../data/songs.json";

const songsFilePath = path.join(process.cwd(), "src", "data", "songs.json");

export async function readSongsFile() {
  try {
    // For development, we'll return the imported data directly
    return songsData;

    // For production, you might want to read from the file system:
    // const data = await fs.readFile(songsFilePath, 'utf8');
    // return JSON.parse(data);
  } catch (error) {
    console.error("Error reading songs file:", error);
    return { songs: [] };
  }
}

export async function writeSongsFile(songs) {
  try {
    await fs.writeFile(songsFilePath, JSON.stringify(songs, null, 2));
  } catch (error) {
    console.error("Error writing songs file:", error);
  }
}
