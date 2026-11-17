/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - DIALEKT- & RÖSTMOTOR (voice.js)
 * Inkluderar Lasse, Conny, Tant Karin (Connys mamma i köket), Pappan, Bulten,
 * Överkonstapel Grym, 1961 års Radiouppläsare och de internationella ledarna.
 * ============================================================================
 */

window.VoiceEngine = {
    synth: window.speechSynthesis || null,
    voices: [],
    currentAudio: null,
    blipInterval: null,
    subtitleTimeout: null,
    speechToken: 0,
    preferredVoices: {},

    profiles: {
        'lasse': {
            name: 'LASSE',
            color: '#67b0e8',
            lang: 'sv-SE',
            pitch: 1.08,
            rate: 1.02,
            dialect: 'ostgotska_light'
        },
        'conny': {
            name: 'CONNY',
            color: '#ffaa00',
            lang: 'sv-SE',
            pitch: 0.94,
            rate: 0.95,
            dialect: 'ostgotska_broad'
        },
        'mamma': {
            name: 'TANT KARIN (CONNYS MAMMA)',
            color: '#f4a261',
            lang: 'sv-SE',
            pitch: 1.22,
            rate: 0.98,
            dialect: 'ostgotska_light'
        },
        'pappa': {
            name: 'CHEFSKONSTRUKTÖREN (KÄLLAREN)',
            color: '#a3b8cc',
            lang: 'sv-SE',
            pitch: 0.78,
            rate: 0.86,
            dialect: 'none'
        },
        'radio': {
            name: 'SVERIGES RADIO (1961)',
            color: '#88dd88',
            lang: 'sv-SE',
            pitch: 0.88,
            rate: 0.94,
            dialect: 'radio_1961'
        },
        'bulten': {
            name: 'RAGGARKUNGEN BULTEN',
            color: '#ff5555',
            lang: 'sv-SE',
            pitch: 0.74,
            rate: 0.96,
            dialect: 'ostgotska_broad'
        },
        'polis': {
            name: 'ÖVERKONSTAPEL GRYM',
            color: '#99bbff',
            lang: 'sv-SE',
            pitch: 0.80,
            rate: 0.92,
            dialect: 'none'
        }
    },

    init() {
        if (!this.synth) return;
        const loadVoices = () => { this.voices = this.synth.getVoices(); };
        loadVoices();
        if (this.synth.addEventListener) {
            this.synth.addEventListener('voiceschanged', loadVoices);
        } else if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    },

    stop() {
        this.speechToken++;
        if (this.synth) this.synth.cancel();
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        if (this.blipInterval) {
            clearInterval(this.blipInterval);
            this.blipInterval = null;
        }
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = null;
        }
        if (window.GameState) {
            window.GameState.player.isTalking = false;
            window.GameState.companion.isTalking = false;
            window.GameState.subtitle.active = false;
        }
    },

    speak(speakerId, displayText, options = {}) {
        this.stop();

        const token = this.speechToken;
        const gs = window.GameState;
        const profile = this.profiles[speakerId] || this.profiles['lasse'];

        if (gs) {
            gs.subtitle.active = true;
            gs.subtitle.speaker = profile.name;
            gs.subtitle.speakerId = speakerId;
            gs.subtitle.text = displayText;
            gs.subtitle.color = profile.color;

            if (speakerId === 'lasse') gs.player.isTalking = true;
            if (speakerId === 'conny') gs.companion.isTalking = true;
        }

        const readingDurationMs = Math.max(2800, displayText.length * 68);

        if (gs && gs.settings.voiceEnabled && this.synth) {
            const spokenString = options.spokenText || this._applyPhoneticDialect(displayText, profile.dialect);
            const utter = new SpeechSynthesisUtterance(spokenString);
            utter.lang = profile.lang;
            utter.pitch = profile.pitch;
            utter.rate = profile.rate;

            const matchedVoice = this._findBestVoice(profile.lang, speakerId);
            if (matchedVoice) utter.voice = matchedVoice;

            utter.onend = () => this._finishSpeech(speakerId, options.onComplete, token);
            utter.onerror = () => this._finishSpeech(speakerId, options.onComplete, token);

            this.synth.speak(utter);

            this.subtitleTimeout = setTimeout(() => {
                this._finishSpeech(speakerId, options.onComplete, token);
            }, Math.max(readingDurationMs + 5000, 15000));
        } else {
            this._startRetroBlips(readingDurationMs, speakerId, options.onComplete);
        }
    },

    speakSequence(lines, finalCallback = null) {
        if (!lines || lines.length === 0) {
            if (finalCallback) finalCallback();
            return;
        }
        const [current, ...rest] = lines;
        this.speak(current.speaker, current.text, {
            spokenText: current.spokenText,
            onComplete: () => {
                setTimeout(() => {
                    this.speakSequence(rest, finalCallback);
                }, 220);
            }
        });
    },

    _finishSpeech(speakerId, callback, token = this.speechToken) {
        if (token !== this.speechToken) return;
        // Mark this utterance finished before invoking a callback that may start the next one.
        this.speechToken++;
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = null;
        }
        if (this.blipInterval) {
            clearInterval(this.blipInterval);
            this.blipInterval = null;
        }
        const gs = window.GameState;
        if (gs) {
            gs.player.isTalking = false;
            gs.companion.isTalking = false;
            gs.subtitle.active = false;
        }
        if (typeof callback === 'function') callback();
    },

    _startRetroBlips(durationMs, speakerId, onComplete) {
        this.blipInterval = setInterval(() => {
            if (window.AudioEngine) window.AudioEngine.playSFX('voice_blip');
        }, 95);

        this.subtitleTimeout = setTimeout(() => {
            this._finishSpeech(speakerId, onComplete);
        }, durationMs);
    },

    // A browser's installed Swedish voices determine the actual timbre and accent.
    // Assign distinct voices where possible, without pretending pitch creates a dialect.
    _findBestVoice(langCode, speakerId) {
        if (!this.voices || this.voices.length === 0) {
            this.voices = this.synth ? this.synth.getVoices() : [];
        }
        const prefix = langCode.split('-')[0].toLowerCase();
        const available = this.voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
        if (!available.length) return null;
        const preferredName = this.preferredVoices[speakerId];
        const preferred = available.find(v => v.name === preferredName);
        if (preferred) return preferred;
        const voiceSlots = { lasse: 0, conny: 1, mamma: 2, pappa: 3, radio: 4, bulten: 5, polis: 6 };
        const slot = voiceSlots[speakerId] ?? 0;
        return available[slot % available.length];
    },

    // Can be set from a future settings UI after listing speechSynthesis.getVoices().
    setPreferredVoice(speakerId, voiceName) {
        if (!this.profiles[speakerId]) return false;
        this.preferredVoices[speakerId] = voiceName;
        return true;
    },

    _applyPhoneticDialect(text, dialectType) {
        if (!dialectType || dialectType === 'none') return text;
        let s = text;
        if (dialectType === 'ostgotska_broad') {
            s = s.replace(/\bdet är\b/gi, 'dä ä')
                 .replace(/\bdet\b/gi, 'dä')
                 .replace(/\binte\b/gi, 'ente')
                 .replace(/\bmed\b/gi, 'me')
                 .replace(/\boch\b/gi, 'å')
                 .replace(/\bjag\b/gi, 'ja')
                 .replace(/\bmig\b/gi, 'mej')
                 .replace(/\bdig\b/gi, 'dej');
        } else if (dialectType === 'ostgotska_light') {
            s = s.replace(/\bdet är\b/gi, 'de e')
                 .replace(/\bmig\b/gi, 'mej')
                 .replace(/\bdig\b/gi, 'dej');
        }
        return s;
    }
};