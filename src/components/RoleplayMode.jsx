import { useState } from 'react';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
import './RoleplayMode.css';

export default function RoleplayMode({ topic, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Chào bạn, tôi là nhân vật trong tác phẩm liên quan đến chủ đề "${topic}". Bạn muốn phỏng vấn hay tranh luận điều gì với tôi không?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          topic: topic,
          history: messages 
        })
      });
      if (!response.ok) throw new Error('AI đang bận, thử lại sau nhé!');
      const data = await response.json();
      
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Tôi đang bận một chút, bạn chờ một lát nhé!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="roleplay-container animate-fade-in">
      <div className="roleplay-header">
        <button className="btn-icon-text" onClick={onBack}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="character-info">
          <div className="character-avatar">
            <Bot size={24} />
          </div>
          <div>
            <h3>Nhân vật văn học</h3>
            <span className="status-online">AI Persona</span>
          </div>
        </div>
        <div style={{ width: '100px' }}></div>
      </div>

      <div className="chat-window glass-panel">
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              {msg.sender === 'bot' && (
                <div className="msg-avatar bot-avatar"><Bot size={16} /></div>
              )}
              <div className={`message-bubble ${msg.sender}-bubble`}>
                <p>{msg.text}</p>
              </div>
              {msg.sender === 'user' && (
                <div className="msg-avatar user-avatar"><User size={16} /></div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="msg-avatar bot-avatar"><Bot size={16} /></div>
              <div className="message-bubble bot-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Đặt câu hỏi hoặc tranh luận với nhân vật..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary send-btn" disabled={!input.trim() || isTyping}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
