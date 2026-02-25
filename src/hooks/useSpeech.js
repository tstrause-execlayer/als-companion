// Custom hook: useSpeech
// Wraps both SpeechRecognition (STT) and SpeechSynthesis (TTS) APIs.
// Provides a clean interface for voice-first interactions.
import { useState, useEffect, useCallback, useRef } from 'react';

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeech({ onTranscript, onCommand } = {}) {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [voices, setVoices] = useState([]);
    const [preferredVoice, setPreferredVoice] = useState(null);
    const recognitionRef = useRef(null);
    const supported = Boolean(SpeechRecognition);
    const ttsSupported = Boolean(window.speechSynthesis);

    // Load available TTS voices
    useEffect(() => {
        if (!ttsSupported) return;
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length) setVoices(v);
        };
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }, [ttsSupported]);

    // Initialize recognition
    useEffect(() => {
        if (!supported) return;
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (e) => {
            const text = e.results[0][0].transcript.trim();
            setTranscript(text);
            if (onTranscript) onTranscript(text);
            // Voice command routing
            if (onCommand) {
                const lower = text.toLowerCase();
                if (lower.includes('home') || lower.includes('dashboard')) onCommand('nav:home');
                else if (lower.includes('talk') || lower.includes('chat') || lower.includes('companion')) onCommand('nav:talk');
                else if (lower.includes('speak') || lower.includes('board') || lower.includes('aac')) onCommand('nav:aac');
                else if (lower.includes('schedule') || lower.includes('medication') || lower.includes('reminder')) onCommand('nav:reminders');
                else if (lower.includes('alert') || lower.includes('emergency') || lower.includes('help') || lower.includes('caregiver')) onCommand('nav:caregiver');
                else if (lower.includes('check') || lower.includes('how i feel') || lower.includes('checkin')) onCommand('nav:checkin');
                // AAC voice shortcuts
                else if (lower.includes('water') || lower.includes('drink')) onCommand('aac:Water');
                else if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry')) onCommand('aac:Food');
                else if (lower.includes('bathroom') || lower.includes('toilet')) onCommand('aac:Bathroom');
                else if (lower.includes('pain') || lower.includes('hurt')) onCommand('aac:I\'m in pain');
                else if (lower.includes('reposit') || lower.includes('move me')) onCommand('aac:Reposition me');
                else if (lower.includes('breathe') || lower.includes('breathing')) onCommand('aac:I can\'t breathe');
                else if (lower.includes('medication') || lower.includes('pill') || lower.includes('medicine')) onCommand('aac:Medication');
                else if (lower.includes('thank') || lower.includes('thanks')) onCommand('aac:Thank you');
                else if (lower.includes('yes') || lower.includes('good')) onCommand('aac:Yes / Good');
                else if (lower.includes('no') || lower.includes('stop')) onCommand('aac:No / Stop');
                else if (lower.includes('love')) onCommand('aac:I love you');
                else if (lower.includes('okay') || lower.includes("i'm fine")) onCommand('aac:I\'m okay');
                else if (lower.includes('tired') || lower.includes('sleepy')) onCommand('aac:I\'m tired');
                else if (lower.includes('sad') || lower.includes('down')) onCommand('aac:I\'m sad');
                else if (lower.includes('anxious') || lower.includes('worried') || lower.includes('nervous')) onCommand('aac:I\'m anxious');
                else onCommand('chat:' + text); // default: send to chat
            }
        };

        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);

        recognitionRef.current = rec;
        return () => {
            try { rec.abort(); } catch { }
        };
    }, [supported, onTranscript, onCommand]);

    const startListening = useCallback(() => {
        if (!supported || listening) return;
        try {
            recognitionRef.current.start();
            setListening(true);
            setTranscript('');
        } catch { }
    }, [supported, listening]);

    const stopListening = useCallback(() => {
        if (!supported || !listening) return;
        try { recognitionRef.current.abort(); } catch { }
        setListening(false);
    }, [supported, listening]);

    const speak = useCallback((text, { rate = 0.88, pitch = 1 } = {}) => {
        if (!ttsSupported || !text || !ttsEnabled) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = pitch;
        if (preferredVoice) u.voice = preferredVoice;
        window.speechSynthesis.speak(u);
    }, [ttsSupported, ttsEnabled, preferredVoice]);

    const speakImmediate = useCallback((text) => {
        if (!ttsSupported || !text) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.88;
        if (preferredVoice) u.voice = preferredVoice;
        window.speechSynthesis.speak(u);
    }, [ttsSupported, preferredVoice]);

    return {
        listening, transcript,
        ttsEnabled, setTtsEnabled,
        voices, preferredVoice, setPreferredVoice,
        startListening, stopListening,
        speak, speakImmediate,
        supported, ttsSupported,
    };
}
