<script setup>
import {t} from './locale.js';
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import PlayerIcon from './PlayerIcon.vue';
import {musicLibrary} from './music-library.js';

defineProps({animated: {type: Boolean, default: true}});
const audio = ref(null);
const index = ref(0);
const playing = ref(false);
const loading = ref(false);
const volume = ref(.25);
const muted = ref(false);
const mode = ref('list');
const playlistOpen = ref(false);
const elapsed = ref(0);
const loadedDuration = ref(0);
const message = ref('');
const storageKey = 'calculator-music-preferences-v1';
const modes = [
  {id: 'list', label: '列表循环', icon: 'repeat'},
  {id: 'single', label: '单曲循环', icon: 'repeat'},
  {id: 'shuffle', label: '随机播放', icon: 'shuffle'},
  {id: 'sequence', label: '顺序播放', icon: 'list'},
];
const track = computed(() => musicLibrary[index.value]);
const duration = computed(() => loadedDuration.value || track.value.duration);
const progress = computed(() => Math.min(100, elapsed.value / duration.value * 100));
const currentMode = computed(() => modes.find(item => item.id === mode.value));
const volumeLabel = computed(() => Math.round(volume.value * 100));
const status = computed(() => loading.value ? '正在加载音乐…' : playing.value ? '正在播放 · 自动连播' : '点一下播放，让计算有旋律');
let playRequest = 0;
const wantsPlay = ref(false);

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function savePreferences() {
  try { localStorage.setItem(storageKey, JSON.stringify({index: index.value, mode: mode.value,
    volume: volume.value, muted: muted.value})); }
  catch { /* Listening remains available when browser storage is disabled. */ }
}
function updateTime() {
  if (!audio.value) return;
  elapsed.value = Number.isFinite(audio.value.currentTime) ? audio.value.currentTime : 0;
  loadedDuration.value = Number.isFinite(audio.value.duration) ? audio.value.duration : 0;
}
async function playCurrent() {
  if (!audio.value) return;
  if (audio.value.error) audio.value.load();
  const request = ++playRequest;
  message.value = '';
  wantsPlay.value = true;
  loading.value = true;
  try {
    await audio.value.play();
    if (request === playRequest) loading.value = false;
  } catch (error) {
    if (request !== playRequest) return;
    wantsPlay.value = false;
    playing.value = false;
    loading.value = false;
    message.value = error.name === 'NotAllowedError' ? '请点击播放，浏览器需要你的播放许可。' :
      '音乐暂时无法播放，请重试或换一首。';
  }
}
function pause() {
  ++playRequest;
  wantsPlay.value = false;
  audio.value?.pause();
  playing.value = false;
  loading.value = false;
}
function togglePlay() { if (wantsPlay.value || playing.value) pause(); else playCurrent(); }
function selectTrack(nextIndex, autoPlay = true) {
  if (!audio.value) return;
  if (nextIndex === index.value) { if (autoPlay) playCurrent(); return; }
  pause();
  index.value = nextIndex;
  elapsed.value = 0;
  loadedDuration.value = 0;
  message.value = '';
  // Set the source and call play in the same gesture, including on mobile browsers.
  audio.value.src = track.value.src;
  if (autoPlay) playCurrent();
}
function nextIndex() {
  return mode.value === 'shuffle' ?
    (index.value + 1 + Math.floor(Math.random() * (musicLibrary.length - 1))) % musicLibrary.length :
    (index.value + 1) % musicLibrary.length;
}
function skip(direction) {
  selectTrack(direction < 0 ? (index.value + musicLibrary.length - 1) % musicLibrary.length : nextIndex(),
    wantsPlay.value || playing.value);
}
function onEnded() {
  playing.value = false;
  wantsPlay.value = false;
  if (mode.value === 'single') {
    audio.value.currentTime = 0;
    playCurrent();
  } else if (mode.value === 'sequence' && index.value === musicLibrary.length - 1) {
    loading.value = false;
    message.value = '歌单已播放完，可以再听一遍。';
  } else selectTrack(nextIndex());
}
function onPlaying() { playing.value = !audio.value.paused; loading.value = false; }
function onPause() { playing.value = !audio.value.paused; if (!playing.value) loading.value = false; }
function onError() {
  pause();
  message.value = '这首音乐暂时无法加载，可换一首或点击播放重试。';
}
function seek(event) {
  if (!audio.value || !loadedDuration.value) return;
  audio.value.currentTime = Math.max(0, Math.min(Number(event.target.value), loadedDuration.value));
  updateTime();
}
function changeVolume(event) {
  volume.value = Number(event.target.value) / 100;
  muted.value = false;
}
function toggleMute() {
  if (volume.value === 0) { volume.value = .25; muted.value = false; }
  else muted.value = !muted.value;
}
function cycleMode() {
  mode.value = modes[(modes.findIndex(item => item.id === mode.value) + 1) % modes.length].id;
}
watch([index, mode, volume, muted], () => {
  if (audio.value) { audio.value.volume = volume.value; audio.value.muted = muted.value; }
  savePreferences();
});
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved) {
      if (Number.isInteger(saved.index) && saved.index >= 0 && saved.index < musicLibrary.length) index.value = saved.index;
      if (modes.some(item => item.id === saved.mode)) mode.value = saved.mode;
      if (Number.isFinite(saved.volume) && saved.volume >= 0 && saved.volume <= 1) volume.value = saved.volume;
      muted.value = saved.muted === true;
    }
  } catch { /* Invalid preferences never prevent playback. */ }
  audio.value.volume = volume.value;
  audio.value.muted = muted.value;
  audio.value.src = track.value.src;
});
onUnmounted(() => { pause(); });
</script>

<template>
  <section class="music-player" :aria-label="t('专注电台音乐播放器')"
    :class="{'is-playing': playing, 'motion-paused': !animated}"
    :style="{'--album-color': track.color, '--album-accent': track.accent}" @keydown.stop>
    <audio ref="audio" preload="none" @loadedmetadata="updateTime" @durationchange="updateTime"
      @timeupdate="updateTime" @playing="onPlaying" @pause="onPause" @ended="onEnded"
      @waiting="loading = wantsPlay" @error="onError" />
    <div class="music-main">
      <div class="music-cover"><img :src="track.cover" :alt="t('{title} 歌曲封面', {title: track.title})" width="74" height="74" /><div class="vinyl" aria-hidden="true"><span class="vinyl-label">♪</span></div></div>
      <div class="music-info">
        <div class="radio-label"><span>FOCUS RADIO</span><span class="music-live"><i></i> {{ t('专注电台') }} </span></div>
        <h2>{{ t(track.title) }}</h2><p>{{ t(track.artist) }}<span> · {{ t(track.mood) }}</span></p>
        <div class="music-status"><span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>{{ t(status) }}</span></div>
      </div>
      <div class="music-controls">
        <div class="transport">
          <button class="icon-button mode-button" type="button" :aria-label="t('切换播放模式，当前{mode}', {mode: t(currentMode.label)})" :title="t(currentMode.label)" @click="cycleMode"><PlayerIcon :name="currentMode.icon" /><span v-if="mode === 'single'" class="single-mark">1</span></button>
          <button class="icon-button" type="button" :aria-label="t('上一首')" @click="skip(-1)"><PlayerIcon name="previous" /></button>
          <button class="play-button" type="button" :aria-label="t(wantsPlay || playing || loading ? '暂停音乐' : '播放音乐')" @click="togglePlay"><span v-if="loading" class="music-spinner" aria-hidden="true"></span><PlayerIcon v-else :name="playing ? 'pause' : 'play'" /></button>
          <button class="icon-button" type="button" :aria-label="t('下一首')" @click="skip(1)"><PlayerIcon name="next" /></button>
          <button class="icon-button playlist-toggle" type="button" :aria-expanded="playlistOpen" aria-controls="music-playlist" :aria-label="t('展开或收起播放列表')" @click="playlistOpen = !playlistOpen"><PlayerIcon name="list" /></button>
        </div>
        <div class="music-settings"><span class="mode-label">{{ t(currentMode.label) }}</span><div class="volume-control"><button class="icon-button" type="button" :aria-label="t(muted || volume === 0 ? '取消静音' : '静音')" @click="toggleMute"><PlayerIcon :name="muted || volume === 0 ? 'muted' : 'volume'" /></button><input type="range" min="0" max="100" :value="muted ? 0 : volumeLabel" :aria-label="t('音乐音量')" :aria-valuetext="`${muted ? 0 : volumeLabel}%`" @input="changeVolume" /></div></div>
      </div>
    </div>
    <div class="music-progress"><span>{{ t(formatTime(elapsed)) }}</span><input type="range" min="0" :max="duration" step="0.1" :value="elapsed" :disabled="!loadedDuration" :aria-label="t('音乐播放进度')" :aria-valuetext="`${formatTime(elapsed)} / ${formatTime(duration)}`" :style="{'--progress': `${progress}%`}" @input="seek" /><span>{{ t(formatTime(duration)) }}</span></div>
    <div class="music-bottom"><span>{{ t(musicLibrary.length) }} {{ t('首轻音乐 ·') }} {{ t(mode === 'single' ? '单曲循环' : mode === 'sequence' ? '依序播放后停止' : '播放完自动切歌') }}</span><a href="/music/credits.md" target="_blank" rel="noopener noreferrer"> {{ t('音乐署名 · CC BY 4.0 ↗') }} </a></div>
    <p v-if="message" class="music-message" role="status">{{ t(message) }}</p>
    <Transition name="playlist">
      <div v-if="playlistOpen" id="music-playlist" class="music-playlist">
        <div class="playlist-heading"><h3> {{ t('陪你计算的歌单') }} </h3><span>{{ t(currentMode.label) }}</span></div>
        <ol><li v-for="(item, itemIndex) in musicLibrary" :key="item.id"><button type="button" :class="{selected: index === itemIndex}" :aria-current="index === itemIndex ? 'true' : undefined" :aria-label="t('播放 {title}', {title: item.title})" @click="selectTrack(itemIndex)"><span class="track-art"><img :src="item.cover" :alt="t('{title} 封面缩略图', {title: item.title})" width="38" height="38" /><span class="track-number">{{ t(String(itemIndex + 1).padStart(2, '0')) }}</span></span><span class="track-copy"><strong>{{ t(item.title) }}</strong><small>{{ t(item.mood) }}</small></span><span class="track-duration">{{ t(formatTime(item.duration)) }}</span><span class="track-indicator" aria-hidden="true">{{ t(index === itemIndex && playing ? '♫' : '▷') }}</span></button></li></ol>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.music-player { margin: 0 0 26px; padding: 23px 26px 16px; border: 1px solid #e2e6f6; border-radius: 18px; background: linear-gradient(115deg, #ffffffed, #f7f8ffed 70%, #f0f4fbed); box-shadow: 0 8px 36px #5b6caa08; position: relative; overflow: hidden; }
.music-main { display: grid; grid-template-columns: 74px minmax(0, 1fr) auto; gap: 22px; align-items: center; }
.music-cover { width: 74px; height: 74px; border-radius: 16px; background: linear-gradient(140deg, var(--album-color), #e9e8fc); display: grid; place-items: center; position: relative; box-shadow: 0 5px 14px #717bc022; }
.vinyl { width: 27px; height: 27px; position: absolute; right: -7px; bottom: -5px; border: 2px solid #f7f8ff; display: grid; place-items: center; border-radius: 50%; background: repeating-radial-gradient(circle, #3e4260 0 1px, #2e324d 2px 4px); box-shadow: 0 3px 6px #28315430; }
.vinyl-label { display: grid; place-items: center; width: 11px; height: 11px; border-radius: 50%; background: var(--album-color); color: #444d78; font-size: 8px; }
.music-cover > img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
.radio-label { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 9px; font-weight: 600; letter-spacing: 1.8px; color: #969fbd; }
.music-live { display: inline-flex; gap: 5px; align-items: center; font-size: 9px; font-weight: 400; letter-spacing: 0; color: #7d9a96; }
.music-live i { width: 4px; height: 4px; border-radius: 50%; background: #92b5a9; }
.music-info h2 { font-size: 18px; font-weight: 650; letter-spacing: -.3px; color: #53618a; margin: 7px 0 5px; display: block; overflow-wrap: anywhere; }
.music-info p { font-size: 10px; color: #8f98b1; margin: 0; line-height: 1.7; }
.music-info p span { color: #a1a9bc; }
.music-status { display: flex; align-items: center; gap: 7px; font-size: 9px; color: #9ca5bc; margin-top: 8px; }
.music-bars { display: flex; align-items: center; gap: 2px; height: 12px; width: 15px; }
.music-bars i { width: 2px; height: 3px; border-radius: 2px; background: #8f9bdd; }
.music-bars i:nth-child(2), .music-bars i:nth-child(4) { height: 7px; }
.music-controls { min-width: 222px; }
.transport { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.icon-button { display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 4px; border: 0; border-radius: 9px; background: transparent; color: #8e9abd; }
.icon-button:hover { background: #e9edfc; color: #596cc2; }
.icon-button svg { width: 17px; height: 17px; }
.mode-button { position: relative; }
.single-mark { position: absolute; font-size: 8px; color: #6070af; top: 9px; left: 13px; background: #f6f7ff; }
.play-button { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 0; color: white; background: #6879d5; box-shadow: 0 5px 16px #6576d135; }
.play-button:hover { background: #576bc8; }
.play-button svg { width: 21px; height: 21px; }
.music-settings { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 9px; }
.mode-label { font-size: 9px; color: #949fb8; }
.volume-control { display: flex; align-items: center; gap: 6px; }
.volume-control .icon-button { width: 24px; height: 24px; padding: 3px; }
.volume-control input { width: 72px; height: 3px; accent-color: #8e9adb; cursor: pointer; }
.music-progress { display: flex; gap: 12px; align-items: center; margin-top: 19px; }
.music-progress > span { font: 10px Consolas, monospace; color: #99a2b8; width: 30px; }
.music-progress > span:last-child { text-align: right; }
.music-progress input { appearance: none; -webkit-appearance: none; flex: 1; min-width: 0; height: 4px; margin: 0; border-radius: 4px; background: linear-gradient(to right, #8794d9 var(--progress), #e7eaf4 var(--progress)); cursor: pointer; }
.music-progress input:disabled { cursor: default; opacity: .7; }
.music-progress input::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #8794d9; border: 2px solid white; box-shadow: 0 1px 5px #677bb755; }
.music-progress input::-moz-range-thumb { width: 7px; height: 7px; border-radius: 50%; background: #8794d9; border: 2px solid white; }
.music-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 7px 15px; color: #a6aec1; font-size: 9px; margin-top: 12px; line-height: 1.6; }
.music-bottom a { color: #95a0bf; text-decoration: none; }
.music-bottom a:hover { color: #6478c7; }
.music-message { color: #af805e; font-size: 11px; margin: 12px 0 0; line-height: 1.7; }
.music-playlist { border-top: 1px solid #e6eaf6; margin-top: 16px; padding-top: 16px; }
.playlist-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.playlist-heading h3 { margin: 0; font-size: 11px; font-weight: 500; color: #7f8bab; }
.playlist-heading > span { color: #a3abc1; font-size: 9px; }
.music-playlist ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; list-style: none; padding: 0; margin: 0; }
.music-playlist li { min-width: 0; }
.music-playlist li button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e8ecf7; background: #ffffffb8; text-align: left; color: #91a0bf; }
.music-playlist li button.selected { border-color: #cfd8f5; background: #edf1ffb0; }
.music-playlist li button:hover { border-color: #b9c6ed; }
.track-art { position: relative; width: 38px; height: 38px; flex-shrink: 0; }
.track-art img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.track-number { position: absolute; right: -3px; bottom: -3px; color: #7f8eb8; background: #f7f9ff; border-radius: 4px; padding: 1px 3px; font: 8px Consolas, monospace; }
.track-copy { display: grid; gap: 5px; min-width: 0; flex: 1; }
.track-copy strong { color: #7181ae; font-size: 11px; font-weight: 500; overflow-wrap: anywhere; }
.track-copy small { color: #a0aabd; font-size: 9px; }
.track-duration { color: #a6afc2; font: 9px Consolas, monospace; }
.track-indicator { width: 10px; color: #8898ce; font-size: 8px; }
.music-spinner { width: 16px; height: 16px; border: 2px solid #ffffff55; border-top-color: white; border-radius: 50%; }
@keyframes vinyl-turn { to { transform: rotate(360deg); } }
@keyframes music-pulse { 50% { transform: scaleY(1.7); } }
@media (prefers-reduced-motion: no-preference) {
  .is-playing .vinyl { animation: vinyl-turn 12s linear infinite; }
  .is-playing .music-bars i { animation: music-pulse .8s ease-in-out infinite alternate; }
  .is-playing .music-bars i:nth-child(2) { animation-delay: -.3s; }
  .is-playing .music-bars i:nth-child(3) { animation-delay: -.5s; }
  .motion-paused .vinyl, .motion-paused .music-bars i { animation-play-state: paused; }
  .music-spinner { animation: vinyl-turn .9s linear infinite; }
  .icon-button, .play-button, .music-playlist li button { transition: background .2s ease, border-color .2s ease, transform .2s ease; }
  .play-button:active { transform: scale(.93); }
  .playlist-enter-active, .playlist-leave-active { transition: opacity .18s ease, transform .18s ease; }
  .playlist-enter-from, .playlist-leave-to { opacity: 0; transform: translateY(-6px); }
}
@media (max-width: 760px) {
  .music-player { padding: 20px 20px 15px; }
  .music-main { grid-template-columns: 60px minmax(0, 1fr); gap: 16px; }
  .music-cover { width: 60px; height: 60px; border-radius: 13px; }
  .vinyl { width: 24px; height: 24px; }
  .vinyl-label { width: 10px; height: 10px; font-size: 7px; }
  .radio-label { gap: 8px; font-size: 8px; }
  .music-info h2 { font-size: 17px; }
  .music-controls { grid-column: 1 / -1; width: 100%; min-width: 0; padding: 1px 8px 0; }
  .transport { justify-content: center; gap: clamp(12px, 6vw, 25px); }
  .music-settings { margin-top: 6px; }
  .music-playlist ol { grid-template-columns: 1fr; }
  .music-status { font-size: 8px; }
  .music-bottom { font-size: 8px; }
}
</style>


