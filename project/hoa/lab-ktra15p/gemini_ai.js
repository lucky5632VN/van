/* ——— GEMINI AI INTEGRATION ——— */
// Ưu tiên lấy từ biến môi trường (Vite/Vercel), nếu không có mới lấy từ localStorage
let GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || window.localStorage.getItem('QUANTUM_API_KEY') || '';
const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

class QuantumCommander {
  constructor() {
    this.history = [];
    this.isTyping = false;
    this.init();
  }

  init() {
    this.injectHTML();
    this.addEventListeners();
    this.addWelcomeMessage();
  }

  injectHTML() {
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.innerHTML = `
      <div id="chatbot-notification">1</div>
      <button id="chatbot-toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div id="chatbot-window">
        <div class="chat-header">
          <div>
            <h3>QUANTUM AI</h3>
            <div class="chat-status">
              <div class="status-dot"></div>
              <span>COMMANDER ONLINE</span>
            </div>
          </div>
          <button onclick="window.chatbot.toggle()" style="background:none; border:none; color:#64748b; cursor:pointer;">✕</button>
        </div>
        <div id="chat-messages"></div>
        <div class="typing-indicator" id="typing-indicator">Commander đang phân tích dữ liệu...</div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Hỏi về phản ứng hoặc hóa chất..." autocomplete="off">
          <button id="chat-send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  addEventListeners() {
    document.getElementById('chatbot-toggle').onclick = () => this.toggle();
    document.getElementById('chat-send').onclick = () => this.handleUserInput();
    document.getElementById('chat-input').onkeypress = (e) => {
      if (e.key === 'Enter') this.handleUserInput();
    };
  }

  toggle() {
    const win = document.getElementById('chatbot-window');
    const notif = document.getElementById('chatbot-notification');
    const isVisible = win.style.display === 'flex';
    win.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      notif.style.display = 'none';
      document.getElementById('chat-input').focus();
    }
  }

  addWelcomeMessage() {
    if (!GEMINI_API_KEY) {
      this.addMessage('ai', 'Chào mừng đến với QuantumLab! Để bắt đầu sử dụng trợ lý AI, bạn cần nhập **Gemini API Key**. <br><br> <button onclick="window.chatbot.promptForKey()" style="background:#38bdf8; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">NHẬP API KEY</button>');
    } else {
      this.addMessage('ai', 'Chào mừng đến với Trung tâm Chỉ huy Quantum. Tôi là trợ lý AI giám sát phòng Lab này. Tôi có thể thấy mọi phản ứng bạn đang thực hiện. Bạn cần tôi giải thích điều gì?');
    }
  }

  promptForKey() {
    const key = prompt('Vui lòng nhập Google Gemini API Key của bạn:', GEMINI_API_KEY);
    if (key) {
      GEMINI_API_KEY = key;
      window.localStorage.setItem('QUANTUM_API_KEY', key);
      this.addMessage('ai', '✅ Đã lưu API Key thành công! Tôi đã sẵn sàng hỗ trợ bạn.');
    }
  }

  addMessage(role, text) {
    const chatMsgs = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // Xử lý định dạng văn bản sạch sẽ
    let formatted = text
      .replace(/\$([^\$]+)\$/g, '<b style="color:#00ffcc">$1</b>') // Công thức hóa học
      .replace(/\n/g, '<br>') // Xuống dòng
      .replace(/^- (.*)$/gm, '• $1') // Gạch đầu dòng
      .replace(/^([🎯💡🌍⚠️].*):/gm, '<div style="color:#38bdf8; font-weight:bold; margin-top:10px; font-family:Orbitron, sans-serif;">$1</div>'); // Tiêu đề phần
    
    msgDiv.innerHTML = formatted;
    chatMsgs.appendChild(msgDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  getLabContext() {
    const state = window.state || {}; // Trong lab.js dùng biến 'state'
    const lastReaction = this.lastReactionData || null;
    
    // Thu thập tên các hóa chất đang hiển thị trên bàn
    let deskChemicals = [];
    const desk = document.getElementById('workspace'); // 'workspace' là ID vùng chứa trong lab.js
    if (desk) {
      const labels = desk.querySelectorAll('.chemical-label, .beaker-label');
      labels.forEach(el => deskChemicals.push(el.innerText.trim()));
    }

    // Lấy 3 dòng nhật ký gần nhất
    let recentLogs = [];
    const logEntries = document.querySelectorAll('.log-msg');
    if (logEntries.length > 0) {
      const start = Math.max(0, logEntries.length - 3);
      for (let i = start; i < logEntries.length; i++) {
        recentLogs.push(logEntries[i].innerText.trim());
      }
    }

    return `
      NGỮ CẢNH PHÒNG THÍ NGHIỆM HIỆN TẠI:
      - Nhiệt độ: ${state.currentTemp || 25}°C
      - Năng lượng IDCL: ${state.currentEnergy || 100}%
      - Vi phạm an toàn: ${state.safetyViolations || 0}
      - Phản ứng vừa xảy ra: ${lastReaction ? lastReaction.equation : 'Chưa có'}
      - Hiện tượng quan sát: ${lastReaction ? lastReaction.observation : 'N/A'}
      - Nhật ký gần đây: ${recentLogs.join(' | ')}
      - Hóa chất đang có trên bàn: ${deskChemicals.join(', ')}
    `;
  }

  async handleUserInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || this.isTyping) return;

    this.addMessage('user', text);
    input.value = '';
    this.showTyping(true);

    try {
      const response = await this.callGemini(text);
      this.addMessage('ai', response);
    } catch (error) {
      console.error('Gemini API Error Detail:', error);
      let errorMsg = 'Xin lỗi, tôi đang gặp sự cố khi kết nối với mạng lưới dữ liệu Quantum.';
      if (window.location.protocol === 'file:') {
        errorMsg += ' **Lưu ý:** Bạn đang chạy file trực tiếp từ ổ đĩa, vui lòng sử dụng Live Server để API có thể hoạt động.';
      }
      this.addMessage('ai', errorMsg);
    } finally {
      this.showTyping(false);
    }
  }

  showTyping(show) {
    this.isTyping = show;
    document.getElementById('typing-indicator').style.display = show ? 'block' : 'none';
  }

  async discoverModels() {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      const data = await response.json();
      if (data.models) {
        // Lọc ra các model hỗ trợ generateContent và sắp xếp theo độ mạnh (Pro > Flash)
        const available = data.models
          .filter(m => m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''))
          .sort((a, b) => {
            if (a.includes('pro') && !b.includes('pro')) return -1;
            if (!a.includes('pro') && b.includes('pro')) return 1;
            return 0;
          });
        
        console.log('📡 [Quantum AI] Các model khả dụng:', available);
        return available;
      }
    } catch (e) {
      console.error('[Quantum AI] Không thể liệt kê model:', e);
    }
    return ['gemini-pro', 'gemini-1.5-flash']; // Fallback nếu lỗi
  }

  async callGemini(prompt) {
    if (!GEMINI_API_KEY) {
      throw new Error('Thiếu API Key. Vui lòng nhấp vào nút "NHẬP API KEY" phía trên.');
    }
    const context = this.getLabContext();
    const systemPrompt = `
      Bạn là "Quantum Commander", trợ lý AI của QuantumLab. 
      NHIỆM VỤ: Giải thích phản ứng hóa học dựa trên dữ liệu phòng Lab.
      
      QUY TẮC TRÌNH BÀY (BẮT BUỘC):
      1. Câu trả lời phải chia thành 4 phần rõ ràng: 
         - 🎯 TÓM TẮT: (Phản ứng là gì)
         - 💡 CƠ CHẾ & HIỆN TƯỢNG: (Dùng gạch đầu dòng ngắn gọn)
         - 🌍 ỨNG DỤNG THỰC TẾ: (Ứng dụng trong đời sống hoặc công nghiệp)
         - ⚠️ LƯU Ý AN TOÀN: (Cảnh báo nếu có)
      2. KHÔNG sử dụng các ký tự đặc biệt như *, #, _, ~ ở đầu câu hoặc bao quanh từ (trừ khi viết công thức).
      3. Viết công thức hóa học trong cặp dấu $ (Ví dụ: $H2SO4$).
      4. Ngôn ngữ: Tiếng Việt, phong cách chuyên nghiệp, dễ hiểu.
      
      Trạng thái Lab hiện tại: ${context}
    `;

    // Tự động khám phá danh sách model nếu chưa có
    if (!this.availableModels || this.availableModels.length === 0) {
      this.availableModels = await this.discoverModels();
    }

    // Luôn ưu tiên model đã hoạt động trước đó
    const modelsToTry = this.workingModel ? [this.workingModel, ...this.availableModels] : this.availableModels;

    for (const model of [...new Set(modelsToTry)]) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + "\n\nUser: " + prompt }] }]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            this.workingModel = model;
            console.log(`✅ [Quantum AI] Kết nối thành công: ${model}`);
            return data.candidates[0].content.parts[0].text;
          }
        } else {
          const err = await response.json();
          console.warn(`[Quantum AI] Thử ${model} thất bại:`, err.error?.message);
        }
      } catch (e) {
        console.error(`[Quantum AI] Lỗi với ${model}`);
      }
    }
    
    throw new Error('Tất cả model đều từ chối kết nối.');
  }

  // Phương thức để lab.js gọi khi có sự kiện
  notify(type, data) {
    if (type === 'reaction') {
      this.lastReactionData = data; // Lưu dữ liệu để getLabContext sử dụng
      console.log('📡 [Quantum AI] Đã ghi nhận phản ứng:', data.equation);

      const notif = document.getElementById('chatbot-notification');
      if (document.getElementById('chatbot-window').style.display !== 'flex') {
        notif.style.display = 'flex';
        notif.textContent = '!';
        
        // Hiệu ứng rung nhẹ nút chat để báo hiệu AI đã thấy phản ứng
        const toggle = document.getElementById('chatbot-toggle');
        toggle.style.animation = 'bounce 0.5s 3';
        setTimeout(() => toggle.style.animation = '', 1500);
      }
    }
  }
}

// Khởi tạo toàn cục
window.chatbot = new QuantumCommander();
