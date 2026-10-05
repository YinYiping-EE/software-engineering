<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {locale, t} from './locale.js';
import cloudIcon from './assets/branding/alibabacloud.svg';

const data = ref(null);
const state = ref('loading');
const busy = ref(false);
const latency = ref(null);
let timer;
let controller;
let disposed = false;
const label = computed(() => t(state.value === 'online' ? '服务在线' :
  state.value === 'offline' ? '状态暂不可用' : '正在读取服务器状态'));
const local = computed(() => data.value?.provider === 'local');
const updated = computed(() => data.value ? new Intl.DateTimeFormat(locale.value,
  {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}).format(new Date(data.value.sampledAt)) : t('尚无数据'));
const cpu = computed(() => data.value?.cpu.percent == null ? '—' : `${data.value.cpu.percent.toFixed(1)}%`);
const memory = computed(() => data.value?.memory.percent == null ? '—' : `${data.value.memory.percent.toFixed(1)}%`);
function gib(bytes) { return (bytes / 1024 ** 3).toFixed(2); }
const uptime = computed(() => {
  if (!data.value) return '—';
  const minutes = Math.floor(data.value.uptimeSeconds / 60);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes % 1440 / 60);
  return `${days} ${t('天')} ${hours} ${t('小时')} ${minutes % 60} ${t('分钟')}`;
});
async function refresh() {
  if (busy.value || disposed) return;
  busy.value = true;
  controller = new AbortController();
  const started = performance.now();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('/api/status', {cache: 'no-store', signal: controller.signal});
    if (!response.ok) throw new Error('Status unavailable');
    const snapshot = await response.json();
    if (!snapshot.success || snapshot.status !== 'online') throw new Error('Invalid status');
    if (disposed) return;
    latency.value = Math.round(performance.now() - started);
    data.value = snapshot;
    state.value = 'online';
  } catch {
    if (!disposed) state.value = 'offline';
  } finally {
    clearTimeout(timeout);
    if (!disposed) busy.value = false;
  }
}
function onVisibilityChange() { if (!document.hidden) refresh(); }
onMounted(() => {
  refresh();
  timer = setInterval(() => { if (!document.hidden) refresh(); }, 30_000);
  document.addEventListener('visibilitychange', onVisibilityChange);
});
onUnmounted(() => {
  disposed = true;
  clearInterval(timer);
  controller?.abort();
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>

<template>
  <section class="server-card" :class="{'is-stale': state === 'offline'}" :aria-label="t('服务器状态')">
    <div class="server-heading">
      <div class="cloud-brand"><img :src="cloudIcon" alt="Alibaba Cloud" width="34" height="34" />
        <div><h2>{{ t('阿里云服务器') }}</h2><p>{{ t('基于阿里云服务器部署，计算与记录由云端服务提供。') }}</p></div>
      </div>
      <span class="server-badge" :class="state" role="status"><i aria-hidden="true"></i>{{ label }}</span>
    </div>
    <p v-if="local" class="local-preview">{{ t('当前为本机开发预览，以下展示本机服务状态。') }}</p>
    <div class="server-metrics">
      <div class="server-metric"><span>{{ t('CPU 使用率') }}</span><strong>{{ cpu }}</strong>
        <small v-if="data">{{ data.cpu.cores }} {{ t('核') }}</small>
        <meter min="0" max="100" :value="data?.cpu.percent ?? 0" :aria-label="t('CPU 使用率')" /></div>
      <div class="server-metric"><span>{{ t('内存占用') }}</span><strong>{{ memory }}</strong>
        <small v-if="data">{{ gib(data.memory.usedBytes) }} / {{ gib(data.memory.totalBytes) }} GiB</small>
        <meter min="0" max="100" :value="data?.memory.percent ?? 0" :aria-label="t('内存占用')" /></div>
      <div class="server-metric"><span>{{ t('运行时间') }}</span><strong class="uptime-value">{{ uptime }}</strong><small>{{ local ? t('本机开发服务') : 'Ubuntu 24.04' }}</small></div>
      <div class="server-metric"><span>{{ t('响应耗时') }}</span><strong>{{ latency === null ? '—' : `${latency} ms` }}</strong><small>{{ t('记录服务') }}</small></div>
    </div>
    <div class="server-footer"><span>{{ t('每 30 秒更新 · CPU 为采样区间平均值') }}</span>
      <div><time v-if="data" :datetime="data.sampledAt">{{ t(state === 'offline' ? '上次数据' : '最近更新') }} {{ updated }}</time>
        <button type="button" :disabled="busy" :aria-label="t('更新状态')" @click="refresh" @keydown.stop>↻ {{ t('刷新') }}</button></div>
    </div>
  </section>
</template>

<style scoped>
.server-card { margin-top: 26px; padding: 23px 26px 17px; border: 1px solid #e4e8f2; border-radius: 18px; background: #ffffffed; }
.server-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.cloud-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.cloud-brand img { flex-shrink: 0; padding: 4px; width: 38px; height: 38px; background: #fff4e9; border-radius: 10px; }
.cloud-brand h2 { font-size: 14px; color: #58678b; }
.cloud-brand p { color: #929eb4; font-size: 10px; line-height: 1.7; margin: 6px 0 0; }
.server-badge { display: flex; align-items: center; gap: 6px; flex-shrink: 0; color: #929ab0; padding: 6px 9px; background: #f3f5f9; border-radius: 20px; font-size: 10px; }
.server-badge i { width: 5px; height: 5px; background: currentColor; border-radius: 50%; }
.server-badge.online { color: #5f9985; background: #edf7f1; }
.server-badge.offline { color: #b57d63; background: #fcf2ed; }
.local-preview { font-size: 10px; color: #aa8666; line-height: 1.7; margin: 14px 0 0; }
.server-metrics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; margin-top: 20px; }
.server-metric { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px; background: #f7f9fd; border: 1px solid #edf0f6; border-radius: 11px; min-width: 0; }
.server-metric > span { font-size: 10px; color: #97a2b7; }
.server-metric strong { font-size: 21px; color: #6677ad; font-weight: 600; overflow-wrap: anywhere; }
.server-metric strong.uptime-value { font-size: 15px; line-height: 1.8; }
.server-metric small { font-size: 9px; color: #a1aabd; }
.server-metric meter { width: 100%; height: 5px; margin-top: 3px; }
meter::-webkit-meter-bar { background: #e8edf7; border: 0; border-radius: 6px; }
meter::-webkit-meter-optimum-value { background: #98a6dc; border-radius: 6px; }
meter::-moz-meter-bar { background: #98a6dc; }
.is-stale .server-metrics { opacity: .55; }
.server-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px 15px; flex-wrap: wrap; font-size: 9px; color: #a1aabd; margin-top: 14px; line-height: 1.8; }
.server-footer > div { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.server-footer button { border: 0; color: #8696c3; background: transparent; font-size: 10px; padding: 4px 0; }
@media (max-width:760px) {
  .server-card { padding: 20px; }
  .server-heading { flex-wrap: wrap; }
  .server-metrics { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
  .server-metric { padding: 12px; }
  .cloud-brand p { font-size: 9px; }
}
</style>
