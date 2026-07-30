(function () {
    const root = document.getElementById('chat-widget-root');
    if (!root) return;

    // State
    let isOpen = false;
    let messages = [];
    let isLoading = false;

    // Build DOM
    root.innerHTML = `
        <button id="chat-toggle" class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-2xl shadow-brand-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105" aria-label="Abrir chat">
            <svg id="chat-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <svg id="chat-icon-close" class="hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div id="chat-panel" class="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right scale-0 opacity-0 pointer-events-none">
            <!-- Header -->
            <div class="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </div>
                <div>
                    <p class="text-white text-sm font-semibold">Elizabeth Asistente de IA de Braulio</p>
                    <p class="text-slate-500 text-xs">"Hola, soy Elizabeth, la asistente de IA de Braulio. Preguntame sobre su experiencia profesional, habilidades técnicas o proyectos. ¿En qué puedo ayudarte?"</p>
                </div>
            </div>
            <!-- Messages -->
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar bg-slate-900">
                <div class="flex gap-3">
                    <div class="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div class="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 max-w-[85%]">
                        Hola, soy el asistente de Braulio. Preguntame sobre su experiencia profesional, habilidades técnicas o proyectos. ¿En qué puedo ayudarte?
                    </div>
                </div>
            </div>
            <!-- Input -->
            <div class="border-t border-slate-700 p-3 bg-slate-800/50">
                <div class="flex items-center gap-2">
                    <input id="chat-input" type="text" placeholder="Escribí tu mensaje..." class="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-400 transition-colors" autocomplete="off">
                    <button id="chat-send" class="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    const toggleBtn = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const messagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const iconOpen = document.getElementById('chat-icon-open');
    const iconClose = document.getElementById('chat-icon-close');

    function openChat() {
        isOpen = true;
        panel.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
        panel.classList.add('scale-100', 'opacity-100');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
        chatInput.focus();
    }

    function closeChat() {
        isOpen = false;
        panel.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
        panel.classList.remove('scale-100', 'opacity-100');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
    }

    toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());

    function addMessage(text, sender) {
        const isBot = sender === 'bot';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex gap-3' + (isBot ? '' : ' justify-end');
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isBot) {
            msgDiv.innerHTML = `
                <div class="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div class="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 max-w-[85%]">${escapeHtml(text)}</div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="bg-brand-500/15 border border-brand-500/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-[85%]">${escapeHtml(text)}</div>
            `;
        }
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        messages.push({ role: isBot ? 'assistant' : 'user', content: text });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex gap-3';
        typingDiv.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span class="typing-dot w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                <span class="typing-dot w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                <span class="typing-dot w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isLoading) return;
        chatInput.value = '';
        addMessage(text, 'user');
        isLoading = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });
            removeTyping();
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Error de conexión' }));
                addMessage(err.error || 'Ocurrió un error. Intentá de nuevo.', 'bot');
            } else {
                const data = await response.json();
                addMessage(data.reply || 'Sin respuesta.', 'bot');
            }
        } catch (e) {
            removeTyping();
            addMessage('No se pudo conectar con el asistente. ¿Está desplegado el proyecto en Vercel?', 'bot');
        }
        isLoading = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Close panel on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });
})();