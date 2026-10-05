import {ref, watch} from 'vue';

export const locale = ref('zh-CN');
try { if (localStorage.getItem('calculator-language') === 'en') locale.value = 'en'; }
catch { /* Language switching works without storage. */ }
const english = {
  '页面切换': 'Switch pages', '项目展示': 'Project showcase',
  '算数记': 'Calc Journal', '算数记 · 让结果留得住': 'Calc Journal · Keep every result',
  '记录服务已连接': 'History service connected', '记录服务未连接': 'History service disconnected', '正在连接记录服务': 'Connecting to history service',
  '每一次计算，都有记录。': 'Every calculation, remembered.', '专注于计算，结果自动保存。需要时，随时回来查看。': 'Focus on your calculations. Results are saved for whenever you need them.',
  '计算器': 'Calculator', '四则运算 · 括号': 'Arithmetic · Parentheses', '输入算式': 'Enter an expression',
  '正在计算并保存…': 'Calculating and saving…', '✓ 已保存到历史记录': '✓ Saved to history', '支持键盘输入，按 Enter 计算': 'Type with your keyboard. Press Enter to calculate.',
  '退格': 'Backspace', '清空算式': 'Clear expression', '计算中…': 'Calculating…', '计算并保存': 'Calculate & save',
  '先乘除，后加减。小数结果按最多 15 位有效数字显示。': 'Multiplication and division first. Results use up to 15 significant digits.',
  '历史记录': 'History', '读取中…': 'Loading…', '刷新': 'Refresh', '仅此浏览器可查看自己的记录，包含访问来源。': 'Only this browser can view its records, including access details.',
  '正在读取记录': 'Loading your history', '暂时无法加载': 'Unable to load right now', '你的第一条记录，等你开始': 'Your first calculation starts here',
  '点击上方“刷新”重试。': 'Click Refresh above to try again.', '输入算式，点击“计算并保存”。': 'Enter an expression and click Calculate & save.',
  '删除这条记录': 'Delete this record', '点击复用这条算式': 'Click to reuse this expression', '复用算式 ↗': 'Reuse expression ↗',
  '记录访问来源': 'Record access details', '访问地': 'Location', '根据 IP 数据库估算，可能与实际所在地不同': 'Estimated from an IP database; may differ from the actual location', '估算': 'Estimated', '未知': 'Unknown',
  '访问地 / IP / 设备：来源未记录（旧记录）': 'Location / IP / device: not recorded (legacy record)', '来源按提交计算时记录；IP 归属地为估算位置。': 'Access details are saved when submitted. IP locations are approximate.',
  '加载更多记录': 'Load more records', '背景': 'Background', '（调色）': '(recolored)', '原版形象来自': 'Original character by', '素材说明': 'Asset notes',
  '暂停背景与点击动效': 'Pause background & click effects', '开启背景与点击动效': 'Enable background & click effects',
  '暂时无法读取记录，请检查后端服务后重试。': 'Unable to read history. Please check the service and try again.', '计算失败，请重试': 'Calculation failed. Please try again.',
  '计算完成，记录已保存': 'Calculation complete. Record saved.', '无法连接记录服务，请确认前后端已启动。': 'Unable to connect to the history service. Please try again later.',
  '已复用算式，可继续编辑计算': 'Expression reused. You can edit and calculate again.', '这条记录已删除': 'Record deleted.', '删除失败，请稍后重试。': 'Deletion failed. Please try again later.',
  '请输入要计算的算式': 'Please enter an expression.', '算式不能超过 200 个字符': 'Expressions cannot exceed 200 characters.', '输入的数字过大': 'The input number is too large.',
  '仅支持数字、四则运算和括号': 'Only numbers, arithmetic operators and parentheses are supported.', '结果超出可计算范围': 'The result is outside the supported range.',
  '请检查括号是否配对': 'Please check that parentheses are paired.', '算式不完整，请检查数字和运算符': 'Incomplete expression. Please check numbers and operators.', '不能除以零': 'Cannot divide by zero.', '请检查括号和运算符': 'Please check parentheses and operators.',
  '分页参数不正确': 'Invalid pagination parameters.', '记录不存在': 'Record not found.', '接口不存在': 'Endpoint not found.', '请求格式不正确': 'Invalid request format.', '请求内容过大': 'The request is too large.', '服务暂时不可用': 'Service temporarily unavailable.',
  '不允许跨站请求': 'Cross-site requests are not allowed.', '请求校验失败，请刷新页面': 'Request validation failed. Please refresh.', '请使用 JSON 请求': 'Please use a JSON request.', '服务繁忙，请稍后重试': 'Service busy. Please try again later.', '操作太频繁，请稍后重试': 'Too many requests. Please try again later.',
  '电脑': 'Desktop', '手机': 'Mobile', '平板': 'Tablet', '未知设备': 'Unknown device', '未知系统': 'Unknown OS', '未知浏览器': 'Unknown browser',
  '本机访问': 'Local access', '内网访问': 'Private network', '未知来源': 'Unknown source', '归属地未知': 'Unknown location',
  '专注电台音乐播放器': 'Focus Radio music player', '专注电台': 'Focus Radio', '列表循环': 'Repeat playlist', '单曲循环': 'Repeat one', '随机播放': 'Shuffle', '顺序播放': 'Play in order',
  '正在加载音乐…': 'Loading music…', '正在播放 · 自动连播': 'Playing · Continuous playback', '点一下播放，让计算有旋律': 'Press play for a little focus music',
  '请点击播放，浏览器需要你的播放许可。': 'Click Play to allow audio in your browser.', '音乐暂时无法播放，请重试或换一首。': 'Unable to play music. Please retry or choose another track.',
  '歌单已播放完，可以再听一遍。': 'Playlist finished. You can listen again.', '这首音乐暂时无法加载，可换一首或点击播放重试。': 'Unable to load this track. Choose another or press Play to retry.',
  '上一首': 'Previous track', '下一首': 'Next track', '暂停音乐': 'Pause music', '播放音乐': 'Play music', '展开或收起播放列表': 'Expand or collapse playlist', '取消静音': 'Unmute', '静音': 'Mute', '音乐音量': 'Music volume', '音乐播放进度': 'Music playback position',
  '首轻音乐 ·': 'tracks ·', '依序播放后停止': 'Stop after the last track', '播放完自动切歌': 'Automatic next track', '音乐署名 · CC BY 4.0 ↗': 'Music credits · CC BY 4.0 ↗', '陪你计算的歌单': 'Your calculation soundtrack',
  '轻快 · 尤克里里': 'Upbeat · Ukulele', '舒缓 · 钢琴': 'Calm · Piano', '明亮 · 吉他': 'Bright · Guitar',
  '{title} 歌曲封面': '{title} cover art', '{title} 封面缩略图': '{title} cover thumbnail', '播放 {title}': 'Play {title}', '切换播放模式，当前{mode}': 'Change playback mode, currently {mode}',
  '算数鲸计算助手': 'Calculation Whale assistant', '🐋 唤醒算数鲸': '🐋 Wake the Whale', '算数鲸提示': 'Whale tips', '算数鲸 · 计算小助手': 'Whale · Your calculation buddy', '关闭算数鲸提示': 'Close Whale tips',
  '让我等一下结果…': 'Waiting for the result…', '这个算式需要检查一下': 'Let’s check this expression', '记录服务暂时没连上': 'History service is unavailable', '结果收到啦！': 'Got your result!', '你好，我是算数鲸': 'Hello, I’m Calculation Whale',
  '计算中': 'Calculating', '等待连接': 'Connecting', '正在请后端计算并保存，马上回来。': 'The server is calculating and saving. Back in a moment.', '先检查后端连接，连上后我再帮你记。': 'Please check the service connection so I can save your results.',
  '✓ 这条结果已保存': '✓ This result is saved', '这条记录已删除，结果仍可查看': 'Record deleted. You can still view this result.', '你来出题，我帮你盯着结果和记录。': 'You bring the expression; I’ll look after the result.',
  '已保存记录': 'Saved records', '记录服务': 'History service', '未连接': 'Disconnected', '连接中': 'Connecting',
  '先乘除，后加减；括号里的先算。': 'Multiply and divide first. Evaluate parentheses first.', '按 Enter 计算，按 Escape 清空。': 'Press Enter to calculate and Escape to clear.', '点击历史算式，就能拿回来继续算。': 'Click a saved expression to use it again.', '记录由后端保存，刷新网页也不会丢。': 'Records are saved on the server and survive a page refresh.',
  '试一个算式': 'Try an example', '去计算 ↗': 'Calculate ↗', '拖动我换位置 · 方向键也可以': 'Drag to move · Arrow keys work too', '收起挂件': 'Minimize', '算数鲸，点击查看提示，可拖动或用方向键移动': 'Calculation Whale: click for tips, drag or use arrow keys to move', '点击互动，拖动换位置': 'Click for tips, drag to move',
  '福州大学梅努斯国际工程学院': 'Maynooth International Engineering College, Fuzhou University',
  '阿里云服务器': 'Alibaba Cloud server', '基于阿里云服务器部署，计算与记录由云端服务提供。': 'Hosted on Alibaba Cloud, with calculations and records handled by the server.',
  '当前为本机开发预览，以下展示本机服务状态。': 'Local development preview. Metrics below are from the local service.', '正在读取服务器状态': 'Checking server status', '服务在线': 'Service online', '状态暂不可用': 'Status unavailable',
  '服务器状态': 'Server status', '内存占用': 'Memory usage', 'CPU 使用率': 'CPU usage', '运行时间': 'Server uptime', '响应耗时': 'Response time', '更新状态': 'Refresh status',
  '每 30 秒更新 · CPU 为采样区间平均值': 'Updates every 30 seconds · CPU averaged over the sample interval', '最近更新': 'Last updated', '上次数据': 'Last known data', '尚无数据': 'No data yet', '核': 'cores', '天': 'd', '小时': 'h', '分钟': 'm', '本机开发服务': 'Local development service',
};
const regions = new Map();
const chineseNames = new Intl.DisplayNames(['zh-CN'], {type: 'region'});
const englishNames = new Intl.DisplayNames(['en'], {type: 'region'});
for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) {
  const code = String.fromCharCode(a, b);
  const name = chineseNames.of(code);
  if (name !== code) regions.set(name, englishNames.of(code));
}
export function t(value, parameters = {}) {
  const source = String(value ?? '');
  let text = source;
  if (locale.value === 'en') {
    const count = source.match(/^(\d+) 条(?:记录)?$/);
    text = english[source] ?? regions.get(source) ?? (count ? `${count[1]} ${count[1] === '1' ? 'record' : 'records'}` : source);
    if (text === source && source.includes(' · ')) {
      const parts = source.split(' · ');
      if (regions.has(parts[0])) text = [regions.get(parts[0]), ...parts.slice(1)].join(' · ');
    }
  }
  return text.replace(/\{(\w+)\}/g, (match, key) => parameters[key] ?? match);
}
export function toggleLocale() { locale.value = locale.value === 'en' ? 'zh-CN' : 'en'; }
watch(locale, value => {
  document.documentElement.lang = value;
  document.title = value === 'en' ? 'Calc Journal · Calculator & History' : '算数记 · 计算器与历史记录';
  try { localStorage.setItem('calculator-language', value); } catch { /* Optional preference. */ }
}, {immediate: true});
