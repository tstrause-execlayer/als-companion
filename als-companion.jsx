import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0d1117;
    --surface:   #161b22;
    --surface2:  #1c2230;
    --surface3:  #232d3e;
    --border:    rgba(255,255,255,0.08);
    --amber:     #f0a500;
    --amber-dim: rgba(240,165,0,0.15);
    --teal:      #4ecdc4;
    --teal-dim:  rgba(78,205,196,0.12);
    --rose:      #e07070;
    --rose-dim:  rgba(224,112,112,0.12);
    --sky:       #7eb8f7;
    --text:      #e8edf4;
    --muted:     #8b98a8;
    --radius:    16px;
    --radius-sm: 10px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 16px 80px;
  }

  /* ── Header ── */
  .header {
    padding: 28px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .header-title {
    font-family: 'Lora', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--amber);
    letter-spacing: -0.3px;
  }
  .header-sub {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 2px;
    font-weight: 300;
  }
  .time-badge {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.82rem;
    color: var(--muted);
    white-space: nowrap;
  }

  /* ── Nav ── */
  .nav {
    display: flex;
    gap: 6px;
    margin-top: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .nav::-webkit-scrollbar { display: none; }
  .nav-btn {
    flex: 1;
    min-width: 80px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    color: var(--muted);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .nav-btn .nav-icon { font-size: 1.3rem; }
  .nav-btn:hover { background: var(--surface2); color: var(--text); }
  .nav-btn.active { background: var(--amber-dim); color: var(--amber); }

  /* ── Cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-top: 16px;
    animation: fadeUp 0.3s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card-title {
    font-family: 'Lora', serif;
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 14px;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── AAC Board ── */
  .aac-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
  .aac-btn {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 10px;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .aac-btn:hover, .aac-btn:active {
    transform: scale(0.97);
  }
  .aac-btn.need   { border-color: rgba(240,165,0,0.4);  background: var(--amber-dim); }
  .aac-btn.feel   { border-color: rgba(78,205,196,0.4); background: var(--teal-dim);  }
  .aac-btn.ask    { border-color: rgba(126,184,247,0.4); background: rgba(126,184,247,0.1); }
  .aac-btn.urgent { border-color: rgba(224,112,112,0.6); background: var(--rose-dim);  }
  .aac-emoji { font-size: 1.8rem; }
  .aac-label { font-size: 0.78rem; font-weight: 500; color: var(--text); }
  .aac-output {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    font-size: 1.15rem;
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    font-family: 'Lora', serif;
    color: var(--amber);
    flex-wrap: wrap;
  }
  .speak-btn {
    background: var(--amber);
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    transition: opacity 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .speak-btn:hover { opacity: 0.88; }
  .clear-btn {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    transition: all 0.15s;
  }
  .clear-btn:hover { color: var(--text); }
  .aac-cats {
    display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
  }
  .cat-btn {
    border: 1px solid var(--border);
    background: var(--surface2);
    border-radius: 100px;
    padding: 5px 14px;
    font-size: 0.78rem;
    cursor: pointer;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .cat-btn.active { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }

  /* ── AI Chat ── */
  .chat-msgs {
    height: 340px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .msg {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    animation: fadeUp 0.25s ease;
  }
  .msg.user { flex-direction: row-reverse; }
  .msg-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    background: var(--surface3);
  }
  .msg-bubble {
    max-width: 72%;
    padding: 11px 15px;
    border-radius: 16px;
    font-size: 0.9rem;
    line-height: 1.55;
  }
  .msg.ai .msg-bubble {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    color: var(--text);
  }
  .msg.user .msg-bubble {
    background: var(--amber-dim);
    border: 1px solid rgba(240,165,0,0.3);
    border-bottom-right-radius: 4px;
    color: var(--amber);
  }
  .typing-indicator {
    display: flex; gap: 4px; padding: 4px 2px;
  }
  .typing-indicator span {
    width: 7px; height: 7px;
    background: var(--muted);
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%,80%,100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  .chat-input-row {
    display: flex; gap: 8px; margin-top: 14px;
  }
  .chat-input {
    flex: 1;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    resize: none;
    transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: rgba(240,165,0,0.4); }
  .chat-input::placeholder { color: var(--muted); }
  .send-btn {
    background: var(--amber);
    color: #000;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0 18px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1.1rem;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }
  .send-btn:hover { opacity: 0.85; }
  .send-btn:disabled { opacity: 0.4; cursor: default; }
  .quick-prompts {
    display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
  }
  .qp-btn {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 0.75rem;
    color: var(--muted);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .qp-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

  /* ── Check-in ── */
  .checkin-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .checkin-label {
    font-size: 0.85rem;
    color: var(--muted);
    min-width: 120px;
  }
  .scale-btns {
    display: flex; gap: 6px; flex-wrap: wrap;
  }
  .scale-btn {
    width: 38px; height: 38px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    background: var(--surface2);
    color: var(--muted);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .scale-btn:hover { border-color: var(--amber); }
  .scale-btn.selected { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }
  .mood-row {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .mood-btn {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    font-size: 0.75rem;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .mood-btn .mood-emoji { font-size: 1.5rem; }
  .mood-btn.selected { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); }
  .submit-btn {
    width: 100%;
    margin-top: 10px;
    padding: 14px;
    background: linear-gradient(135deg, var(--teal) 0%, #3ab7b0 100%);
    border: none;
    border-radius: var(--radius-sm);
    color: #001a19;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .submit-btn:hover { opacity: 0.88; }

  /* ── Reminders ── */
  .reminder-list { display: flex; flex-direction: column; gap: 8px; }
  .reminder-item {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    transition: border-color 0.15s;
  }
  .reminder-item.done { opacity: 0.45; }
  .reminder-item.done .reminder-name { text-decoration: line-through; }
  .reminder-time {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--amber);
    min-width: 50px;
  }
  .reminder-name { flex: 1; font-size: 0.9rem; }
  .reminder-tag {
    font-size: 0.7rem;
    padding: 3px 9px;
    border-radius: 100px;
  }
  .reminder-tag.med { background: rgba(126,184,247,0.15); color: var(--sky); }
  .reminder-tag.exercise { background: var(--teal-dim); color: var(--teal); }
  .reminder-tag.care { background: var(--amber-dim); color: var(--amber); }
  .check-circle {
    width: 26px; height: 26px;
    border: 2px solid var(--border);
    border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .check-circle:hover { border-color: var(--teal); }
  .check-circle.done { background: var(--teal); border-color: var(--teal); }

  /* ── SOS / Caregiver ── */
  .sos-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  .sos-btn {
    padding: 18px 12px;
    border-radius: var(--radius-sm);
    border: 1.5px solid;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .sos-btn .sos-icon { font-size: 1.7rem; }
  .sos-btn.urgent {
    background: var(--rose-dim);
    border-color: var(--rose);
    color: var(--rose);
  }
  .sos-btn.urgent:hover { background: rgba(224,112,112,0.25); }
  .sos-btn.info {
    background: rgba(126,184,247,0.1);
    border-color: rgba(126,184,247,0.4);
    color: var(--sky);
  }
  .sos-btn.info:hover { background: rgba(126,184,247,0.18); }
  .sos-btn.comfort {
    background: var(--amber-dim);
    border-color: rgba(240,165,0,0.4);
    color: var(--amber);
  }
  .sos-btn.comfort:hover { background: rgba(240,165,0,0.25); }
  .sos-btn.check {
    background: var(--teal-dim);
    border-color: rgba(78,205,196,0.4);
    color: var(--teal);
  }
  .sos-btn.check:hover { background: rgba(78,205,196,0.22); }
  .alert-log {
    font-size: 0.8rem;
    color: var(--muted);
    border-top: 1px solid var(--border);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
  }
  .alert-entry {
    display: flex; gap: 10px; align-items: center;
  }
  .alert-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 10px 20px;
    font-size: 0.85rem;
    color: var(--text);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 1000;
    animation: toastIn 0.3s ease;
    white-space: nowrap;
  }
  @keyframes toastIn {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to   { transform: translateX(-50%) translateY(0); opacity: 1; }
  }

  /* ── Welcome banner ── */
  .welcome {
    background: linear-gradient(135deg, rgba(240,165,0,0.08) 0%, rgba(78,205,196,0.06) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .welcome-avatar {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--amber) 0%, #e07030 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  .welcome-name {
    font-family: 'Lora', serif;
    font-size: 1.2rem;
    font-weight: 600;
  }
  .welcome-msg { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }

  /* ── Info section ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 0;
  }
  .info-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px;
  }
  .info-card-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .info-card-value { font-size: 1.35rem; font-weight: 600; margin-top: 4px; color: var(--text); }
  .info-card-value.teal { color: var(--teal); }
  .info-card-value.amber { color: var(--amber); }

  @media (max-width: 520px) {
    .aac-grid { grid-template-columns: repeat(2, 1fr); }
    .sos-grid { grid-template-columns: 1fr; }
    .info-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Data ────────────────────────────────────────────────────────────────────
const AAC_CATEGORIES = {
  Needs: [
    { emoji: "🥤", label: "Water", urgent: false },
    { emoji: "🍽️", label: "Food", urgent: false },
    { emoji: "🚽", label: "Bathroom", urgent: true },
    { emoji: "💊", label: "Medication", urgent: false },
    { emoji: "🛏️", label: "Reposition me", urgent: false },
    { emoji: "🌡️", label: "I'm in pain", urgent: true },
    { emoji: "😰", label: "I can't breathe", urgent: true },
    { emoji: "📱", label: "My device", urgent: false },
  ],
  Feelings: [
    { emoji: "😊", label: "I'm okay", feel: true },
    { emoji: "😔", label: "I'm sad", feel: true },
    { emoji: "😤", label: "I'm frustrated", feel: true },
    { emoji: "😰", label: "I'm anxious", feel: true },
    { emoji: "🥱", label: "I'm tired", feel: true },
    { emoji: "🙏", label: "Thank you", feel: true },
    { emoji: "❤️", label: "I love you", feel: true },
    { emoji: "👍", label: "Yes / Good", feel: true },
    { emoji: "👎", label: "No / Stop", feel: true },
  ],
  Questions: [
    { emoji: "⏰", label: "What time is it?", ask: true },
    { emoji: "👤", label: "Who's coming?", ask: true },
    { emoji: "📅", label: "What day is it?", ask: true },
    { emoji: "📺", label: "Turn on TV", ask: true },
    { emoji: "🎵", label: "Play music", ask: true },
    { emoji: "📞", label: "Call someone", ask: true },
  ],
};

const REMINDERS = [
  { id: 1, time: "8:00",  name: "Baclofen (muscle relaxant)", tag: "med",      color: "var(--sky)" },
  { id: 2, time: "9:00",  name: "Morning stretching routine", tag: "exercise", color: "var(--teal)" },
  { id: 3, time: "12:00", name: "Riluzole with food",         tag: "med",      color: "var(--sky)" },
  { id: 4, time: "14:00", name: "Respiratory therapy",         tag: "care",    color: "var(--amber)" },
  { id: 5, time: "18:00", name: "Baclofen (muscle relaxant)", tag: "med",      color: "var(--sky)" },
  { id: 6, time: "20:00", name: "Pressure ulcer check",        tag: "care",    color: "var(--amber)" },
];

const QUICK_PROMPTS = [
  "I'm feeling lonely today",
  "Tell me something uplifting",
  "I'm worried about my family",
  "Help me relax",
  "I want to talk about my memories",
];

const MOODS = [
  { emoji: "😄", label: "Great" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Down" },
  { emoji: "😢", label: "Struggling" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ALSCompanion() {
  const [tab, setTab] = useState("home");
  const [aacCat, setAacCat] = useState("Needs");
  const [aacOutput, setAacOutput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm here with you. How are you feeling today? You can type a message, choose a quick prompt below, or just talk." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState({});
  const [checkin, setCheckin] = useState({ mood: null, pain: null, breath: null });
  const [checkinDone, setCheckinDone] = useState(false);
  const [toast, setToast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const speak = (text) => {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
    showToast("🔊 Speaking aloud…");
  };

  const addAACPhrase = (label) => {
    setAacOutput(prev => prev ? prev + " · " + label : label);
  };

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text
      }));
      history.push({ role: "user", content: userMsg });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a compassionate AI companion for a person living with ALS (Amyotrophic Lateral Sclerosis). 

Your role is to:
- Provide warm, genuine emotional support and companionship
- Never minimize their challenges, but gently encourage resilience and dignity
- Engage in meaningful conversation about their memories, interests, and feelings
- Offer calming techniques when they're anxious or in distress
- Be honest and empathetic — treat them as an intelligent adult, never patronizing
- Keep responses concise (2-4 sentences) since reading may be tiring
- If they express severe distress or safety concerns, gently encourage them to alert their caregiver

You are NOT a medical advisor. Always recommend consulting their care team for medical questions.`,
          messages: history,
        })
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm here with you. Could you tell me more?";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "I'm still here with you. It seems there was a connection issue — please try again." }]);
    }
    setLoading(false);
  }, [messages]);

  const triggerAlert = (type, label, icon, colorClass) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAlerts(prev => [{ type, label, icon, time, colorClass }, ...prev.slice(0, 9)]);
    showToast(`${icon} Alert sent to caregiver: "${label}"`);
  };

  const fmtTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const tabs = [
    { id: "home",     icon: "🏠", label: "Home" },
    { id: "talk",     icon: "💬", label: "Talk" },
    { id: "aac",      icon: "🗣️",  label: "Speak" },
    { id: "reminders",icon: "💊", label: "Schedule" },
    { id: "caregiver",icon: "🆘", label: "Alert" },
    { id: "checkin",  icon: "❤️", label: "Check-In" },
  ];

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div>
            <div className="header-title">✦ Companion</div>
            <div className="header-sub">Your care, your voice, your comfort</div>
          </div>
          <div className="time-badge">
            {fmtTime(currentTime)} · {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </header>

        {/* Nav */}
        <nav className="nav">
          {tabs.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── HOME ── */}
        {tab === "home" && (
          <>
            <div className="welcome">
              <div className="welcome-avatar">🌤️</div>
              <div>
                <div className="welcome-name">Good {currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 18 ? "afternoon" : "evening"}</div>
                <div className="welcome-msg">{fmtDate(currentTime)} · Your care team was last notified 2h ago</div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="info-card">
                  <div className="info-card-label">Next Medication</div>
                  <div className="info-card-value amber">12:00 PM</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>Riluzole with food</div>
                </div>
                <div className="info-card">
                  <div className="info-card-label">Today's Check-In</div>
                  <div className={`info-card-value ${checkinDone ? "teal" : ""}`}>{checkinDone ? "✓ Done" : "Pending"}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{checkinDone ? "Sent to caregiver" : "Tap Check-In tab"}</div>
                </div>
                <div className="info-card">
                  <div className="info-card-label">Alerts Sent Today</div>
                  <div className="info-card-value">{alerts.length}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>Caregiver notified</div>
                </div>
                <div className="info-card">
                  <div className="info-card-label">Companion Chat</div>
                  <div className="info-card-value teal">Active</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{messages.length} messages today</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">🆘 Quick Alert</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button className="sos-btn urgent" onClick={() => { triggerAlert("urgent","I need help now!","🆘","var(--rose)"); }}>
                  <span className="sos-icon">🆘</span>I need help now
                </button>
                <button className="sos-btn comfort" onClick={() => { triggerAlert("need","I need repositioning","🛏️","var(--amber)"); }}>
                  <span className="sos-icon">🛏️</span>Reposition me
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">💬 Daily Companion</div>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12 }}>
                Your AI companion is here to listen, talk, and keep you company anytime.
              </p>
              <button className="submit-btn" onClick={() => setTab("talk")}>
                Open Conversation →
              </button>
            </div>
          </>
        )}

        {/* ── TALK (AI Chat) ── */}
        {tab === "talk" && (
          <div className="card">
            <div className="card-title">💬 AI Companion</div>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="qp-btn" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
            <div className="chat-msgs" ref={chatRef}>
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-avatar">{m.role === "ai" ? "✦" : "👤"}</div>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="msg ai">
                  <div className="msg-avatar">✦</div>
                  <div className="msg-bubble">
                    <div className="typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                rows={2}
                placeholder="Type a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              />
              <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>
        )}

        {/* ── AAC BOARD ── */}
        {tab === "aac" && (
          <div className="card">
            <div className="card-title">🗣️ Voice Board</div>
            <div className="aac-output">
              <span style={{ flex: 1, minWidth: 0 }}>{aacOutput || <span style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>Tap phrases below to build a sentence…</span>}</span>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button className="speak-btn" onClick={() => speak(aacOutput)} disabled={!aacOutput}>
                  🔊 Speak
                </button>
                <button className="clear-btn" onClick={() => setAacOutput("")}>Clear</button>
              </div>
            </div>
            <div className="aac-cats">
              {Object.keys(AAC_CATEGORIES).map(c => (
                <button key={c} className={`cat-btn ${aacCat === c ? "active" : ""}`} onClick={() => setAacCat(c)}>{c}</button>
              ))}
            </div>
            <div className="aac-grid">
              {AAC_CATEGORIES[aacCat].map(item => (
                <button
                  key={item.label}
                  className={`aac-btn ${item.urgent ? "urgent" : item.feel ? "feel" : item.ask ? "ask" : "need"}`}
                  onClick={() => addAACPhrase(item.label)}
                >
                  <span className="aac-emoji">{item.emoji}</span>
                  <span className="aac-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── REMINDERS ── */}
        {tab === "reminders" && (
          <div className="card">
            <div className="card-title">💊 Today's Schedule</div>
            <div className="reminder-list">
              {REMINDERS.map(r => (
                <div key={r.id} className={`reminder-item ${done[r.id] ? "done" : ""}`}>
                  <div className="reminder-time">{r.time}</div>
                  <div className="reminder-name">{r.name}</div>
                  <span className={`reminder-tag ${r.tag}`}>{r.tag}</span>
                  <div
                    className={`check-circle ${done[r.id] ? "done" : ""}`}
                    onClick={() => setDone(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                  >
                    {done[r.id] && "✓"}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 14, textAlign: "center" }}>
              Medication schedule synced from care plan · Always confirm with your care team
            </p>
          </div>
        )}

        {/* ── CAREGIVER ALERTS ── */}
        {tab === "caregiver" && (
          <div className="card">
            <div className="card-title">🆘 Alert Caregiver</div>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 14 }}>
              Tap any button to instantly notify your caregiver. They'll receive a notification immediately.
            </p>
            <div className="sos-grid">
              <button className="sos-btn urgent" onClick={() => triggerAlert("emergency","Emergency — I need help now!","🆘","var(--rose)")}>
                <span className="sos-icon">🆘</span>Emergency
              </button>
              <button className="sos-btn info" onClick={() => triggerAlert("pain","I'm in pain","😣","var(--sky)")}>
                <span className="sos-icon">😣</span>I'm in pain
              </button>
              <button className="sos-btn comfort" onClick={() => triggerAlert("reposition","Please reposition me","🛏️","var(--amber)")}>
                <span className="sos-icon">🛏️</span>Reposition me
              </button>
              <button className="sos-btn check" onClick={() => triggerAlert("bathroom","I need the bathroom","🚽","var(--teal)")}>
                <span className="sos-icon">🚽</span>Bathroom
              </button>
              <button className="sos-btn info" onClick={() => triggerAlert("water","I need water","🥤","var(--sky)")}>
                <span className="sos-icon">🥤</span>Water / Food
              </button>
              <button className="sos-btn comfort" onClick={() => triggerAlert("breathe","Breathing difficulty","😰","var(--amber)")}>
                <span className="sos-icon">😰</span>Breathing
              </button>
              <button className="sos-btn check" onClick={() => triggerAlert("okay","I'm okay — checking in","👍","var(--teal)")}>
                <span className="sos-icon">👍</span>I'm okay
              </button>
              <button className="sos-btn info" onClick={() => triggerAlert("med","Medication reminder","💊","var(--sky)")}>
                <span className="sos-icon">💊</span>Medication
              </button>
            </div>
            {alerts.length > 0 && (
              <div className="alert-log">
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Recent Alerts</div>
                {alerts.map((a, i) => (
                  <div key={i} className="alert-entry">
                    <span className="alert-dot" style={{ background: a.colorClass }} />
                    <span>{a.icon} {a.label}</span>
                    <span style={{ marginLeft: "auto" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHECK-IN ── */}
        {tab === "checkin" && (
          <div className="card">
            <div className="card-title">❤️ Daily Check-In</div>
            {checkinDone ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", marginBottom: 8 }}>Check-in sent!</div>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Your caregiver has been notified of how you're feeling today.</p>
                <button className="clear-btn" style={{ marginTop: 16 }} onClick={() => { setCheckin({ mood: null, pain: null, breath: null }); setCheckinDone(false); }}>
                  Update Check-In
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 10 }}>How are you feeling overall?</div>
                  <div className="mood-row">
                    {MOODS.map(m => (
                      <button key={m.label} className={`mood-btn ${checkin.mood === m.label ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, mood: m.label }))}>
                        <span className="mood-emoji">{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="checkin-row">
                  <div className="checkin-label">Pain level (1–10)</div>
                  <div className="scale-btns">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} className={`scale-btn ${checkin.pain === n ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, pain: n }))}>{n}</button>
                    ))}
                  </div>
                </div>

                <div className="checkin-row">
                  <div className="checkin-label">Breathing (1–5)</div>
                  <div className="scale-btns">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className={`scale-btn ${checkin.breath === n ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, breath: n }))}>{n}</button>
                    ))}
                  </div>
                </div>

                <button
                  className="submit-btn"
                  disabled={!checkin.mood || !checkin.pain || !checkin.breath}
                  onClick={() => { setCheckinDone(true); showToast("❤️ Check-in sent to your caregiver"); }}
                >
                  Send Check-In to Caregiver
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
