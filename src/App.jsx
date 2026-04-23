import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import TopicInput from './components/TopicInput';
import IdeaGenerator from './components/IdeaGenerator';
import Workspace from './components/Workspace';
import RoleplayMode from './components/RoleplayMode';

export default function App() {
  const [step, setStep] = useState('topic'); // topic, ideas, workspace, roleplay
  const [topicInfo, setTopicInfo] = useState({ topic: '', level: '' });
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleTopicSubmit = (topic, level) => {
    setTopicInfo({ topic, level });
    setStep('ideas');
  };

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setStep('workspace');
  };

  const renderStep = () => {
    switch (step) {
      case 'topic':
        return <TopicInput onSubmit={handleTopicSubmit} />;
      case 'ideas':
        return (
          <IdeaGenerator 
            topic={topicInfo.topic} 
            level={topicInfo.level}
            onSelectIdea={handleSelectIdea} 
            onBack={() => setStep('topic')} 
          />
        );
      case 'workspace':
        return (
          <Workspace 
            idea={selectedIdea} 
            onRoleplay={() => setStep('roleplay')} 
          />
        );
      case 'roleplay':
        return <RoleplayMode topic={topicInfo.topic} onBack={() => setStep('workspace')} />;
      default:
        return <TopicInput onSubmit={handleTopicSubmit} />;
    }
  };

  return (
    <div className="container">
      <header>
        <div className="logo text-gradient">
          <Sparkles size={28} className="text-accent" />
          Supervisor AI
        </div>
        
        {step !== 'topic' && (
          <div className="user-profile animate-fade-in">
            <span className="rank-badge">Rank: Writer Bronze</span>
            <div className="avatar">A</div>
          </div>
        )}
      </header>

      <main>
        {renderStep()}
      </main>
    </div>
  );
}
