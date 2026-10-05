import carefreeCover from './assets/music/carefree.svg';
import dreamCover from './assets/music/dream-culture.svg';
import lemonCover from './assets/music/easy-lemon.svg';

export const musicLibrary = [
  {id: 'carefree', title: 'Carefree', artist: 'Kevin MacLeod', mood: '轻快 · 尤克里里',
    duration: 205, src: '/music/carefree.mp3', cover: carefreeCover, color: '#a9a7ef', accent: '#5965bf',
    source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037'},
  {id: 'dream-culture', title: 'Dream Culture', artist: 'Kevin MacLeod', mood: '舒缓 · 钢琴',
    duration: 214, src: '/music/dream-culture.mp3', cover: dreamCover, color: '#99cfc8', accent: '#497f86',
    source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046'},
  {id: 'easy-lemon', title: 'Easy Lemon', artist: 'Kevin MacLeod', mood: '明亮 · 吉他',
    duration: 126, src: '/music/easy-lemon.mp3', cover: lemonCover, color: '#e8c88f', accent: '#ad8054',
    source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200076'},
];
