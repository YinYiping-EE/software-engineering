<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';

const props = defineProps({enabled: {type: Boolean, default: true}});
const reducedMotion = ref(false);
const hidden = ref(false);
const bursts = ref([]);
const timers = new Map();
let preference;
let sequence = 0;
const symbols = ['+', '−', '×', '÷', '=', '(', ')', '+', '×', '=', '÷', '−'];
const backgroundSpeed = 1.3;
const floatingSymbols = symbols.map((symbol, index) => ({
  symbol,
  style: {
    '--left': `${(index * 29 + 8) % 96}%`,
    '--top': `${(index * 37 + 12) % 92}%`,
    '--duration': `${(18 + index % 5 * 4) / backgroundSpeed}s`,
    '--delay': `${-index * 3 / backgroundSpeed}s`,
    '--rotation': `${index % 2 ? -15 : 15}deg`,
    '--size': `${16 + index % 3 * 9}px`,
  },
}));

function clearBursts() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  bursts.value = [];
}
function removeBurst(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  bursts.value = bursts.value.filter((burst) => burst.id !== id);
}
function onPointerdown(event) {
  if (!props.enabled || reducedMotion.value || hidden.value || event.button !== 0 || !event.isPrimary) return;
  // Bound the transient elements even when someone taps very quickly.
  if (bursts.value.length >= 6) removeBurst(bursts.value[0].id);
  const id = ++sequence;
  const isButton = event.target instanceof Element && Boolean(event.target.closest('button'));
  const particles = Array.from({length: 7}, (_, index) => {
    const angle = (index / 7) * Math.PI * 2 + (id % 5) * .2;
    const distance = 28 + index % 3 * 13;
    return {
      symbol: index % 3 === 0 ? symbols[(id + index) % symbols.length] : '',
      style: {
        '--dx': `${Math.cos(angle) * distance}px`,
        '--dy': `${Math.sin(angle) * distance}px`,
        '--turn': `${index % 2 ? -60 : 60}deg`,
        '--particle-color': ['#6575e7', '#aa7bdb', '#4aabad'][index % 3],
      },
    };
  });
  bursts.value.push({id, x: event.clientX, y: event.clientY, isButton, particles});
  timers.set(id, setTimeout(() => removeBurst(id), 850));
}
function onPreferenceChange() {
  reducedMotion.value = preference.matches;
  if (reducedMotion.value) clearBursts();
}
function onVisibilityChange() {
  hidden.value = document.hidden;
  if (hidden.value) clearBursts();
}
watch(() => props.enabled, (enabled) => { if (!enabled) clearBursts(); });
onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  onPreferenceChange();
  onVisibilityChange();
  preference.addEventListener('change', onPreferenceChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('pointerdown', onPointerdown, {passive: true});
});
onUnmounted(() => {
  clearBursts();
  preference?.removeEventListener('change', onPreferenceChange);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.removeEventListener('pointerdown', onPointerdown);
});
</script>

<template>
  <div class="ambient-scene" :class="{'is-paused': !enabled || hidden || reducedMotion}" aria-hidden="true">
    <div class="ambient-orb orb-indigo"></div>
    <div class="ambient-orb orb-mint"></div>
    <div class="ambient-orb orb-rose"></div>
    <div class="ambient-pattern"></div>
    <div class="floating-symbols">
      <span v-for="(item, index) in floatingSymbols" :key="index" class="floating-symbol" :style="item.style">{{ item.symbol }}</span>
    </div>
  </div>
  <div class="click-effects" aria-hidden="true">
    <div v-for="burst in bursts" :key="burst.id" class="click-burst" :class="{'button-burst': burst.isButton}" :style="{left: `${burst.x}px`, top: `${burst.y}px`}">
      <span class="click-ring"></span>
      <span class="click-core"></span>
      <span v-for="(particle, index) in burst.particles" :key="index" class="click-particle" :class="{'symbol-particle': particle.symbol}" :style="particle.style">{{ particle.symbol }}</span>
    </div>
  </div>
</template>

<style scoped>
.ambient-scene { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; background: #f2f4fc; }
.ambient-orb { position: absolute; width: min(75vw, 800px); aspect-ratio: 1; border-radius: 50%; }
.orb-indigo { top: -25%; right: -20%; background: radial-gradient(circle, #aeb9f378 0%, #ccd2fa40 40%, transparent 70%); }
.orb-mint { top: 25%; left: -28%; background: radial-gradient(circle, #a9e6df65 0%, #bfecea30 40%, transparent 70%); }
.orb-rose { bottom: -35%; right: -12%; background: radial-gradient(circle, #dabdf26b 0%, #ecdafa30 40%, transparent 70%); }
.ambient-pattern { position: absolute; inset: -60px; background-image: url('./assets/hero-plus.svg'); background-size: 60px 60px; opacity: .15; }
.floating-symbols { position: absolute; inset: 0; }
.floating-symbol { position: absolute; left: var(--left); top: var(--top); font: 500 var(--size) "Cascadia Code", Consolas, monospace; color: #7c8cc2; opacity: .16; transform: rotate(var(--rotation)); user-select: none; }
.click-effects { position: fixed; inset: 0; z-index: 100; overflow: hidden; pointer-events: none; }
.click-burst { position: absolute; width: 0; height: 0; }
.click-ring { position: absolute; left: -20px; top: -20px; width: 40px; height: 40px; border: 1.5px solid #8393ed; border-radius: 50%; opacity: 0; }
.click-core { position: absolute; left: -12px; top: -12px; width: 24px; height: 24px; background: radial-gradient(circle, #cad2ff9c, transparent 70%); border-radius: 50%; opacity: 0; }
.click-particle { position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; background: var(--particle-color); border-radius: 50%; opacity: 0; }
.symbol-particle { left: -5px; top: -7px; width: 10px; height: 14px; font: 600 13px Consolas, monospace; color: var(--particle-color); background: transparent; border-radius: 0; }
@keyframes orb-flow { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-10%, 12%) scale(1.12); } }
@keyframes pattern-drift { to { transform: translate(60px, 60px); } }
@keyframes symbol-float { 0%, 100% { transform: translateY(0) rotate(var(--rotation)); } 50% { transform: translateY(-38px) rotate(calc(var(--rotation) * -1)); } }
@keyframes click-ring { from { opacity: .65; transform: scale(.2); } to { opacity: 0; transform: scale(1.7); } }
@keyframes click-core { from { opacity: .85; transform: scale(.4); } to { opacity: 0; transform: scale(2.6); } }
@keyframes click-scatter { 0% { opacity: 0; transform: translate(0, 0) scale(.5); } 15% { opacity: .9; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--turn)) scale(.4); } }
@media (prefers-reduced-motion: no-preference) {
  .orb-indigo { animation: orb-flow calc(22s / 1.3) ease-in-out infinite; }
  .orb-mint { animation: orb-flow calc(28s / 1.3) calc(-9s / 1.3) ease-in-out infinite reverse; }
  .orb-rose { animation: orb-flow calc(26s / 1.3) calc(-17s / 1.3) ease-in-out infinite; }
  .ambient-pattern { animation: pattern-drift calc(36s / 1.3) linear infinite; }
  .floating-symbol { animation: symbol-float var(--duration) var(--delay) ease-in-out infinite; }
  .is-paused .ambient-orb, .is-paused .ambient-pattern, .is-paused .floating-symbol { animation-play-state: paused; }
  .click-ring { animation: click-ring .65s ease-out both; }
  .click-core { animation: click-core .5s ease-out both; }
  .click-particle { animation: click-scatter .8s cubic-bezier(.15,.65,.3,1) both; }
}
</style>
