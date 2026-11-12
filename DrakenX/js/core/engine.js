/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - HUVUDMOTOR & SPELLOOP v3.0 (engine.js)
 * Binder samman State, Audio, Voice, WebGL-Renderer, SCUMM-UI och alla 16 rum.
 * ============================================================================
 */

window.Scenes = window.Scenes || {};

window.Engine = {
    isRunning: false,
    lastFrameTime: 0,
    footstepTimer: 0,
    activeSceneObj: null,

    registerScene(sceneId, sceneDefinition) {
        window.Scenes[sceneId] = sceneDefinition;
    },

    init() {
        if (window.VoiceEngine) window.VoiceEngine.init();
        if (window.Renderer) window.Renderer.init();
        if (window.UI) window.UI.init();

        this._bindEvents();
        this.loadScene(window.GameState.currentScene || 'scene0_intro', true);

        this.isRunning = true;
        requestAnimationFrame((ts) => this._gameLoop(ts));
    },

    loadScene(sceneId, isInitialBoot = false) {
        const gs = window.GameState;
        if (!gs) return;

        if (window.VoiceEngine) window.VoiceEngine.stop();
        gs.interaction.inDialogue = false;
        gs.interaction.activeDialogueTree = null;
        gs.interaction.hoveredObject = null;
        gs.resetVerb();

        gs.currentScene = sceneId;

        const selectEl = document.getElementById('dev-scene-select');
        if (selectEl && selectEl.value !== sceneId) {
            selectEl.value = sceneId;
        }

        const sceneDef = window.Scenes[sceneId];
        if (!sceneDef) {
            this._buildPlaceholderScene(sceneId);
            return;
        }

        this.activeSceneObj = sceneDef;
        gs.player.isWalking = false;
        gs.player.walkCallback = null;

        if (typeof sceneDef.init === 'function') {
            sceneDef.init();
        }

        if (!isInitialBoot && window.AudioEngine) {
            window.AudioEngine.startAmbience(sceneId);
            if (typeof sceneDef.onEnter === 'function') {
                sceneDef.onEnter();
            }
        }
    },

    _gameLoop(timestamp) {
        if (!this.isRunning) return;

        const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;

        this._updatePlayerMovement(dt);

        if (this.activeSceneObj && typeof this.activeSceneObj.update === 'function') {
            this.activeSceneObj.update(dt, timestamp);
        }

        if (window.Renderer) window.Renderer.renderFrame();
        if (window.UI) window.UI.render();

        requestAnimationFrame((ts) => this._gameLoop(ts));
    },

    _updatePlayerMovement(dt) {
        const gs = window.GameState;
        if (!gs || !gs.player.isWalking) return;

        if (gs.webgl.cameraMode !== 'room_25d') {
            gs.player.isWalking = false;
            if (typeof gs.player.walkCallback === 'function') {
                const cb = gs.player.walkCallback;
                gs.player.walkCallback = null;
                cb();
            }
            return;
        }

        const dx = gs.player.targetX - gs.player.x;
        const dy = gs.player.targetY - gs.player.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= gs.player.speed) {
            gs.player.x = gs.player.targetX;
            gs.player.y = gs.player.targetY;
            gs.player.isWalking = false;

            if (typeof gs.player.walkCallback === 'function') {
                const cb = gs.player.walkCallback;
                gs.player.walkCallback = null;
                cb();
            }
        } else {
            const moveStep = gs.player.speed * (dt * 60);
            gs.player.x += (dx / dist) * moveStep;
            gs.player.y += (dy / dist) * moveStep;
            gs.player.direction = dx < 0 ? 'left' : 'right';

            this.footstepTimer += dt;
            if (this.footstepTimer >= 0.28) {
                this.footstepTimer = 0;
                if (window.AudioEngine) {
                    const stepSound = (gs.currentScene === 'scene3_hangar' || gs.currentScene === 'scene2_gate')
                        ? 'footstep_concrete'
                        : 'footstep_wood';
                    window.AudioEngine.playSFX(stepSound);
                }
            }
        }
    },

    walkToAndExecute(targetX, targetY, lookDirection, callback) {
        const gs = window.GameState;
        if (!gs) return;

        const clampedX = Math.max(-220, Math.min(1500, targetX));
        const clampedY = Math.max(510, Math.min(715, targetY));

        gs.player.targetX = clampedX;
        gs.player.targetY = clampedY;
        gs.player.isWalking = true;
        gs.player.walkCallback = () => {
            if (lookDirection) gs.player.direction = lookDirection;
            if (typeof callback === 'function') callback();
        };
    },

    _handleSceneObjectInteraction(hotspot) {
        const gs = window.GameState;
        const verb = gs.interaction.currentVerb;
        const selectedItem = gs.interaction.selectedItem;

        // I 3D-cutscenes (som prologen) kör vi interaktionen direkt utan promenad
        if (gs.webgl.cameraMode !== 'room_25d') {
            if (this.activeSceneObj && typeof this.activeSceneObj.onInteract === 'function') {
                this.activeSceneObj.onInteract(hotspot.id, verb, selectedItem);
            }
            gs.resetVerb();
            return;
        }

        const walkX = hotspot.walkX !== undefined ? hotspot.walkX : gs.player.x;
        const walkY = hotspot.walkY !== undefined ? hotspot.walkY : gs.player.y;
        const lookAt = hotspot.lookAt || (walkX < gs.player.x ? 'left' : 'right');

        this.walkToAndExecute(walkX, walkY, lookAt, () => {
            if (verb === 'ANVÄND' && selectedItem && hotspot.id === 'conny_npc') {
                this._handleUseItemOnConny(selectedItem);
                gs.resetVerb();
                return;
            }

            if (this.activeSceneObj && typeof this.activeSceneObj.onInteract === 'function') {
                const handled = this.activeSceneObj.onInteract(hotspot.id, verb, selectedItem);
                if (handled) {
                    gs.resetVerb();
                    return;
                }
            }

            this._triggerDefaultResponse(hotspot, verb, selectedItem);
            gs.resetVerb();
        });
    },

    _handleUseItemOnConny(itemId) {
        if (itemId === 'skogaholms_messmor') {
            if (window.AudioEngine) window.AudioEngine.playSFX('stomach_rumble');
            window.VoiceEngine.speakSequence([
                {
                    speaker: 'lasse',
                    text: 'Hörru Conny, hugg in på en Skogaholmslimpa med fjällbrynt messmör så du håller blodsockret uppe!'
                },
                {
                    speaker: 'conny',
                    text: 'Nänä, Lasse! Ger du mej en enda skiva Skogaholmslimpa med dä dära förbannade messmöret så gör min mage totaluppror inom fem minuter! Då gör ja kupéfilter av din fina mockajacka, dä lovar ja!'
                }
            ]);
        } else if (itemId === 'lerhjarta_dagis') {
            window.VoiceEngine.speak(
                'conny',
                'Haha! Försök inte ge ditt gamla dagis-lerhjärta till mej, Lasse! Spara dä till Britt-Marie eller nån utländsk prinsessa på resan!'
            );
        } else if (itemId === 'messing_nyckel') {
            window.VoiceEngine.speak('conny', 'Håll i nyckeln till Tors Vrede tills vi är redo att dra till bergsrummet, Lasse!');
        } else if (itemId === 'betyg_engelska') {
            window.VoiceEngine.speak('conny', 'En stark trea i engelska! Med det där betyget kommer ju utlänningarna tro att vi är diplomater från UD hela bunten!');
        } else {
            window.VoiceEngine.speak('conny', 'Nä hörru Lasse, dä dära får du allt behålla i egen ficka.');
        }
    },

    handleItemCombination(itemA, itemB) {
        const pair = [itemA, itemB].sort().join('+');
        if (pair === 'betyg_engelska+skolatlas_1954') {
            window.VoiceEngine.speak(
                'lasse',
                'Med 1954 års världsatlas OCH min starka trea i engelska från magister Karlsson är vi praktiskt taget ostoppbara i utlandet!'
            );
        } else {
            window.VoiceEngine.speak('lasse', 'Nä, jag ser ingen vits med att kladda ihop de där två grejerna.');
        }
    },

    _triggerDefaultResponse(hotspot, verb, selectedItem) {
        if (verb === 'TITTA PÅ') {
            window.VoiceEngine.speak('lasse', `Det är ${hotspot.name.toLowerCase()}. Ser helt normalt ut för en höstdag 1961.`);
        } else if (verb === 'PLOCKA UPP') {
            window.VoiceEngine.speak('lasse', `Jag kan ju inte gå runt och bära på ${hotspot.name.toLowerCase()} i fickan!`);
        } else if (verb === 'PRATA MED') {
            window.VoiceEngine.speak('lasse', 'Även med en stark trea i engelska känns det meningslöst att prata med döda ting.');
        } else if (verb === 'ÖPPNA') {
            window.VoiceEngine.speak('lasse', `Det går inte att öppna ${hotspot.name.toLowerCase()} sådär bara.`);
        } else if (verb === 'ANVÄND' && selectedItem) {
            window.VoiceEngine.speak('lasse', 'Nä, det där leder nog ingenstans.');
        } else {
            window.VoiceEngine.speak('lasse', 'Hmm, hur tänkte jag nu egentligen?');
        }
    },

    startDialogue(optionsList) {
        const gs = window.GameState;
        gs.interaction.inDialogue = true;
        gs.interaction.activeDialogueTree = { options: optionsList };
    },

    endDialogue() {
        const gs = window.GameState;
        gs.interaction.inDialogue = false;
        gs.interaction.activeDialogueTree = null;
        gs.resetVerb();
    },

    _bindEvents() {
        const uiCanvas = document.getElementById('ui-canvas');
        const gs = window.GameState;

        const getCanvasCoords = (e) => {
            const rect = uiCanvas.getBoundingClientRect();
            const scaleX = 1280 / rect.width;
            const scaleY = 1024 / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        if (uiCanvas) {
            uiCanvas.addEventListener('mousemove', (e) => {
                const { x, y } = getCanvasCoords(e);
                if (window.UI && window.UI.handleMouseMove(x, y)) return;

                if (window.Renderer) {
                    const hovered = window.Renderer.getHoveredObject(x, y);
                    gs.interaction.hoveredObject = hovered;
                    gs.updateSentenceBar();
                }
            });

            uiCanvas.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                const { x, y } = getCanvasCoords(e);

                if (window.UI && window.UI.handleMouseClick(x, y)) return;
                if (gs.interaction.inDialogue) return;

                const clickedHotspot = window.Renderer ? window.Renderer.getHoveredObject(x, y) : null;
                if (clickedHotspot) {
                    this._handleSceneObjectInteraction(clickedHotspot);
                } else if (gs.webgl.cameraMode === 'room_25d') {
                    const roomTargetX = window.Renderer ? window.Renderer.viewportToRoomX(x) : x;
                    this.walkToAndExecute(roomTargetX, y, null, null);
                }
            });
        }

        const launchBtn = document.getElementById('btn-launch-game');
        if (launchBtn) {
            launchBtn.addEventListener('click', () => {
                const overlay = document.getElementById('boot-overlay');
                if (overlay) overlay.classList.add('hidden');

                if (window.AudioEngine) {
                    window.AudioEngine.init();
                    window.AudioEngine.playSFX('pickup');
                    window.AudioEngine.startAmbience(gs.currentScene);
                }

                if (this.activeSceneObj && typeof this.activeSceneObj.onEnter === 'function') {
                    this.activeSceneObj.onEnter();
                }
            });
        }

        const btnVoice = document.getElementById('btn-toggle-voice');
        if (btnVoice) {
            btnVoice.addEventListener('click', () => {
                gs.settings.voiceEnabled = !gs.settings.voiceEnabled;
                btnVoice.textContent = gs.settings.voiceEnabled ? '🔊 TAL: PÅ' : '🔇 TAL: AV (BLIPS)';
                if (!gs.settings.voiceEnabled && window.VoiceEngine) window.VoiceEngine.stop();
            });
        }

        const btnSfx = document.getElementById('btn-toggle-sfx');
        if (btnSfx) {
            btnSfx.addEventListener('click', () => {
                gs.settings.sfxEnabled = !gs.settings.sfxEnabled;
                btnSfx.textContent = gs.settings.sfxEnabled ? '🎵 LJUD: PÅ' : '🔇 LJUD: AV';
                if (window.AudioEngine) window.AudioEngine.toggleMute(gs.settings.sfxEnabled);
            });
        }

        const btnFx = document.getElementById('btn-toggle-fx') || document.getElementById('btn-Toggle-crt');
        if (btnFx) {
            btnFx.addEventListener('click', () => {
                const cinemaEl = document.getElementById('cinema-overlay') || document.getElementById('crt-overlay');
                if (cinemaEl) {
                    const isActive = cinemaEl.classList.toggle('cinema-active');
                    btnFx.textContent = isActive ? '🎬 FILM-FILTER: PÅ' : '🎬 FILM-FILTER: AV';
                }
            });
        }

        const sceneSelect = document.getElementById('dev-scene-select');
        if (sceneSelect) {
            sceneSelect.addEventListener('change', (e) => {
                this.loadScene(e.target.value);
            });
        }
    },

    _buildPlaceholderScene(sceneId) {
        if (!window.Renderer) return;
        window.Renderer.clearScene(0x141a24, 0.02);
        window.Renderer.buildStandardRoom({ wallColor: 0x2c3e50, floorColor: 0x34495e });
        window.Renderer.spawnMainActors(true);
        window.VoiceEngine.speak('lasse', `Scenmodulen "${sceneId}" väntar på att levereras!`);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.Engine.init();
});