import { useState, useEffect } from 'react';
import { Lightbulb, Compass, GitMerge, ArrowLeft, Loader2 } from 'lucide-react';
import './IdeaGenerator.css';

export default function IdeaGenerator({ topic, level, onSelectIdea, onBack }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, level })
        });
        if (!response.ok) throw new Error('Không thể lấy ý tưởng từ AI');
        const data = await response.json();
        setIdeas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [topic, level]);

  if (loading) {
    return (
      <div className="idea-container animate-fade-in flex-center">
        <Loader2 className="loader animate-spin" size={48} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Gemini đang tư duy ý tưởng sáng tạo cho bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idea-container animate-fade-in text-center">
        <p className="text-danger">Lỗi: {error}</p>
        <button className="btn-secondary" onClick={onBack}>Quay lại thử lại</button>
      </div>
    );
  }

  return (
    <div className="idea-container animate-fade-in">
      <button className="btn-icon-text back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="idea-header">
        <h2 className="section-title">
          Gợi ý cho: <span className="text-gradient">"{topic}"</span>
        </h2>
        <p className="section-subtitle">
          Hãy chọn một hướng đi khiến bài viết của bạn trở nên độc đáo và khác biệt.
        </p>
      </div>

      <div className="ideas-grid">
        {ideas.map((idea) => (
          <div 
            key={idea.id} 
            className={`glass-panel idea-card ${idea.color || 'purple'}-glow`}
            onClick={() => onSelectIdea(idea)}
          >
            <div className="idea-card-header">
              <span className={`idea-badge badge-${idea.color || 'purple'}`}>{idea.type}</span>
              {idea.type === 'Góc nhìn mới' ? <Compass className="idea-icon new-angle" /> : 
               idea.type === 'Plot twist' ? <GitMerge className="idea-icon twist" /> : 
               <Lightbulb className="idea-icon psychology" />}
            </div>
            <h3 className="idea-title">{idea.title}</h3>
            <p className="idea-description">{idea.description}</p>
            <button className={`btn-outline btn-${idea.color || 'purple'}`}>
              Viết theo hướng này
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
