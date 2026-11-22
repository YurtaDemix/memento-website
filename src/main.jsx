import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from './pages/Home';
import { Demo } from './pages/Demo';
import './style.css';
import { copy } from './i18n';

function getRoute() {
  return window.location.hash.slice(1).split('/');
}

function App() {
  const [route, setRoute] = useState(getRoute);
  const [language, setLanguage] = useState(() => localStorage.getItem('memento-language') || 'ru');
  const t = copy[language];
  const [, page, detail] = route;

  useEffect(() => {
    function navigate() {
      if (window.location.hash === '#content') return;
      setRoute(getRoute());
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.getElementById('content')?.focus({ preventScroll: true }));
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  useEffect(() => {
    document.getElementById('content')?.setAttribute('tabindex', '-1');
    document.title = ({
      create: 'Create a memory', archive: 'My archive', demo: 'Memory stories', stories: 'Memory stories', edit: 'Edit a memory',
    }[page] ?? 'Keep the feeling') + ' — MEMENTO';
  }, [page]);

  const home = !['create', 'archive', 'edit', 'demo', 'stories'].includes(page);
  if (['create', 'archive', 'edit'].includes(page)) return null;
  function changeLanguage(next) { setLanguage(next); localStorage.setItem('memento-language', next); }
  return (
    <>
      <a className="skip" href="#content" onClick={event => {
        event.preventDefault();
        document.getElementById('content')?.focus();
      }}>{t.skip}</a>
      <header>
        <div className="wrap header-inner">
          <a className="brand" href="#/" aria-label="Memento home"><span aria-hidden="true">✦</span> MEMENTO</a>
          <nav aria-label="Main navigation">
            <a href="#/" aria-current={home ? 'page' : undefined}>{t.home}</a>
            <a href="#/create" aria-current={page === 'create' ? 'page' : undefined}>{t.create}</a>
            <a href="#/archive" aria-current={page === 'archive' ? 'page' : undefined}>{t.archive}</a>
          </nav>
          <label className="language-picker"><span className="visually-hidden">Language</span><select value={language} onChange={event => changeLanguage(event.target.value)}><option value="kk">Қазақша</option><option value="ru">Русский</option><option value="en">English</option></select></label>
        </div>
      </header>
      {page === 'demo' ? <Demo frameId={detail} t={t} language={language} /> : page === 'stories' ? <Demo folderId={detail} t={t} language={language} /> : <Home t={t} />}
      <footer><div className="wrap"><span className="brand">MEMENTO</span><span>{t.footer}</span></div></footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
