/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Assistant {
  _id: string;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  icon: string;
  accent: string;
  isFree: boolean;
}

// ── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="ws-code-block"><code class="lang-${lang || 'text'}">${escHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, (_, c) => `<code class="ws-inline-code">${escHtml(c)}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="ws-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="ws-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="ws-h1">$1</h1>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(?![\s\S]*<li>)/g, '<ul class="ws-ul">$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr class="ws-hr" />')
    .replace(/\n\n/g, '</p><p class="ws-p">')
    .replace(/\n/g, '<br />');
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Copy hook ────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);
  return { copied, copy };
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="ws-typing-dots" aria-label="Typing">
      <span /><span /><span />
    </span>
  );
}

// ── Accent extractor ─────────────────────────────────────────────────────────
function getAccentColor(accent: string): { primary: string; secondary: string; rgb: string } {
  const map: Record<string, { primary: string; secondary: string; rgb: string }> = {
    blue:    { primary: '#4f8ef7', secondary: '#3b6fd4', rgb: '79,142,247' },
    cyan:    { primary: '#22d3ee', secondary: '#0ea5e9', rgb: '34,211,238' },
    emerald: { primary: '#34d399', secondary: '#10b981', rgb: '52,211,153' },
    green:   { primary: '#4ade80', secondary: '#22c55e', rgb: '74,222,128' },
    violet:  { primary: '#a78bfa', secondary: '#7c3aed', rgb: '167,139,250' },
    purple:  { primary: '#c084fc', secondary: '#9333ea', rgb: '192,132,252' },
    pink:    { primary: '#f472b6', secondary: '#ec4899', rgb: '244,114,182' },
    rose:    { primary: '#fb7185', secondary: '#f43f5e', rgb: '251,113,133' },
    teal:    { primary: '#2dd4bf', secondary: '#14b8a6', rgb: '45,212,191' },
    amber:   { primary: '#fbbf24', secondary: '#f59e0b', rgb: '251,191,36' },
    yellow:  { primary: '#facc15', secondary: '#eab308', rgb: '250,204,21' },
    orange:  { primary: '#fb923c', secondary: '#f97316', rgb: '251,146,60' },
    red:     { primary: '#f87171', secondary: '#ef4444', rgb: '248,113,113' },
    indigo:  { primary: '#818cf8', secondary: '#6366f1', rgb: '129,140,248' },
    sky:     { primary: '#38bdf8', secondary: '#0ea5e9', rgb: '56,189,248' },
  };
  const key = Object.keys(map).find(k => accent.includes(k));
  return key ? map[key] : { primary: '#4f8ef7', secondary: '#3b6fd4', rgb: '79,142,247' };
}

export default function AIWorkspace() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { copied, copy } = useCopy();

  // ── Auth & init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    const stored = sessionStorage.getItem('selectedAssistant');
    if (!stored) { router.push('/ai-assistants'); return; }
    try {
      const assistant: Assistant = JSON.parse(stored);
      if (!assistant.isFree && !user) {
        toast.error('Please sign in to access premium assistants.');
        router.push('/sign-in');
        return;
      }
      setSelectedAssistant(assistant);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello${user ? ` **${user.name}**` : ''}! I'm **${assistant.name}**, your ${assistant.title.toLowerCase()}.\n\n${assistant.userInstruction}`,
        timestamp: new Date(),
      }]);
      setIsInitialized(true);
    } catch {
      toast.error('Failed to load assistant.');
      router.push('/ai-assistants');
    }
  }, [router, user, authLoading]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isLoading || messages[messages.length - 1]?.role === 'assistant') scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [inputMessage]);

  // ── API call ───────────────────────────────────────────────────────────────
  const callGeminiAPI = async (prompt: string, history: Message[]) => {
    const last = sessionStorage.getItem('lastApiRequest');
    const now = Date.now();
    if (last && now - parseInt(last) < 800) throw new Error('wait');
    sessionStorage.setItem('lastApiRequest', now.toString());
    if (!prompt.trim()) throw new Error('empty');
    if (prompt.length > 4000) throw new Error('toolong');

    const systemPrompt = selectedAssistant?.instruction ?? '';
    const userCtx = user ? `User: ${user.name} (${user.email})` : 'Anonymous User';
    const ctx = history.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\n${userCtx}\n\nConversation History:\n${ctx}\n\nUser: ${prompt}\n\nAssistant:`;

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? { 'X-User-ID': user.uid } : {}),
      },
      body: JSON.stringify({ prompt: fullPrompt, model: 'gemini-3-flash-preview', userId: user?.uid ?? 'anonymous' }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.response) throw new Error('empty_response');
    return data.response as string;
  };

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputMessage.trim();
    if (!text || isLoading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const reply = await callGeminiAPI(text, [...messages, userMsg]);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      let friendly = 'Something went wrong. Please try again.';
      if (msg === 'wait') friendly = 'Please wait a moment before sending.';
      else if (msg === 'toolong') friendly = 'Message too long — keep it under 4 000 characters.';
      else if (msg.includes('rate limit')) friendly = 'Rate limit reached. Try again in a minute.';
      else if (msg.includes('safety') || msg.includes('blocked')) friendly = 'Content flagged by safety filters. Please rephrase.';
      toast.error(friendly);
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: `⚠️ ${friendly}`, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => {
    if (!selectedAssistant) return;
    setMessages([{
      id: `w-${Date.now()}`, role: 'assistant',
      content: `Hello${user ? ` **${user.name}**` : ''}! I'm **${selectedAssistant.name}**, your ${selectedAssistant.title.toLowerCase()}.\n\n${selectedAssistant.userInstruction}`,
      timestamp: new Date(),
    }]);
    setInputMessage('');
    toast.success('Conversation cleared');
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading || !isInitialized || !selectedAssistant) {
    return (
      <div className="ws-loader-screen">
        <div className="ws-loader-ring" />
        <p className="ws-loader-text">Initializing workspace…</p>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400&display=swap');
          .ws-loader-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0a0b0f;gap:20px;font-family:'DM Sans',sans-serif;}
          .ws-loader-ring{width:40px;height:40px;border:2px solid rgba(79,142,247,.2);border-top-color:#4f8ef7;border-radius:50%;animation:wspin .8s linear infinite;}
          @keyframes wspin{to{transform:rotate(360deg)}}
          .ws-loader-text{color:#4a5568;font-size:14px;letter-spacing:.05em;}
        `}</style>
      </div>
    );
  }

  const accent = getAccentColor(selectedAssistant.accent);
  const msgCount = messages.filter(m => m.role === 'user').length;

  return (
    <div className="ws-root">
      <style>{buildStyles(accent)}</style>

      {/* ── SIDEBAR (info panel) ── */}
      <aside className={`ws-sidebar ${sidebarOpen ? 'ws-sidebar-open' : ''}`}>
        <div className="ws-sidebar-header">
          <button className="ws-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="ws-sidebar-icon">{selectedAssistant.icon}</div>
        <h2 className="ws-sidebar-name">{selectedAssistant.name}</h2>
        <p className="ws-sidebar-title">{selectedAssistant.title}</p>

        <div className="ws-sidebar-divider" />

        <p className="ws-sidebar-section-label">About</p>
        <p className="ws-sidebar-desc">{selectedAssistant.userInstruction}</p>

        <div className="ws-sidebar-divider" />

        <p className="ws-sidebar-section-label">Try asking</p>
        <div className="ws-sidebar-starters">
          {selectedAssistant.sampleQuestions.map((q, i) => (
            <button key={i} className="ws-sidebar-starter" onClick={() => { setInputMessage(q); setSidebarOpen(false); textareaRef.current?.focus(); }}>
              <span className="ws-sidebar-starter-q">{q}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>

        <div className="ws-sidebar-divider" />

        <div className="ws-sidebar-stats">
          <div className="ws-stat">
            <span className="ws-stat-value">{msgCount}</span>
            <span className="ws-stat-label">messages sent</span>
          </div>
          <div className="ws-stat">
            <span className="ws-stat-value">{selectedAssistant.isFree ? 'Free' : 'Pro'}</span>
            <span className="ws-stat-label">plan</span>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="ws-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="ws-main">

        {/* ── HEADER ── */}
        <header className="ws-header">
          <div className="ws-header-left">
            <button className="ws-icon-btn ws-back" onClick={() => router.push('/ai-assistants')} aria-label="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
            <button className="ws-assistant-identity" onClick={() => setSidebarOpen(true)}>
              <div className="ws-ai-icon-wrap">
                <span className="ws-ai-icon-emoji">{selectedAssistant.icon}</span>
                <span className="ws-ai-online-dot" />
              </div>
              <div className="ws-ai-meta">
                <span className="ws-ai-name">{selectedAssistant.name}</span>
                <span className="ws-ai-status">
                  <span className="ws-ai-status-dot" />
                  {isLoading ? 'Thinking…' : 'Online'}
                </span>
              </div>
              {!selectedAssistant.isFree && <span className="ws-pro-chip">PRO</span>}
            </button>
          </div>

          <div className="ws-header-right">
            {user && (
              <div className="ws-user-chip">
                <Image src={user.picture} alt={user.name} width={26} height={26} className="ws-user-avatar" />
                <span className="ws-user-initial">{user.name[0]}</span>
              </div>
            )}
            <button className="ws-icon-btn ws-info-btn" onClick={() => setSidebarOpen(true)} title="Assistant info">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </button>
            <button className="ws-icon-btn ws-clear-btn" onClick={clearChat} title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </header>

        {/* ── MESSAGES ── */}
        <main className="ws-messages" ref={messagesContainerRef}>
          <div className="ws-messages-track">

            {/* Starter suggestions — first time only */}
            {messages.length <= 1 && (
              <div className="ws-welcome">
                <div className="ws-welcome-hero">
                  <div className="ws-welcome-icon">{selectedAssistant.icon}</div>
                  <h1 className="ws-welcome-title">How can I help?</h1>
                  <p className="ws-welcome-sub">Ask me anything, or pick a suggestion below</p>
                </div>
                <div className="ws-starters">
                  {selectedAssistant.sampleQuestions.map((q, i) => (
                    <button key={i} className="ws-starter" style={{ animationDelay: `${i * 0.08}s` }}
                      onClick={() => { setInputMessage(q); textareaRef.current?.focus(); }}>
                      <span className="ws-starter-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="ws-starter-q">{q}</span>
                      <svg className="ws-starter-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`ws-msg ws-msg--${msg.role}`} style={{ animationDelay: `${Math.min(idx, 4) * 0.04}s` }}>

                {msg.role === 'assistant' && (
                  <div className="ws-avatar ws-avatar--ai">
                    <span className="ws-avatar-emoji">{selectedAssistant.icon}</span>
                  </div>
                )}

                <div className="ws-bubble-col">
                  <div className={`ws-bubble ws-bubble--${msg.role}`}>
                    {msg.role === 'assistant'
                      ? <div className="ws-md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      : <div className="ws-user-body">{msg.content}</div>}
                  </div>

                  <div className={`ws-msg-meta ws-msg-meta--${msg.role}`}>
                    <time className="ws-time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    {msg.role === 'assistant' && (
                      <button className="ws-copy" onClick={() => copy(msg.content, msg.id)}>
                        {copied === msg.id
                          ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Copied</span></>
                          : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>Copy</span></>}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="ws-avatar ws-avatar--user">
                    {user
                      ? <Image src={user.picture} alt={user.name} width={28} height={28} style={{ borderRadius: '50%' }} />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>}
                  </div>
                )}
              </div>
            ))}

            {/* Typing */}
            {isLoading && (
              <div className="ws-msg ws-msg--assistant">
                <div className="ws-avatar ws-avatar--ai">
                  <span className="ws-avatar-emoji">{selectedAssistant.icon}</span>
                </div>
                <div className="ws-bubble ws-bubble--assistant ws-bubble--typing">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>

          {/* Scroll button */}
          {showScrollBtn && (
            <button className="ws-scroll-fab" onClick={scrollToBottom}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </button>
          )}
        </main>

        {/* ── INPUT ── */}
        <footer className="ws-footer">
          <div className="ws-input-shell">
            <div className="ws-input-inner">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedAssistant.name}…`}
                rows={1}
                disabled={isLoading}
                className="ws-textarea"
                maxLength={4000}
              />
              {inputMessage.length > 100 && (
                <span className="ws-char" style={{ color: inputMessage.length > 3800 ? '#ef4444' : inputMessage.length > 3200 ? '#f59e0b' : undefined }}>
                  {inputMessage.length}/4000
                </span>
              )}
            </div>
            <button
              className={`ws-send ${!inputMessage.trim() || isLoading ? 'ws-send--off' : 'ws-send--on'}`}
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading
                ? <div className="ws-send-spin" />
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
            </button>
          </div>
          <p className="ws-footer-hint">↵ Send · ⇧↵ New line</p>
        </footer>
      </div>
    </div>
  );
}

// ── Style factory ────────────────────────────────────────────────────────────
function buildStyles(accent: { primary: string; secondary: string; rgb: string }) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --accent: ${accent.primary};
  --accent2: ${accent.secondary};
  --accent-rgb: ${accent.rgb};
  --bg: #0a0b0f;
  --surface: #111318;
  --surface2: #181b22;
  --border: rgba(255,255,255,0.065);
  --border2: rgba(255,255,255,0.04);
  --text: #e2e4ed;
  --text2: #8b91a8;
  --text3: #50566b;
  --user-bubble: var(--accent);
  --ai-bubble: var(--surface2);
  --font-body: 'DM Sans', sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* ── Layout ── */
.ws-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14.5px;
}

.ws-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

/* ── Sidebar ── */
.ws-sidebar {
  position: fixed;
  right: 0; top: 0; bottom: 0;
  width: 300px;
  background: var(--surface);
  border-left: 1px solid var(--border);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 0 0 32px;
  overflow-y: auto;
}
.ws-sidebar-open { transform: translateX(0); }
.ws-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 49;
  backdrop-filter: blur(2px);
}

.ws-sidebar-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px 16px 0;
}
.ws-sidebar-close {
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text2);
  cursor: pointer;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.ws-sidebar-close:hover { color: var(--text); background: var(--surface2); }

.ws-sidebar-icon {
  font-size: 48px;
  text-align: center;
  margin: 16px 0 8px;
}
.ws-sidebar-name {
  font-family: var(--font-serif);
  font-size: 22px;
  text-align: center;
  color: var(--text);
  font-style: italic;
}
.ws-sidebar-title {
  font-size: 12px;
  text-align: center;
  color: var(--accent);
  letter-spacing: .06em;
  margin-top: 4px;
  padding: 0 24px;
}
.ws-sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 20px;
}
.ws-sidebar-section-label {
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 0 20px 8px;
  font-weight: 500;
}
.ws-sidebar-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.65;
  padding: 0 20px;
}
.ws-sidebar-starters {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px;
}
.ws-sidebar-starter {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text2);
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: all .15s;
}
.ws-sidebar-starter:hover {
  background: var(--surface2);
  border-color: rgba(${accent.rgb},0.3);
  color: var(--text);
}
.ws-sidebar-starter-q { flex: 1; line-height: 1.4; }
.ws-sidebar-stats {
  display: flex;
  gap: 1px;
  margin: 0 20px;
}
.ws-stat {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.ws-stat:first-child { border-radius: 10px 0 0 10px; }
.ws-stat:last-child { border-radius: 0 10px 10px 0; }
.ws-stat-value {
  display: block;
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--accent);
  font-style: italic;
}
.ws-stat-label {
  display: block;
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

/* ── Header ── */
.ws-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid var(--border);
  background: rgba(10,11,15,0.85);
  backdrop-filter: blur(24px);
  flex-shrink: 0;
  z-index: 10;
}
.ws-header-left, .ws-header-right { display: flex; align-items: center; gap: 10px; }

.ws-icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: none;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text2);
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
}
.ws-icon-btn:hover { color: var(--text); background: var(--surface2); border-color: var(--border); }
.ws-back:hover { transform: translateX(-1px); }
.ws-clear-btn:hover { border-color: rgba(239,68,68,0.4); color: #f87171; }

.ws-assistant-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  transition: all .15s;
}
.ws-assistant-identity:hover {
  background: var(--surface2);
  border-color: var(--border);
}
.ws-ai-icon-wrap {
  position: relative;
  width: 34px; height: 34px;
  background: linear-gradient(135deg, rgba(${accent.rgb},0.25), rgba(${accent.rgb},0.08));
  border: 1px solid rgba(${accent.rgb},0.3);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ws-ai-icon-emoji { font-size: 18px; }
.ws-ai-online-dot {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 9px; height: 9px;
  background: #22c55e;
  border: 2px solid var(--bg);
  border-radius: 50%;
}
.ws-ai-meta { display: flex; flex-direction: column; gap: 1px; }
.ws-ai-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  line-height: 1;
}
.ws-ai-status {
  font-size: 11px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ws-ai-status-dot {
  width: 6px; height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}
@keyframes statusPulse {
  0%,100% { opacity:1; }
  50% { opacity:.4; }
}
.ws-pro-chip {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .07em;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(${accent.rgb},0.15);
  color: var(--accent);
  border: 1px solid rgba(${accent.rgb},0.25);
}

.ws-user-chip {
  display: flex; align-items: center;
  border-radius: 50%;
  overflow: hidden;
  width: 32px; height: 32px;
  border: 2px solid rgba(${accent.rgb},0.3);
}
.ws-user-avatar { border-radius: 50%; display: block; }
.ws-user-initial {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(${accent.rgb},0.2);
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  display: none;
}

/* ── Messages ── */
.ws-messages {
  flex: 1;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
}
.ws-messages::-webkit-scrollbar { width: 4px; }
.ws-messages::-webkit-scrollbar-track { background: transparent; }
.ws-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }

.ws-messages-track {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 16px;
}

/* ── Welcome / starters ── */
.ws-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 20px 0 40px;
}
.ws-welcome-hero { text-align: center; }
.ws-welcome-icon {
  font-size: 52px;
  display: block;
  margin-bottom: 16px;
  animation: iconFloat 4s ease-in-out infinite;
}
@keyframes iconFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.ws-welcome-title {
  font-family: var(--font-serif);
  font-size: 36px;
  font-style: italic;
  color: var(--text);
  margin-bottom: 8px;
}
.ws-welcome-sub {
  font-size: 14px;
  color: var(--text3);
}

.ws-starters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 560px;
}
.ws-starter {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text2);
  font-size: 13.5px;
  text-align: left;
  cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1);
  opacity: 0;
  animation: starterIn .4s ease forwards;
}
@keyframes starterIn {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:none; }
}
.ws-starter:hover {
  border-color: rgba(${accent.rgb},0.35);
  background: rgba(${accent.rgb},0.06);
  color: var(--text);
  transform: translateX(4px);
}
.ws-starter-num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(${accent.rgb},0.7);
  font-weight: 500;
  flex-shrink: 0;
}
.ws-starter-q { flex: 1; line-height: 1.45; }
.ws-starter-arr {
  flex-shrink: 0;
  color: var(--text3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all .15s;
}
.ws-starter:hover .ws-starter-arr { opacity: 1; transform: none; }

/* ── Message rows ── */
.ws-msg {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
  opacity: 0;
  animation: msgIn .3s ease forwards;
}
@keyframes msgIn {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:none; }
}
.ws-msg--user { flex-direction: row-reverse; }

.ws-avatar {
  width: 32px; height: 32px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.ws-avatar--ai {
  background: linear-gradient(135deg, rgba(${accent.rgb},0.25), rgba(${accent.rgb},0.08));
  border: 1px solid rgba(${accent.rgb},0.25);
  font-size: 17px;
}
.ws-avatar-emoji { font-size: 17px; }
.ws-avatar--user {
  background: linear-gradient(135deg, rgba(${accent.rgb},0.3), rgba(${accent.rgb},0.1));
  color: var(--accent);
  border: 1px solid rgba(${accent.rgb},0.2);
}

.ws-bubble-col { display: flex; flex-direction: column; gap: 5px; max-width: calc(100% - 44px); }
.ws-msg--user .ws-bubble-col { align-items: flex-end; }

.ws-bubble {
  border-radius: 18px;
  padding: 13px 17px;
  font-size: 14.5px;
  line-height: 1.68;
  position: relative;
}
.ws-bubble--typing { padding: 16px 20px; }
.ws-bubble--assistant {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
  color: var(--text);
}
.ws-bubble--user {
  background: var(--accent);
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 16px rgba(${accent.rgb},0.35);
}

/* ── Markdown ── */
.ws-md-body p.ws-p, .ws-md-body p { margin-bottom: 10px; }
.ws-md-body p:last-child { margin-bottom: 0; }
.ws-md-body h1.ws-h1 { font-family: var(--font-serif); font-size: 18px; font-style: italic; color: var(--text); margin: 14px 0 6px; }
.ws-md-body h2.ws-h2 { font-family: var(--font-serif); font-size: 16px; font-style: italic; color: var(--text); margin: 12px 0 5px; }
.ws-md-body h3.ws-h3 { font-size: 14px; font-weight: 600; color: var(--text); margin: 10px 0 5px; }
.ws-md-body ul.ws-ul { padding-left: 18px; margin: 6px 0; }
.ws-md-body li { margin: 4px 0; color: var(--text); }
.ws-md-body strong { font-weight: 600; color: var(--text); }
.ws-md-body em { font-style: italic; opacity: .85; }
.ws-md-body hr.ws-hr { border: none; border-top: 1px solid var(--border); margin: 12px 0; }

.ws-inline-code {
  font-family: var(--font-mono);
  font-size: 12.5px;
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(255,255,255,0.08);
  color: var(--accent);
}
.ws-code-block {
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.65;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  overflow-x: auto;
  margin: 10px 0;
  color: #c9d1e0;
}

.ws-user-body { white-space: pre-wrap; word-break: break-word; }

/* ── Message meta ── */
.ws-msg-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
  opacity: 0;
  transition: opacity .15s;
}
.ws-msg:hover .ws-msg-meta { opacity: 1; }
.ws-msg-meta--user { flex-direction: row-reverse; }
.ws-time {
  font-size: 11px;
  color: var(--text3);
  font-variant-numeric: tabular-nums;
}
.ws-copy {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: none;
  color: var(--text3);
  font-size: 11px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
}
.ws-copy:hover { color: var(--text); background: var(--surface2); border-color: var(--border2); }

/* ── Typing dots ── */
.ws-typing-dots { display: flex; gap: 5px; align-items: center; height: 16px; }
.ws-typing-dots span {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
}
.ws-typing-dots span:nth-child(1) { animation: wsDot .9s ease infinite; }
.ws-typing-dots span:nth-child(2) { animation: wsDot .9s ease .18s infinite; }
.ws-typing-dots span:nth-child(3) { animation: wsDot .9s ease .36s infinite; }
@keyframes wsDot {
  0%,100% { opacity:.2; transform:scale(.8); }
  40% { opacity:.9; transform:scale(1); }
}

/* ── Scroll FAB ── */
.ws-scroll-fab {
  position: sticky;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  z-index: 5;
}
.ws-scroll-fab:hover { color: var(--text); background: var(--accent); border-color: transparent; transform: translateX(-50%) translateY(-2px); }

/* ── Footer / Input ── */
.ws-footer {
  flex-shrink: 0;
  padding: 12px 20px 10px;
  border-top: 1px solid var(--border);
  background: rgba(10,11,15,0.9);
  backdrop-filter: blur(24px);
}
.ws-input-shell {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.ws-input-inner {
  flex: 1;
  position: relative;
}
.ws-textarea {
  width: 100%;
  resize: none;
  border-radius: 16px;
  padding: 13px 50px 13px 18px;
  font-size: 14.5px;
  line-height: 1.55;
  font-family: var(--font-body);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  min-height: 50px;
  max-height: 160px;
  transition: border-color .15s, box-shadow .15s;
  display: block;
}
.ws-textarea::placeholder { color: var(--text3); }
.ws-textarea:focus {
  outline: none;
  border-color: rgba(${accent.rgb},0.5);
  box-shadow: 0 0 0 3px rgba(${accent.rgb},0.1);
}
.ws-textarea:disabled { opacity: .4; cursor: not-allowed; }
.ws-char {
  position: absolute;
  bottom: 11px; right: 14px;
  font-size: 11px;
  color: var(--text3);
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}

.ws-send {
  width: 48px; height: 48px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .2s cubic-bezier(0.4,0,0.2,1);
}
.ws-send--on {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 20px rgba(${accent.rgb},0.4);
}
.ws-send--on:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(${accent.rgb},0.55); }
.ws-send--on:active { transform: scale(0.94); }
.ws-send--off {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text3);
  cursor: not-allowed;
}
.ws-send-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: wsSpin .7s linear infinite;
}
@keyframes wsSpin { to { transform: rotate(360deg); } }

.ws-footer-hint {
  max-width: 720px;
  margin: 6px auto 0;
  font-size: 11px;
  text-align: center;
  color: var(--text3);
  letter-spacing: .02em;
}

/* ── Responsive ── */
@media (max-width:640px) {
  .ws-messages-track { padding: 20px 16px 8px; }
  .ws-footer { padding: 10px 14px 8px; }
  .ws-header { padding: 0 14px; }
  .ws-footer-hint { display: none; }
  .ws-welcome-title { font-size: 28px; }
  .ws-info-btn { display: none; }
}
`;
}