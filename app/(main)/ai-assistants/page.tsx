'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AuthContext, AuthContextType } from '@/context/AuthContext';

const assistants = [
  {
    id: 'codegenie-01',
    name: 'CodeGenie',
    title: 'AI Coding Assistant',
    description: 'Your coding copilot',
    imagePath: '/images/assistants/codegenie.jpeg',
    accent: 'from-blue-500 to-cyan-400',
    accentHex: '#3b82f6',
    accentHex2: '#22d3ee',
    icon: '💻',
    instruction: 'You are CodeGenie, an expert programming assistant. Provide clean, efficient code solutions with explanations. Focus on best practices and modern development patterns.',
    userInstruction: 'Ask me coding questions, request code snippets, or get help debugging issues. I can assist with multiple programming languages and frameworks.',
    sampleQuestions: [
      'How do I create a responsive navbar with React?',
      'Help me debug this JavaScript function',
      'Write a Python script to analyze CSV data'
    ],
    isFree: true
  },
  {
    id: 'edumate-04',
    name: 'EduMate',
    title: 'Educational Learning Companion',
    description: 'Smart learning companion',
    imagePath: '/images/assistants/edumate.jpeg',
    accent: 'from-amber-500 to-yellow-400',
    accentHex: '#f59e0b',
    accentHex2: '#facc15',
    icon: '📚',
    instruction: 'You are EduMate, an educational assistant. Provide clear, informative explanations on academic subjects. Break down complex topics into understandable concepts. Help with learning but don\'t solve assignments for students.',
    userInstruction: 'Ask me to explain academic concepts, help you study, or provide educational resources across various subjects.',
    sampleQuestions: [
      'Explain photosynthesis in simple terms',
      'Help me understand quadratic equations',
      'What are the major periods of world history?'
    ],
    isFree: true
  },
  {
    id: 'medibot-02',
    name: 'MediBot',
    title: 'Medical Information Assistant',
    description: 'Medical insights assistant',
    imagePath: '/images/assistants/medibot.jpeg',
    accent: 'from-emerald-500 to-green-400',
    accentHex: '#10b981',
    accentHex2: '#4ade80',
    icon: '🩺',
    instruction: 'You are MediBot, a medical information assistant. Provide educational health information based on reliable medical knowledge. Always emphasize the importance of consulting healthcare professionals.',
    userInstruction: 'Ask me about general medical topics, health education, and wellness information. Remember I cannot provide medical diagnosis or treatment advice.',
    sampleQuestions: [
      'What are common symptoms of the flu?',
      'How can I improve my sleep hygiene?',
      'Explain how vaccines work'
    ],
    isFree: false
  },
  {
    id: 'legalmind-03',
    name: 'LegalMind',
    title: 'Legal Documentation AI',
    description: 'Legal documentation AI',
    imagePath: '/images/assistants/legalmind.jpeg',
    accent: 'from-violet-500 to-purple-400',
    accentHex: '#8b5cf6',
    accentHex2: '#c084fc',
    icon: '⚖️',
    instruction: 'You are LegalMind, an assistant for legal information. Provide educational content about legal concepts, document types, and general legal information. Always disclaim that you are not providing legal advice.',
    userInstruction: 'Ask me about legal concepts, document types, or legal terminology. I cannot provide specific legal advice or represent you legally.',
    sampleQuestions: [
      'What should be included in a basic NDA?',
      'Explain the difference between copyright and trademark',
      'How does small claims court work?'
    ],
    isFree: false
  },
  {
    id: 'designwhiz-05',
    name: 'DesignWhiz',
    title: 'UI/UX Design Assistant',
    description: 'UI/UX design assistant',
    imagePath: '/images/assistants/designwhiz.jpeg',
    accent: 'from-pink-500 to-rose-400',
    accentHex: '#ec4899',
    accentHex2: '#fb7185',
    icon: '🎨',
    instruction: 'You are DesignWhiz, a UI/UX design assistant. Provide design principles, feedback, and guidance about user interfaces and experiences. Help with color theory, layout decisions, and accessibility considerations.',
    userInstruction: 'Ask me about UI/UX design principles, get feedback on design ideas, or learn about current design trends and best practices.',
    sampleQuestions: [
      'What color scheme would work for a finance app?',
      'How can I improve this website layout?',
      'Explain the principles of accessible design'
    ],
    isFree: false
  },
  {
    id: 'travelbot-06',
    name: 'TravelBot',
    title: 'Travel Planning Assistant',
    description: 'Travel planning AI',
    imagePath: '/images/assistants/travel.jpeg',
    accent: 'from-teal-500 to-cyan-400',
    accentHex: '#14b8a6',
    accentHex2: '#22d3ee',
    icon: '✈️',
    instruction: 'You are TravelBot, a travel planning assistant. Provide travel tips, destination information, and itinerary suggestions. Focus on helpful travel advice while acknowledging limitations in current pricing or availability information.',
    userInstruction: 'Ask me about travel destinations, planning tips, or itinerary suggestions. I can help with general travel information but cannot book tickets or provide real-time pricing.',
    sampleQuestions: [
      'What should I see during 3 days in Tokyo?',
      'Tips for traveling on a budget in Europe',
      'What\'s the best time to visit Costa Rica?'
    ],
    isFree: false
  },
  {
    id: 'chefai-07',
    name: 'ChefAI',
    title: 'Culinary Assistant',
    description: 'Recipe & cooking guide',
    imagePath: '/images/assistants/chefai.jpeg',
    accent: 'from-red-500 to-orange-400',
    accentHex: '#ef4444',
    accentHex2: '#fb923c',
    icon: '👨‍🍳',
    instruction: 'You are ChefAI, a culinary assistant. Provide recipes, cooking techniques, and food knowledge. Focus on clear instructions and helpful cooking tips. Consider dietary restrictions when mentioned.',
    userInstruction: 'Ask me for recipes, cooking advice, ingredient substitutions, or help with meal planning for various dietary needs.',
    sampleQuestions: [
      'How do I make a vegetarian lasagna?',
      'What can I substitute for eggs in baking?',
      'Give me a weekly meal plan for a family of four'
    ],
    isFree: false
  },
  {
    id: 'fingenie-08',
    name: 'FinGenie',
    title: 'Financial Planning Assistant',
    description: 'Financial planning AI',
    imagePath: '/images/assistants/fitness.jpeg',
    accent: 'from-indigo-500 to-blue-400',
    accentHex: '#6366f1',
    accentHex2: '#60a5fa',
    icon: '💰',
    instruction: 'You are FinGenie, a financial education assistant. Provide general financial education and concepts. Explain financial terms and principles clearly. Always disclaim that you cannot provide personalized financial advice.',
    userInstruction: 'Ask me about financial concepts, budgeting strategies, or general financial education. Remember I cannot provide personalized investment or tax advice.',
    sampleQuestions: [
      'Explain the difference between stocks and bonds',
      'How do I create a monthly budget?',
      'What should I know about retirement accounts?'
    ],
    isFree: false
  },
  {
    id: 'fitbuddy-09',
    name: 'FitBuddy',
    title: 'Fitness Training Assistant',
    description: 'Fitness trainer assistant',
    imagePath: '/images/assistants/fitness.jpeg',
    accent: 'from-orange-500 to-amber-400',
    accentHex: '#f97316',
    accentHex2: '#fbbf24',
    icon: '💪',
    instruction: 'You are FitBuddy, a fitness guidance assistant. Provide workout suggestions, exercise information, and general fitness education. Always emphasize safety and proper form. Suggest consulting professionals for personalized fitness plans.',
    userInstruction: 'Ask me about exercise routines, fitness techniques, or general workout guidance. I can provide fitness information but not personalized training plans.',
    sampleQuestions: [
      'What\'s a good beginner workout routine?',
      'How do I improve my running endurance?',
      'Explain proper squat form'
    ],
    isFree: false
  },
  {
    id: 'mindmuse-10',
    name: 'MindMuse',
    title: 'Wellness & Meditation Guide',
    description: 'Wellness & meditation AI',
    imagePath: '/images/assistants/meditation.jpeg',
    accent: 'from-sky-500 to-blue-400',
    accentHex: '#0ea5e9',
    accentHex2: '#60a5fa',
    icon: '🧘',
    instruction: 'You are MindMuse, a wellness and meditation assistant. Provide mindfulness techniques, meditation guidance, and general mental wellbeing information. Be calming and supportive in your approach. For serious mental health concerns, suggest professional help.',
    userInstruction: 'Ask me about meditation techniques, mindfulness practices, or general wellness information to support your mental wellbeing.',
    sampleQuestions: [
      'Guide me through a 5-minute breathing meditation',
      'How can I practice mindfulness throughout the day?',
      'What are some techniques to reduce stress?'
    ],
    isFree: false
  },
];

interface Assistant {
  id: string;
  name: string;
  title: string;
  description: string;
  imagePath: string;
  accent: string;
  accentHex: string;
  accentHex2: string;
  icon: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  isFree: boolean;
}

export interface UserType {
  uid: string;
  name: string;
  email: string;
  picture: string;
  credits?: number;
}

export default function AiAssistants() {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { user } = useContext(AuthContext) || { user: null };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Debug:', { userExists: !!user, userDetails: user });
    }
  }, [user]);

  const isUserLoggedIn = Boolean(user?.email);

  const handleSelect = (assistant: Assistant) => {
    if (!assistant.isFree && !isUserLoggedIn) {
      toast.error("Please sign in to access premium assistants.");
      return;
    }
    setSelecting(assistant.id);
    try {
      const selectedAssistant = {
        _id: assistant.id,
        name: assistant.name,
        title: assistant.title,
        image: assistant.imagePath,
        instruction: assistant.instruction,
        userInstruction: assistant.userInstruction,
        sampleQuestions: assistant.sampleQuestions,
        icon: assistant.icon,
        accent: assistant.accent,
        isFree: assistant.isFree
      };
      sessionStorage.setItem('selectedAssistant', JSON.stringify(selectedAssistant));
      toast.success(`${assistant.name} selected!`);
      router.push('/workspace');
    } catch (err) {
      console.error("Selection error:", err);
      toast.error("Failed to select assistant. Please try again.");
    } finally {
      setSelecting(null);
    }
  };

  const contactViaWhatsApp = () => {
    const phoneNumber = '254708201715';
    const message = encodeURIComponent(
      `Hello! I'm interested in learning more about KAI Assistant Platform. Could you please provide more information?`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const freeAssistants = assistants.filter(a => a.isFree);
  const premiumAssistants = assistants.filter(a => !a.isFree);

  if (!mounted) return null;

  return (
    <div className="kai-root">
      {/* Ambient background */}
      <div className="kai-bg">
        <div className="kai-grid" />
        <div className="kai-orb kai-orb-1" />
        <div className="kai-orb kai-orb-2" />
        <div className="kai-orb kai-orb-3" />
      </div>

      <div className="kai-container">

        {/* ── HERO HEADER ── */}
        <header className="kai-hero">
          <div className="kai-logo-ring">
            <span className="kai-logo-icon">🤖</span>
          </div>
          <div className="kai-hero-text">
            <h1 className="kai-wordmark">
              <span className="kai-wordmark-k">K</span>
              <span className="kai-wordmark-a">A</span>
              <span className="kai-wordmark-i">I</span>
            </h1>
            <p className="kai-tagline">Knowledge Assistants & Intelligence</p>
          </div>
          <p className="kai-subtitle">
            Next-generation neural assistants with specialized capabilities for enhanced human–AI collaboration
          </p>
          <div className="kai-meta">
            <span className="kai-pill kai-pill-live">
              <span className="kai-pulse" />
              Powered by XammyTech
            </span>
            <span className="kai-pill">Beta v1.0</span>
            <span className="kai-pill">Student Testing Phase</span>
          </div>

          <button onClick={contactViaWhatsApp} className="kai-whatsapp-btn">
            <span>📱</span>
            <span>Contact via WhatsApp</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </button>
        </header>

        {/* ── FREE SECTION ── */}
        <section className="kai-section">
          <div className="kai-section-head">
            <div className="kai-section-badge" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
              <span>🆓</span>
            </div>
            <div>
              <h2 className="kai-section-title">Free Assistants</h2>
              <p className="kai-section-sub">No sign-in required · Available to everyone</p>
            </div>
            <div className="kai-section-line" />
          </div>

          <div className="kai-free-grid">
            {freeAssistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                isLocked={false}
                isSelecting={selecting === assistant.id}
                isHovered={hoveredId === assistant.id}
                onHover={setHoveredId}
                onSelect={handleSelect}
                onSignIn={() => router.push('/sign-in')}
                badge="FREE"
                badgeColor="#10b981"
              />
            ))}
          </div>
        </section>

        {/* ── PREMIUM SECTION ── */}
        <section className="kai-section">
          <div className="kai-section-head">
            <div className="kai-section-badge" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' }}>
              <span>⭐</span>
            </div>
            <div>
              <h2 className="kai-section-title">Premium Assistants</h2>
              <p className="kai-section-sub">Sign-in required · Advanced capabilities</p>
            </div>
            <div className="kai-section-line" />
          </div>

          {!isUserLoggedIn && (
            <div className="kai-login-banner">
              <div className="kai-login-icon">🔐</div>
              <div>
                <p className="kai-login-title">Unlock the full suite</p>
                <p className="kai-login-sub">Create a free account to access all 8 premium AI assistants.</p>
              </div>
              <button onClick={() => router.push('/sign-in')} className="kai-login-cta">
                Sign In
              </button>
            </div>
          )}

          <div className="kai-premium-grid">
            {premiumAssistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                isLocked={!isUserLoggedIn}
                isSelecting={selecting === assistant.id}
                isHovered={hoveredId === assistant.id}
                onHover={setHoveredId}
                onSelect={handleSelect}
                onSignIn={() => router.push('/sign-in')}
                badge="PRO"
                badgeColor="#8b5cf6"
              />
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="kai-footer">
          <div className="kai-footer-card">
            <div className="kai-footer-logo">
              <span className="kai-footer-rocket">🚀</span>
              <span className="kai-footer-brand">XTechDevs</span>
            </div>
            <p className="kai-footer-desc">
              Innovative AI solutions for the modern world. This is a school project showcasing next-generation AI assistant technology.
            </p>
          </div>
          <p className="kai-copyright">© 2026 KAI · Built with ❤️ by XTech Devs · Powered by Next.js & Convex</p>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ─── ROOT ─── */
        .kai-root {
          min-height: 100vh;
          background: #060812;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* ─── AMBIENT BACKGROUND ─── */
        .kai-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .kai-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%);
        }
        .kai-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.18;
        }
        .kai-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #6366f1, transparent 70%);
          top: -200px; left: -100px;
          animation: orbFloat 14s ease-in-out infinite alternate;
        }
        .kai-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #06b6d4, transparent 70%);
          top: 40%; right: -150px;
          animation: orbFloat 18s ease-in-out infinite alternate-reverse;
        }
        .kai-orb-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #8b5cf6, transparent 70%);
          bottom: 10%; left: 20%;
          animation: orbFloat 22s ease-in-out infinite alternate;
        }
        @keyframes orbFloat {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.1); }
        }

        /* ─── LAYOUT ─── */
        .kai-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        /* ─── HERO ─── */
        .kai-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 80px 0 64px;
          gap: 20px;
        }
        .kai-logo-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.15));
          border: 1px solid rgba(99,102,241,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
          box-shadow: 0 0 40px rgba(99,102,241,0.25), inset 0 0 20px rgba(99,102,241,0.1);
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 40px rgba(99,102,241,0.25), inset 0 0 20px rgba(99,102,241,0.1); }
          50%      { box-shadow: 0 0 60px rgba(99,102,241,0.5), inset 0 0 30px rgba(99,102,241,0.2); }
        }
        .kai-logo-icon { font-size: 36px; }
        .kai-hero-text { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .kai-wordmark {
          font-family: 'Syne', sans-serif;
          font-size: 80px;
          font-weight: 800;
          letter-spacing: -4px;
          line-height: 1;
          display: flex;
        }
        .kai-wordmark-k { color: #e8eaf0; }
        .kai-wordmark-a {
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .kai-wordmark-i { color: #e8eaf0; }
        .kai-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(99,102,241,0.9);
          font-weight: 500;
        }
        .kai-subtitle {
          max-width: 520px;
          color: #8b92b0;
          font-size: 16px;
          line-height: 1.7;
          font-weight: 300;
        }
        .kai-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .kai-pill {
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          font-size: 12px;
          color: #8b92b0;
          display: flex; align-items: center; gap: 6px;
          backdrop-filter: blur(8px);
        }
        .kai-pill-live { color: #34d399; border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.07); }
        .kai-pulse {
          width: 7px; height: 7px;
          background: #34d399;
          border-radius: 50%;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.8); }
        }
        .kai-whatsapp-btn {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 100px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 24px rgba(16,185,129,0.35);
        }
        .kai-whatsapp-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(16,185,129,0.5);
        }

        /* ─── SECTIONS ─── */
        .kai-section { margin-bottom: 64px; }
        .kai-section-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .kai-section-badge {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .kai-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #e8eaf0;
          margin: 0;
          line-height: 1;
        }
        .kai-section-sub {
          font-size: 13px;
          color: #8b92b0;
          margin: 4px 0 0;
        }
        .kai-section-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%);
        }

        /* ─── GRIDS ─── */
        .kai-free-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .kai-premium-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* ─── CARD ─── */
        .kai-card {
          position: relative;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(12px);
        }
        .kai-card:hover {
          transform: translateY(-4px);
        }
        .kai-card.locked {
          opacity: 0.7;
        }
        .kai-card-top-bar {
          height: 2px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .kai-card-top-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        .kai-card-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          z-index: 2;
          font-family: 'DM Sans', sans-serif;
        }
        .kai-card-icon-area {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .kai-card-icon {
          font-size: 40px;
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5));
        }
        .kai-card:hover .kai-card-icon {
          transform: scale(1.15) translateY(-2px);
        }
        .kai-card-icon-glow {
          position: absolute;
          width: 80px; height: 80px;
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .kai-card:hover .kai-card-icon-glow { opacity: 0.6; }
        .kai-lock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6,8,18,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          backdrop-filter: blur(2px);
        }
        .kai-card-body {
          padding: 16px 20px 20px;
        }
        .kai-card-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
          margin: 0 0 2px;
        }
        .kai-card-title {
          font-size: 12px;
          color: #8b92b0;
          margin: 0 0 8px;
        }
        .kai-card-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px;
          line-height: 1.5;
        }
        .kai-card-btn {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .kai-card-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s ease;
        }
        .kai-card-btn:hover::before { background: rgba(255,255,255,0.12); }
        .kai-card-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .kai-card-btn.locked-btn {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1);
          color: #8b92b0;
        }

        /* ─── LOGIN BANNER ─── */
        .kai-login-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          margin-bottom: 24px;
          backdrop-filter: blur(8px);
        }
        .kai-login-icon { font-size: 28px; }
        .kai-login-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #e8eaf0;
          margin: 0 0 2px;
        }
        .kai-login-sub {
          font-size: 13px;
          color: #8b92b0;
          margin: 0;
        }
        .kai-login-cta {
          margin-left: auto;
          padding: 10px 24px;
          border-radius: 100px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: white;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }
        .kai-login-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
        }

        /* ─── FOOTER ─── */
        .kai-footer {
          text-align: center;
          padding-top: 48px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .kai-footer-card {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 28px 36px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 24px;
          max-width: 480px;
        }
        .kai-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kai-footer-rocket { font-size: 24px; }
        .kai-footer-brand {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
        }
        .kai-footer-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          text-align: center;
          margin: 0;
        }
        .kai-copyright {
          font-size: 12px;
          color: #4b5563;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 640px) {
          .kai-wordmark { font-size: 56px; }
          .kai-free-grid { grid-template-columns: 1fr; }
          .kai-premium-grid { grid-template-columns: repeat(2, 1fr); }
          .kai-login-banner { flex-wrap: wrap; }
          .kai-login-cta { margin-left: 0; width: 100%; }
          .kai-section-line { display: none; }
        }
        @media (max-width: 400px) {
          .kai-premium-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

/* ─── ASSISTANT CARD COMPONENT ─── */
function AssistantCard({
  assistant,
  isLocked,
  isSelecting,
  isHovered,
  onHover,
  onSelect,
  onSignIn,
  badge,
  badgeColor,
}: {
  assistant: Assistant;
  isLocked: boolean;
  isSelecting: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (a: Assistant) => void;
  onSignIn: () => void;
  badge: string;
  badgeColor: string;
}) {
  const glowColor = assistant.accentHex;

  return (
    <div
      className={`kai-card${isLocked ? ' locked' : ''}`}
      style={{
        boxShadow: isHovered
          ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${glowColor}40`
          : '0 4px 24px rgba(0,0,0,0.3)',
        borderColor: isHovered ? `${glowColor}30` : 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => onHover(assistant.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Top accent bar */}
      <div
        className="kai-card-top-bar"
        style={{ background: `linear-gradient(90deg, ${glowColor}, ${assistant.accentHex2})` }}
      />

      {/* Badge */}
      <div
        className="kai-card-badge"
        style={{ background: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}44` }}
      >
        {badge}
      </div>

      {/* Icon area */}
      <div
        className="kai-card-icon-area"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${glowColor}18 0%, transparent 70%)`,
        }}
      >
        <div className="kai-card-icon-glow" style={{ background: glowColor }} />
        <span className="kai-card-icon">{assistant.icon}</span>
        {isLocked && <div className="kai-lock-overlay">🔒</div>}
      </div>

      {/* Body */}
      <div className="kai-card-body">
        <h3 className="kai-card-name">{assistant.name}</h3>
        <p className="kai-card-title">{assistant.title}</p>
        <p className="kai-card-desc">{assistant.description}</p>

        <button
          className={`kai-card-btn${isLocked ? ' locked-btn' : ''}`}
          style={
            isLocked
              ? {}
              : { background: `linear-gradient(135deg, ${glowColor}, ${assistant.accentHex2})` }
          }
          disabled={isSelecting}
          onClick={() => {
            if (isLocked) {
              onSignIn();
            } else {
              onSelect(assistant);
            }
          }}
        >
          {isSelecting ? 'Starting…' : isLocked ? '🔒 Sign In Required' : 'Start Chat →'}
        </button>
      </div>
    </div>
  );
}