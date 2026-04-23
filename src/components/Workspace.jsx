import { useState } from 'react';
import { PenTool, BrainCircuit, AlertCircle, TrendingUp, CheckCircle2, MessageSquare } from 'lucide-react';
import './Workspace.css';

export default function Workspace({ idea, onRoleplay }) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          idea_context: idea.title 
        })
      });
      if (!response.ok) throw new Error('Không thể phân tích bài viết');
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="workspace-container animate-fade-in">
      <div className="workspace-header">
        <div className="current-idea">
          <span className="idea-label">Đang viết theo hướng:</span>
          <h3>{idea.title}</h3>
        </div>
        <button className="btn-secondary" onClick={onRoleplay}>
          <MessageSquare size={18} /> Phỏng vấn nhân vật
        </button>
      </div>

      <div className="workspace-layout">
        {/* Editor Area */}
        <div className="editor-area glass-panel">
          <div className="panel-header">
            <PenTool size={18} className="text-gradient" /> 
            <span>Không gian sáng tạo</span>
          </div>
          <textarea 
            className="main-editor"
            placeholder="Bắt đầu viết đoạn văn của bạn tại đây..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div className="editor-footer">
            <span className="word-count">{content.split(/\s+/).filter(w => w.length > 0).length} từ</span>
            <button 
              className="btn-primary analyze-btn" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content.trim()}
            >
              <BrainCircuit size={18} />
              {isAnalyzing ? 'Supervisor đang đọc...' : 'Nhận xét bài viết'}
            </button>
          </div>
        </div>

        {/* Supervisor AI Area */}
        <div className="supervisor-area glass-panel">
          <div className="panel-header">
            <BrainCircuit size={18} className="text-gradient" /> 
            <span>Supervisor AI</span>
          </div>
          
          <div className="feedback-content">
            {!feedback && !isAnalyzing && (
              <div className="empty-state">
                <div className="pulse-circle"></div>
                <p>AI đang chờ bạn hoàn thành đoạn văn để đưa ra nhận xét.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="analyzing-state">
                <div className="loader"></div>
                <p>Đang phân tích logic và cảm xúc...</p>
              </div>
            )}

            {feedback && !isAnalyzing && (
              <div className="feedback-results animate-fade-in">
                <div className="score-card">
                  <div className="score-circle">
                    <span className="score-value">{feedback.score}</span>
                    <span className="score-max">/100</span>
                  </div>
                  <div className="score-info">
                    <h4>Khá tốt!</h4>
                    <p>Tiếp tục phát huy nhé.</p>
                  </div>
                </div>

                <div className="feedback-section">
                  <h4><CheckCircle2 size={16} className="text-success" /> Điểm sáng</h4>
                  <ul>
                    {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className="feedback-section">
                  <h4><AlertCircle size={16} className="text-warning" /> Cần cải thiện</h4>
                  <ul className="weakness-list">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i}>
                        <span className={`badge-${w.type}`}>{w.type === 'logic' ? 'Logic' : 'Từ vựng'}</span>
                        {w.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="suggestion-box">
                  <h4><TrendingUp size={16} className="text-accent" /> Gợi ý nâng cấp</h4>
                  <p>{feedback.suggestions}</p>
                  <button className="btn-secondary apply-btn">Thêm ý này vào bài</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
