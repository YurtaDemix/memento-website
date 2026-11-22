// MEMENTO design tokens are authored by the team. AI can only select a mood.
export const themes = {
  calm: { bg: '#e6ead9', ink: '#354a38', accent: '#819884', paper: '#faf4e8', texture: 'linen', layout: 'polaroid', speed: 0.7 },
  joy: { bg: '#ffdfc4', ink: '#71383f', accent: '#df8b61', paper: '#fff9ec', texture: 'confetti', layout: 'collage', speed: 1.3 },
  nostalgic: { bg: '#e9e0ed', ink: '#553b64', accent: '#a793b2', paper: '#fffaf0', texture: 'grain', layout: 'album', speed: 0.75 },
  hopeful: { bg: '#f5ecd0', ink: '#586647', accent: '#cdb46a', paper: '#fffdf1', texture: 'rays', layout: 'postcard', speed: 0.9 },
  energetic: { bg: '#fbd4c3', ink: '#7b2e36', accent: '#d75539', paper: '#fff7e9', texture: 'stripes', layout: 'collage', speed: 1.6 },
  focused: { bg: '#dce9ec', ink: '#284755', accent: '#6198a7', paper: '#f8fcf9', texture: 'grid', layout: 'editorial', speed: 0.8 },
  tender: { bg: '#f3dfe4', ink: '#763f58', accent: '#d496a6', paper: '#fff8f6', texture: 'petals', layout: 'postcard', speed: 0.75 },
  adventurous: { bg: '#dae6d5', ink: '#2c544c', accent: '#ba8751', paper: '#fff8e9', texture: 'contours', layout: 'film', speed: 1.4 },
  melancholy: { bg: '#dce2ec', ink: '#46546d', accent: '#8197b6', paper: '#f7f6f2', texture: 'rain', layout: 'album', speed: 0.65 },
  proud: { bg: '#f0ddc3', ink: '#66432d', accent: '#b78149', paper: '#fffaf0', texture: 'rays', layout: 'editorial', speed: 1.1 },
  playful: { bg: '#e2dcf3', ink: '#59427c', accent: '#b79bdc', paper: '#fff8f2', texture: 'confetti', layout: 'collage', speed: 1.45 },
  wonder: { bg: '#d9e6e6', ink: '#254c54', accent: '#719ba5', paper: '#f8fff9', texture: 'stars', layout: 'film', speed: 0.95 },
};

export const moodKeys = Object.keys(themes);
export const themeFor = mood => themes[mood] || themes.calm;

export function animationSpeed(mood, track) {
  const base = themeFor(mood).speed;
  // Track energy adjusts movement *inside* a fixed theme, not the theme itself.
  return Math.max(0.55, Math.min(1.7, base * (track?.energy === 'high' ? 1.18 : track?.energy === 'low' ? 0.85 : 1)));
}
