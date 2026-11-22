import { listFolders, listMemories, getMemory, saveStory, addFolder, renameFolder, deleteFolder, deleteMemory, makeId } from './storage.js';
import { themes, themeFor } from './themes.js';
import { getTrack } from './tracks.js';
import { suggestMemory } from './analyze.js';
import { filmLength, clipRange, maxClipLength } from './timeline.js';
import { renderMemory } from './render.js';
import { phoneReadyMp4, safeVideoName } from './export-mp4.js';

const ru = {
  home:'Главная', create:'Создать', archive:'Архив', newMemory:'Новое воспоминание', editMemory:'Редактирование воспоминания',
  intro:'Сохрани историю, выбери точный момент видео и создай собственный фильм.', story:'Твоя история', title:'Название', date:'Дата', mood:'Настроение',
  photos:'Фотографии (1–5)', photosHelp:'Можно выбрать несколько. До 15 МБ каждая.', replacePhotos:'Добавить / заменить фотографии',
  video:'Видеоматериал', videoHelp:'До 80 МБ. Выбери начало и конец нужного фрагмента.', clip:'Выбери фрагмент', start:'Начало', end:'Конец',
  selected:'Выбрано', previewClip:'▶ Посмотреть выбранный фрагмент', changeVideo:'Добавить или заменить видео', removeVideo:'Убрать видео',
  filmLength:'Длина готового ролика', seconds:'сек', sound:'Музыка', custom:'Свой трек', noMusic:'Без музыки',
  morning:'At Ease · спокойная, 78 BPM', evening:'Explosive Energy · динамичная, 134 BPM',
  folder:'Папка воспоминания', createFolder:'Создать новую папку', useFolder:'Добавить в существующую', unfiled:'Без папки', folderName:'Название новой папки',
  newFolderHint:'При сохранении папка создастся автоматически, если выбрана новая.',
  save:'Сохранить в архив', saving:'Сохраняем…', back:'← В архив', suggest:'✨ Предложить название и настроение',
  render:'🎬 Создать ролик', exporting:'Создаём', download:'⬇ Скачать MP4', videoReady:'Готово! MP4 можно сохранить в «Загрузки» и отправить на телефон.', converting:'Готовим MP4 для телефона…', share:'Отправить на телефон', transferNote:'На Mac скачанный файл будет в «Загрузках». Оттуда передай MP4 на iPhone через AirDrop или на Android через Quick Share/мессенджер.', fallback:'MP4 пока не удалось подготовить. Доступен исходный WebM; для MP4 нужен FFmpeg на локальном сервере.', webmDownload:'⬇ Скачать WebM (запасной вариант)',
  error:'Ошибка', empty:'Пока нет воспоминаний', emptyHint:'Создай первую историю — и она появится здесь.',
  newFolder:'Новая папка', rename:'Переименовать', delete:'Удалить', edit:'Редактировать', all:'Все',
  confirmDelete:'Удалить это воспоминание? Это действие нельзя отменить.',
  confirmFolder:'Удалить папку? Все её воспоминания останутся в архиве без папки.',
  folderPrompt:'Название папки', folders:'Папки', total:'воспоминаний', archiveHeading:'Твой архив',
  exportNote:'Фильм создаётся на этом компьютере. Для монтажа и хранения медиа не нужен внешний ИИ.',
  clampNote:'В выбранную длительность входят вступление и финальные титры. Доступный отрезок видео:',
  browser:'Для экспорта видео лучше использовать Google Chrome или Microsoft Edge.',
  required:'Добавь рассказ и хотя бы одну фотографию.', invalidPhotos:'Допустимо 1–5 фотографий до 15 МБ каждая.',
  invalidVideo:'Нужно видео до 80 МБ.', invalidAudio:'Нужно аудио до 30 МБ.',
  noFolder:'Выбери папку.', deletePhoto:'Убрать фото', editHint:'Измени историю, фото, фрагмент, музыку или папку и сохрани.',
  fileNote:'Если не выбирать новые файлы, старые сохранятся.', v3:'MEMENTO · Studio 3.3', loading:'Загрузка…',
  noPreview:'Добавь фотографию для предпросмотра.', rendered:'Готовое видео',
  trimNotLoaded:'Если длительность видео не определяется, попробуй MP4 (H.264).'
};
const en = { ...ru, home:'Home', create:'Create', archive:'Archive', newMemory:'New memory', editMemory:'Edit memory', intro:'Keep the story. Choose an exact clip and make a film.', story:'Your story', title:'Title', date:'Date', mood:'Mood', photos:'Photos (1–5)', photosHelp:'Up to 15 MB each.', replacePhotos:'Add / replace photos', video:'Video footage', videoHelp:'Up to 80 MB. Choose the start and end.', clip:'Select video segment', start:'Start', end:'End', selected:'Selected', previewClip:'▶ Preview selection', changeVideo:'Add / replace video', removeVideo:'Remove video', filmLength:'Final video length', seconds:'sec', sound:'Soundtrack', custom:'Custom audio', noMusic:'No music', morning:'At Ease · calm, 78 BPM', evening:'Explosive Energy · energetic, 134 BPM', folder:'Memory folder', createFolder:'Create a new folder', useFolder:'Use existing folder', unfiled:'No folder', folderName:'New folder name', newFolderHint:'A new folder will be created when you save.', save:'Save to archive', saving:'Saving…', back:'← Archive', suggest:'✨ Suggest title and mood', render:'🎬 Make video', exporting:'Rendering', download:'⬇ Download MP4', videoReady:'Ready! Save the MP4 to Downloads and send it to your phone.', converting:'Preparing phone-compatible MP4…', share:'Share to phone', transferNote:'On Mac, find your MP4 in Downloads. Send it to iPhone with AirDrop or to Android with Quick Share / a messenger.', fallback:'MP4 could not be prepared. The original WebM is available; FFmpeg is needed on the local server for conversion.', webmDownload:'⬇ Download WebM (fallback)', error:'Error', empty:'No memories yet', emptyHint:'Create a story to get started.', newFolder:'New folder', rename:'Rename', delete:'Delete', edit:'Edit', all:'All', confirmDelete:'Delete this memory permanently?', confirmFolder:'Delete this folder? Its memories will remain in the archive.', folderPrompt:'Folder name', folders:'Folders', total:'memories', archiveHeading:'Your archive', exportNote:'Your media is edited locally, without an external AI video generator.', clampNote:'The intro and final titles are included. Maximum clip duration:', browser:'Chrome or Edge is recommended for video export.', required:'Add a story and a photo.', invalidPhotos:'Choose 1–5 photos, maximum 15 MB each.', invalidVideo:'Video must be under 80 MB.', invalidAudio:'Audio must be under 30 MB.', noFolder:'Choose a folder.', deletePhoto:'Remove photo', editHint:'Update story, media, clip, music and folder.', fileNote:'Leave file inputs empty to keep your current files.', v3:'MEMENTO · Studio 3.3', loading:'Loading…', noPreview:'Add a photo to preview.', rendered:'Rendered video', trimNotLoaded:'If video metadata cannot be loaded, try MP4 (H.264).' };
const kk = { ...ru, home:'Басты бет', create:'Жасау', archive:'Мұрағат', newMemory:'Жаңа естелік', editMemory:'Естелікті өңдеу', intro:'Оқиғаны сақта, бейненің қажетті бөлігін таңда және фильм жаса.', story:'Оқиғаң', title:'Атауы', date:'Күні', mood:'Көңіл күй', photos:'Фотолар (1–5)', video:'Бейне', clip:'Бейне бөлігін таңда', start:'Басы', end:'Соңы', selected:'Таңдалды', filmLength:'Ролик ұзақтығы', seconds:'сек', folder:'Естелік қалтасы', createFolder:'Жаңа қалта', useFolder:'Бар қалтаға қосу', unfiled:'Қалтасыз', folderName:'Қалта атауы', save:'Мұрағатқа сақтау', back:'← Мұрағат', render:'🎬 Бейне жасау', download:'⬇ MP4 жүктеу', videoReady:'MP4 дайын! Телефонға жіберуге болады.', converting:'Телефонға арналған MP4 дайындалуда…', share:'Телефонға бөлісу', transferNote:'Mac-та MP4 файлы Жүктеулерге сақталады. Оны AirDrop немесе хабарлама арқылы жібер.', fallback:'MP4 жасау мүмкін болмады. WebM нұсқасын жүктеуге болады. Серверге FFmpeg қажет.', webmDownload:'⬇ WebM жүктеу', newFolder:'Жаңа қалта', rename:'Атын өзгерту', delete:'Жою', edit:'Өңдеу', all:'Барлығы', archiveHeading:'Естеліктер мұрағаты', folders:'Қалталар', total:'естелік', saving:'Сақталуда…', v3:'MEMENTO · Studio 3.3' };
const moodNames = { ru: { calm:'Спокойствие', joy:'Радость', nostalgic:'Ностальгия', hopeful:'Надежда', energetic:'Энергия', focused:'Сосредоточенность', tender:'Нежность', adventurous:'Приключение', melancholy:'Грусть', proud:'Гордость', playful:'Веселье', wonder:'Удивление' }, en:{ calm:'Calm', joy:'Joy', nostalgic:'Nostalgia', hopeful:'Hopeful', energetic:'Energetic', focused:'Focused', tender:'Tender', adventurous:'Adventure', melancholy:'Melancholy', proud:'Proud', playful:'Playful', wonder:'Wonder' }, kk:{ calm:'Тыныштық', joy:'Қуаныш', nostalgic:'Сағыныш', hopeful:'Үміт', energetic:'Қуат', focused:'Зейін', tender:'Нәзіктік', adventurous:'Шытырман', melancholy:'Мұң', proud:'Мақтаныш', playful:'Көңілді', wonder:'Таңғажайып' } };
let lang = localStorage.getItem('memento-language') || 'ru';
const t = () => ({ ru, en, kk }[lang] || ru);
const escape = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const formatSeconds = x => `${Math.floor(Math.max(0,x)/60)}:${String(Math.floor(Math.max(0,x)%60)).padStart(2,'0')}`;
const localeDate = x => { try { return new Date(x+'T12:00:00').toLocaleDateString(lang === 'kk'?'kk-KZ':lang==='en'?'en-US':'ru-RU'); } catch { return x; } };
const base = document.createElement('div'); base.id = 'memento-v3'; document.body.append(base);
const urlCache = new Map(); let exportUrl = null; let editor = null; let archiveFilter = 'all'; let archiveSearch = '';
function mediaUrl(file) { if (!file) return ''; if (typeof file === 'string') return file; if (!(file instanceof Blob)) return ''; if (!urlCache.has(file)) urlCache.set(file, URL.createObjectURL(file)); return urlCache.get(file); }
function releaseUrls() { for (const url of urlCache.values()) URL.revokeObjectURL(url); urlCache.clear(); }
function revokeExport() { if (exportUrl) URL.revokeObjectURL(exportUrl); exportUrl = null; }
function header() { const x=t(); return `<header class="v3-header"><div class="v3-wrap v3-head-row"><a class="v3-brand" href="#/">✦ MEMENTO</a><nav><a href="#/">${x.home}</a><a href="#/create">${x.create}</a><a href="#/archive">${x.archive}</a></nav><select aria-label="Language" id="v3-language"><option value="ru" ${lang==='ru'?'selected':''}>Русский</option><option value="kk" ${lang==='kk'?'selected':''}>Қазақша</option><option value="en" ${lang==='en'?'selected':''}>English</option></select></div></header>`; }
function shell(content) { base.innerHTML = header()+`<main class="v3-wrap v3-main">${content}</main><footer class="v3-footer">✦ MEMENTO · SmallStuffPotato · ArtTech</footer>`;
  base.querySelector('#v3-language').addEventListener('change', e => { lang = e.target.value; localStorage.setItem('memento-language',lang); if(editor) renderEditorForm(); else route(); }); }
function optionsMood(selected) { return Object.keys(themes).map(key=>`<option value="${key}" ${selected===key?'selected':''}>${escape((moodNames[lang] || moodNames.ru)[key])}</option>`).join(''); }
function defaultEditor(memory, folders) {
  const old = memory || {}; const photos = Array.isArray(old.photos) && old.photos.length ? old.photos : (old.photo ? [old.photo] : []);
  const knownFolder = folders.some(f=>f.id===old.folderId);
  return { id:old.id||makeId(), createdAt:old.createdAt||Date.now(), isEditing:!!memory, title:old.title||'', text:old.text||'', date:old.date||new Date().toISOString().slice(0,10), mood:old.mood||'calm', photos:[...photos], footage: Array.isArray(old.footage)?old.footage[0]:old.footage||null, music:old.music||null, trackId:old.trackId||'none', duration:filmLength(old.duration||12), trim: { start:Number(old.videoTrim?.start)||0, end:Number(old.videoTrim?.end)||0 }, videoSourceLength:0, folderMode: knownFolder?'existing':'new', folderId:knownFolder?old.folderId:(folders[0]?.id||''), folderName: old.folder && !knownFolder ? old.folder : '', folders, old };
}
function memoryFromEditor() { const e=editor; const track=getTrack(e.trackId);
  return { ...e.old, id:e.id, createdAt:e.createdAt, updatedAt:Date.now(), title:e.title.trim()||e.text.trim().split(/[.!?\n]/)[0].slice(0,65)||'MEMENTO', text:e.text.trim(), date:e.date, mood:e.mood, photos:[...e.photos], photo:e.photos[0]||null, footage:e.footage, duration:filmLength(e.duration), videoTrim:{...e.trim}, music:e.trackId==='custom'?e.music:track.src, trackId:e.trackId, songTitle:e.trackId==='custom'?(e.music?.name||e.old.songTitle||'Audio'):track.title, artist:track.artist||'' };
}
async function showEditor(id) { base.innerHTML = header()+`<main class="v3-wrap v3-main">${escape(t().loading)}</main>`;
  const folders = await listFolders(); const memory = id ? await getMemory(id):null;
  if (id && !memory) { location.hash='/archive'; return; }
  editor = defaultEditor(memory,folders); archiveFilter='all'; renderEditorForm(); }
function renderEditorForm() {
  if (!editor) return; const e=editor, x=t(); const hasVideo=Boolean(e.footage); const photoCount=e.photos.length;
  const photoHtml=e.photos.map((photo,i)=>`<div class="v3-photo-item">${mediaUrl(photo)?`<img src="${escape(mediaUrl(photo))}" alt="Photo ${i+1}"/>`:''}<button type="button" data-remove-photo="${i}" title="${escape(x.deletePhoto)}">×</button></div>`).join('');
  const maxTrim=maxClipLength(e.duration);
  const videoArea=hasVideo?`<div class="v3-trimmer"><p class="v3-kicker">✦ ${escape(x.clip)}</p><video id="v3-clip-video" controls preload="metadata" playsinline src="${escape(mediaUrl(e.footage))}"></video><p class="v3-hint">${escape(x.clampNote)} <b>${maxTrim.toFixed(1)} ${escape(x.seconds)}</b></p><div class="v3-trim-row"><label>${escape(x.start)} <strong id="v3-start-time">${formatSeconds(e.trim.start)}</strong><input id="v3-clip-start" aria-label="${escape(x.start)}" type="range" min="0" max="${Math.max(1,e.videoSourceLength||100)}" step="0.1" value="${e.trim.start}"></label><label>${escape(x.end)} <strong id="v3-end-time">${formatSeconds(e.trim.end)}</strong><input id="v3-clip-end" aria-label="${escape(x.end)}" type="range" min="0" max="${Math.max(1,e.videoSourceLength||100)}" step="0.1" value="${e.trim.end}"></label></div><div class="v3-inline"><button type="button" class="v3-secondary" id="v3-play-clip">${escape(x.previewClip)}</button><button type="button" class="v3-quiet" id="v3-remove-video">${escape(x.removeVideo)}</button><span id="v3-clip-selected">${escape(x.selected)}: ${(Math.max(0,e.trim.end-e.trim.start)).toFixed(1)} ${escape(x.seconds)}</span></div></div>`:'';
  const foldersOptions=e.folders.map(f=>`<option value="${escape(f.id)}" ${e.folderId===f.id?'selected':''}>${escape(f.name)}</option>`).join('');
  const theme=themeFor(e.mood);
  const cardPhoto=e.photos[0]?`<img id="v3-card-photo" src="${escape(mediaUrl(e.photos[0]))}" alt="Preview"/>`:`<p>${escape(x.noPreview)}</p>`;
  shell(`<div class="v3-topline"><span>✦ ${escape(x.v3)}</span><a href="#/archive">${escape(x.back)}</a></div><div class="v3-page-title"><h1>${escape(e.isEditing?x.editMemory:x.newMemory)}</h1><p>${escape(e.isEditing?x.editHint:x.intro)}</p></div><div class="v3-editor-grid"><form id="v3-form" class="v3-form"><label>${escape(x.story)}<textarea id="v3-text" rows="6" maxlength="2000" required>${escape(e.text)}</textarea></label><button type="button" class="v3-secondary" id="v3-suggest">${escape(x.suggest)}</button><div class="v3-form-cols"><label>${escape(x.title)}<input id="v3-title" maxlength="100" value="${escape(e.title)}"/></label><label>${escape(x.date)}<input id="v3-date" type="date" value="${escape(e.date)}" required/></label></div><label>${escape(x.mood)}<select id="v3-mood">${optionsMood(e.mood)}</select></label><div class="v3-divider"></div><label>${escape(x.photos)}<small>${escape(x.photosHelp)}</small><input type="file" id="v3-photos" accept="image/*" multiple/></label><div class="v3-photo-grid">${photoHtml}</div><label>${escape(x.video)}<small>${escape(x.videoHelp)}</small><input type="file" id="v3-footage" accept="video/*"/></label>${videoArea}<div class="v3-divider"></div><label>${escape(x.filmLength)} <strong id="v3-length-value">${e.duration} ${escape(x.seconds)}</strong><input id="v3-film-duration" type="range" min="5" max="40" step="1" value="${e.duration}"/><div class="v3-duration-labels"><span>5 ${escape(x.seconds)}</span><span>40 ${escape(x.seconds)}</span></div></label><label>${escape(x.sound)}<select id="v3-track"><option value="none" ${e.trackId==='none'?'selected':''}>${escape(x.noMusic)}</option><option value="morning" ${e.trackId==='morning'?'selected':''}>${escape(x.morning)}</option><option value="evening" ${e.trackId==='evening'?'selected':''}>${escape(x.evening)}</option><option value="custom" ${e.trackId==='custom'?'selected':''}>${escape(x.custom)}</option></select></label>${e.trackId==='custom'?`<label>${escape(x.custom)}<input type="file" accept="audio/*" id="v3-audio"/>${e.music?`<small>${escape(e.music.name||e.old.songTitle||x.custom)}</small>`:''}</label>`:''}<div class="v3-divider"></div><fieldset class="v3-folder-field"><legend>${escape(x.folder)}</legend><label class="v3-radio"><input type="radio" name="v3-folder-mode" value="new" ${e.folderMode==='new'?'checked':''}/>${escape(x.createFolder)}</label><label class="v3-radio"><input type="radio" name="v3-folder-mode" value="existing" ${e.folderMode==='existing'?'checked':''} ${e.folders.length?'':'disabled'}/>${escape(x.useFolder)}</label>${e.isEditing?`<label class="v3-radio"><input type="radio" name="v3-folder-mode" value="none" ${e.folderMode==='none'?'checked':''}/>${escape(x.unfiled)}</label>`:''}<div id="v3-folder-fields">${folderFields()}</div><p class="v3-hint">${escape(x.newFolderHint)}</p></fieldset><p id="v3-error" class="v3-error" role="alert" hidden></p><div class="v3-action-bar"><button type="submit" class="v3-primary" id="v3-save">${escape(x.save)}</button><button type="button" id="v3-export" class="v3-secondary">${escape(x.render)}</button></div><p class="v3-hint">${escape(x.exportNote)} ${escape(x.browser)}</p><div id="v3-export-result" aria-live="polite"></div></form><aside class="v3-preview"><div class="v3-kicker">✦ MEMENTO • PREVIEW</div><div class="v3-memory-preview" id="v3-card" style="--card-bg:${theme.bg};--card-ink:${theme.ink};--card-accent:${theme.accent}"><span class="v3-card-mark">✦ MEMORY</span>${cardPhoto}<time id="v3-card-date">${escape(localeDate(e.date))}</time><span id="v3-card-mood">${escape((moodNames[lang]||moodNames.ru)[e.mood])}</span><h2 id="v3-card-title">${escape(e.title||'MEMENTO')}</h2><p id="v3-card-story">${escape(e.text.slice(0,180))}</p></div><p class="v3-hint">12 авторских тем · 540×960 · ${e.duration} ${escape(x.seconds)}</p></aside></div>`);
  wireEditor();
  if(e.footage) wireTrimmer();
}
function folderFields() { const e=editor, x=t(); return e.folderMode==='new'?`<label>${escape(x.folderName)}<input id="v3-new-folder-name" value="${escape(e.folderName)}" placeholder="${escape(e.title||x.newFolder)}" maxlength="100"/></label>`:e.folderMode==='existing'?`<select id="v3-folder-select">${e.folders.map(f=>`<option value="${escape(f.id)}" ${f.id===e.folderId?'selected':''}>${escape(f.name)}</option>`).join('')}</select>`:`<span class="v3-hint">${escape(x.unfiled)}</span>`; }
function syncTextFields() { if(!editor) return; for (const [name,id] of [['text','v3-text'],['title','v3-title'],['date','v3-date'],['mood','v3-mood'],['trackId','v3-track']]) { const el=document.getElementById(id); if(el) editor[name]=el.value; } const fname=document.getElementById('v3-new-folder-name'); if(fname) editor.folderName=fname.value; const fid=document.getElementById('v3-folder-select'); if(fid) editor.folderId=fid.value; }
function showError(message) { const el=document.getElementById('v3-error'); if(el) { el.hidden=false; el.textContent=message; } }
function changePreview(){ const e=editor; const card=document.getElementById('v3-card'); if(!card) return; const th=themeFor(e.mood); card.style.setProperty('--card-bg',th.bg); card.style.setProperty('--card-ink',th.ink); card.style.setProperty('--card-accent',th.accent); document.getElementById('v3-card-title').textContent=e.title||'MEMENTO'; document.getElementById('v3-card-story').textContent=e.text.slice(0,180); document.getElementById('v3-card-date').textContent=localeDate(e.date); document.getElementById('v3-card-mood').textContent=(moodNames[lang]||moodNames.ru)[e.mood]; }
function wireEditor(){
  for(const id of ['v3-text','v3-title','v3-date','v3-mood']) document.getElementById(id).addEventListener('input',()=>{syncTextFields(); changePreview();});
  document.getElementById('v3-track').addEventListener('change',()=>{syncTextFields();renderEditorForm();});
  document.getElementById('v3-photos').addEventListener('change',evt=>{syncTextFields(); const files=Array.from(evt.target.files||[]); if (files.length) { editor.photos=files; renderEditorForm(); } });
  document.querySelectorAll('[data-remove-photo]').forEach(btn=>btn.addEventListener('click',()=>{syncTextFields(); editor.photos.splice(Number(btn.dataset.removePhoto),1);renderEditorForm();}));
  document.getElementById('v3-footage').addEventListener('change',evt=>{syncTextFields(); const file=evt.target.files?.[0]; if(file){editor.footage=file;editor.trim={start:0,end:0};editor.videoSourceLength=0;renderEditorForm();}});
  document.getElementById('v3-audio')?.addEventListener('change',evt=>{ const file=evt.target.files?.[0]; if(file) editor.music=file; });
  document.getElementById('v3-film-duration').addEventListener('input',evt=>{syncTextFields();editor.duration=filmLength(evt.target.value);document.getElementById('v3-length-value').textContent=editor.duration+' '+t().seconds;
    if(editor.footage && editor.videoSourceLength) { editor.trim=clipRange(editor.trim.start,editor.trim.end,editor.videoSourceLength,editor.duration); renderEditorForm(); }});
  document.querySelectorAll('[name="v3-folder-mode"]').forEach(el=>el.addEventListener('change',()=>{syncTextFields();editor.folderMode=el.value;renderEditorForm();}));
  document.getElementById('v3-suggest').addEventListener('click',async()=>{syncTextFields(); if(!editor.text.trim())return showError(t().required);const btn=document.getElementById('v3-suggest');btn.disabled=true;try{const result=await suggestMemory(editor.text,lang,editor.trackId);editor.title=result.title;editor.mood=result.mood;renderEditorForm();}catch(err){showError(err.message);}finally{btn.disabled=false;}});
  document.getElementById('v3-form').addEventListener('submit',async ev=>{ev.preventDefault();syncTextFields();const mem=memoryFromEditor();if(!validateMemory(mem)) return; const btn=document.getElementById('v3-save');btn.disabled=true; btn.textContent=t().saving;
    try { await saveStory(mem,{mode:editor.folderMode,id:editor.folderId,name:editor.folderName||mem.title});location.hash='/archive'; }catch(err){showError(err.message);btn.disabled=false;btn.textContent=t().save;}});
  document.getElementById('v3-export').addEventListener('click',async()=>{syncTextFields();const mem=memoryFromEditor();if(!validateMemory(mem))return;await exportFilm(mem,'v3-export-result','v3-export');});
}
function validateMemory(mem){const x=t();if(!mem.text.trim()||!mem.photos?.length)return showError(x.required),false;
  if(mem.photos.length>5||mem.photos.some(p=>p instanceof File && (!p.type.startsWith('image/')||p.size>15e6)))return showError(x.invalidPhotos),false;
  if(mem.footage instanceof File && (!mem.footage.type.startsWith('video/')||mem.footage.size>80e6))return showError(x.invalidVideo),false;
  if(mem.trackId==='custom' && (!(mem.music instanceof Blob)||mem.music.size>30e6))return showError(x.invalidAudio),false;
  if(editor.folderMode==='existing'&&!editor.folderId)return showError(x.noFolder),false;
  return true;
}
function wireTrimmer(){ const el=document.getElementById('v3-clip-video');if(!el)return;
  const updateUi=()=>{const start=document.getElementById('v3-clip-start'),end=document.getElementById('v3-clip-end'); if(!start||!end)return;
    start.max=end.max=String(editor.videoSourceLength||100);start.value=editor.trim.start;end.value=editor.trim.end;
    document.getElementById('v3-start-time').textContent=formatSeconds(editor.trim.start);document.getElementById('v3-end-time').textContent=formatSeconds(editor.trim.end);
    document.getElementById('v3-clip-selected').textContent=`${t().selected}: ${(editor.trim.end-editor.trim.start).toFixed(1)} ${t().seconds}`;};
  el.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(el.duration)||el.duration<=0)return;
    editor.videoSourceLength=el.duration;
    if(editor.trim.end<=editor.trim.start)editor.trim.end=Math.min(el.duration,Math.max(.3,Math.min(6,maxClipLength(editor.duration))));
    editor.trim=clipRange(editor.trim.start,editor.trim.end,el.duration,editor.duration);updateUi();});
  const startEl=document.getElementById('v3-clip-start'),endEl=document.getElementById('v3-clip-end');
  startEl.addEventListener('input',()=>{const max=editor.videoSourceLength||100;const start=Number(startEl.value);
    editor.trim=clipRange(start,Math.max(start+.3,Math.min(editor.trim.end,start+maxClipLength(editor.duration))),max,editor.duration);
    if(editor.trim.end-editor.trim.start<.25) editor.trim.end=Math.min(max,editor.trim.start+Math.min(1,maxClipLength(editor.duration)));
    el.pause();try{el.currentTime=editor.trim.start;}catch{}updateUi();});
  endEl.addEventListener('input',()=>{const max=editor.videoSourceLength||100;const end=Number(endEl.value);
    editor.trim=clipRange(editor.trim.start,Math.max(editor.trim.start+.3,end),max,editor.duration);
    if(editor.trim.end<editor.trim.start+.2) editor.trim.start=Math.max(0,editor.trim.end-.3);
    el.pause();try{el.currentTime=editor.trim.end;}catch{}updateUi();});
  document.getElementById('v3-play-clip').addEventListener('click',async()=>{try{el.currentTime=editor.trim.start;await el.play();}catch(err){showError(err.message);}});
  el.addEventListener('timeupdate',()=>{if(el.currentTime>=editor.trim.end-.05&& !el.paused)el.pause();});
  document.getElementById('v3-remove-video').addEventListener('click',()=>{syncTextFields();editor.footage=null;editor.trim={start:0,end:0};editor.videoSourceLength=0;renderEditorForm();});
  if(el.readyState>=1)el.dispatchEvent(new Event('loadedmetadata'));
}
async function exportFilm(mem,targetId,buttonId){
  const x=t(); const target=document.getElementById(targetId),btn=document.getElementById(buttonId);
  if(!target||!btn)return;
  revokeExport();btn.disabled=true;
  target.innerHTML=`<p role="status">${escape(x.exporting)} <span id="v3-progress">0%</span></p><progress max="100" value="0" id="v3-progress-bar"></progress>`;
  try {
    const raw=await renderMemory(mem,p=>{
      const text=document.getElementById('v3-progress'),bar=document.getElementById('v3-progress-bar');
      if(text)text.textContent=p+'%';if(bar)bar.value=p;
    });
    let result=raw, conversionIssue='';
    try {
      result=await phoneReadyMp4(raw,()=>{
        target.innerHTML=`<p role="status">${escape(x.converting)}</p><progress></progress>`;
      });
    } catch(err) {
      // Never lose the original film if this computer lacks FFmpeg.
      conversionIssue=err.message;
      result=raw;
    }
    exportUrl=URL.createObjectURL(result.blob);
    const isMp4=result.extension==='mp4';
    const filename=safeVideoName(mem.title,result.extension);
    const notice=isMp4?escape(x.videoReady):escape(x.fallback)+' '+escape(conversionIssue);
    const downloadLabel=isMp4?x.download:x.webmDownload;
    target.innerHTML=`<p role="status" class="${isMp4?'':'v3-error'}">${notice}</p><video controls playsinline preload="metadata" src="${escape(exportUrl)}"></video><a class="v3-primary v3-download" id="v3-film-download" download="${escape(filename)}" href="${escape(exportUrl)}">${escape(downloadLabel)}</a><div id="v3-share-slot"></div><p class="v3-hint">${escape(x.transferNote)}</p>`;
    if (isMp4 && navigator.share && navigator.canShare && typeof File !== 'undefined') {
      const file=new File([result.blob],filename,{type:'video/mp4'});
      if (navigator.canShare({files:[file]})) {
        const button=document.createElement('button');button.className='v3-secondary v3-share';button.type='button';
        button.textContent=x.share;
        button.addEventListener('click',async()=>{
          try { await navigator.share({files:[file],title:'MEMENTO'}); }
          catch(err) { if(err.name!=='AbortError') alert(err.message); }
        });
        target.querySelector('#v3-share-slot')?.append(button);
      }
    }
  }catch(err){target.innerHTML=`<p class="v3-error" role="alert">${escape(x.error+': '+err.message)}. ${escape(x.browser)}</p>`;}
  finally{btn.disabled=false;}
}
async function showArchive() { editor=null;revokeExport(); const [folders,memories]=await Promise.all([listFolders(),listMemories()]);const x=t(); const selected=archiveFilter;
  const results=memories.filter(mem=>(selected==='all'||(selected==='none'?!mem.folderId:mem.folderId===selected))&&(mem.title||'').toLowerCase().includes(archiveSearch.toLowerCase()));
  shell(`<div class="v3-topline"><span>✦ ${escape(x.v3)}</span><a href="#/create">+ ${escape(x.newMemory)}</a></div><div class="v3-page-title"><h1>${escape(x.archiveHeading)}</h1><p>${memories.length} ${escape(x.total)} · ${folders.length} ${escape(x.folders)}</p></div><section class="v3-folder-section"><div class="v3-section-header"><h2>${escape(x.folders)}</h2><button id="v3-add-folder" class="v3-secondary">+ ${escape(x.newFolder)}</button></div><div class="v3-folders"><button data-filter="all" class="v3-folder-tile ${selected==='all'?'active':''}">✦ ${escape(x.all)} <span>${memories.length}</span></button><button data-filter="none" class="v3-folder-tile ${selected==='none'?'active':''}">▣ ${escape(x.unfiled)} <span>${memories.filter(m=>!m.folderId).length}</span></button>${folders.map(f=>`<div class="v3-folder-tile ${selected===f.id?'active':''}"><button data-filter="${escape(f.id)}">▱ ${escape(f.name)} <span>${memories.filter(m=>m.folderId===f.id).length}</span></button><div class="v3-tile-actions"><button data-rename-folder="${escape(f.id)}" title="${escape(x.rename)}">✎</button><button data-delete-folder="${escape(f.id)}" title="${escape(x.delete)}">×</button></div></div>`).join('')}</div></section><div class="v3-section-header"><h2>${escape(x.archiveHeading)}</h2><input id="v3-search" type="search" value="${escape(archiveSearch)}" placeholder="Поиск по названию…"/></div><div class="v3-memory-grid">${results.length?results.map(mem=>archiveCard(mem,folders)).join(''):`<div class="v3-empty">${escape(x.empty)} · ${escape(x.emptyHint)} <a href="#/create">+ ${escape(x.create)}</a></div>`}</div>`);
  base.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{archiveFilter=btn.dataset.filter;showArchive();}));
  document.getElementById('v3-search').addEventListener('change',ev=>{archiveSearch=ev.target.value;showArchive();});
  document.getElementById('v3-add-folder').addEventListener('click',async()=>{const name=prompt(x.folderPrompt,x.newFolder);if(name?.trim()){try{await addFolder(name);showArchive();}catch(err){alert(err.message);}}});
  base.querySelectorAll('[data-rename-folder]').forEach(btn=>btn.addEventListener('click',async()=>{const f=folders.find(f=>f.id===btn.dataset.renameFolder);const name=prompt(x.folderPrompt,f?.name||'');if(name?.trim()){try{await renameFolder(btn.dataset.renameFolder,name);showArchive();}catch(err){alert(err.message);}}}));
  base.querySelectorAll('[data-delete-folder]').forEach(btn=>btn.addEventListener('click',async()=>{if(confirm(x.confirmFolder)){await deleteFolder(btn.dataset.deleteFolder);archiveFilter='all';showArchive();}}));
  base.querySelectorAll('[data-delete-memory]').forEach(btn=>btn.addEventListener('click',async()=>{if(confirm(x.confirmDelete)){await deleteMemory(btn.dataset.deleteMemory);showArchive();}}));
  base.querySelectorAll('[data-export-memory]').forEach(btn=>btn.addEventListener('click',async()=>{const mem=memories.find(m=>m.id===btn.dataset.exportMemory);if(mem)await exportFilm(mem,`v3-export-result-${mem.id}`,`v3-render-${mem.id}`);}));
}
function archiveCard(mem,folders){ const x=t();const th=themeFor(mem.mood);const folder=folders.find(f=>f.id===mem.folderId)?.name||mem.folder||x.unfiled;return `<article class="v3-archive-card" style="--card-bg:${th.bg};--card-ink:${th.ink};--card-accent:${th.accent}">${mem.photo?`<img class="v3-archive-image" src="${escape(mediaUrl(mem.photo))}" alt=""/>`:''}<div class="v3-archive-content"><div class="v3-kicker">✦ ${escape(folder)} · ${escape(localeDate(mem.date||''))}</div><h3>${escape(mem.title||'MEMENTO')}</h3><p>${escape((mem.text||'').slice(0,175))}</p><div class="v3-archive-meta">${escape((moodNames[lang]||moodNames.ru)[mem.mood]||mem.mood)} · ${filmLength(mem.duration||12)} ${escape(x.seconds)} ${mem.footage?'· 🎞':''}</div><div class="v3-archive-buttons"><a class="v3-secondary" href="#/edit/${encodeURIComponent(mem.id)}">✎ ${escape(x.edit)}</a><button type="button" class="v3-secondary" id="v3-render-${escape(mem.id)}" data-export-memory="${escape(mem.id)}">${escape(x.render)}</button><button class="v3-quiet" data-delete-memory="${escape(mem.id)}">${escape(x.delete)}</button></div><div id="v3-export-result-${escape(mem.id)}" class="v3-archive-export"></div></div></article>`;}
// Original React (first ZIP) exclusively owns Home, Stories, and Demo pages.
let routeVersion=0;
async function route(){
  const version=++routeVersion;
  const match=location.hash.match(/^#\/(create|archive|edit)(?:\/([^/]+))?/);
  const section=match?.[1] || 'legacy';
  const root=document.getElementById('root');
  // Preserve the FIRST ZIP's original homepage and all six demo stories.
  if (section === 'legacy') {
    base.style.display='none';
    if(root) root.style.display='flex';
    document.body.classList.add('is-legacy');
    document.body.classList.remove('is-studio');
    revokeExport(); releaseUrls(); editor=null;
    return;
  }
  lang=localStorage.getItem('memento-language') || 'ru';
  if(root) root.style.display='none';
  base.style.display='block';
  document.body.classList.add('is-studio');
  document.body.classList.remove('is-legacy');
  revokeExport();releaseUrls();
  base.innerHTML=`<div class="v3-loading">${escape(t().loading)}</div>`;
  try {
    if(section==='archive')await showArchive();
    else await showEditor(section==='edit'?decodeURIComponent(match[2]||''):'');
    if(version!==routeVersion)return;
    window.scrollTo(0,0);
  }catch(err){
    if(version!==routeVersion)return;
    base.innerHTML=`<div class="v3-wrap v3-error v3-error-screen">${escape(t().error+': '+err.message)} <a href="#/create">${escape(t().create)}</a></div>`;
    console.error('MEMENTO Studio editor',err);
  }
}
window.addEventListener('hashchange',route);
route();
