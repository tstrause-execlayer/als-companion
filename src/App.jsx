import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSpeech } from "./hooks/useSpeech";
import VoiceButton from "./components/VoiceButton";
import OnboardingModal from "./components/OnboardingModal";

// ─── Fonts & Global CSS ───────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0d1117; --surface: #161b22; --surface2: #1c2230; --surface3: #232d3e;
  --border: rgba(255,255,255,0.08);
  --amber: #f0a500; --amber-dim: rgba(240,165,0,0.15);
  --teal: #4ecdc4; --teal-dim: rgba(78,205,196,0.12);
  --rose: #e07070; --rose-dim: rgba(224,112,112,0.12);
  --sky: #7eb8f7; --text: #e8edf4; --muted: #8b98a8;
  --radius: 16px; --radius-sm: 10px;
  --font-scale: 1;
}
html { font-size: calc(16px * var(--font-scale)); }
body {
  background: var(--bg); color: var(--text);
  font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden;
}
.app { max-width: 900px; margin: 0 auto; padding: 0 16px 120px; }

/* Header */
.header { padding: 28px 0 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.header-title { font-family: 'Lora', serif; font-size: 1.5rem; font-weight: 600; color: var(--amber); letter-spacing: -0.3px; }
.header-sub { font-size: 0.8rem; color: var(--muted); margin-top: 2px; font-weight: 300; }
.header-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.time-badge { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 6px 14px; font-size: 0.82rem; color: var(--muted); white-space: nowrap; }
.ctrl-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 6px 12px; font-size: 0.78rem; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
.ctrl-btn:hover, .ctrl-btn.active { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }

/* Nav */
.nav { display: flex; gap: 6px; margin-top: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 6px; overflow-x: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nav-btn { flex: 1; min-width: 72px; border: none; background: transparent; border-radius: var(--radius-sm); padding: 12px 10px; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 500; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 56px; }
.nav-btn .nav-icon { font-size: 1.4rem; }
.nav-btn:hover { background: var(--surface2); color: var(--text); }
.nav-btn.active { background: var(--amber-dim); color: var(--amber); }

/* Cards */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-top: 16px; animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.card-title { font-family: 'Lora', serif; font-size: 1.05rem; font-weight: 600; margin-bottom: 14px; color: var(--text); display: flex; align-items: center; gap: 8px; }

/* Voice status bar */
.voice-bar { background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 12px; padding: 10px 16px; margin-top: 16px; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--rose); animation: fadeUp 0.2s ease; }
.voice-bar-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rose); animation: pulse 1s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.voice-hint { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; margin-top: 12px; font-size: 0.8rem; color: var(--muted); line-height: 1.6; }

/* Welcome */
.welcome { background: linear-gradient(135deg, rgba(240,165,0,0.08) 0%, rgba(78,205,196,0.06) 100%); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-top: 16px; display: flex; align-items: center; gap: 16px; }
.welcome-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--amber) 0%, #e07030 100%); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.welcome-name { font-family: 'Lora', serif; font-size: 1.2rem; font-weight: 600; }
.welcome-msg { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }

/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; cursor: pointer; transition: border-color 0.15s; }
.info-card:hover { border-color: rgba(240,165,0,0.3); }
.info-card-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }
.info-card-value { font-size: 1.35rem; font-weight: 600; margin-top: 4px; color: var(--text); }
.info-card-value.teal { color: var(--teal); }
.info-card-value.amber { color: var(--amber); }

/* AAC Board */
.aac-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.aac-btn { background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 18px 10px; cursor: pointer; text-align: center; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 90px; }
.aac-btn:hover, .aac-btn:active { transform: scale(0.97); }
.aac-btn.need   { border-color: rgba(240,165,0,0.4);  background: var(--amber-dim); }
.aac-btn.feel   { border-color: rgba(78,205,196,0.4); background: var(--teal-dim);  }
.aac-btn.ask    { border-color: rgba(126,184,247,0.4); background: rgba(126,184,247,0.1); }
.aac-btn.urgent { border-color: rgba(224,112,112,0.6); background: var(--rose-dim); }
.aac-btn.flash  { border-color: var(--amber) !important; box-shadow: 0 0 0 3px rgba(240,165,0,0.3); }
.aac-emoji { font-size: 2rem; }
.aac-label { font-size: 0.8rem; font-weight: 500; color: var(--text); }
.aac-output { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; font-size: 1.1rem; min-height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; font-family: 'Lora', serif; color: var(--amber); flex-wrap: wrap; }
.aac-cats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.cat-btn { border: 1px solid var(--border); background: var(--surface2); border-radius: 100px; padding: 8px 16px; font-size: 0.8rem; cursor: pointer; color: var(--muted); font-family: 'DM Sans', sans-serif; transition: all 0.15s; min-height: 36px; }
.cat-btn.active { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }
.speak-btn { background: var(--amber); color: #000; border: none; border-radius: 8px; padding: 10px 18px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; transition: opacity 0.15s; display: flex; align-items: center; gap: 6px; min-height: 44px; }
.speak-btn:hover { opacity: 0.88; }
.speak-btn:disabled { opacity: 0.4; cursor: default; }
.clear-btn { background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; transition: all 0.15s; min-height: 44px; }
.clear-btn:hover { color: var(--text); }

/* Chat */
.chat-msgs { height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.msg { display: flex; gap: 10px; align-items: flex-end; animation: fadeUp 0.25s ease; }
.msg.user { flex-direction: row-reverse; }
.msg-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; background: var(--surface3); }
.msg-bubble { max-width: 72%; padding: 12px 16px; border-radius: 16px; font-size: 0.92rem; line-height: 1.55; }
.msg.ai .msg-bubble { background: var(--surface2); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text); }
.msg.user .msg-bubble { background: var(--amber-dim); border: 1px solid rgba(240,165,0,0.3); border-bottom-right-radius: 4px; color: var(--amber); }
.msg-speak { background: none; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.5; padding: 2px 4px; transition: opacity 0.15s; }
.msg-speak:hover { opacity: 1; }
.typing-indicator { display: flex; gap: 4px; padding: 4px 2px; }
.typing-indicator span { width: 7px; height: 7px; background: var(--muted); border-radius: 50%; animation: bounce 1.2s infinite ease-in-out; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
.chat-input-row { display: flex; gap: 8px; margin-top: 14px; }
.chat-input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.92rem; outline: none; resize: none; transition: border-color 0.2s; }
.chat-input:focus { border-color: rgba(240,165,0,0.4); }
.chat-input::placeholder { color: var(--muted); }
.send-btn { background: var(--amber); color: #000; border: none; border-radius: var(--radius-sm); padding: 0 20px; cursor: pointer; font-weight: 700; font-size: 1.2rem; transition: opacity 0.15s; flex-shrink: 0; min-width: 56px; }
.send-btn:hover { opacity: 0.85; }
.send-btn:disabled { opacity: 0.4; cursor: default; }
.quick-prompts { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.qp-btn { background: var(--surface2); border: 1px solid var(--border); border-radius: 100px; padding: 7px 14px; font-size: 0.77rem; color: var(--muted); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; min-height: 36px; }
.qp-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
.tts-toggle { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--muted); margin-bottom: 10px; }
.tts-toggle input { accent-color: var(--teal); width: 18px; height: 18px; cursor: pointer; }

/* Reminders */
.reminder-list { display: flex; flex-direction: column; gap: 8px; }
.reminder-item { display: flex; align-items: center; gap: 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; transition: border-color 0.15s; cursor: pointer; min-height: 64px; }
.reminder-item:hover { border-color: rgba(255,255,255,0.15); }
.reminder-item.done { opacity: 0.45; }
.reminder-item.done .reminder-name { text-decoration: line-through; }
.reminder-time { font-weight: 600; font-size: 0.88rem; color: var(--amber); min-width: 52px; }
.reminder-name { flex: 1; font-size: 0.92rem; }
.reminder-tag { font-size: 0.72rem; padding: 4px 10px; border-radius: 100px; }
.reminder-tag.med { background: rgba(126,184,247,0.15); color: var(--sky); }
.reminder-tag.exercise { background: var(--teal-dim); color: var(--teal); }
.reminder-tag.care { background: var(--amber-dim); color: var(--amber); }
.check-circle { width: 30px; height: 30px; border: 2px solid var(--border); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; transition: all 0.15s; }
.check-circle:hover { border-color: var(--teal); }
.check-circle.done { background: var(--teal); border-color: var(--teal); color: #001a19; }

/* SOS / Alerts */
.sos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.sos-btn { padding: 20px 12px; border-radius: var(--radius-sm); border: 1.5px solid; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.92rem; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 80px; }
.sos-btn .sos-icon { font-size: 1.8rem; }
.sos-btn.urgent { background: var(--rose-dim); border-color: var(--rose); color: var(--rose); }
.sos-btn.urgent:hover { background: rgba(224,112,112,0.25); }
.sos-btn.info { background: rgba(126,184,247,0.1); border-color: rgba(126,184,247,0.4); color: var(--sky); }
.sos-btn.info:hover { background: rgba(126,184,247,0.18); }
.sos-btn.comfort { background: var(--amber-dim); border-color: rgba(240,165,0,0.4); color: var(--amber); }
.sos-btn.comfort:hover { background: rgba(240,165,0,0.25); }
.sos-btn.check { background: var(--teal-dim); border-color: rgba(78,205,196,0.4); color: var(--teal); }
.sos-btn.check:hover { background: rgba(78,205,196,0.22); }
.alert-log { font-size: 0.82rem; color: var(--muted); border-top: 1px solid var(--border); padding-top: 12px; display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto; }
.alert-entry { display: flex; gap: 10px; align-items: center; padding: 6px 0; }
.alert-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

/* Check-In */
.checkin-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.checkin-label { font-size: 0.88rem; color: var(--muted); min-width: 130px; }
.scale-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.scale-btn { width: 42px; height: 42px; border: 1.5px solid var(--border); border-radius: 8px; background: var(--surface2); color: var(--muted); cursor: pointer; font-size: 0.88rem; font-weight: 600; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.scale-btn:hover { border-color: var(--amber); }
.scale-btn.selected { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }
.mood-row { display: flex; gap: 8px; flex-wrap: wrap; }
.mood-btn { background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--muted); font-family: 'DM Sans', sans-serif; transition: all 0.15s; min-height: 70px; }
.mood-btn .mood-emoji { font-size: 1.6rem; }
.mood-btn.selected { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); }
.submit-btn { width: 100%; margin-top: 10px; padding: 16px; background: linear-gradient(135deg, var(--teal) 0%, #3ab7b0 100%); border: none; border-radius: var(--radius-sm); color: #001a19; font-weight: 600; font-size: 0.98rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; min-height: 56px; }
.submit-btn:hover { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Toast */
.toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(0); background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 11px 22px; font-size: 0.88rem; color: var(--text); box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 800; animation: toastIn 0.3s ease; white-space: nowrap; pointer-events: none; }
@keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

/* High contrast override */
body.high-contrast {
  --bg: #000; --surface: #111; --surface2: #1a1a1a; --surface3: #222;
  --border: rgba(255,255,255,0.25); --text: #fff; --muted: #bbb;
  --amber: #ffc107; --teal: #00e5d4; --rose: #ff6b6b; --sky: #87ceeb;
}

@media (max-width: 520px) {
  .aac-grid { grid-template-columns: repeat(2, 1fr); }
  .sos-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
}
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const AAC_CATEGORIES = {
    Needs: [
        { emoji: "🥤", label: "Water", type: "need" },
        { emoji: "🍽️", label: "Food", type: "need" },
        { emoji: "🚽", label: "Bathroom", type: "urgent" },
        { emoji: "💊", label: "Medication", type: "need" },
        { emoji: "🛏️", label: "Reposition me", type: "need" },
        { emoji: "🌡️", label: "I'm in pain", type: "urgent" },
        { emoji: "😰", label: "I can't breathe", type: "urgent" },
        { emoji: "📱", label: "My device", type: "need" },
    ],
    Feelings: [
        { emoji: "😊", label: "I'm okay", type: "feel" },
        { emoji: "😔", label: "I'm sad", type: "feel" },
        { emoji: "😤", label: "I'm frustrated", type: "feel" },
        { emoji: "😰", label: "I'm anxious", type: "feel" },
        { emoji: "🥱", label: "I'm tired", type: "feel" },
        { emoji: "🙏", label: "Thank you", type: "feel" },
        { emoji: "❤️", label: "I love you", type: "feel" },
        { emoji: "👍", label: "Yes / Good", type: "feel" },
        { emoji: "👎", label: "No / Stop", type: "feel" },
    ],
    Questions: [
        { emoji: "⏰", label: "What time is it?", type: "ask" },
        { emoji: "👤", label: "Who's coming?", type: "ask" },
        { emoji: "📅", label: "What day is it?", type: "ask" },
        { emoji: "📺", label: "Turn on TV", type: "ask" },
        { emoji: "🎵", label: "Play music", type: "ask" },
        { emoji: "📞", label: "Call someone", type: "ask" },
    ],
};

const DEFAULT_REMINDERS = [
    { id: 1, time: "8:00 AM", name: "Baclofen (muscle relaxant)", tag: "med" },
    { id: 2, time: "9:00 AM", name: "Morning stretching routine", tag: "exercise" },
    { id: 3, time: "12:00 PM", name: "Riluzole with food", tag: "med" },
    { id: 4, time: "2:00 PM", name: "Respiratory therapy", tag: "care" },
    { id: 5, time: "6:00 PM", name: "Baclofen (muscle relaxant)", tag: "med" },
    { id: 6, time: "8:00 PM", name: "Pressure ulcer check", tag: "care" },
];

const QUICK_PROMPTS = [
    "I'm feeling lonely today",
    "Tell me something uplifting",
    "Help me relax",
    "I want to share a memory",
];

const MOODS = [
    { emoji: "😄", label: "Great" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Down" },
    { emoji: "😢", label: "Struggling" },
];

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

// ─── App Component ─────────────────────────────────────────────────────────────
export default function App() {
    const [tab, setTab] = useState("home");
    const [aacCat, setAacCat] = useState("Needs");
    const [aacOutput, setAacOutput] = useLocalStorage("aac-output", "");
    const [flashLabel, setFlashLabel] = useState(null);

    const [messages, setMessages] = useLocalStorage("chat-messages", [
        { role: "ai", text: "Hello! I'm here with you. How are you feeling today? You can type a message, use a quick prompt, or tap the 🎤 mic and speak to me." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [done, setDone] = useLocalStorage(`reminders-done-${todayKey()}`, {});
    const [checkin, setCheckin] = useLocalStorage(`checkin-${todayKey()}`, { mood: null, pain: null, breath: null, submitted: false });
    const [alerts, setAlerts] = useLocalStorage(`alerts-${todayKey()}`, []);
    const [toast, setToast] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Settings
    const [profile, setProfile] = useLocalStorage("profile", null);
    const [fontScale, setFontScale] = useLocalStorage("font-scale", 1);
    const [highContrast, setHighContrast] = useLocalStorage("high-contrast", false);
    const [autoTTS, setAutoTTS] = useLocalStorage("auto-tts", true);

    const chatRef = useRef(null);

    // Voice command handler
    const handleCommand = useCallback((cmd) => {
        if (cmd.startsWith("nav:")) {
            setTab(cmd.slice(4));
            showToast(`📍 Navigated to ${cmd.slice(4)}`);
        } else if (cmd.startsWith("aac:")) {
            const label = cmd.slice(4);
            setAacOutput(prev => prev ? prev + " · " + label : label);
            setFlashLabel(label);
            setTab("aac");
            setTimeout(() => setFlashLabel(null), 600);
            showToast(`🗣️ ${label}`);
        } else if (cmd.startsWith("chat:")) {
            const text = cmd.slice(5);
            setTab("talk");
            sendMessage(text);
        }
    }, []);

    const { listening, transcript, ttsEnabled, setTtsEnabled, speak, speakImmediate,
        startListening, stopListening, supported: micSupported } = useSpeech({
            onCommand: handleCommand,
        });

    // Apply font scale + high contrast
    useEffect(() => {
        document.documentElement.style.setProperty("--font-scale", fontScale);
        document.body.classList.toggle("high-contrast", highContrast);
    }, [fontScale, highContrast]);

    // Clock
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, loading]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const speakText = (text) => {
        speakImmediate(text);
        showToast("🔊 Speaking aloud…");
    };

    const addAACPhrase = (label) => {
        setAacOutput(prev => prev ? prev + " · " + label : label);
        setFlashLabel(label);
        setTimeout(() => setFlashLabel(null), 600);
    };

    const sendMessage = useCallback(async (text) => {
        if (!text?.trim()) return;
        const userMsg = text.trim();
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);
        try {
            const history = messages.map(m => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.text,
            }));
            history.push({ role: "user", content: userMsg });

            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

            let reply = "";
            if (baseUrl) {
                const res = await fetch(`${baseUrl}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: history }),
                });
                const data = await res.json();
                reply = data.reply || "I'm here with you.";
            } else if (apiKey) {
                const res = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
                    body: JSON.stringify({
                        model: "claude-opus-4-5",
                        max_tokens: 512,
                        system: `You are a compassionate AI companion for a person living with ALS or another neurodegenerative disorder.
Your role:
- Provide warm, genuine emotional support and companionship
- Never minimize their challenges, but gently encourage resilience and dignity
- Engage in meaningful conversation about memories, interests, feelings
- Offer calming techniques when anxious or distressed
- Be honest and empathetic — treat them as an intelligent adult, never patronizing
- Keep responses very concise (2-3 sentences max) since reading may be tiring
- If they express severe distress or safety concerns, gently encourage them to use the Alert tab
You are NOT a medical advisor. Always recommend consulting their care team for medical questions.
The patient's name is: ${profile?.name || "Friend"}.`,
                        messages: history,
                    }),
                });
                const data = await res.json();
                reply = data.content?.[0]?.text || "I'm here with you. Could you tell me more?";
            } else {
                reply = "To enable the AI companion, please add your Anthropic API key to the .env.local file. See .env.example for instructions.";
            }

            setMessages(prev => [...prev, { role: "ai", text: reply }]);
            if (autoTTS) speak(reply);
        } catch {
            const errMsg = "I'm still here with you. There was a connection issue — please try again.";
            setMessages(prev => [...prev, { role: "ai", text: errMsg }]);
            if (autoTTS) speak(errMsg);
        }
        setLoading(false);
    }, [messages, profile, autoTTS, speak]);

    const triggerAlert = (type, label, icon, color) => {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setAlerts(prev => [{ type, label, icon, time, color }, ...prev.slice(0, 19)]);
        speakText(`Alert sent: ${label}`);
        showToast(`${icon} Alert sent: "${label}"`);
    };

    const fmtTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fmtDate = (d) => d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    const greeting = currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 18 ? "afternoon" : "evening";
    const nextMed = DEFAULT_REMINDERS.find(r => r.tag === "med" && !done[r.id]);

    const tabs = [
        { id: "home", icon: "🏠", label: "Home" },
        { id: "talk", icon: "💬", label: "Talk" },
        { id: "aac", icon: "🗣️", label: "Speak" },
        { id: "reminders", icon: "💊", label: "Schedule" },
        { id: "caregiver", icon: "🆘", label: "Alert" },
        { id: "checkin", icon: "❤️", label: "Check-In" },
    ];

    const cycleFontScale = () => {
        setFontScale(s => s >= 1.3 ? 1 : parseFloat((s + 0.15).toFixed(2)));
    };

    if (!profile) {
        return (
            <>
                <style>{GLOBAL_CSS}</style>
                <OnboardingModal onComplete={setProfile} />
            </>
        );
    }

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div className="app">

                {/* Header */}
                <header className="header">
                    <div>
                        <div className="header-title">✦ Companion</div>
                        <div className="header-sub">Your care, your voice, your comfort</div>
                    </div>
                    <div className="header-controls">
                        <div className="time-badge">{fmtTime(currentTime)}</div>
                        <button id="font-scale-btn" className="ctrl-btn" onClick={cycleFontScale} aria-label="Change font size">
                            {fontScale === 1 ? "A" : fontScale <= 1.15 ? "AA" : "AAA"}
                        </button>
                        <button id="contrast-btn" className={`ctrl-btn ${highContrast ? "active" : ""}`} onClick={() => setHighContrast(v => !v)} aria-label="Toggle high contrast">
                            ◑
                        </button>
                    </div>
                </header>

                {/* Voice status bar */}
                {listening && (
                    <div className="voice-bar" role="status" aria-live="polite">
                        <div className="voice-bar-dot" />
                        {transcript ? `Heard: "${transcript}"` : "Listening… speak a command or message"}
                    </div>
                )}

                {/* Nav */}
                <nav className="nav" role="navigation" aria-label="Main navigation">
                    {tabs.map(t => (
                        <button id={`nav-${t.id}`} key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
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
                                <div className="welcome-name">Good {greeting}, {profile.name}</div>
                                <div className="welcome-msg">{fmtDate(currentTime)}</div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="info-grid">
                                <div className="info-card" onClick={() => setTab("reminders")} role="button" tabIndex={0} aria-label="Next medication">
                                    <div className="info-card-label">Next Medication</div>
                                    <div className="info-card-value amber">{nextMed?.time || "All done ✓"}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{nextMed?.name || "No more meds today"}</div>
                                </div>
                                <div className="info-card" onClick={() => setTab("checkin")} role="button" tabIndex={0} aria-label="Today check-in status">
                                    <div className="info-card-label">Today's Check-In</div>
                                    <div className={`info-card-value ${checkin.submitted ? "teal" : ""}`}>{checkin.submitted ? "✓ Done" : "Pending"}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{checkin.submitted ? "Sent to caregiver" : "Tap to check in"}</div>
                                </div>
                                <div className="info-card" onClick={() => setTab("caregiver")} role="button" tabIndex={0}>
                                    <div className="info-card-label">Alerts Today</div>
                                    <div className="info-card-value">{alerts.length}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>Caregiver notified</div>
                                </div>
                                <div className="info-card" onClick={() => setTab("talk")} role="button" tabIndex={0}>
                                    <div className="info-card-label">Companion Chat</div>
                                    <div className="info-card-value teal">Active</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{messages.length} messages</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-title">🆘 Quick Alert</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <button id="home-emergency" className="sos-btn urgent" onClick={() => triggerAlert("emergency", "I need help now!", "🆘", "#e07070")}>
                                    <span className="sos-icon">🆘</span>I need help now
                                </button>
                                <button id="home-reposition" className="sos-btn comfort" onClick={() => triggerAlert("need", "I need repositioning", "🛏️", "#f0a500")}>
                                    <span className="sos-icon">🛏️</span>Reposition me
                                </button>
                            </div>
                        </div>

                        <div className="voice-hint">
                            <strong style={{ color: "var(--amber)" }}>🎤 Voice commands</strong><br />
                            Tap the mic button and say: <em>"emergency"</em>, <em>"water"</em>, <em>"go to chat"</em>, <em>"I'm in pain"</em>, <em>"medication"</em>, or anything — it will route automatically.
                        </div>
                    </>
                )}

                {/* ── TALK ── */}
                {tab === "talk" && (
                    <div className="card">
                        <div className="card-title">💬 AI Companion</div>
                        <label className="tts-toggle">
                            <input id="tts-toggle" type="checkbox" checked={autoTTS} onChange={e => setAutoTTS(e.target.checked)} />
                            Auto read responses aloud
                        </label>
                        <div className="quick-prompts">
                            {QUICK_PROMPTS.map(p => (
                                <button key={p} id={`qp-${p.slice(0, 15).replace(/\s/g, "-")}`} className="qp-btn" onClick={() => sendMessage(p)}>{p}</button>
                            ))}
                        </div>
                        <div className="chat-msgs" ref={chatRef} role="log" aria-live="polite">
                            {messages.map((m, i) => (
                                <div key={i} className={`msg ${m.role}`}>
                                    <div className="msg-avatar">{m.role === "ai" ? "✦" : "👤"}</div>
                                    <div className="msg-bubble">{m.text}</div>
                                    {m.role === "ai" && (
                                        <button className="msg-speak" onClick={() => speakText(m.text)} aria-label="Read message aloud">🔊</button>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="msg ai">
                                    <div className="msg-avatar">✦</div>
                                    <div className="msg-bubble">
                                        <div className="typing-indicator"><span /><span /><span /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="chat-input-row">
                            <textarea
                                id="chat-input"
                                className="chat-input"
                                rows={2}
                                placeholder="Type a message, or tap 🎤 to speak…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                            />
                            <button id="chat-send" className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>➤</button>
                        </div>
                    </div>
                )}

                {/* ── AAC BOARD ── */}
                {tab === "aac" && (
                    <div className="card">
                        <div className="card-title">🗣️ Voice Board</div>
                        <div className="aac-output">
                            <span style={{ flex: 1, minWidth: 0 }}>
                                {aacOutput || <span style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>Tap phrases below, or say them aloud via 🎤…</span>}
                            </span>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button id="aac-speak" className="speak-btn" onClick={() => speakText(aacOutput)} disabled={!aacOutput}>🔊 Speak</button>
                                <button id="aac-clear" className="clear-btn" onClick={() => setAacOutput("")}>Clear</button>
                            </div>
                        </div>
                        <div className="aac-cats">
                            {Object.keys(AAC_CATEGORIES).map(c => (
                                <button key={c} id={`cat-${c}`} className={`cat-btn ${aacCat === c ? "active" : ""}`} onClick={() => setAacCat(c)}>{c}</button>
                            ))}
                        </div>
                        <div className="aac-grid">
                            {AAC_CATEGORIES[aacCat].map(item => (
                                <button
                                    key={item.label}
                                    id={`aac-${item.label.replace(/\s/g, "-")}`}
                                    className={`aac-btn ${item.type} ${flashLabel === item.label ? "flash" : ""}`}
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
                            {DEFAULT_REMINDERS.map(r => (
                                <div
                                    key={r.id}
                                    id={`reminder-${r.id}`}
                                    className={`reminder-item ${done[r.id] ? "done" : ""}`}
                                    onClick={() => setDone(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${r.name} at ${r.time}, ${done[r.id] ? "completed" : "not completed"}`}
                                    onKeyDown={e => e.key === "Enter" && setDone(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                                >
                                    <div className="reminder-time">{r.time}</div>
                                    <div className="reminder-name">{r.name}</div>
                                    <span className={`reminder-tag ${r.tag}`}>{r.tag}</span>
                                    <div className={`check-circle ${done[r.id] ? "done" : ""}`} aria-hidden="true">
                                        {done[r.id] && "✓"}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 14, textAlign: "center" }}>
                            Tap a row to mark complete · Always confirm with your care team
                        </p>
                    </div>
                )}

                {/* ── CAREGIVER ALERTS ── */}
                {tab === "caregiver" && (
                    <div className="card">
                        <div className="card-title">🆘 Alert Caregiver</div>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 16 }}>
                            Tap any button to instantly notify your caregiver — or say the word aloud via 🎤.
                        </p>
                        <div className="sos-grid">
                            {[
                                { id: "emergency", cls: "urgent", icon: "🆘", label: "Emergency", alert: "Emergency — I need help now!", color: "#e07070" },
                                { id: "pain", cls: "info", icon: "😣", label: "I'm in pain", alert: "I'm in pain", color: "#7eb8f7" },
                                { id: "reposition", cls: "comfort", icon: "🛏️", label: "Reposition me", alert: "Please reposition me", color: "#f0a500" },
                                { id: "bathroom", cls: "check", icon: "🚽", label: "Bathroom", alert: "I need the bathroom", color: "#4ecdc4" },
                                { id: "water", cls: "info", icon: "🥤", label: "Water / Food", alert: "I need water or food", color: "#7eb8f7" },
                                { id: "breathing", cls: "comfort", icon: "😰", label: "Breathing", alert: "Breathing difficulty", color: "#f0a500" },
                                { id: "okay", cls: "check", icon: "👍", label: "I'm okay", alert: "I'm okay — checking in", color: "#4ecdc4" },
                                { id: "med", cls: "info", icon: "💊", label: "Medication", alert: "Medication reminder", color: "#7eb8f7" },
                            ].map(btn => (
                                <button key={btn.id} id={`sos-${btn.id}`} className={`sos-btn ${btn.cls}`} onClick={() => triggerAlert(btn.id, btn.alert, btn.icon, btn.color)}>
                                    <span className="sos-icon">{btn.icon}</span>
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        {alerts.length > 0 && (
                            <div className="alert-log" role="log">
                                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, color: "var(--muted)" }}>Recent Alerts</div>
                                {alerts.map((a, i) => (
                                    <div key={i} className="alert-entry">
                                        <span className="alert-dot" style={{ background: a.color }} />
                                        <span>{a.icon} {a.label}</span>
                                        <span style={{ marginLeft: "auto", color: "var(--muted)" }}>{a.time}</span>
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
                        {checkin.submitted ? (
                            <div style={{ textAlign: "center", padding: "24px 0" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                                <div style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", marginBottom: 8 }}>Check-in complete!</div>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Your caregiver has been notified of how you're feeling.</p>
                                <button id="checkin-redo" className="clear-btn" style={{ marginTop: 16 }} onClick={() => setCheckin({ mood: null, pain: null, breath: null, submitted: false })}>
                                    Update Check-In
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 10 }}>How are you feeling overall?</div>
                                    <div className="mood-row">
                                        {MOODS.map(m => (
                                            <button key={m.label} id={`mood-${m.label}`} className={`mood-btn ${checkin.mood === m.label ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, mood: m.label }))}>
                                                <span className="mood-emoji">{m.emoji}</span>
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="checkin-row">
                                    <div className="checkin-label">Pain level (1–10)</div>
                                    <div className="scale-btns">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <button key={n} id={`pain-${n}`} className={`scale-btn ${checkin.pain === n ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, pain: n }))}>{n}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="checkin-row">
                                    <div className="checkin-label">Breathing (1–5)</div>
                                    <div className="scale-btns">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} id={`breath-${n}`} className={`scale-btn ${checkin.breath === n ? "selected" : ""}`} onClick={() => setCheckin(p => ({ ...p, breath: n }))}>{n}</button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    id="checkin-submit"
                                    className="submit-btn"
                                    disabled={!checkin.mood || !checkin.pain || !checkin.breath}
                                    onClick={() => {
                                        setCheckin(p => ({ ...p, submitted: true }));
                                        showToast("❤️ Check-in sent to your caregiver");
                                        speak("Check-in complete. Your caregiver has been notified.");
                                    }}
                                >
                                    Send Check-In to Caregiver
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Voice Button */}
            <VoiceButton
                listening={listening}
                supported={micSupported}
                transcript={transcript}
                onToggle={listening ? stopListening : startListening}
            />

            {toast && <div className="toast" role="status" aria-live="assertive">{toast}</div>}
        </>
    );
}
