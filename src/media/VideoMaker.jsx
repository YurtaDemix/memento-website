import { useEffect, useState } from 'react';
import { renderMemory } from './render';

export function VideoMaker({ memory, t, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState(0);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!output?.url) return;
    return () => URL.revokeObjectURL(output.url);
  }, [output]);
  useEffect(() => { setOutput(null); setError(''); }, [memory?.photo, memory?.photos, memory?.footage, memory?.text, memory?.title, memory?.mood, memory?.trackId, memory?.music]);

  async function makeVideo() {
    if (busy) return;
    if (!memory?.text?.trim() || !memory?.photo) { setError(t.requiredStory); return; }
    setBusy(true); setError(''); setNotice(''); setPercent(0);
    try {
      const result = await renderMemory(memory, setPercent);
      const url = URL.createObjectURL(result.blob);
      setOutput({ url, extension: result.extension });
      setNotice(t.videoReady);
    } catch (problem) {
      console.error('MEMENTO video export:', problem);
      setError(t.videoError);
    } finally { setBusy(false); }
  }

  return <div className={'video-maker ' + (compact ? 'video-maker--small' : '')}>
    <button type="button" className="button secondary" disabled={busy} onClick={makeVideo}>
      {busy ? `${t.exporting} ${percent}%` : t.videoButton}
    </button>
    {busy && <progress aria-label={t.exporting} value={percent} max="100" />}
    {!compact && <p className="field-note">{t.trimNotice} {t.videoFormat}</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {notice && <p role="status" className="field-note">{notice}</p>}
    {output && <div className="exported-video">
      <video controls playsInline preload="metadata" src={output.url} aria-label="MEMENTO memory film" />
      <a className="button primary" href={output.url} download={`MEMENTO-${(memory.title || 'memory').replace(/[^\p{L}\p{N}-]+/gu,'-').slice(0, 40)}.${output.extension}`}>{t.videoDownload}</a>
    </div>}
  </div>;
}
