import { schoolDay } from '../media/demo';
import { MemoryCard } from '../memory/MemoryCard';

const folders = ['schoolFolder', 'familyFolder', 'horseFolder'];

export function Demo({ frameId, folderId, t, language }) {
  if (!folderId && !frameId) {
    return (
      <main id="content" className="wrap inner-page story-index">
        <p className="eyebrow">{t.demo}</p>
        <h1>{t.folderTitle}</h1>
        <p className="lede">{t.folderIntro}</p>
        <div className="folder-grid">
          {folders.map(key => {
            const memories = schoolDay.filter(memory => memory.folderKey === key);
            const cover = memories.find(memory => memory.photo) || memories[0];
            return (
              <a className="story-folder" href={'#/stories/' + key} key={key} data-mood={cover.mood}>
                {cover.photo && <img src={cover.photo} alt="" />}
                <span className="eyebrow">{memories.length} {t.days}</span>
                <h2>{t[key]}</h2>
                <p>{memories.map(memory => t[memory.captionKey]).join(' · ')}</p>
              </a>
            );
          })}
        </div>
      </main>
    );
  }

  if (folderId) {
    const memories = schoolDay.filter(memory => memory.folderKey === folderId);
    return (
      <main id="content" className="wrap inner-page">
        <a className="text-link" href="#/stories">{t.allFolders}</a>
        <p className="eyebrow">{t.demo}</p>
        <h1>{t[folderId]}</h1>
        <div className="memory-grid folder-memories">
          {memories.map(memory => (
            <a className="folder-memory" href={'#/demo/' + memory.id} key={memory.id}>
              {memory.photo && <img src={memory.photo} alt={memory.alt} />}
              <p className="eyebrow">{new Intl.DateTimeFormat({en:'en-GB',ru:'ru-RU',kk:'kk-KZ'}[language], {day:'numeric', month:'long', year:'numeric'}).format(new Date(memory.date + 'T12:00:00'))} · {memory.time}</p>
              <h2>{t[memory.titleKey]}</h2>
              <p>{t[memory.textKey]}</p>
            </a>
          ))}
        </div>
      </main>
    );
  }

  const frame = schoolDay.find(memory => memory.id === frameId) ?? schoolDay[0];
  const chapters = schoolDay.filter(memory => memory.folderKey === frame.folderKey);
  return (
    <main id="content" className="demo-page" data-mood={frame.mood}>
      <div className="wrap inner-page">
        <a className="text-link" href={'#/stories/' + frame.folderKey}>{t[frame.folderKey]}</a>
        <p className="eyebrow">{t.demo}</p>
        <h1>{t[frame.titleKey]}</h1>
        <nav aria-label={t.chapters} className="chapters">
          {chapters.map(memory => (
            <a className={'button ' + (memory === frame ? 'primary' : 'secondary')} href={'#/demo/' + memory.id}
              key={memory.id} aria-current={memory === frame ? 'page' : undefined}>{t[memory.captionKey]}</a>
          ))}
        </nav>
        <MemoryCard memory={frame} t={t} language={language} />
      </div>
    </main>
  );
}
