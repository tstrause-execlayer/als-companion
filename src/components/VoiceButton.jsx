// VoiceButton.jsx — Persistent floating microphone button
// Animated waveform when listening. Speaks instructions on first press.
import { useEffect } from 'react';

const styles = `
  .voice-fab {
    position: fixed;
    bottom: 28px;
    right: 20px;
    z-index: 900;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.7rem;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(0,0,0,0.45);
    outline: none;
  }
  .voice-fab.idle {
    background: linear-gradient(135deg, #f0a500 0%, #e07030 100%);
  }
  .voice-fab.listening {
    background: linear-gradient(135deg, #e07070 0%, #c44060 100%);
    animation: pulseRing 1.2s ease-in-out infinite;
  }
  .voice-fab.unsupported {
    background: #2a3040;
    opacity: 0.5;
    cursor: not-allowed;
  }
  @keyframes pulseRing {
    0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(224,112,112,0.5); }
    70%  { transform: scale(1.06); box-shadow: 0 0 0 14px rgba(224,112,112,0); }
    100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(224,112,112,0); }
  }
  .voice-fab:hover:not(.listening):not(.unsupported) {
    transform: scale(1.07);
  }
  .voice-fab:active { transform: scale(0.95); }
  .voice-tip {
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: #161b22;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 0.8rem;
    color: #8b98a8;
    max-width: 200px;
    text-align: right;
    z-index: 900;
    animation: fadeUp 0.3s ease;
    pointer-events: none;
  }
`;

export default function VoiceButton({ listening, supported, onToggle, transcript }) {
    return (
        <>
            <style>{styles}</style>
            {listening && transcript && (
                <div className="voice-tip">"{transcript}"</div>
            )}
            {listening && !transcript && (
                <div className="voice-tip">Listening… speak now</div>
            )}
            <button
                id="voice-fab"
                className={`voice-fab ${!supported ? 'unsupported' : listening ? 'listening' : 'idle'}`}
                onClick={onToggle}
                aria-label={listening ? 'Stop listening' : 'Start voice command'}
                title={!supported ? 'Voice not supported in this browser' : listening ? 'Tap to stop' : 'Tap to speak'}
            >
                {listening ? '🔴' : '🎤'}
            </button>
        </>
    );
}
