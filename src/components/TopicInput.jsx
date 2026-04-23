import { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import './TopicInput.css';

export default function TopicInput({ onSubmit }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Lớp 12');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic, level);
    }
  };

  return (
    <div className="topic-input-container animate-fade-in">
      <div className="hero-section">
        <h1 className="hero-title">
          Khai phá <span className="text-gradient">Sáng tạo</span> trong bạn
        </h1>
        <p className="hero-subtitle">
          Nhập một chủ đề văn học, Supervisor AI sẽ giúp bạn tìm ra những góc nhìn độc đáo nhất.
        </p>
      </div>

      <div className="glass-panel input-panel">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><BookOpen size={18} /> Chủ đề bài viết</label>
            <input 
              type="text" 
              placeholder="VD: Phân tích nhân vật Chí Phèo..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="topic-textfield"
              autoFocus
            />
          </div>
          
          <div className="input-row">
            <div className="input-group">
              <label>Khối lớp</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="level-select">
                <option>Lớp 9</option>
                <option>Lớp 10</option>
                <option>Lớp 11</option>
                <option>Lớp 12</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary submit-btn"
              disabled={!topic.trim()}
            >
              <Sparkles size={18} /> Lên ý tưởng ngay <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="suggested-topics">
        <p>Gợi ý phổ biến:</p>
        <div className="tags">
          <span className="tag" onClick={() => setTopic('Phân tích Vợ nhặt')}>Vợ nhặt</span>
          <span className="tag" onClick={() => setTopic('Cảm nhận về đoạn trích Đất Nước')}>Đất Nước</span>
          <span className="tag" onClick={() => setTopic('Phân tích Lão Hạc')}>Lão Hạc</span>
        </div>
      </div>
    </div>
  );
}
