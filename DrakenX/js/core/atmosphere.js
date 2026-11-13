/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - ATMOSFÄR & RUMSDJUP (atmosphere.js)
 *
 * Lägger till det som får ett rum att kännas som ett RUM i stället för
 * kulisser:
 *   - Golvmaterial med struktur (betong, kakel, heltäckningsmatta, parkett)
 *   - Mjuk "ambient occlusion" där vägg möter golv och tak
 *   - Kontaktskuggor under alla möbler (läggs på automatiskt efter att rummet byggts)
 *   - Dammkorn som svävar i lampljuset
 *
 * Funktionerna läggs på window.Renderer. buildStandardRoom() i renderer.js
 * anropar _addRoomShading() och Engine.loadScene() anropar finalizeScene().
 * ============================================================================
 */

(function () {
    'use strict';
    const R = window.Renderer;
    if (!R) return;

    // ------------------------------------------------------------------
    // Texturer
    // ------------------------------------------------------------------
    function canvasTex(canvas, rx, ry, srgb = true) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(rx, ry);
        if (srgb && THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
        if (R.renderer && R.renderer.capabilities) tex.anisotropy = R.renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    function rng(seed) {
        let s = seed >>> 0;
        return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }

    R._ensureExtraTextures = function () {
        const T = this.proceduralTextures;
        if (T.concrete) return;

        // --- Betongplattor (ljus bas så att golvfärgen tintar den) ---
        {
            const c = document.createElement('canvas');
            c.width = c.height = 512;
            const g = c.getContext('2d');
            const rand = rng(11);
            g.fillStyle = '#e4e3df';
            g.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 9000; i++) {
                const v = rand() < 0.5 ? 0 : 255;
                g.fillStyle = `rgba(${v},${v},${v},${0.035 + rand() * 0.05})`;
                g.fillRect(rand() * 512, rand() * 512, 1 + rand() * 2, 1 + rand() * 2);
            }
            for (let i = 0; i < 7; i++) {
                const x = rand() * 512, y = rand() * 512, r = 40 + rand() * 90;
                const gr = g.createRadialGradient(x, y, 2, x, y, r);
                gr.addColorStop(0, 'rgba(60,55,50,0.16)');
                gr.addColorStop(1, 'rgba(60,55,50,0)');
                g.fillStyle = gr;
                g.fillRect(x - r, y - r, r * 2, r * 2);
            }
            g.strokeStyle = 'rgba(70,68,64,0.75)';
            g.lineWidth = 3;
            g.strokeRect(1.5, 1.5, 509, 509);
            g.strokeStyle = 'rgba(255,255,255,0.18)';
            g.lineWidth = 1.5;
            g.strokeRect(5, 5, 502, 502);
            T.concrete = canvasTex(c, 7, 3);
        }

        // --- Badrumskakel: 2x2 rutor, ljus/mörk, med fog ---
        {
            const c = document.createElement('canvas');
            c.width = c.height = 256;
            const g = c.getContext('2d');
            const cols = ['#dfe6e0', '#7d9892', '#7d9892', '#dfe6e0'];
            for (let i = 0; i < 4; i++) {
                const x = (i % 2) * 128, y = Math.floor(i / 2) * 128;
                const gr = g.createLinearGradient(x, y, x + 128, y + 128);
                gr.addColorStop(0, cols[i]);
                gr.addColorStop(1, 'rgba(0,0,0,0.12)');
                g.fillStyle = cols[i];
                g.fillRect(x, y, 128, 128);
                g.fillStyle = gr;
                g.globalAlpha = 0.25;
                g.fillRect(x, y, 128, 128);
                g.globalAlpha = 1;
            }
            g.strokeStyle = '#f1f3ee';
            g.lineWidth = 4;
            for (let i = 0; i <= 256; i += 128) {
                g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
                g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
            }
            T.tiles = canvasTex(c, 56, 24);
            T.tilesWall = canvasTex(c, 52, 5);
        }

        // --- Heltäckningsmatta ---
        {
            const c = document.createElement('canvas');
            c.width = c.height = 256;
            const g = c.getContext('2d');
            const rand = rng(5);
            g.fillStyle = '#dcdcd4';
            g.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 14000; i++) {
                const v = rand() < 0.5 ? 0 : 255;
                g.fillStyle = `rgba(${v},${v},${v},${0.05 + rand() * 0.08})`;
                g.fillRect(rand() * 256, rand() * 256, 1.6, 1.6);
            }
            T.carpet = canvasTex(c, 12, 5);
        }

        // --- Mjuka gradienter för väggskuggor ---
        const grad = (flip) => {
            const c = document.createElement('canvas');
            c.width = 4; c.height = 128;
            const g = c.getContext('2d');
            const gr = g.createLinearGradient(0, 0, 0, 128);
            gr.addColorStop(0, flip ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)');
            gr.addColorStop(1, flip ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.55)');
            g.fillStyle = gr;
            g.fillRect(0, 0, 4, 128);
            const t = new THREE.CanvasTexture(c);
            return t;
        };
        T.aoFromBottom = grad(false);   // mörkast längst ner
        T.aoFromTop = grad(true);       // mörkast högst upp

        // --- Rund mjuk skugga (kontaktskugga) ---
        {
            const c = document.createElement('canvas');
            c.width = c.height = 128;
            const g = c.getContext('2d');
            const gr = g.createRadialGradient(64, 64, 6, 64, 64, 62);
            gr.addColorStop(0, 'rgba(0,0,0,0.9)');
            gr.addColorStop(0.5, 'rgba(0,0,0,0.5)');
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr;
            g.fillRect(0, 0, 128, 128);
            T.softShadow = new THREE.CanvasTexture(c);
        }

        // --- Dammkorn ---
        {
            const c = document.createElement('canvas');
            c.width = c.height = 32;
            const g = c.getContext('2d');
            const gr = g.createRadialGradient(16, 16, 0, 16, 16, 15);
            gr.addColorStop(0, 'rgba(255,240,210,1)');
            gr.addColorStop(1, 'rgba(255,240,210,0)');
            g.fillStyle = gr;
            g.fillRect(0, 0, 32, 32);
            T.dust = new THREE.CanvasTexture(c);
        }
    };

    // ------------------------------------------------------------------
    // Golv + väggskuggning (anropas från buildStandardRoom)
    // ------------------------------------------------------------------
    R._floorMaterial = function (options) {
        this._ensureExtraTextures();
        const T = this.proceduralTextures;
        const type = options.floorType || (options.woodFloor ? 'wood' : 'concrete');
        let mat;
        if (type === 'wood') {
            mat = new THREE.MeshStandardMaterial({
                color: 0xffffff, map: T.wood, bumpMap: T.wood, bumpScale: 0.012, roughness: 0.58, metalness: 0.02
            });
        } else if (type === 'tiles') {
            mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: T.tiles, roughness: 0.28, metalness: 0.05 });
        } else if (type === 'carpet') {
            mat = new THREE.MeshStandardMaterial({ color: options.floorColor || 0x727a78, map: T.carpet, bumpMap: T.carpet, bumpScale: 0.01, roughness: 0.97 });
        } else {
            mat = new THREE.MeshStandardMaterial({ color: options.floorColor || 0x555555, map: T.concrete, bumpMap: T.concrete, bumpScale: 0.01, roughness: 0.82, metalness: 0.02 });
        }
        return mat;
    };

    R._addRoomShading = function (options) {
        this._ensureExtraTextures();
        const T = this.proceduralTextures;
        const mk = (map, w, h) => {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(w, h),
                new THREE.MeshBasicMaterial({
                    map, transparent: true, depthWrite: false, fog: false,
                    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
                })
            );
            m.userData.noContact = true;
            m.raycast = () => {};
            m.renderOrder = 2;
            return m;
        };

        // Mörkare längs golvlisten
        const low = mk(T.aoFromBottom, 26, 1.5);
        low.position.set(0, 0.75, -3.43);
        this.roomGroup.add(low);

        // Mörkare mot taket
        const high = mk(T.aoFromTop, 26, 1.7);
        high.position.set(0, 4.2, -3.43);
        this.roomGroup.add(high);

        // Mjuk skugga på golvet närmast väggen
        const floorStrip = mk(T.aoFromBottom, 26, 1.4);
        floorStrip.rotation.x = -Math.PI / 2;
        floorStrip.position.set(0, 0.006, -2.8);
        this.roomGroup.add(floorStrip);
    };

    // ------------------------------------------------------------------
    // Efter att ett rum byggts: kontaktskuggor + dammkorn
    // ------------------------------------------------------------------
    R.finalizeScene = function (sceneId) {
        if (!this.roomGroup) return;
        this._ensureExtraTextures();
        const T = this.proceduralTextures;
        const box = new THREE.Box3();
        const size = new THREE.Vector3();
        const ctr = new THREE.Vector3();
        const shadows = [];

        this.roomGroup.children.forEach(obj => {
            if (obj.isLight || obj.userData.noContact || obj.userData.contactDone) return;
            box.setFromObject(obj);
            if (box.isEmpty()) return;
            box.getSize(size);
            box.getCenter(ctr);
            if (size.x > 9 || size.z > 6 || size.y < 0.2) return;   // väggar, golv, långa band
            if (box.min.y > 0.45 || box.max.y < 0.3) return;        // måste stå på golvet
            if (!isFinite(size.x + size.z)) return;
            const h = Math.min(1, size.y / 0.9);
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(size.x * 1.3 + 0.25, size.z * 1.3 + 0.25),
                new THREE.MeshBasicMaterial({
                    map: T.softShadow, transparent: true, depthWrite: false, fog: false,
                    opacity: 0.35 + 0.3 * h,
                    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
                })
            );
            m.rotation.x = -Math.PI / 2;
            m.position.set(ctr.x, 0.007, ctr.z);
            m.userData.noContact = true;
            m.raycast = () => {};
            m.renderOrder = 1;
            obj.userData.contactDone = true;
            shadows.push(m);
        });
        shadows.forEach(m => this.roomGroup.add(m));

        // Dammkorn i inomhusrum
        if (this.dust) { this.dust.parent && this.dust.parent.remove(this.dust); this.dust = null; }
        const indoor = this.dustEnabled !== false && sceneId && sceneId !== 'scene2_gate' && sceneId !== 'scene0_intro';
        if (indoor) {
            const n = 90;
            const pos = new Float32Array(n * 3);
            const seed = rng(77);
            this._dustBase = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) {
                this._dustBase[i * 3] = (seed() - 0.5) * 14;
                this._dustBase[i * 3 + 1] = 0.4 + seed() * 3.4;
                this._dustBase[i * 3 + 2] = -3 + seed() * 6;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            this.dust = new THREE.Points(geo, new THREE.PointsMaterial({
                map: T.dust, size: 0.07, transparent: true, opacity: 0.55,
                depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false
            }));
            this.dust.frustumCulled = false;
            this.dust.userData.noContact = true;
            this.fxGroup.add(this.dust);
            this.updateAtmosphere(0);
        }
    };

    R.updateAtmosphere = function (t) {
        if (!this.dust || !this._dustBase) return;
        const p = this.dust.geometry.attributes.position;
        const b = this._dustBase;
        for (let i = 0; i < p.count; i++) {
            const o = i * 3;
            p.array[o] = b[o] + Math.sin(t * 0.17 + i * 1.7) * 0.5;
            p.array[o + 1] = b[o + 1] + Math.sin(t * 0.23 + i * 0.9) * 0.22 + ((t * 0.02 * (1 + (i % 5) * 0.2)) % 3.4) * 0.0;
            p.array[o + 2] = b[o + 2] + Math.cos(t * 0.13 + i * 2.3) * 0.4;
        }
        p.needsUpdate = true;
    };
})();
