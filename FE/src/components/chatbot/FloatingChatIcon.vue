<template>
  <!-- Icono Flotante -->
  <div :class="['floating-icon', { 'is-active': isOpen }]" @click="toggleChat">
    <!-- Puedes usar un SVG si no quieres depender de emojis -->
    🤖 
  </div>
  <!-- Ventana del chat -->
  <div v-if="isOpen" class="chat-window">
    <div class="chat-header">
      Asistente AI
      <button @click.stop="toggleChat" class="close-btn">✕</button>
    </div>

    <div class="chat-body">
      <DxChat
        :data-source="dataSource"
        :user="user"
        :height="'100%'"
        :show-avatar="false"
        @message-entered="onMessageEntered"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DxChat from 'devextreme-vue/chat';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';

// Estado para abrir/cerrar chat
const isOpen = ref(false);
const toggleChat = () => (isOpen.value = !isOpen.value);

// Usuario actual
const user = { id: 'user', name: 'Tú' };

// Configuración del DataSource para los mensajes
const store = new CustomStore({
  key: 'id',
  load: () => Promise.resolve([]),
  insert: (msg) => {
    msg.id = Date.now();
    return Promise.resolve(msg);
  },
});

const dataSource = new DataSource({ store });

// Función al enviar un mensaje
const onMessageEntered = async ({ message }) => {
  // Agrega mensaje del usuario
  await store.insert({ 
    author: user, 
    text: message.text, 
    timestamp: new Date() 
  });

  // Llamada a tu backend de IA
  const aiReply = await fetchAIResponse(message.text);

  // Agrega respuesta de la IA
  await store.insert({
    author: { id: 'assistant', name: 'AI' },
    text: aiReply,
    timestamp: new Date()
  });
};

// Función ejemplo para conectar a tu API / backend de IA
async function fetchAIResponse(text) {
  const res = await fetch('http://localhost:5000/api/ChatAI', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  });
  const data = await res.json();
  return data.reply;
}
</script>

<style scoped>
/* Icono flotante */
.floating-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 28px;
  z-index: 1000;
  transition: all 0.3s;
  opacity: 0.8;
}
.floating-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  background-color: #0056b3;
}
.floating-icon.is-active {
  opacity: 1;
}

/* Ventana de chat */
.chat-window {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  z-index: 999;
}

.chat-header {
  background-color: #007bff;
  color: white;
  padding: 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
}

.chat-body {
  flex-grow: 1;
  padding: 0;
  overflow-y: auto;
}
</style>