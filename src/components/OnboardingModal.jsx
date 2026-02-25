// OnboardingModal.jsx — First-launch setup: patient name + voice preference
import { useState } from 'react';

const styles = `
  .onboard-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .onboard-card {
    background: #161b22;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 32px 28px;
    max-width: 460px;
    width: 100%;
    animation: slideUp 0.4s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .onboard-logo {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 12px;
  }
  .onboard-title {
    font-family: 'Lora', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #f0a500;
    text-align: center;
    margin-bottom: 6px;
  }
  .onboard-sub {
    font-size: 0.85rem;
    color: #8b98a8;
    text-align: center;
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .onboard-label {
    font-size: 0.82rem;
    color: #8b98a8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .onboard-input {
    width: 100%;
    background: #1c2230;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 16px;
    color: #e8edf4;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    outline: none;
    margin-bottom: 20px;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .onboard-input:focus { border-color: rgba(240,165,0,0.5); }
  .onboard-select {
    width: 100%;
    background: #1c2230;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 16px;
    color: #e8edf4;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    margin-bottom: 24px;
    cursor: pointer;
    box-sizing: border-box;
  }
  .onboard-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #f0a500 0%, #e07030 100%);
    border: none;
    border-radius: 12px;
    color: #000;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .onboard-btn:hover { opacity: 0.88; }
  .onboard-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .onboard-skip {
    text-align: center;
    margin-top: 14px;
    font-size: 0.8rem;
    color: #8b98a8;
    cursor: pointer;
    text-decoration: underline;
    background: none; border: none; font-family: 'DM Sans', sans-serif;
    width: 100%;
  }
  .voice-row {
    display: flex; gap: 10px; align-items: center; margin-bottom: 20px;
  }
  .voice-pill {
    flex: 1;
    padding: 10px 14px;
    border-radius: 100px;
    border: 1.5px solid rgba(255,255,255,0.08);
    background: #1c2230;
    color: #8b98a8;
    font-size: 0.8rem;
    cursor: pointer;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .voice-pill.selected { border-color: #f0a500; background: rgba(240,165,0,0.12); color: #f0a500; }
`;

export default function OnboardingModal({ onComplete, voices }) {
    const [name, setName] = useState('');
    const [voiceSpeed, setVoiceSpeed] = useState('normal');

    const handle = () => {
        if (!name.trim()) return;
        onComplete({ name: name.trim(), voiceSpeed });
    };

    return (
        <>
            <style>{styles}</style>
            <div className="onboard-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Companion">
                <div className="onboard-card">
                    <div className="onboard-logo">✦</div>
                    <div className="onboard-title">Welcome to Companion</div>
                    <div className="onboard-sub">
                        A voice-first care app for people living with ALS and other neurodegenerative conditions — and the caregivers who love them.
                    </div>

                    <div className="onboard-label">Patient's name</div>
                    <input
                        id="onboard-name"
                        className="onboard-input"
                        type="text"
                        placeholder="e.g. James"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handle()}
                        autoFocus
                    />

                    <div className="onboard-label">Voice speed for read-aloud</div>
                    <div className="voice-row">
                        {['slow', 'normal', 'fast'].map(s => (
                            <button
                                key={s}
                                className={`voice-pill ${voiceSpeed === s ? 'selected' : ''}`}
                                onClick={() => setVoiceSpeed(s)}
                            >
                                {s === 'slow' ? '🐢 Slow' : s === 'normal' ? '🗣️ Normal' : '⚡ Fast'}
                            </button>
                        ))}
                    </div>

                    <button id="onboard-start" className="onboard-btn" onClick={handle} disabled={!name.trim()}>
                        Get Started →
                    </button>
                    <button className="onboard-skip" onClick={() => onComplete({ name: 'Friend', voiceSpeed: 'normal' })}>
                        Skip setup
                    </button>
                </div>
            </div>
        </>
    );
}
