<template>
  <!-- Botón flotante -->
  <button
    :class="['advisor-fab', { 'is-active': isOpen }]"
    @click="toggleChat"
    title="anDora Advisor"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 10h8M8 14h5" stroke-linecap="round"/>
    </svg>
    <span v-if="unread > 0" class="advisor-badge">{{ unread }}</span>
  </button>

  <!-- Panel de chat -->
  <Transition name="advisor-slide">
    <div v-if="isOpen" class="advisor-panel" @click.stop>
      <!-- Header -->
      <div class="advisor-header">
        <div class="advisor-header-info">
          <div class="advisor-avatar">AI</div>
          <div>
            <div class="advisor-title">anDora Advisor</div>
            <div class="advisor-subtitle">{{ isTyping ? 'Analizando datos...' : 'Listo para ayudar' }}</div>
          </div>
        </div>
        <button class="advisor-close" @click="toggleChat">✕</button>
      </div>

      <!-- Mensajes -->
      <div ref="messagesEl" class="advisor-messages">
        <div v-if="messages.length === 0" class="advisor-empty">
          <div class="advisor-empty-icon">🤖</div>
          <p>Hola, soy tu asistente de análisis operacional.</p>
          <p>Puedes preguntarme sobre producción, paros, precios, calidad y más.</p>
          <div class="advisor-suggestions">
            <button
              v-for="s in suggestions"
              :key="s"
              class="advisor-suggestion"
              @click="sendSuggestion(s)"
            >{{ s }}</button>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['advisor-msg', msg.role === 'user' ? 'advisor-msg--user' : 'advisor-msg--assistant']"
        >
          <div class="advisor-msg-bubble" v-html="renderMarkdown(msg.content)" />
          <div class="advisor-msg-time">{{ formatTime(msg.ts) }}</div>
        </div>

        <!-- Indicador de escritura -->
        <div v-if="isTyping" class="advisor-msg advisor-msg--assistant">
          <div class="advisor-msg-bubble advisor-typing">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="advisor-input-area">
        <textarea
          ref="inputEl"
          v-model="draft"
          class="advisor-input"
          placeholder="Pregunta sobre operaciones, paros, precios..."
          rows="1"
          :disabled="isTyping"
          @keydown.enter.exact.prevent="sendMessage"
          @input="autoResize"
        />
        <button
          class="advisor-send"
          :disabled="!draft.trim() || isTyping"
          @click="sendMessage"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick, watch, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import { advisorService } from '@/service/advisorService';

const isOpen   = ref(false);
const isTyping = ref(false);
const draft    = ref('');
const unread   = ref(0);
const messages = ref([]);
const messagesEl = ref(null);
const inputEl    = ref(null);

// Chart.js state (plain objects — no reactivity needed)
const chartConfigs   = {};   // chartId -> config string
const chartInstances = {};   // chartId -> Chart instance
const htmlCache      = new Map(); // message content -> rendered html (ensures stable canvas ids)

const CHART_PALETTE = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

let blockSeq = 0;

const suggestions = [
  '¿Cuáles son las ventas por año?',
  '¿Qué vendedor tuvo más ventas? Muestra gráfica',
  '¿Cuáles son ventas por canal de venta?',
  '¿Cuál cliente generó más margen? Muestra tabla',
];

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unread.value = 0;
    nextTick(() => { scrollToBottom(); inputEl.value?.focus(); });
  }
}

async function sendMessage() {
  const text = draft.value.trim();
  if (!text || isTyping.value) return;
  draft.value = '';
  autoResize();
  messages.value.push({ role: 'user', content: text, ts: new Date() });
  scrollToBottom();
  isTyping.value = true;
  try {
    const history = messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    const reply = await advisorService.chat(text, history);
    messages.value.push({ role: 'assistant', content: reply, ts: new Date() });
    if (!isOpen.value) unread.value++;
  } catch (err) {
    messages.value.push({ role: 'assistant', content: `Error al conectar con el advisor: ${err.message}`, ts: new Date() });
  } finally {
    isTyping.value = false;
    nextTick(scrollToBottom);
  }
}

function sendSuggestion(text) { draft.value = text; sendMessage(); }
function scrollToBottom() { if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight; }
function autoResize() {
  if (!inputEl.value) return;
  inputEl.value.style.height = 'auto';
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px';
}
function formatTime(date) {
  return date?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) ?? '';
}

// ── Markdown renderer with table + chart support ──────────────────────────

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildTableHtml(lines) {
  const parseRow = l => l.split('|').filter((_,i,a) => i>0 && i<a.length-1).map(c => c.trim());
  const headers = parseRow(lines[0]).map(h => `<th>${escHtml(h)}</th>`).join('');
  const rows = lines.slice(2)
    .filter(l => l.trim())
    .map(l => `<tr>${parseRow(l).map(c => `<td>${escHtml(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="advisor-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function renderMarkdown(text) {
  if (!text) return '';
  if (htmlCache.has(text)) return htmlCache.get(text);
  const cacheKey = text;

  const specials = {};  // placeholder -> html

  // 1. Extract ```chart blocks (before HTML escaping)
  text = text.replace(/```chart\n?([\s\S]+?)\n?```/g, (_, cfg) => {
    const key = `__BLK${++blockSeq}__`;
    const cid = `advchart_${blockSeq}`;
    chartConfigs[cid] = cfg.trim();
    specials[key] = `<div class="advisor-chart-wrap"><canvas id="${cid}"></canvas></div>`;
    return key;
  });

  // 2. Extract markdown tables (before HTML escaping)
  const lines = text.split('\n');
  const processedLines = [];
  let tbl = [];

  const flushTable = () => {
    if (tbl.length >= 2 && /^\|[\s|:-]+\|$/.test(tbl[1])) {
      const key = `__BLK${++blockSeq}__`;
      specials[key] = buildTableHtml(tbl);
      processedLines.push(key);
    } else {
      processedLines.push(...tbl);
    }
    tbl = [];
  };

  for (const line of lines) {
    if (line.startsWith('|') && line.endsWith('|')) {
      tbl.push(line);
    } else {
      if (tbl.length) flushTable();
      processedLines.push(line);
    }
  }
  if (tbl.length) flushTable();
  text = processedLines.join('\n');

  // 3. Standard markdown → HTML (escaping safe since placeholders have no special chars)
  let html = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3,-3).trim()}</code></pre>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, '<p>$1</p>');

  // 4. Restore specials
  for (const [key, specialHtml] of Object.entries(specials)) {
    html = html.replaceAll(key, specialHtml);
  }
  htmlCache.set(cacheKey, html);
  return html;
}

// ── Chart initialization ──────────────────────────────────────────────────

function applyChartDefaults(cfg) {
  cfg.options ??= {};
  cfg.options.responsive = true;
  cfg.options.maintainAspectRatio = false;
  cfg.options.plugins ??= {};
  cfg.options.plugins.legend ??= { position: 'bottom', labels: { font: { size: 11 } } };

  cfg.data?.datasets?.forEach((ds, i) => {
    if (ds.backgroundColor) return;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    if (cfg.type === 'line') {
      ds.backgroundColor = color + '33';
      ds.borderColor = color;
      ds.tension ??= 0.3;
      ds.pointRadius ??= 3;
    } else if (cfg.type === 'pie' || cfg.type === 'doughnut') {
      ds.backgroundColor = CHART_PALETTE.slice(0, ds.data?.length ?? CHART_PALETTE.length);
    } else {
      ds.backgroundColor = color;
    }
  });
}

function initPendingCharts() {
  for (const [cid, cfgStr] of Object.entries(chartConfigs)) {
    if (chartInstances[cid]) continue;
    const canvas = document.getElementById(cid);
    if (!canvas) continue;
    try {
      const cfg = JSON.parse(cfgStr);
      applyChartDefaults(cfg);
      chartInstances[cid] = new Chart(canvas, cfg);
    } catch (e) {
      console.warn('Advisor chart error:', cid, e);
    }
  }
}

watch(messages, () => {
  scrollToBottom();
  initPendingCharts();
}, { deep: true, flush: 'post' });

onUnmounted(() => {
  Object.values(chartInstances).forEach(c => c.destroy());
});
</script>

<style scoped>
/* ── FAB ────────────────────────────────────────────────────────────── */
.advisor-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(37,99,235,.45);
  z-index: 1100;
  transition: transform .2s, background .2s;
}
.advisor-fab:hover  { background: #1d4ed8; transform: scale(1.08); }
.advisor-fab.is-active { background: #1e40af; }

.advisor-badge {
  position: absolute;
  top: 2px; right: 2px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 1px 5px;
  line-height: 1.4;
}

/* ── Panel ──────────────────────────────────────────────────────────── */
.advisor-panel {
  position: fixed;
  bottom: 92px;
  right: 24px;
  width: 380px;
  max-height: 580px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  display: flex;
  flex-direction: column;
  z-index: 1099;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────────────────────────────── */
.advisor-header {
  background: #2563eb;
  color: #fff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.advisor-header-info { display: flex; align-items: center; gap: 10px; }
.advisor-avatar {
  width: 36px; height: 36px;
  background: rgba(255,255,255,.25);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px;
}
.advisor-title   { font-weight: 600; font-size: 14px; }
.advisor-subtitle { font-size: 11px; opacity: .8; margin-top: 1px; }
.advisor-close {
  background: none; border: none; color: #fff;
  font-size: 16px; cursor: pointer; opacity: .8;
  line-height: 1; padding: 2px 6px;
}
.advisor-close:hover { opacity: 1; }

/* ── Messages ───────────────────────────────────────────────────────── */
.advisor-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.advisor-empty {
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  padding: 20px 8px 0;
}
.advisor-empty p { margin: 6px 0; }
.advisor-empty-icon { font-size: 36px; margin-bottom: 8px; }
.advisor-suggestions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.advisor-suggestion {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: #1d4ed8;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.advisor-suggestion:hover { background: #dbeafe; }

.advisor-msg { display: flex; flex-direction: column; max-width: 88%; }
.advisor-msg--user    { align-self: flex-end; align-items: flex-end; }
.advisor-msg--assistant { align-self: flex-start; align-items: flex-start; }

.advisor-msg-bubble {
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}
.advisor-msg--user .advisor-msg-bubble {
  background: #2563eb;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.advisor-msg--assistant .advisor-msg-bubble {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}
.advisor-msg-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 3px;
}

/* Markdown dentro de bubble */
.advisor-msg-bubble :deep(p)    { margin: 4px 0; }
.advisor-msg-bubble :deep(ul)   { margin: 4px 0; padding-left: 18px; }
.advisor-msg-bubble :deep(li)   { margin: 2px 0; }
.advisor-msg-bubble :deep(h2),
.advisor-msg-bubble :deep(h3)   { margin: 8px 0 4px; font-size: 13px; font-weight: 600; }
.advisor-msg-bubble :deep(pre)  { background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 8px; font-size: 11px; overflow-x: auto; }
.advisor-msg-bubble :deep(strong) { font-weight: 600; }

/* Typing indicator */
.advisor-typing {
  display: flex; gap: 5px; align-items: center;
  padding: 12px 14px !important;
}
.advisor-typing span {
  display: inline-block;
  width: 7px; height: 7px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}
.advisor-typing span:nth-child(2) { animation-delay: .2s; }
.advisor-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(.6); opacity: .5; }
  40%           { transform: scale(1);  opacity: 1;  }
}

/* ── Input ──────────────────────────────────────────────────────────── */
.advisor-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
.advisor-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color .15s;
  font-family: inherit;
}
.advisor-input:focus { border-color: #2563eb; }
.advisor-input:disabled { background: #f9fafb; color: #9ca3af; }

.advisor-send {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background .15s, opacity .15s;
}
.advisor-send:hover:not(:disabled) { background: #1d4ed8; }
.advisor-send:disabled { opacity: .4; cursor: default; }

/* ── Transition ─────────────────────────────────────────────────────── */
.advisor-slide-enter-active,
.advisor-slide-leave-active { transition: all .25s cubic-bezier(.4,0,.2,1); }
.advisor-slide-enter-from,
.advisor-slide-leave-to   { opacity: 0; transform: translateY(16px) scale(.97); }

/* ── Tables ──────────────────────────────────────────────────────────── */
.advisor-msg-bubble :deep(.advisor-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin: 6px 0;
  border-radius: 6px;
  overflow: hidden;
}
.advisor-msg-bubble :deep(.advisor-table th) {
  background: #dbeafe;
  color: #1e40af;
  padding: 5px 8px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #bfdbfe;
}
.advisor-msg-bubble :deep(.advisor-table td) {
  padding: 4px 8px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}
.advisor-msg-bubble :deep(.advisor-table tr:nth-child(even) td) {
  background: #f9fafb;
}

/* ── Charts ──────────────────────────────────────────────────────────── */
.advisor-msg-bubble :deep(.advisor-chart-wrap) {
  position: relative;
  height: 220px;
  margin: 8px 0;
  background: #fff;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e5e7eb;
}
</style>
