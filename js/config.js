
// /
//    ANIMEX v4 — CONFIGURATION
//    Platforms, constants, mappings
// ══════════════════════════════════════════*/

const PLATFORMS = {
  netflix: { name:'Netflix', cls:'netflix', icon:'🎬', color:'#e50914', searchUrl: t => `https://netflix.com/search?q=${encodeURIComponent(t)}` },
  crunchyroll: { name:'Crunchyroll', cls:'crunchyroll', icon:'🦊', color:'#f47521', searchUrl: t => `https://crunchyroll.com/search?q=${encodeURIComponent(t)}` },
  prime: { name:'Prime', cls:'prime', icon:'📦', color:'#00a8e0', searchUrl: t => `https://primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}` },
  disney: { name:'Disney+', cls:'disney', icon:'✨', color:'#4fa5ff', searchUrl: t => `https://disneyplus.com/search/${encodeURIComponent(t)}` },
  hidive: { name:'HIDIVE', cls:'hidive', icon:'🌊', color:'#00bacd', searchUrl: t => `https://hidive.com/search#${encodeURIComponent(t)}` },
  youtube: { name:'YouTube', cls:'youtube', icon:'▶️', color:'#ff0000', searchUrl: t => `https://youtube.com/results?search_query=${encodeURIComponent(t + ' anime')}` }
};

const PLATFORM_DB = {
  'attack on titan':['crunchyroll','netflix','prime'],
  'demon slayer':['crunchyroll','netflix','prime','disney'],
  'jujutsu kaisen':['crunchyroll','netflix'],
  'one piece':['crunchyroll','netflix'],
  'naruto':['crunchyroll','netflix','prime'],
  'fullmetal alchemist':['crunchyroll','netflix','prime'],
  'my hero academia':['crunchyroll','netflix','prime'],
  'death note':['crunchyroll','netflix'],
  'hunter x hunter':['crunchyroll','netflix','prime'],
  'dragon ball':['crunchyroll'],
  'sword art online':['crunchyroll','netflix','prime'],
  'bleach':['crunchyroll','netflix'],
  'tokyo ghoul':['crunchyroll','netflix'],
  'vinland saga':['crunchyroll','netflix','prime'],
  'mob psycho':['crunchyroll'],
  'one punch man':['crunchyroll','netflix'],
  'steins':['crunchyroll'],
  'code geass':['crunchyroll','netflix'],
  'evangelion':['netflix'],
  'chainsaw man':['crunchyroll'],
  'spy x family':['crunchyroll','netflix'],
  'blue lock':['crunchyroll','netflix'],
  'cowboy bebop':['crunchyroll','netflix'],
  'violet evergarden':['netflix'],
  'your lie in april':['netflix'],
  'silent voice':['netflix'],
  'spirited away':['netflix','disney'],
  'princess mononoke':['netflix'],
  'howl':['netflix'],
  'black clover':['crunchyroll'],
  'fairy tail':['crunchyroll','netflix'],
  'haikyuu':['crunchyroll','netflix'],
  'made in abyss':['hidive','prime'],
  'mushoku tensei':['crunchyroll','netflix'],
  'slime':['crunchyroll','netflix'],
  'overlord':['crunchyroll'],
  're:zero':['crunchyroll'],
  'konosuba':['crunchyroll'],
  'dr. stone':['crunchyroll','netflix'],
  'fire force':['crunchyroll','netflix'],
};

const MOOD_GENRE_IDS = {
  action:'1', romance:'22', dark:'40', comedy:'4',
  fantasy:'10', chill:'36', scifi:'24', horror:'14'
};

const ACHIEVEMENTS = [
  {count:1, icon:'🌱', label:'First Watch', desc:'Added your first anime!'},
  {count:5, icon:'📚', label:'Getting Serious', desc:'5 anime saved!'},
  {count:10, icon:'⚔️', label:'Anime Warrior', desc:'10 anime in your list!'},
  {count:25, icon:'🏆', label:'Otaku Status', desc:'25 anime saved!'},
  {count:50, icon:'👑', label:'Anime Master', desc:'50 anime! Legendary!'}
];

const API_BASE = 'https://api.jikan.moe/v4';
