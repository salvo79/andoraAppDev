<template>
  <!-- Icono flotante -->
  <div :class="['floating-icon', { 'is-active': isOpen }]" @click="toggleChat" title="Asistente AI">
    🤖
  </div>

  <!-- Ventana del chat -->
  <Teleport to="body">
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <span>Asistente AI</span>
        <button @click.stop="toggleChat" class="close-btn">✕</button>
      </div>

      <!-- Mensajes -->
      <div class="chat-body" ref="bodyRef">
        <div v-for="msg in messages" :key="msg.id"
             class="chat-msg" :class="msg.author === 'user' ? 'chat-msg-user' : 'chat-msg-ai'">
          <div class="chat-bubble">{{ msg.text }}</div>
          <div class="chat-ts">{{ msg.ts }}</div>
        </div>
        <div v-if="loading" class="chat-msg chat-msg-ai">
          <div class="chat-bubble chat-typing">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-footer">
        <input
          v-model="inputText"
          class="chat-input"
          placeholder="Escribe un mensaje..."
          @keydown.enter.prevent="send"
          :disabled="loading"
        />
        <button class="chat-send" :disabled="loading || !inputText.trim()" @click="send">
          <i class="pi pi-send" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref } from 'vue';

const isOpen   = ref(false);
const messages = ref([]);
const inputText = ref('');
const loading  = ref(false);
const bodyRef  = ref(null);

const toggleChat = () => (isOpen.value = !isOpen.value);

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function scrollBottom() {
  await nextTick();
  if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
}

async function send() {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ id: Date.now(), author: 'user', text, ts: now() });
  inputText.value = '';
  loading.value = true;
  await scrollBottom();

  try {
    const res = await fetch('/api/ChatAI', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: text }),
    });
    const data = await res.json();
    messages.value.push({ id: Date.now() + 1, author: 'ai', text: data.reply, ts: now() });
  } catch {
    messages.value.push({ id: Date.now() + 1, author: 'ai', text: 'Error al conectar con el asistente.', ts: now() });
  } finally {
    loading.value = false;
    await scrollBottom();
  }
}
</script>

<style scoped>
.floating-icon {
  position: fixed; bottom: 20px; right: 20px;
  width: 56px; height: 56px;
  background: #2563eb; color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 26px; z-index: 1000;
  box-shadow: 0 4px 12px rgba(37,99,235,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.floating-icon:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(37,99,235,0.5); }
.floating-icon.is-active { background: #1d4ed8; }

.chat-window {
  position: fixed; bottom: 88px; right: 20px;
  width: 340px; height: 440px;
  background: white; border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; z-index: 999;
  overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif;
}

.chat-header {
  background: #2563eb; color: white;
  padding: 12px 16px; font-weight: 700; font-size: 0.9rem;
  display: flex; justify-content: space-between; align-items: center;
}
.close-btn {
  background: none; border: none; color: white;
  cursor: pointer; font-size: 1rem; line-height: 1;
}

.chat-body {
  flex: 1; overflow-y: auto; padding: 12px 10px; display: flex;
  flex-direction: column; gap: 8px;
}

.chat-msg { display: flex; flex-direction: column; max-width: 80%; }
.chat-msg-user { align-self: flex-end; align-items: flex-end; }
.chat-msg-ai   { align-self: flex-start; align-items: flex-start; }

.chat-bubble {
  padding: 8px 12px; border-radius: 12px; font-size: 0.82rem; line-height: 1.4;
  word-break: break-word;
}
.chat-msg-user .chat-bubble { background: #2563eb; color: white; border-bottom-right-radius: 3px; }
.chat-msg-ai   .chat-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 3px; }

.chat-ts { font-size: 0.62rem; color: #94a3b8; margin-top: 2px; }

/* Typing indicator */
.chat-typing { display: flex; gap: 4px; padding: 10px 14px; }
.chat-typing span {
  width: 7px; height: 7px; border-radius: 50%;
  background: #94a3b8; animation: typing 1.2s infinite;
}
.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing { 0%,80%,100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }

.chat-footer {
  display: flex; gap: 6px; padding: 10px;
  border-top: 1px solid #e2e8f0;
}
.chat-input {
  flex: 1; border: 1px solid #cbd5e1; border-radius: 8px;
  padding: 7px 10px; font-size: 0.82rem; outline: none;
  font-family: inherit;
}
.chat-input:focus { border-color: #2563eb; }
.chat-send {
  width: 36px; height: 36px; border-radius: 8px;
  background: #2563eb; color: white; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; transition: background 0.15s;
}
.chat-send:disabled { background: #93c5fd; cursor: default; }
.chat-send:not(:disabled):hover { background: #1d4ed8; }
</style>
