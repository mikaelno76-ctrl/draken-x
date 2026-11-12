/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - 1961 TEAK & BAKELIT SCUMM HUD (ui.js)
 * Uppgraderad med:
 *   - Retina / 4K HiDPI-skalning (knivskarp text oavsett skärm)
 *   - Autentisk 1961 Teak-, Mässings- och Bakelitpanel (ersätter sci-fi-looken)
 *   - Detaljillustrerade föremålsikoner i inventariet
 * ============================================================================
 */

window.UI = {
    canvas: null,
    ctx: null,
    dpr: 1,
    verbs: ['GÅ TILL', 'TITTA PÅ', 'PLOCKA UPP', 'PRATA MED', 'ANVÄND', 'ÖPPNA'],
    verbBoxes: [],
    invBoxes: [],
    dialogueBoxes: [],
    hoveredVerb: null,
    hoveredInvSlot: -1,
    hoveredDialogueIdx: -1,

    init() {
        this.canvas = document.getElementById('ui-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // Stöd för Retina / 4K-skärmar utan att ändra de logiska koordinaterna (1280x1024)!
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = 1280 * this.dpr;
        this.canvas.height = 1024 * this.dpr;

        this._computeLayoutBoxes();
    },

    _computeLayoutBoxes() {
        this.verbBoxes = [];
        const startX = 28;
        const startY = 822;
        const btnW = 210;
        const btnH = 54;
        const gapX = 14;
        const gapY = 12;

        for (let i = 0; i < this.verbs.length; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            this.verbBoxes.push({
                verb: this.verbs[i],
                x: startX + col * (btnW + gapX),
                y: startY + row * (btnH + gapY),
                w: btnW,
                h: btnH
            });
        }

        this.invBoxes = [];
        const invStartX = 496;
        const invStartY = 822;
        const slotW = 182;
        const slotH = 86;
        const invGapX = 12;
        const invGapY = 14;

        for (let s = 0; s < 8; s++) {
            const col = s % 4;
            const row = Math.floor(s / 4);
            this.invBoxes.push({
                slot: s,
                x: invStartX + col * (slotW + invGapX),
                y: invStartY + row * (slotH + invGapY),
                w: slotW,
                h: slotH
            });
        }
    },

    render() {
        if (!this.ctx || !window.GameState) return;
        const ctx = this.ctx;
        const gs = window.GameState;

        ctx.save();
        ctx.scale(this.dpr, this.dpr);
        ctx.clearRect(0, 0, 1280, 1024);

        if (gs.subtitle.active && gs.subtitle.text) {
            this._drawSubtitles(ctx, gs.subtitle);
        }

        this._draw1961TeakAndBakelitePanel(ctx);
        this._drawRadioDialSentenceBar(ctx, gs);

        if (gs.interaction.inDialogue && gs.interaction.activeDialogueTree) {
            this._drawDialogueChoices(ctx, gs.interaction.activeDialogueTree);
        } else {
            this._drawBakeliteVerbButtons(ctx, gs);
            this._drawInventoryGrid(ctx, gs);
        }

        ctx.restore();
    },

    _drawSubtitles(ctx, sub) {
        ctx.save();
        ctx.font = 'bold 22px "Courier Prime", monospace';
        const lines = this._wrapText(ctx, `"${sub.text}"`, 1040);

        const boxH = lines.length * 32 + 46;
        const boxY = 24;

        // Varm 1961-textruta med mässingsram
        ctx.fillStyle = 'rgba(22, 16, 12, 0.90)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.fillRect(100, boxY, 1080, boxH);
        ctx.strokeRect(100, boxY, 1080, boxH);

        ctx.font = '700 15px "Oswald", sans-serif';
        ctx.fillStyle = sub.color || '#ffcc55';
        ctx.textAlign = 'center';
        ctx.fillText(sub.speaker.toUpperCase(), 640, boxY + 23);

        ctx.font = 'bold 21px "Courier Prime", monospace';
        lines.forEach((line, i) => {
            const y = boxY + 52 + i * 30;
            ctx.fillStyle = '#000000';
            ctx.fillText(line, 642, y + 2);
            ctx.fillStyle = sub.color || '#fff8e7';
            ctx.fillText(line, 640, y);
        });

        ctx.restore();
    },

    _draw1961TeakAndBakelitePanel(ctx) {
        // 1. Varm ådrad Teak-bakgrund (Ersätter den kalla sci-fi-panelen!)
        const teakGrad = ctx.createLinearGradient(0, 760, 0, 1024);
        teakGrad.addColorStop(0, '#5e3214');
        teakGrad.addColorStop(0.5, '#4a250d');
        teakGrad.addColorStop(1, '#361a08');
        ctx.fillStyle = teakGrad;
        ctx.fillRect(0, 760, 1280, 264);

        // Subtila horisontella teak-ådringslinjer
        ctx.fillStyle = 'rgba(20, 8, 2, 0.18)';
        for (let y = 766; y < 1024; y += 6) {
            ctx.fillRect(0, y, 1280, 2);
        }

        // 2. Dubbel mässingslist i överkant (Som på en 1961 AGA-radiomöbel!)
        const brassGrad = ctx.createLinearGradient(0, 760, 1280, 760);
        brassGrad.addColorStop(0, '#a67c1e');
        brassGrad.addColorStop(0.5, '#ffd966');
        brassGrad.addColorStop(1, '#a67c1e');
        ctx.fillStyle = brassGrad;
        ctx.fillRect(0, 760, 1280, 5);

        // Infälld mörk bakelitram runt knappsatsen och inventariet
        ctx.fillStyle = 'rgba(18, 12, 8, 0.55)';
        ctx.strokeStyle = '#8c6222';
        ctx.lineWidth = 1.5;
        ctx.fillRect(18, 814, 456, 198);
        ctx.strokeRect(18, 814, 456, 198);
        ctx.fillRect(486, 814, 776, 198);
        ctx.strokeRect(486, 814, 776, 198);
    },

    _drawRadioDialSentenceBar(ctx, gs) {
        // Belyst 1961 AGA-radioskala som meningsrad!
        const dialGrad = ctx.createLinearGradient(28, 770, 28, 808);
        dialGrad.addColorStop(0, '#2b2114');
        dialGrad.addColorStop(0.5, '#3d2f1b');
        dialGrad.addColorStop(1, '#241b10');
        ctx.fillStyle = dialGrad;
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.fillRect(28, 771, 1224, 36);
        ctx.strokeRect(28, 771, 1224, 36);

        // Små frekvensstreck på sidorna av radioskalan
        ctx.strokeStyle = 'rgba(255, 215, 130, 0.25)';
        ctx.lineWidth = 1;
        for (let fx = 44; fx < 1240; fx += 18) {
            if (fx > 240 && fx < 1040) continue;
            ctx.beginPath();
            ctx.moveTo(fx, 774);
            ctx.lineTo(fx, 781);
            ctx.stroke();
        }

        ctx.font = '700 20px "Oswald", sans-serif';
        ctx.fillStyle = '#ffdd80';
        ctx.textAlign = 'center';
        ctx.fillText(gs.interaction.sentenceText.toUpperCase(), 640, 796);
    },

    _drawBakeliteVerbButtons(ctx, gs) {
        this.verbBoxes.forEach(b => {
            const isSelected = gs.interaction.currentVerb === b.verb;
            const isHovered = this.hoveredVerb === b.verb;

            // Blanksvarta eller varmröda 60-tals bakelitknappar med fasad mässingskant!
            const btnGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            if (isSelected) {
                btnGrad.addColorStop(0, '#c93b1e');
                btnGrad.addColorStop(1, '#821c0a');
            } else if (isHovered) {
                btnGrad.addColorStop(0, '#3d3026');
                btnGrad.addColorStop(1, '#211914');
            } else {
                btnGrad.addColorStop(0, '#261e18');
                btnGrad.addColorStop(1, '#120e0b');
            }

            ctx.fillStyle = btnGrad;
            ctx.strokeStyle = isSelected ? '#ffdd77' : isHovered ? '#d4af37' : '#6e522b';
            ctx.lineWidth = isSelected ? 2.2 : 1.5;

            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            // Liten blank bakelit-reflex i överkant
            ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.fillRect(b.x + 3, b.y + 3, b.w - 6, 8);

            ctx.font = '700 20px "Oswald", sans-serif';
            ctx.fillStyle = isSelected ? '#fff8e7' : isHovered ? '#ffdd88' : '#e8dec5';
            ctx.textAlign = 'center';
            ctx.fillText(b.verb, b.x + b.w / 2, b.y + 35);
        });
    },

    _drawInventoryGrid(ctx, gs) {
        this.invBoxes.forEach((box, idx) => {
            const itemId = gs.inventory[idx] || null;
            const isSelected = itemId && gs.interaction.selectedItem === itemId;
            const isHovered = this.hoveredInvSlot === idx && itemId;

            // Varmt sammets-/manilafodrat fack i teakpanelen
            ctx.fillStyle = isSelected
                ? '#4a3219'
                : isHovered ? '#2e2114' : '#1b140d';
            ctx.strokeStyle = isSelected
                ? '#ffdd77'
                : isHovered ? '#d4af37' : '#543d22';
            ctx.lineWidth = isSelected ? 2 : 1.5;

            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeRect(box.x, box.y, box.w, box.h);

            if (itemId && gs.itemCatalog[itemId]) {
                const item = gs.itemCatalog[itemId];
                this._drawDetailedItemIcon(ctx, item.icon, box.x + box.w / 2, box.y + 33);

                ctx.font = 'bold 13px "Courier Prime", monospace';
                ctx.fillStyle = isSelected ? '#ffea99' : '#f2e8d5';
                ctx.textAlign = 'center';
                ctx.fillText(item.name, box.x + box.w / 2, box.y + 75);
            }
        });
    },

    // ========================================================================
    // DETALJILLUSTRERADE FÖREMÅLSIKONER (Ersätter de enkla rektanglarna!)
    // ========================================================================
    _drawDetailedItemIcon(ctx, iconType, cx, cy) {
        ctx.save();
        switch (iconType) {
            case 'key_brass':
                // Detaljerad mässingsbricka med nyckelring och tandad SAAB-nyckel!
                ctx.fillStyle = '#c88a28';
                ctx.strokeStyle = '#ffea88';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(cx - 32, cy - 12, 34, 22, 5) : ctx.rect(cx - 32, cy - 12, 34, 22);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#221505';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('J35X', cx - 15, cy + 3);
                // Nyckelring + Tandat nyckelblad
                ctx.strokeStyle = '#e6c229';
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.arc(cx + 6, cy, 6, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(cx + 11, cy - 3, 22, 5);
                ctx.fillRect(cx + 22, cy + 2, 4, 5);
                ctx.fillRect(cx + 28, cy + 2, 4, 7);
                break;

            case 'sandwich_messmor':
                // Skogaholmslimpa med rundad skorpa och krämigt messmör + röd/gul tub!
                ctx.fillStyle = '#7a4216';
                ctx.beginPath();
                ctx.arc(cx - 4, cy + 2, 18, Math.PI, 0);
                ctx.lineTo(cx + 14, cy + 14);
                ctx.lineTo(cx - 22, cy + 14);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#d99b52';
                ctx.fillRect(cx - 19, cy - 2, 30, 13);
                // Messmörslager med knivspår
                ctx.fillStyle = '#c47d2b';
                ctx.fillRect(cx - 17, cy - 6, 26, 7);
                break;

            case 'atlas_1954':
                // Inbunden Skolatlas med guldtryck, jordglob och Afrika-kontinent!
                ctx.fillStyle = '#1d4e89';
                ctx.fillRect(cx - 20, cy - 16, 40, 32);
                ctx.fillStyle = '#8c221b';
                ctx.fillRect(cx - 20, cy - 16, 7, 32);
                ctx.fillStyle = '#5da865';
                ctx.beginPath(); ctx.arc(cx + 3, cy, 11, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                break;

            case 'report_card':
                // Vårterminsbetyg med rött sigill och Ba+ i snirklig skrift
                ctx.fillStyle = '#f7eed7';
                ctx.fillRect(cx - 18, cy - 16, 36, 32);
                ctx.strokeStyle = '#8c7a5b';
                ctx.strokeRect(cx - 15, cy - 13, 30, 26);
                ctx.fillStyle = '#b52222';
                ctx.font = 'italic bold 14px serif';
                ctx.textAlign = 'center';
                ctx.fillText('Ba+', cx, cy + 4);
                break;

            case 'bottle_pilsner':
                // Brun 60-tals pilsnerflaska med guldetikett och kapsyl
                ctx.fillStyle = '#5c2e0e';
                ctx.beginPath();
                ctx.moveTo(cx - 9, cy + 16);
                ctx.lineTo(cx - 9, cy - 2);
                ctx.lineTo(cx - 4, cy - 10);
                ctx.lineTo(cx - 4, cy - 18);
                ctx.lineTo(cx + 4, cy - 18);
                ctx.lineTo(cx + 4, cy - 10);
                ctx.lineTo(cx + 9, cy - 2);
                ctx.lineTo(cx + 9, cy + 16);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#f2d98c';
                ctx.fillRect(cx - 7, cy + 1, 14, 10);
                ctx.fillStyle = '#c91e1e';
                ctx.fillRect(cx - 5, cy - 19, 10, 3);
                break;

            case 'clay_heart':
                // Skevt handknådat lerhjärta med glans och inristat "L"
                ctx.fillStyle = '#b82424';
                ctx.beginPath();
                ctx.arc(cx - 8, cy - 5, 10, 0, Math.PI * 2);
                ctx.arc(cx + 8, cy - 4, 9, 0, Math.PI * 2);
                ctx.moveTo(cx - 17, cy - 2);
                ctx.lineTo(cx + 1, cy + 16);
                ctx.lineTo(cx + 16, cy - 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.28)';
                ctx.beginPath(); ctx.arc(cx - 10, cy - 8, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f5d6b8';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('L', cx + 1, cy + 6);
                break;

            case 'film_roll':
                // 35mm metallkassett med perforerad filmremsa som sticker ut!
                ctx.fillStyle = '#22262a';
                ctx.fillRect(cx - 8, cy - 8, 28, 16);
                ctx.fillStyle = '#e6ded0';
                for (let hx = cx - 4; hx < cx + 18; hx += 5) {
                    ctx.fillRect(hx, cy - 7, 3, 2);
                    ctx.fillRect(hx, cy + 5, 3, 2);
                }
                ctx.fillStyle = '#d99b26';
                ctx.fillRect(cx - 20, cy - 13, 16, 26);
                ctx.fillStyle = '#444b52';
                ctx.fillRect(cx - 16, cy - 16, 8, 3);
                break;

            case 'photo_bulten':
                // Nyframkallat svartvitt foto med vit kant & Bulten i förkläde!
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(cx - 20, cy - 16, 40, 32);
                ctx.fillStyle = '#2b3036';
                ctx.fillRect(cx - 17, cy - 13, 34, 26);
                ctx.fillStyle = '#dcdcdc';
                ctx.beginPath(); ctx.arc(cx, cy - 4, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f28585'; // Blommigt förkläde!
                ctx.fillRect(cx - 7, cy + 1, 14, 10);
                break;

            default:
                ctx.fillStyle = '#d4af37';
                ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
                break;
        }
        ctx.restore();
    },

    _drawDialogueChoices(ctx, tree) {
        this.dialogueBoxes = [];
        const options = tree.options || [];
        const startX = 36;
        const startY = 820;
        const rowH = 44;

        options.forEach((opt, idx) => {
            const y = startY + idx * rowH;
            const isHovered = this.hoveredDialogueIdx === idx;

            const box = { idx, x: startX, y, w: 1208, h: 38, option: opt };
            this.dialogueBoxes.push(box);

            ctx.fillStyle = isHovered ? '#3d2814' : '#1c130b';
            ctx.strokeStyle = isHovered ? '#ffdd77' : '#6e4e26';
            ctx.lineWidth = 1.5;
            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeRect(box.x, box.y, box.w, box.h);

            ctx.font = 'bold 17px "Courier Prime", monospace';
            ctx.fillStyle = isHovered ? '#ffea99' : '#f2e8d5';
            ctx.textAlign = 'left';
            ctx.fillText(`▸ ${opt.text}`, box.x + 16, box.y + 25);
        });
    },

    handleMouseMove(x, y) {
        const gs = window.GameState;
        this.hoveredVerb = null;
        this.hoveredInvSlot = -1;
        this.hoveredDialogueIdx = -1;

        if (y < 760) return false;

        if (gs.interaction.inDialogue) {
            for (const b of this.dialogueBoxes) {
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                    this.hoveredDialogueIdx = b.idx;
                    break;
                }
            }
            return true;
        }

        for (const b of this.verbBoxes) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this.hoveredVerb = b.verb;
                break;
            }
        }

        for (const box of this.invBoxes) {
            if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
                this.hoveredInvSlot = box.slot;
                const itemId = gs.inventory[box.slot];
                if (itemId && gs.itemCatalog[itemId]) {
                    gs.interaction.hoveredObject = {
                        id: itemId,
                        name: gs.itemCatalog[itemId].name,
                        isInventoryItem: true
                    };
                    gs.updateSentenceBar();
                }
                break;
            }
        }

        return true;
    },

    handleMouseClick(x, y) {
        const gs = window.GameState;

        if (gs.subtitle.active && y < 760) {
            if (window.VoiceEngine && window.VoiceEngine.subtitleTimeout) {
                window.VoiceEngine._finishSpeech('lasse', null);
                return true;
            }
        }

        if (y < 760) return false;

        if (gs.interaction.inDialogue) {
            for (const b of this.dialogueBoxes) {
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                    if (window.AudioEngine) window.AudioEngine.playSFX('ui_click');
                    if (typeof b.option.onSelect === 'function') {
                        b.option.onSelect();
                    }
                    return true;
                }
            }
            return true;
        }

        for (const b of this.verbBoxes) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                if (window.AudioEngine) window.AudioEngine.playSFX('ui_click');
                gs.interaction.currentVerb = b.verb;
                if (b.verb !== 'ANVÄND') {
                    gs.interaction.selectedItem = null;
                }
                gs.updateSentenceBar();
                return true;
            }
        }

        for (const box of this.invBoxes) {
            if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
                const itemId = gs.inventory[box.slot];
                if (!itemId) return true;

                if (window.AudioEngine) window.AudioEngine.playSFX('ui_click');
                const item = gs.itemCatalog[itemId];

                if (gs.interaction.currentVerb === 'TITTA PÅ') {
                    window.VoiceEngine.speak('lasse', item.description);
                    gs.resetVerb();
                } else if (gs.interaction.currentVerb === 'ANVÄND' && gs.interaction.selectedItem && gs.interaction.selectedItem !== itemId) {
                    if (window.Engine && window.Engine.handleItemCombination) {
                        window.Engine.handleItemCombination(gs.interaction.selectedItem, itemId);
                    }
                    gs.resetVerb();
                } else {
                    gs.interaction.currentVerb = 'ANVÄND';
                    gs.interaction.selectedItem = itemId;
                    gs.updateSentenceBar();
                }
                return true;
            }
        }

        return true;
    },

    _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let current = '';

        words.forEach(w => {
            const test = current ? `${current} ${w}` : w;
            if (ctx.measureText(test).width > maxWidth) {
                lines.push(current);
                current = w;
            } else {
                current = test;
            }
        });
        if (current) lines.push(current);
        return lines;
    }
};