import { useEffect, useState } from 'react';
import { moods } from './moods';

function useMedia(source) {
  const [fileUrl, setFileUrl] = useState('');
  useEffect(() => {
    if (!(source instanceof Blob)) return;
    const url = URL.createObjectURL(source);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [source]);
  return typeof source === 'string' ? source : fileUrl;
}

function MemoryFootage({ source, alt }) {
  const url = useMedia(source);
  return url && <video className="memory-footage" controls playsInline preload="metadata" src={url} aria-label={alt ?? 'Memory footage'} />;
}

export function MemoryCard({ memory, t, language }) {
  const photo = useMedia(memory.photo);
  const footage = Array.isArray(memory.footage) ? memory.footage : [memory.footage];
  const music = useMedia(memory.music);

  return (
    <article className="memory-card" data-mood={memory.mood}>
      {photo && <img src={photo} alt={memory.alt ?? 'Photo attached to this memory'} />}
      {footage.filter(Boolean).map(source => <MemoryFootage key={typeof source === 'string' ? source : source.name} source={source} alt={memory.alt} />)}
      {(memory.date || memory.time || memory.folderKey || memory.folder) && <p className="memory-meta">{(memory.folderKey || memory.folder) && <span>{memory.folderKey ? t[memory.folderKey] : memory.folder}</span>} {memory.date && <time dateTime={memory.date}>{new Intl.DateTimeFormat({ en: 'en-GB', ru: 'ru-RU', kk: 'kk-KZ' }[language] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(memory.date + 'T12:00:00'))}</time>} {memory.time && <span>{memory.time}</span>}</p>}
      <p className="eyebrow">{t[moods[memory.mood]]}{memory.time && ' · ' + memory.time}</p>
      <h2>{memory.titleKey ? t[memory.titleKey] : memory.title}</h2>
      <p className="memory-text">{memory.textKey ? t[memory.textKey] : memory.text}</p>
      {music && <div className="song-player"><div><strong>{memory.songTitle || t.song}</strong>{memory.artist && <span>{t.by} {memory.artist}</span>}</div><audio controls preload="metadata" src={music} aria-label="Memory soundtrack"
        onLoadedMetadata={event => {
          if (memory.musicStart) event.currentTarget.currentTime = memory.musicStart;
        }} /></div>}
    </article>
  );
}
