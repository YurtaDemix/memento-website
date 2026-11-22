import { schoolDay } from '../media/demo';

export function Home({ t }) {
  return (
    <>
      <main id="content" className="home">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow intro"><span aria-hidden="true">✦</span> {t.box}</p>
            <h1 id="hero-title">{t.headline}</h1>
            <p className="lede">{t.intro}</p>
            <div className="actions">
              <a className="button primary" href="#/create"><span aria-hidden="true">+</span> {t.createCta}</a>
              <a className="text-link" href="#/archive">{t.archiveCta}</a>
            </div>
          </div>
          <div className="collage">
            <div className="film" aria-hidden="true" />
            {schoolDay.filter(frame => frame.id === 'school-morning' || frame.id === 'school-evening').map(frame => (
              <a key={frame.id} href={'#/demo/' + frame.id} className={'polaroid ' + frame.mood} data-mood={frame.mood} aria-label={'View demo: ' + frame.title}>
                <span className="tape" aria-hidden="true" />
                <img src={frame.photo} alt={frame.alt} />
                <span className="caption">{t[frame.captionKey]}</span>
                <span className="frame-time">{frame.time}</span>
              </a>
            ))}
            <span className="spark" aria-hidden="true">✧</span>
              <span className="collage-note">{t.twoMoments}</span>
          </div>
        </section>
        <section className="featured">
          <div className="wrap featured-inner">
            <div>
              <p className="eyebrow">{t.fromBox}</p>
              <h2>{t.oneDay}</h2>
              <p>{t.dayDesc}</p>
            </div>
            <a className="button secondary" href="#/stories">{t.demoCta}</a>
          </div>
        </section>
      </main>
    </>
  );
}
