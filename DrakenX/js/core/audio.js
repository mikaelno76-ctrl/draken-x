/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - WEBAUDIO 1961 SOUND ENGINE (audio.js)
 * Komplett ljudeffekts- och atmosfärsyntetisator (Inklusive Taxen Sputniks
 * skall, Treo-brus, Bakelit-fingerskiva, Cheva V8 och Romantiskt Crescendo!).
 * ============================================================================
 */

window.AudioEngine = {
    ctx: null,
    masterGain: null,
    sfxGain: null,
    ambienceGain: null,
    ambienceNodes: [],
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.85;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.9;
        this.sfxGain.connect(this.masterGain);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.value = 0.32;
        this.ambienceGain.connect(this.masterGain);

        this.isInitialized = true;
    },

    _ensureContext() {
        if (!this.isInitialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx && window.GameState && window.GameState.settings.sfxEnabled;
    },

    toggleMute(enabled) {
        if (!this.masterGain || !this.ctx) return;
        this.masterGain.gain.setTargetAtTime(enabled ? 0.85 : 0.0, this.ctx.currentTime, 0.05);
    },

    playSFX(type) {
        if (!this._ensureContext()) return;
        const now = this.ctx.currentTime;

        switch (type) {
            case 'ui_click':
                this._playTone(720, 420, 0.04, 'triangle', 0.25);
                break;

            case 'pickup':
                this._playTone(440, 660, 0.09, 'sine', 0.35, 0);
                this._playTone(660, 880, 0.14, 'sine', 0.35, 0.08);
                break;

            case 'footstep_wood':
                this._playFilteredNoise(160, 'lowpass', 0.05, 0.28);
                break;

            case 'footstep_concrete':
                this._playFilteredNoise(420, 'bandpass', 0.04, 0.22);
                break;

            case 'treo_fizz':
                this._playFilteredNoise(2400, 'bandpass', 1.4, 0.22);
                break;

            case 'bottles_clink':
                this._playTone(1480, 1490, 0.12, 'sine', 0.3, 0.0);
                this._playTone(1720, 1710, 0.15, 'sine', 0.28, 0.09);
                break;

            case 'dog_bark':
                // Taxen Sputniks dubbel-skall ("Voff-voff!")
                this._playTone(320, 140, 0.11, 'sawtooth', 0.35, 0.0);
                this._playFilteredNoise(900, 'bandpass', 0.09, 0.25, 0.0);
                this._playTone(360, 130, 0.14, 'sawtooth', 0.38, 0.16);
                this._playFilteredNoise(950, 'bandpass', 0.12, 0.28, 0.16);
                break;

            case 'rotary_dial':
                for (let i = 0; i < 7; i++) {
                    this._playTone(950, 600, 0.025, 'square', 0.2, i * 0.07);
                }
                break;

            case 'phone_ring_1961':
                for (let i = 0; i < 10; i++) {
                    this._playTone(1150, 1350, 0.04, 'triangle', 0.35, i * 0.055);
                }
                break;

            case 'aga_radio_tune':
                this._playTone(650, 1950, 0.55, 'sine', 0.15);
                this._playFilteredNoise(1100, 'bandpass', 0.55, 0.25);
                break;

            case 'stomach_rumble':
                this._playTone(95, 52, 0.85, 'sawtooth', 0.45);
                break;

            case 'v8_cheva_burnout':
                this._playTone(55, 195, 1.8, 'sawtooth', 0.5, 0);
                this._playFilteredNoise(650, 'bandpass', 1.6, 0.45, 0.25);
                break;

            case 'police_siren_1961':
                for (let i = 0; i < 4; i++) {
                    const freq = i % 2 === 0 ? 440 : 587;
                    this._playTone(freq, freq, 0.38, 'sawtooth', 0.28, i * 0.4);
                }
                break;

            case 'romantic_crescendo':
                // För kyssen med den etiopiska prinsessan!
                [261.6, 329.6, 392.0, 523.2].forEach((freq, idx) => {
                    this._playTone(freq, freq * 1.02, 2.8, 'sine', 0.22, idx * 0.25);
                });
                break;

            case 'voice_blip':
                this._playTone(210 + Math.random() * 80, 190, 0.035, 'triangle', 0.12);
                break;
        }
    },

    startAmbience(sceneId) {
        if (!this._ensureContext()) return;
        this.stopAmbience();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = sceneId === 'scene2_gate' ? 62 : 50;
        gain.gain.value = 0.06;
        osc.connect(gain);
        gain.connect(this.ambienceGain);
        osc.start();
        this.ambienceNodes.push(osc);
    },

    stopAmbience() {
        this.ambienceNodes.forEach(node => {
            try { node.stop(); node.disconnect(); } catch (e) {}
        });
        this.ambienceNodes = [];
    },

    _playTone(startFreq, endFreq, duration, waveType = 'sine', volume = 0.3, delay = 0) {
        const startTime = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(startFreq, startTime);
        if (startFreq !== endFreq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
        }

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
    },

    _playFilteredNoise(cutoffFreq, filterType = 'lowpass', duration = 0.2, volume = 0.3, delay = 0) {
        const startTime = this.ctx.currentTime + delay;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(cutoffFreq, startTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(startTime);
    }
};