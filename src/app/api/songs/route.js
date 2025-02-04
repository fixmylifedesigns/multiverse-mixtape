import { readSongsFile, writeSongsFile } from "../../../utils/fileOperations";
import { NextResponse } from "next/server";

export async function GET() {
  const songs = await readSongsFile();
  return NextResponse.json(songs);
}

export async function POST(request) {
  const newSong = await request.json();
  const songs = await readSongsFile();
  songs.songs.push(newSong);
  await writeSongsFile(songs);
  return NextResponse.json({ message: "Song added successfully" });
}
