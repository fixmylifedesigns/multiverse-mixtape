import { readSongsFile, writeSongsFile } from '../../../../utils/fileOperations';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { id } = params;
  const updatedSong = await request.json();
  const songs = await readSongsFile();
  const index = songs.songs.findIndex(song => song.id === id);
  
  if (index !== -1) {
    songs.songs[index] = { ...songs.songs[index], ...updatedSong };
    await writeSongsFile(songs);
    return NextResponse.json({ message: 'Song updated successfully' });
  } else {
    return NextResponse.json({ message: 'Song not found' }, { status: 404 });
  }
}