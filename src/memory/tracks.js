const folder = import.meta.env.BASE_URL + 'media/school-day/';
// Keep metadata in our own controlled catalog. Audio never goes to the AI endpoint.
export const tracks = {
  none: { id: 'none', title: 'No music', bpm: 0, genre: 'none', energy: 'medium', src: null },
  morning: { id: 'morning', title: 'At Ease', artist: 'Hazelwood', bpm: 78, genre: 'ambient', energy: 'low', src: folder + 'morning.mp3' },
  evening: { id: 'evening', title: 'Explosive Energy', artist: 'Dagored', bpm: 134, genre: 'electronic', energy: 'high', src: folder + 'evening.mp3' },
  custom: { id: 'custom', title: 'My audio file', bpm: 100, genre: 'personal', energy: 'medium', src: null },
};
export const getTrack = id => tracks[id] || tracks.none;
