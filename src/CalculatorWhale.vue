<script setup>
import {t} from './locale.js';
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import originalWhale from './assets/original-whale.png';

const props = defineProps({
  total: {type: Number, default: 0},
  calculation: {type: Object, default: null},
  busy: {type: Boolean, default: false},
  error: {type: String, default: ''},
  connected: {type: Boolean, default: null},
  animated: {type: Boolean, default: true},
});
const emit = defineEmits(['example', 'focus-input']);
const position = ref({x: 0, y: 0});
const viewport = ref({width: 0, height: 0, offsetX: 0, offsetY: 0});
const artSize = ref(132);
const size = computed(() => ({width: artSize.value, height: artSize.value + 26}));
const side = ref('right');
const visible = ref(false);
const collapsed = ref(false);
const open = ref(false);
const pressed = ref(false);
const dragging = ref(false);
const hintIndex = ref(0);
const storageKey = 'calculator-whale-layout-v1';
let gesture = null;
let suppressClick = false;
let bubbleTimer;
let dragClickTimer;
const hints = [
  '先乘除，后加减；括号里的先算。',
  '按 Enter 计算，按 Escape 清空。',
  '点击历史算式，就能拿回来继续算。',
  '记录由后端保存，刷新网页也不会丢。',
];
const examples = ['(12+8)÷4', '0.1+0.2', '3×(-2)+8', '(18+24)×2'];
const mood = computed(() => props.busy ? 'busy' : props.error ? 'error' :
  props.connected === false ? 'offline' : props.calculation?.id ? 'success' : 'idle');
const heading = computed(() => ({busy: '让我等一下结果…', error: '这个算式需要检查一下',
  offline: '记录服务暂时没连上', success: '结果收到啦！', idle: '你好，我是算数鲸'}[mood.value]));
const bubbleWidth = computed(() => Math.min(viewport.value.width - 24, Math.max(220, Math.min(280, artSize.value * 1.8))));
const bubbleStyle = computed(() => {
  const ideal = side.value === 'left' ? position.value.x : position.value.x + size.value.width - bubbleWidth.value;
  const left = Math.max(viewport.value.offsetX + 12, Math.min(ideal,
    viewport.value.offsetX + viewport.value.width - bubbleWidth.value - 12));
  const availableHeight = bubbleBelow.value ? viewport.value.offsetY + viewport.value.height -
    position.value.y - size.value.height - 20 : position.value.y - viewport.value.offsetY - 20;
  return {width: `${bubbleWidth.value}px`, left: `${left - position.value.x}px`, maxHeight: `${Math.max(0, availableHeight)}px`};
});
const bubbleBelow = computed(() => position.value.y - viewport.value.offsetY < (viewport.value.height - size.value.height) / 2);
const badge = computed(() => props.busy ? '计算中' : props.connected === false ? '等待连接' :
  props.calculation ? `= ${props.calculation.result}` : `${props.total} 条记录`);

function keepInView(x, y) {
  position.value = {
    x: Math.max(viewport.value.offsetX + 8, Math.min(x, viewport.value.offsetX + viewport.value.width - size.value.width - 8)),
    y: Math.max(viewport.value.offsetY + 8, Math.min(y, viewport.value.offsetY + viewport.value.height - size.value.height - 8)),
  };
  side.value = position.value.x + size.value.width / 2 < viewport.value.offsetX + viewport.value.width / 2 ? 'left' : 'right';
}
function measure() {
  const visual = window.visualViewport;
  viewport.value = {
    width: Math.round(Math.min(document.documentElement.clientWidth, visual?.width ?? Infinity)),
    height: Math.round(Math.min(document.documentElement.clientHeight, visual?.height ?? Infinity)),
    offsetX: visual?.offsetLeft ?? 0, offsetY: visual?.offsetTop ?? 0,
  };
  // Use actual CSS dimensions, so drag bounds and restored positions follow the resized artwork.
  artSize.value = Math.round(Math.max(72, Math.min(160, viewport.value.width * .2, viewport.value.height * .18)));
}
function saveLayout() {
  // This stores only widget preferences; calculation history always stays in SQLite.
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      x: (position.value.x - viewport.value.offsetX) / Math.max(1, viewport.value.width - size.value.width),
      y: (position.value.y - viewport.value.offsetY) / Math.max(1, viewport.value.height - size.value.height),
      collapsed: collapsed.value,
    }));
  } catch { /* The widget also works when browser storage is unavailable. */ }
}
function snapToEdge() {
  let {x, y} = position.value;
  if (x - viewport.value.offsetX < 48) x = viewport.value.offsetX + 8;
  else if (viewport.value.offsetX + viewport.value.width - size.value.width - x < 48) x = viewport.value.offsetX + viewport.value.width - size.value.width - 8;
  if (y - viewport.value.offsetY < 30) y = viewport.value.offsetY + 8;
  else if (viewport.value.offsetY + viewport.value.height - size.value.height - y < 40) y = viewport.value.offsetY + viewport.value.height - size.value.height - 8;
  keepInView(x, y);
  saveLayout();
}
function onResize() {
  const ratioX = (position.value.x - viewport.value.offsetX) / Math.max(1, viewport.value.width - size.value.width);
  const ratioY = (position.value.y - viewport.value.offsetY) / Math.max(1, viewport.value.height - size.value.height);
  measure();
  keepInView(viewport.value.offsetX + ratioX * (viewport.value.width - size.value.width),
    viewport.value.offsetY + ratioY * (viewport.value.height - size.value.height));
}
function showBubble(autoClose = false) {
  clearTimeout(bubbleTimer);
  if (collapsed.value) return;
  open.value = true;
  if (autoClose) bubbleTimer = setTimeout(() => { open.value = false; }, 7000);
}
function toggleBubble(event) {
  if (event.detail > 0 && suppressClick) { suppressClick = false; return; }
  clearTimeout(bubbleTimer);
  if (!open.value) hintIndex.value++;
  open.value = !open.value;
}
function closeBubble() { clearTimeout(bubbleTimer); open.value = false; }
function minimize() { closeBubble(); collapsed.value = true; saveLayout(); }
function restore() { collapsed.value = false; showBubble(); saveLayout(); }
function insertExample() {
  if (props.busy) return;
  emit('example', examples[hintIndex.value % examples.length]);
  hintIndex.value++;
  closeBubble();
}
function onPointerdown(event) {
  if (event.button !== 0 || !event.isPrimary) return;
  suppressClick = false;
  pressed.value = true;
  gesture = {pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    startX: position.value.x, startY: position.value.y, moved: false};
  event.currentTarget.setPointerCapture(event.pointerId);
}
function onPointermove(event) {
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (Math.hypot(dx, dy) > 6) gesture.moved = true;
  if (!gesture.moved) return;
  dragging.value = true;
  closeBubble();
  keepInView(gesture.startX + dx, gesture.startY + dy);
}
function finishPointer(event) {
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const moved = gesture.moved;
  suppressClick = gesture.moved || event.type === 'pointercancel';
  clearTimeout(dragClickTimer);
  dragClickTimer = setTimeout(() => { suppressClick = false; }, 250);
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  gesture = null;
  pressed.value = false;
  dragging.value = false;
  if (moved) snapToEdge();
}
function onKeydown(event) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeBubble(); return; }
  const offsets = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
  if (!offsets[event.key]) return;
  event.preventDefault();
  event.stopPropagation();
  const step = event.shiftKey ? 30 : 12;
  const [x, y] = offsets[event.key];
  keepInView(position.value.x + x * step, position.value.y + y * step);
  saveLayout();
}
watch(() => [props.busy, props.error, props.connected, props.calculation?.id], ([busy, error, connected, id], previous) => {
  if (busy || error || connected === false || (id && id !== previous?.[3])) showBubble(!busy);
});
onMounted(() => {
  measure();
  keepInView(viewport.value.offsetX + viewport.value.width - size.value.width - 16,
    viewport.value.offsetY + viewport.value.height - size.value.height - 18);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) &&
        saved.x >= 0 && saved.x <= 1 && saved.y >= 0 && saved.y <= 1) {
      keepInView(viewport.value.offsetX + saved.x * (viewport.value.width - size.value.width),
        viewport.value.offsetY + saved.y * (viewport.value.height - size.value.height));
      collapsed.value = saved.collapsed === true;
    }
  } catch { /* Ignore invalid or inaccessible widget preferences. */ }
  visible.value = true;
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('scroll', onResize);
});
onUnmounted(() => {
  clearTimeout(bubbleTimer);
  clearTimeout(dragClickTimer);
  window.removeEventListener('resize', onResize);
  window.visualViewport?.removeEventListener('resize', onResize);
  window.visualViewport?.removeEventListener('scroll', onResize);
});
</script>

<template>
  <aside class="whale-widget" :aria-label="t('算数鲸计算助手')"
    :class="[mood, {ready: visible, 'is-left': side === 'left', 'is-pressed': pressed,
      'is-dragging': dragging, 'is-collapsed': collapsed, 'motion-paused': !animated}]"
    :style="{left: `${position.x}px`, top: `${position.y}px`, '--whale-size': `${artSize}px`}" @keydown.esc.stop.prevent="closeBubble">
    <button v-if="collapsed" class="whale-restore" type="button" @click="restore"> {{ t('🐋 唤醒算数鲸') }} </button>
    <template v-else>
      <Transition name="whale-bubble">
        <section v-if="open" class="whale-bubble" :class="{'bubble-below': bubbleBelow}" :style="bubbleStyle" :aria-label="t('算数鲸提示')">
          <div class="bubble-heading"><span> {{ t('算数鲸 · 计算小助手') }} </span><button type="button" :aria-label="t('关闭算数鲸提示')" @click="closeBubble">×</button></div>
          <h3>{{ t(heading) }}</h3>
          <p v-if="error" class="whale-message error-message" role="status">{{ t(error) }}</p>
          <p v-else-if="busy" class="whale-message" role="status"> {{ t('正在请后端计算并保存，马上回来。') }} </p>
          <p v-else-if="connected === false" class="whale-message"> {{ t('先检查后端连接，连上后我再帮你记。') }} </p>
          <div v-else-if="calculation" class="whale-answer">
            <span>{{ t(calculation.expression) }}</span>
            <strong :title="t(calculation.result)">= {{ t(calculation.result) }}</strong>
            <small>{{ t(calculation.id ? '✓ 这条结果已保存' : '这条记录已删除，结果仍可查看') }}</small>
          </div>
          <p v-else class="whale-message"> {{ t('你来出题，我帮你盯着结果和记录。') }} </p>
          <div class="whale-record-count"><span>{{ t(connected === true ? '已保存记录' : '记录服务') }}</span><strong>{{ t(connected === true ? `${total} 条` : connected === false ? '未连接' : '连接中') }}</strong></div>
          <p class="whale-tip">{{ t(hints[hintIndex % hints.length]) }}</p>
          <div class="whale-actions"><button type="button" :disabled="busy" @click="insertExample"> {{ t('试一个算式') }} </button><button type="button" :disabled="busy" @click="closeBubble(); emit('focus-input')"> {{ t('去计算 ↗') }} </button></div>
          <div class="whale-bubble-footer"><span> {{ t('拖动我换位置 · 方向键也可以') }} </span><button type="button" @click="minimize"> {{ t('收起挂件') }} </button></div>
        </section>
      </Transition>
      <button class="whale-character" type="button" :aria-label="t('算数鲸，点击查看提示，可拖动或用方向键移动')"
        :aria-expanded="open" :title="t('点击互动，拖动换位置')" @click="toggleBubble" @keydown="onKeydown"
        @pointerdown="onPointerdown" @pointermove="onPointermove" @pointerup="finishPointer"
        @pointercancel="finishPointer" @lostpointercapture="finishPointer">
        <div class="whale-float"><div class="whale-squish">
          <img class="whale-art" :src="originalWhale" alt="" draggable="false" @dragstart.prevent />
        </div></div>
        <span class="whale-badge" :title="t(badge)"><span class="whale-status-dot" aria-hidden="true"></span>{{ t(badge) }}</span>
      </button>
    </template>
  </aside>
</template>

<style scoped>
.whale-widget { position: fixed; width: var(--whale-size, 132px); height: calc(var(--whale-size, 132px) + 26px); z-index: 30; visibility: hidden; }
.whale-widget.ready { visibility: visible; }
.whale-character { width: 100%; height: 100%; border: 0; background: transparent; padding: 0; display: flex; flex-direction: column; align-items: center; cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; }
.whale-character:active, .is-dragging .whale-character { cursor: grabbing; }
.whale-character:focus-visible { border-radius: 18px; }
.whale-float { width: 100%; height: var(--whale-size, 132px); }
.whale-squish { width: 100%; height: 100%; transform-origin: 50% 100%; }
.whale-art { display: block; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 3px 5px #5263a511); pointer-events: none; }
.is-left .whale-art { transform: scaleX(-1); }
.is-pressed .whale-squish { transform: scale(1.08, .84); }
.whale-badge { display: flex; align-items: center; justify-content: center; gap: 5px; max-width: 100%; height: 22px; padding: 3px 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 10px "Cascadia Code", Consolas, monospace; color: #6773a2; border: 1px solid #dce2f6; border-radius: 20px; background: #fffffff2; box-shadow: 0 3px 12px #5968a60b; }
.whale-status-dot { flex-shrink: 0; width: 5px; height: 5px; background: #8d9cdd; border-radius: 50%; }
.success .whale-status-dot { background: #78b6a2; }
.error .whale-status-dot, .offline .whale-status-dot { background: #d89a83; }
.whale-bubble { position: absolute; bottom: calc(100% + 8px); padding: 15px; border: 1px solid #dde3f5; border-radius: 16px; background: #fffffff7; box-shadow: 0 12px 40px #5265a31c; max-height: calc(100dvh - 160px); overflow: auto; }
.whale-bubble.bubble-below { bottom: auto; top: calc(100% + 8px); }
.bubble-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: #909bbb; font-size: 10px; }
.bubble-heading button { width: 24px; height: 24px; border: 0; background: #f2f4fc; color: #929ebc; border-radius: 50%; font-size: 17px; }
.whale-bubble h3 { font-size: 14px; color: #536394; margin: 9px 0; font-weight: 600; }
.whale-message { font-size: 11px; line-height: 1.8; color: #7d8aaa; margin: 0 0 10px; }
.whale-message.error-message { color: #b7775a; }
.whale-answer { display: grid; gap: 5px; padding: 10px; border-radius: 9px; background: #f2f5ff; overflow-wrap: anywhere; }
.whale-answer > span { color: #7d89a8; font: 11px Consolas, monospace; }
.whale-answer strong { color: #6475c3; font: 600 19px Consolas, monospace; }
.whale-answer small { font-size: 9px; color: #8399a3; }
.whale-record-count { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; color: #8b96af; font-size: 10px; }
.whale-record-count strong { color: #6879ad; font: 600 12px Consolas, monospace; }
.whale-tip { margin: 0 0 11px; color: #9ba4b9; font-size: 10px; line-height: 1.7; }
.whale-actions { display: flex; gap: 7px; }
.whale-actions button { flex: 1; padding: 8px 5px; border-radius: 8px; border: 0; background: #edf0fc; color: #7786be; font-size: 10px; }
.whale-actions button:first-child { background: #6c7cda; color: white; }
.whale-bubble-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 12px; color: #b1b9cc; font-size: 8px; }
.whale-bubble-footer button { padding: 3px 0; background: transparent; border: 0; color: #97a3c2; font-size: 9px; }
.whale-restore { position: absolute; right: 0; bottom: 0; padding: 8px 11px; border: 1px solid #dce2f6; border-radius: 20px; color: #6e7fad; background: #fffffff2; font-size: 10px; white-space: nowrap; }
.is-left .whale-restore { right: auto; left: 0; }
@keyframes whale-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes whale-thinking { 50% { opacity: .35; } }
@media (prefers-reduced-motion: no-preference) {
  .whale-float { animation: whale-float 4s ease-in-out infinite; }
  .whale-squish { transition: transform .2s cubic-bezier(.2,.8,.3,1.6); }
  .whale-art { transition: transform .25s ease; }
  .busy .whale-status-dot { animation: whale-thinking .8s ease-in-out infinite; }
  .motion-paused .whale-float, .motion-paused .whale-status-dot,
  .is-dragging .whale-float { animation-play-state: paused; }
  .whale-bubble-enter-active, .whale-bubble-leave-active { transition: opacity .18s ease, transform .18s ease; }
  .whale-bubble-enter-from, .whale-bubble-leave-to { opacity: 0; transform: translateY(8px) scale(.96); }
}
@media (max-width: 760px) {
  .whale-badge { height: 20px; font-size: 9px; padding: 3px 6px; }
}
</style>


