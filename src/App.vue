<script setup>
import {locale, t, toggleLocale} from './locale.js';
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue';
import AmbientEffects from './AmbientEffects.vue';
import CalculatorWhale from './CalculatorWhale.vue';
import MusicPlayer from './MusicPlayer.vue';
import ServerStatus from './ServerStatus.vue';
import PageSwitcher from './PageSwitcher.vue';
import collegeLogo from './assets/branding/mu-fzu.png';

const expression = ref('');
const calculation = ref(null);
const justCalculated = ref(false);
const busy = ref(false);
const error = ref('');
const history = ref([]);
const total = ref(0);
const historyLoading = ref(false);
const historyError = ref('');
const deletingId = ref(null);
const connected = ref(null);
const activeKey = ref('');
const keyPulse = ref(0);
const toast = ref('');
const recentId = ref(null);
const effectsEnabled = ref(true);
let toastTimer;
let highlightTimer;
let historyRequest = 0;
const keys = ['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '00', '0', '.', '+'];
const result = computed(() => calculation.value?.result ?? '0');
const saved = computed(() => Boolean(calculation.value?.id));
const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, {
  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}));

function edit() {
  calculation.value = null;
  justCalculated.value = false;
  error.value = '';
}
function keyPress(key) {
  if (busy.value) return;
  activeKey.value = key;
  keyPulse.value++;
  if (key === 'C') { expression.value = ''; edit(); return; }
  if (key === '⌫') { expression.value = expression.value.slice(0, -1); edit(); return; }
  const prefix = justCalculated.value ? ('+−×÷'.includes(key) ? result.value : '') : expression.value;
  if ((prefix + key).length <= 200) expression.value = prefix + key;
  edit();
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.value = message;
  toastTimer = setTimeout(() => { toast.value = ''; }, 2400);
}

async function focusInput() {
  if (busy.value) return;
  await nextTick();
  const input = document.getElementById('expression');
  input?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
  input?.focus({preventScroll: true});
}
function useWhaleExample(value) {
  if (busy.value) return;
  expression.value = value;
  edit();
  focusInput();
}

async function loadHistory(append = false) {
  const request = ++historyRequest;
  historyLoading.value = true;
  historyError.value = '';
  try {
    const offset = append ? history.value.length : 0;
    const response = await fetch(`/api/calculations?limit=20&offset=${offset}`, {
      cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Could not read history');
    const data = await response.json();
    if (request !== historyRequest) return;
    history.value = append ? [...history.value, ...data.items] : data.items;
    total.value = data.total;
    connected.value = true;
  } catch {
    if (request !== historyRequest) return;
    connected.value = false;
    historyError.value = '暂时无法读取记录，请检查后端服务后重试。';
  } finally {
    if (request === historyRequest) historyLoading.value = false;
  }
}

async function submit() {
  if (busy.value || !expression.value.trim()) return;
  busy.value = true;
  error.value = '';
  try {
    const response = await fetch('/api/calculations', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Calculator-Request': '1'},
      body: JSON.stringify({expression: expression.value}),
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    connected.value = true;
    if (!response.ok) { error.value = data.message || '计算失败，请重试'; return; }
    calculation.value = data;
    justCalculated.value = true;
    recentId.value = data.id;
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => { recentId.value = null; }, 2600);
    notify('计算完成，记录已保存');
    await loadHistory();
  } catch {
    connected.value = false;
    error.value = '无法连接记录服务，请确认前后端已启动。';
  } finally {
    busy.value = false;
  }
}

function reuse(item) {
  if (busy.value) return;
  expression.value = item.expression;
  calculation.value = item;
  justCalculated.value = true;
  error.value = '';
  notify('已复用算式，可继续编辑计算');
}
async function remove(item) {
  if (deletingId.value) return;
  deletingId.value = item.id;
  historyError.value = '';
  try {
    const response = await fetch(`/api/calculations/${item.id}`, {
      method: 'DELETE', headers: {'X-Calculator-Request': '1'}, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Could not delete history item');
    if (calculation.value?.id === item.id) calculation.value = {...calculation.value, id: null};
    await loadHistory();
    notify('这条记录已删除');
  } catch {
    historyError.value = '删除失败，请稍后重试。';
  } finally {
    deletingId.value = null;
  }
}
function onKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey ||
      (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
  if (/^[0-9.+\-*/()]$/.test(event.key)) {
    event.preventDefault();
    keyPress(({'-': '−', '*': '×', '/': '÷'})[event.key] || event.key);
  } else if (event.key === 'Escape') { event.preventDefault(); keyPress('C'); }
  else if (event.key === 'Backspace') { event.preventDefault(); keyPress('⌫'); }
  else if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
    event.preventDefault(); submit();
  }
}
onMounted(() => { loadHistory(); window.addEventListener('keydown', onKeydown); });
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  clearTimeout(toastTimer);
  clearTimeout(highlightTimer);
});
</script>

<template>
  <AmbientEffects :enabled="effectsEnabled" />
  <CalculatorWhale :total="total" :calculation="calculation" :busy="busy" :error="error"
    :connected="connected" :animated="effectsEnabled" @example="useWhaleExample" @focus-input="focusInput" />
  <div class="page">
    <header class="header">
      <a class="brand" href="https://miec.fzu.edu.cn/" target="_blank" rel="noopener noreferrer"
        :aria-label="t('福州大学梅努斯国际工程学院')"><img class="college-logo" :src="collegeLogo" :alt="t('福州大学梅努斯国际工程学院')" /></a>
      <div class="header-actions">
        <div class="service-status" :class="{offline: connected === false}"><span aria-hidden="true"></span>{{ t(connected === true ? '记录服务已连接' : connected === false ? '记录服务未连接' : '正在连接记录服务') }}</div>
        <button class="language-toggle" type="button" :aria-label="locale === 'en' ? '切换至中文' : 'Switch to English'"
          @click="toggleLocale" @keydown.stop><span aria-hidden="true">◎</span><span :lang="locale === 'en' ? 'zh-CN' : 'en'">{{ locale === 'en' ? '中文' : 'English' }}</span></button>
      </div>
    </header>
    <PageSwitcher />
    <main>
      <section class="intro"><span class="eyebrow">CALCULATE. KEEP. REVISIT.</span><h1> {{ t('每一次计算，都有记录。') }} </h1><p> {{ t('专注于计算，结果自动保存。需要时，随时回来查看。') }} </p></section>
      <MusicPlayer :animated="effectsEnabled" />
      <div class="workspace">
        <section class="calculator" :aria-label="t('计算器')">
          <div class="section-top"><h2> {{ t('计算器') }} </h2><span class="subtle"> {{ t('四则运算 · 括号') }} </span></div>
          <div class="display" :class="{'is-busy': busy, 'has-error': error}">
            <label for="expression"> {{ t('输入算式') }} </label>
            <input id="expression" v-model="expression" type="text" autocomplete="off" spellcheck="false" maxlength="200" placeholder="0" :disabled="busy" aria-describedby="expression-help" @input="edit" @keydown.enter.prevent="submit" @keydown.esc.prevent="keyPress('C')">
            <div class="result-row"><span class="equals" aria-hidden="true">=</span><output :class="{muted: !calculation}" aria-live="polite"><Transition name="result" mode="out-in"><span :key="calculation?.id || result" class="result-value">{{ t(result) }}</span></Transition></output></div>
            <div class="display-note" :class="{error: error}" role="status">{{ t(error || (busy ? '正在计算并保存…' : saved ? '✓ 已保存到历史记录' : '支持键盘输入，按 Enter 计算')) }}</div>
          </div>
          <div class="keypad">
            <button v-for="key in keys" :key="key" type="button" :class="{operator: ['÷', '×', '−', '+'].includes(key), utility: ['C', '(', ')', '⌫'].includes(key), clear: key === 'C'}" :aria-label="t(key === '⌫' ? '退格' : key === 'C' ? '清空算式' : key)" :disabled="busy" @click="keyPress(key)"><span>{{ t(key) }}</span><span v-if="activeKey === key" :key="keyPulse" class="key-ripple" aria-hidden="true"></span></button>
            <button class="calculate-button" type="button" :class="{'is-busy': busy}" :disabled="busy || !expression.trim()" @click="submit">{{ t(busy ? '计算中…' : '计算并保存') }}<span v-if="busy" class="spinner" aria-hidden="true"></span><span v-else aria-hidden="true">=</span></button>
          </div>
          <p id="expression-help" class="calculator-hint"> {{ t('先乘除，后加减。小数结果按最多 15 位有效数字显示。') }} </p>
        </section>
        <section class="history-panel" :aria-label="t('历史记录')">
          <div class="section-top"><h2> {{ t('历史记录') }} <Transition name="count" mode="out-in"><span :key="total" class="count">{{ t(total) }}</span></Transition></h2><button class="text-button refresh-button" :disabled="historyLoading" type="button" @click="loadHistory()"><span class="refresh-icon" :class="{spinning: historyLoading}" aria-hidden="true">↻</span>{{ t(historyLoading ? '读取中…' : '刷新') }}</button></div>
          <p class="history-intro"> {{ t('仅此浏览器可查看自己的记录，包含访问来源。') }} </p>
          <p v-if="historyError" class="history-error" role="alert">{{ t(historyError) }}</p>
          <div v-if="!history.length" class="empty-state">
            <span class="empty-symbol" aria-hidden="true">↺</span>
            <h3>{{ t(historyLoading ? '正在读取记录' : historyError ? '暂时无法加载' : '你的第一条记录，等你开始') }}</h3>
            <p>{{ t(historyError ? '点击上方“刷新”重试。' : '输入算式，点击“计算并保存”。') }}</p>
          </div>
          <TransitionGroup name="record" tag="ol" class="history-list" appear>
            <li v-for="item in history" :key="item.id" class="history-item" :class="{'is-new': recentId === item.id, 'is-selected': calculation?.id === item.id}" :data-record-id="item.id">
              <div class="history-meta"><time :datetime="item.createdAt">{{ t(timeFormatter.format(new Date(item.createdAt))) }}</time><button type="button" class="delete-button" :disabled="Boolean(deletingId)" :aria-label="t('删除这条记录')" :title="t('删除这条记录')" @click="remove(item)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg></button></div>
              <button type="button" class="reuse-button" :disabled="busy" :title="t('点击复用这条算式')" @click="reuse(item)"><span class="history-expression">{{ t(item.expression) }}</span><strong>= {{ t(item.result) }}</strong><span class="reuse-label"> {{ t('复用算式 ↗') }} </span></button>
              <div v-if="item.client" class="record-source" :aria-label="t('记录访问来源')">
                <div class="source-location"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span> {{ t('访问地') }} </span><strong>{{ t(item.client.location) }}</strong><span v-if="item.client.locationType === 'estimated'" class="estimate-badge" :title="t('根据 IP 数据库估算，可能与实际所在地不同')"> {{ t('估算') }} </span></div>
                <div class="source-ip"><span>IP</span><code>{{ t(item.client.ip || '未知') }}</code></div>
                <div class="source-agent"><span>{{ t(item.client.device) }}</span><span>{{ t(item.client.os) }}</span><span>{{ t(item.client.browser) }}</span></div>
              </div>
              <div v-else class="legacy-source"> {{ t('访问地 / IP / 设备：来源未记录（旧记录）') }} </div>
            </li>
          </TransitionGroup>
          <p class="source-hint"> {{ t('来源按提交计算时记录；IP 归属地为估算位置。') }} </p>
          <button v-if="history.length < total" type="button" class="load-more" :disabled="historyLoading" @click="loadHistory(true)">{{ t(historyLoading ? '读取中…' : '加载更多记录') }}</button>
        </section>
      </div>
      <ServerStatus />
    </main>
    <footer>
      <div class="footer-details"><span> {{ t('算数记 · 让结果留得住') }} </span><span class="asset-credit"> {{ t('背景') }} <a href="https://heropatterns.com/" target="_blank" rel="noopener noreferrer">Plus · Steve Schoger</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> {{ t('（调色）') }} </span><span class="asset-credit"> {{ t('原版形象来自') }} <a href="https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget" target="_blank" rel="noopener noreferrer">MeteorNOX / Whale Widget</a> · <a href="/third-party/whale-widget/PROVENANCE.md" target="_blank" rel="noopener noreferrer"> {{ t('素材说明') }} </a></span></div>
      <button class="effects-toggle" type="button" :aria-pressed="!effectsEnabled" @click="effectsEnabled = !effectsEnabled">{{ t(effectsEnabled ? '暂停背景与点击动效' : '开启背景与点击动效') }}</button>
    </footer>
    <Transition name="toast"><div v-if="toast" class="toast" role="status"><span aria-hidden="true">✓</span>{{ t(toast) }}</div></Transition>
  </div>
</template>
