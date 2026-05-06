/* ANIMEX v5 — PLATFORM CONFIG */

export const PLATFORMS = {
  netflix: {
    name: 'Netflix', cls: 'netflix', color: '#e50914',
    searchUrl: t => `https://netflix.com/search?q=${encodeURIComponent(t)}`
  },
  crunchyroll: {
    name: 'Crunchyroll', cls: 'crunchyroll', color: '#f47521',
    searchUrl: t => `https://crunchyroll.com/search?q=${encodeURIComponent(t)}`
  },
  prime: {
    name: 'Prime', cls: 'prime', color: '#00a8e0',
    searchUrl: t => `https://primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`
  },
  disney: {
    name: 'Disney+', cls: 'disney', color: '#4fa5ff',
    searchUrl: t => `https://disneyplus.com/search/${encodeURIComponent(t)}`
  },
  hidive: {
    name: 'HIDIVE', cls: 'hidive', color: '#00bacd',
    searchUrl: t => `https://hidive.com/search#${encodeURIComponent(t)}`
  },
  youtube: {
    name: 'YouTube', cls: 'youtube', color: '#ff0000',
    searchUrl: t => `https://youtube.com/results?search_query=${encodeURIComponent(t + ' anime')}`
  }
};

export const PLATFORM_DB = {
  'attack on titan':    ['crunchyroll', 'netflix', 'prime'],
  'demon slayer':       ['crunchyroll', 'netflix', 'prime', 'disney'],
  'jujutsu kaisen':     ['crunchyroll', 'netflix'],
  'one piece':          ['crunchyroll', 'netflix'],
  'naruto':             ['crunchyroll', 'netflix', 'prime'],
  'fullmetal alchemist':['crunchyroll', 'netflix', 'prime'],
  'my hero academia':   ['crunchyroll', 'netflix', 'prime'],
  'death note':         ['crunchyroll', 'netflix'],
  'hunter x hunter':   ['crunchyroll', 'netflix', 'prime'],
  'dragon ball':        ['crunchyroll'],
  'sword art online':   ['crunchyroll', 'netflix', 'prime'],
  'bleach':             ['crunchyroll', 'netflix'],
  'tokyo ghoul':        ['crunchyroll', 'netflix'],
  'vinland saga':       ['crunchyroll', 'netflix', 'prime'],
  'mob psycho':         ['crunchyroll'],
  'one punch man':      ['crunchyroll', 'netflix'],
  'steins':             ['crunchyroll'],
  'code geass':         ['crunchyroll', 'netflix'],
  'evangelion':         ['netflix'],
  'chainsaw man':       ['crunchyroll'],
  'spy x family':       ['crunchyroll', 'netflix'],
  'blue lock':          ['crunchyroll', 'netflix'],
  'cowboy bebop':       ['crunchyroll', 'netflix'],
  'violet evergarden':  ['netflix'],
  'your lie in april':  ['netflix'],
  'spirited away':      ['netflix', 'disney'],
  'princess mononoke':  ['netflix'],
  'howl':               ['netflix'],
  'black clover':       ['crunchyroll'],
  'fairy tail':         ['crunchyroll', 'netflix'],
  'haikyuu':            ['crunchyroll', 'netflix'],
  'made in abyss':      ['hidive', 'prime'],
  'mushoku tensei':     ['crunchyroll', 'netflix'],
  'slime':              ['crunchyroll', 'netflix'],
  'overlord':           ['crunchyroll'],
  're:zero':            ['crunchyroll'],
  'konosuba':           ['crunchyroll'],
  'dr. stone':          ['crunchyroll', 'netflix'],
  'fire force':         ['crunchyroll', 'netflix'],
};

export const MOOD_GENRE_IDS = {
  action: '1', romance: '22', dark: '40', comedy: '4',
  fantasy: '10', chill: '36', scifi: '24', horror: '14'
};

export const ACHIEVEMENTS = [
  { count: 1,  icon: '🌱', label: 'First Watch',    desc: 'Added your first anime!' },
  { count: 5,  icon: '📚', label: 'Getting Serious', desc: '5 anime saved!' },
  { count: 10, icon: '⚔️', label: 'Anime Warrior',   desc: '10 anime in your list!' },
  { count: 25, icon: '🏆', label: 'Otaku Status',     desc: '25 anime saved!' },
  { count: 50, icon: '👑', label: 'Anime Master',     desc: '50 anime! Legendary!' },
];

export const API_BASE = 'https://api.jikan.moe/v4';

export function detectPlatforms(anime) {
  let platforms = [];
  if (anime.streaming?.length) {
    anime.streaming.forEach(s => {
      const n = s.name.toLowerCase();
      if (n.includes('netflix'))                  platforms.push({ key: 'netflix', url: s.url });
      else if (n.includes('crunchyroll'))         platforms.push({ key: 'crunchyroll', url: s.url });
      else if (n.includes('prime') || n.includes('amazon')) platforms.push({ key: 'prime', url: s.url });
      else if (n.includes('disney'))              platforms.push({ key: 'disney', url: s.url });
      else if (n.includes('hidive'))              platforms.push({ key: 'hidive', url: s.url });
      else if (n.includes('youtube'))             platforms.push({ key: 'youtube', url: s.url });
    });
  }
  if (!platforms.length) {
    const tl = (anime.title || '').toLowerCase();
    for (const [k, pks] of Object.entries(PLATFORM_DB)) {
      if (tl.includes(k)) {
        pks.forEach(pk => {
          if (!platforms.find(p => p.key === pk))
            platforms.push({ key: pk, url: PLATFORMS[pk].searchUrl(anime.title), fallback: true });
        });
        break;
      }
    }
  }
  if (!platforms.length) platforms = [
    { key: 'crunchyroll', url: PLATFORMS.crunchyroll.searchUrl(anime.title), fallback: true },
    { key: 'youtube',     url: PLATFORMS.youtube.searchUrl(anime.title), fallback: true },
  ];
  return platforms;
}
