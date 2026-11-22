import { moodKeys } from './themes.js';

const hints = {
  calm: /спокой|тих|тишин|уют|расслаб|душевн|peace|calm|quiet|тыныш|жайлы/gi,
  joy: /радос|счаст|улыб|праздн|весел|қуаны|бақыт|joy|happy|celebrat/gi,
  nostalgic: /вспомина|детств|раньше|прошл|носталь|сағын|балалық|remember|miss|nostalg/gi,
  hopeful: /надежд|мечт|вперед|ожида|үміт|арман|hope|dream|future/gi,
  energetic: /энерг|актив|бег|движен|танец|спорт|жарыс|бил|energy|dance|sport|cheer/gi,
  focused: /учеб|проект|работ|экзамен|задач|сабақ|жоба|оқу|study|project|focus/gi,
  tender: /любов|забот|тепл|нежн|отбас|сүйісп|kind|love|gentle|family/gi,
  adventurous: /путеше|приключ|поход|лошад|дорог|саяхат|жорық|travel|adventur|ride/gi,
  melancholy: /груст|печал|одиноч|слез|мұң|sad|lonely|melanch/gi,
  proud: /побед|горд|медал|третье место|достиж|жеңіс|мақтан|proud|victory|won/gi,
  playful: /шут|смешн|игр|прикол|ойын|funny|joke|playful/gi,
  wonder: /удив|волшеб|звезд|невероят|таңғал|ғажайып|amazing|wonder|magic/gi,
};

export function localSuggestion(text, language = 'ru', trackId = 'none') {
  const clean = (text || '').trim();
  let mood = 'calm';
  let top = 0;
  for (const key of moodKeys) {
    const score = (clean.match(hints[key]) || []).length;
    if (score > top) { top = score; mood = key; }
  }
  if (!top && trackId === 'evening') mood = 'joy';
  const first = clean.split(/[.!?\n]/)[0].trim().replace(/^[«"'\s]+|[»"'\s]+$/g, '');
  const title = first.length > 56 ? first.slice(0, 53).replace(/\s+\S*$/, '') + '…' : first;
  return {
    title: title || ({ ru: 'Момент, который хочется сохранить', kk: 'Есте қалатын сәт', en: 'A moment to remember' }[language] || 'A moment to remember'),
    mood,
    detail: ({
      calm: { ru: 'спокойствие и уют', kk: 'тыныштық пен жайлылық', en: 'calm and comfort' },
      joy: { ru: 'радость и тепло', kk: 'қуаныш пен жылулық', en: 'joy and warmth' },
      proud: { ru: 'гордость и вдохновение', kk: 'мақтаныш пен шабыт', en: 'pride and inspiration' },
    }[mood]?.[language] || { ru: 'яркое воспоминание', kk: 'жарқын естелік', en: 'a vivid memory' }[language]),
    provider: 'local',
  };
}

export function validateSuggestion(data, fallback) {
  const title = typeof data?.title === 'string' ? data.title.trim().slice(0, 64) : '';
  return {
    title: title || fallback.title,
    mood: moodKeys.includes(data?.mood) ? data.mood : fallback.mood,
    detail: typeof data?.detail === 'string' ? data.detail.trim().slice(0, 100) : fallback.detail,
    provider: data?.provider === 'ai' ? 'ai' : 'local',
  };
}

export async function suggestMemory(text, language, trackId) {
  const fallback = localSuggestion(text, language, trackId);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let result;
    try {
      result = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }), signal: controller.signal,
      });
    } finally { clearTimeout(timer); }
    if (!result.ok) throw Error('AI endpoint unavailable');
    const data = await result.json();
    return validateSuggestion(data, fallback);
  } catch { return fallback; }
}
