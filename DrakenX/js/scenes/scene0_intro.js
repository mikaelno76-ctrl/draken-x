/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - PROLOG: KATANGA & NDOLA (scene0_intro.js)
 * Filmisk 3D-introduktion i två akter:
 *   Akt 1: Det roströda dagbrottet i Katanga, koboltådror & legosoldater.
 *   Akt 2: Natten över Ndola där planet "Albertina" störtar i djungeln.
 *   Övergår därefter automatiskt till Pojkrummet i Linköping (scene1_boyroom).
 * ============================================================================
 */

window.Engine.registerScene('scene0_intro', {
    phase: 1,
    timer: 0,
    katangaGroup: null,
    ndolaGroup: null,
    albertinaPlane: null,
    fireLight: null,
    cigGlows: [],

    init() {
        const R = window.Renderer;
        const gs = window.GameState;
        if (!R || !gs) return;

        this.phase = 1;
        this.timer = 0;
        this.cigGlows = [];

        R.clearScene(0x8a4220, 0.012, { exposure: 1.35, bloom: 0.55, bloomThreshold: 0.95, saturation: 1.12, vignette: 0.38, shadowTint: [1.04, 0.92, 0.88], highTint: [1.1, 1.0, 0.82] });
        gs.webgl.cameraMode = 'cutscene_3d';

        this.katangaGroup = new THREE.Group();
        this.ndolaGroup = new THREE.Group();
        this.ndolaGroup.visible = false;

        R.roomGroup.add(this.katangaGroup, this.ndolaGroup);

        this._buildKatangaOpenPitMine(R);
        this._buildNdolaNightJungle(R);

        const skipPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 20),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        skipPlane.position.set(0, 2, 2);
        R.roomGroup.add(skipPlane);
        R.registerInteractive(skipPlane, {
            id: 'skip_intro_click',
            name: 'Prolog: Katanga & Ndola 1961 (Klicka för att hoppa till Linköping)',
            walkX: 640,
            walkY: 600
        });
    },

    onEnter() {
        const V = window.VoiceEngine;
        const A = window.AudioEngine;
        const R = window.Renderer;

        V.speakSequence([
            {
                speaker: 'radio',
                text: 'Året var 1961. Världen trodde i sin oskuldsfulla naivitet att kolonialismens mörka epok äntligen hade packat ihop sina tält.'
            },
            {
                speaker: 'radio',
                text: 'Men nere i Katangas skoningslösa, roströda dagbrott vägrade den nakna girigheten att släppa taget om kobolten och uranet. Och de som stod upp för frihet och rättvisa fick plikta med sina liv.'
            }
        ], () => {
            this._switchToNdolaNight(R, V, A);
        });
    },

    _switchToNdolaNight(R, V, A) {
        this.phase = 2;
        this.timer = 0;

        if (this.katangaGroup) this.katangaGroup.visible = false;
        if (this.ndolaGroup) this.ndolaGroup.visible = true;

        if (R && R.scene) {
            R.scene.fog = new THREE.FogExp2(0x0a1220, 0.022);
            R.scene.background = new THREE.Color(0x070b12);
            if (window.PostFX) window.PostFX.setGrade({ exposure: 2.0, bloom: 0.7, bloomThreshold: 0.85, saturation: 1.05, vignette: 0.45, shadowTint: [0.88, 0.97, 1.12], highTint: [1.1, 0.98, 0.85] });
        }

        if (A) A.playSFX('aga_radio_tune');

        V.speakSequence([
            {
                speaker: 'radio',
                text: 'Natten till den artonde september närmade sig FN:s generalsekreterare Dag Hammarskjölds plan Albertina gränsstaden Ndola för att mäkla fred.'
            },
            {
                speaker: 'radio',
                text: 'Men i mörkret väntade legosoldaternas kulor. Medan vraket brann i djungeln tvekade stormakterna i New York... helt ovetande om att två sextonåriga grabbar i en villaförort i Linköping snart skulle ta saken i egna händer.'
            }
        ], () => {
            window.Engine.loadScene('scene1_boyroom');
        });
    },

    update(dt, timestamp) {
        const R = window.Renderer;
        if (!R || !R.camera) return;
        const t = timestamp * 0.001;
        this.timer += dt;

        if (this.phase === 1) {
            R.camera.position.set(
                Math.sin(this.timer * 0.18) * 2.2,
                2.6 + Math.cos(this.timer * 0.15) * 0.3,
                7.8 - this.timer * 0.12
            );
            R.camera.lookAt(0, 0.8, -2.5);

            this.cigGlows.forEach((cig, i) => {
                cig.scale.setScalar(0.8 + Math.sin(t * 5 + i * 2) * 0.35);
            });
            if (this.pitWheel) this.pitWheel.rotation.z += dt * 0.6;
            this._drift(this.dust, dt, 0.35);
        } else if (this.phase === 2) {
            R.camera.position.set(0, 2.1, 7.5);
            R.camera.lookAt(0, 1.4, -3.0);

            if (this.albertinaPlane) {
                this.albertinaPlane.position.x += dt * 1.35;
                this.albertinaPlane.position.y -= dt * 0.42;
                this.albertinaPlane.rotation.z = -0.22 + Math.sin(t * 14) * 0.04;
            }
            if (this.fireLight) {
                this.fireLight.intensity = 3.0 + Math.sin(t * 28) * 1.3 + Math.sin(t * 11) * 0.6;
            }
            (this.flames || []).forEach(f => {
                const k = 0.8 + Math.sin(t * 9 + f.userData.seed) * 0.35;
                f.scale.set(2.2 * k, 2.6 * k, 1);
                f.position.x = f.userData.bx + Math.sin(t * 3 + f.userData.seed) * 0.12;
                f.position.y = 0.5 + Math.abs(Math.sin(t * 5 + f.userData.seed)) * 0.5;
            });
            this._drift(this.smoke, dt, 1);
            this._drift(this.embers, dt, 1.6);
            this._drift(this.mist, dt, 0.02);
        }
    },

    // ---------- Hjälpare ----------
    _canvasTex(w, h, draw, repeat) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        draw(c.getContext('2d'), w, h);
        const tex = new THREE.CanvasTexture(c);
        if (repeat) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeat[0], repeat[1]);
        }
        return tex;
    },

    _skyDome(stops, extra) {
        const tex = this._canvasTex(16, 256, (g, w, h) => {
            const grad = g.createLinearGradient(0, 0, 0, h);
            stops.forEach(([p, col]) => grad.addColorStop(p, col));
            g.fillStyle = grad;
            g.fillRect(0, 0, w, h);
        });
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(60, 24, 16),
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
        );
        dome.position.y = -4;
        dome.renderOrder = -10;
        return dome;
    },

    _glowSprite(color, size) {
        const tex = this._canvasTex(128, 128, (g, w, h) => {
            const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = grad;
            g.fillRect(0, 0, w, h);
        });
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
        }));
        spr.scale.set(size, size, 1);
        return spr;
    },

    _particles(count, spread, color, size, opacity, sy) {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * spread[0];
            pos[i * 3 + 1] = Math.random() * spread[1];
            pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        if (!this._dotTex) {
            this._dotTex = this._canvasTex(64, 64, (c, w, h) => {
                const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
                gr.addColorStop(0, 'rgba(255,255,255,1)');
                gr.addColorStop(0.5, 'rgba(255,255,255,0.5)');
                gr.addColorStop(1, 'rgba(255,255,255,0)');
                c.fillStyle = gr; c.fillRect(0, 0, w, h);
            });
        }
        const pts = new THREE.Points(g, new THREE.PointsMaterial({
            color, size, map: this._dotTex, transparent: true, opacity, depthWrite: false, sizeAttenuation: true
        }));
        pts.userData.rise = sy || 0;
        pts.userData.h = spread[1];
        return pts;
    },

    _rockTexture() {
        return this._canvasTex(256, 256, (g, w, h) => {
            g.fillStyle = '#8a3a1c';
            g.fillRect(0, 0, w, h);
            for (let i = 0; i < 1400; i++) {
                const l = 25 + Math.random() * 40;
                g.fillStyle = 'hsla(' + (10 + Math.random() * 12) + ',60%,' + l + '%,0.35)';
                g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 10, 1 + Math.random() * 3);
            }
            g.strokeStyle = 'rgba(40,12,5,0.45)';
            g.lineWidth = 2;
            for (let i = 0; i < 22; i++) {
                g.beginPath();
                const y = Math.random() * h;
                g.moveTo(0, y);
                for (let x = 0; x < w; x += 32) g.lineTo(x, y + (Math.random() - 0.5) * 14);
                g.stroke();
            }
        }, [6, 1]);
    },

    _drift(pts, dt, speed) {
        if (!pts) return;
        const a = pts.geometry.attributes.position;
        const h = pts.userData.h || 4;
        for (let i = 0; i < a.count; i++) {
            let y = a.getY(i) + dt * speed * (0.5 + (i % 5) * 0.2);
            if (y > h) y = 0;
            a.setY(i, y);
            a.setX(i, a.getX(i) + Math.sin(y * 2 + i) * dt * 0.05);
        }
        a.needsUpdate = true;
    },

    _buildKatangaOpenPitMine(R) {
        const G = this.katangaGroup;
        G.add(this._skyDome([[0, '#5a2210'], [0.45, '#c4602a'], [0.62, '#f2a04a'], [0.78, '#e6783a'], [1, '#3a1608']]));

        const sun = new THREE.DirectionalLight(0xffa860, 2.1);
        sun.position.set(-7, 8, 5);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
        sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -6;
        sun.shadow.camera.far = 40;
        G.add(sun);
        G.add(new THREE.HemisphereLight(0xffb27a, 0x4a1a0c, 0.55));

        const sunDisc = this._glowSprite(0xffc070, 16);
        sunDisc.position.set(-9, 5.5, -26);
        G.add(sunDisc);
        const sunCore = this._glowSprite(0xfff0c8, 5);
        sunCore.position.set(-9, 5.5, -25.5);
        G.add(sunCore);

        const rockTex = this._rockTexture();
        const rustMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: rockTex, roughness: 0.95, side: THREE.DoubleSide });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0xb06848, map: rockTex, roughness: 0.97, side: THREE.DoubleSide });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x9a4a28, map: rockTex, roughness: 1 });

        // Dagbrottet: trappstegsterrasser (kuvert + platt kant) bakom spelplanen
        const cx = 0, cz = -9;
        const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40, 0, Math.PI), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(cx, -2.6, cz);
        floor.receiveShadow = true;
        G.add(floor);
        for (let k = 0; k < 7; k++) {
            const rIn = 3.2 + k * 2.3;
            const rOut = rIn + 1.5;
            const y = -2.6 + k * 1.05;
            const wall = new THREE.Mesh(new THREE.CylinderGeometry(rIn + 0.15, rIn, 1.05, 48, 1, true, Math.PI / 2, Math.PI), k % 2 ? darkMat : rustMat);
            wall.position.set(cx, y + 0.52, cz);
            wall.receiveShadow = true;
            G.add(wall);
            const ring = new THREE.Mesh(new THREE.RingGeometry(rIn + 0.15, rOut, 48, 1, 0, Math.PI), floorMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(cx, y + 1.05, cz);
            ring.receiveShadow = true;
            G.add(ring);
        }

        // Marken framför (platå där legosoldaterna står)
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), floorMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.2, 3);
        ground.receiveShadow = true;
        G.add(ground);

        // Koboltådror: blå kristaller som glimmar i bergväggen
        const cobaltMat = new THREE.MeshStandardMaterial({ color: 0x2f7ae0, metalness: 0.6, roughness: 0.2, emissive: 0x0a3a9a, emissiveIntensity: 0.9 });
        for (let c = 0; c < 26; c++) {
            const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.1 + Math.random() * 0.26, 0), cobaltMat);
            const ang = -0.9 + Math.random() * 1.8 - Math.PI / 2;
            const rad = 6.2 + Math.floor(Math.random() * 3) * 2.3;
            crystal.position.set(cx + Math.cos(ang) * rad, -1.2 + Math.random() * 3.2, cz + Math.sin(ang) * rad + 0.4);
            crystal.scale.y = 1.6;
            crystal.rotation.set(Math.random(), Math.random(), Math.random());
            G.add(crystal);
        }
        const veinLight = new THREE.PointLight(0x3a86ff, 1.2, 14);
        veinLight.position.set(1.5, 1.6, -3.5);
        G.add(veinLight);

        // Pumphus & schaktstativ i trä och stål
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2616, roughness: 0.85 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x2a2724, roughness: 0.5, metalness: 0.6 });
        const frame = new THREE.Group();
        [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.6, 0.12), woodMat);
            leg.position.set(x * (1 - 0.0), 2.3, z);
            leg.rotation.z = x > 0 ? 0.08 : -0.08;
            leg.castShadow = true;
            frame.add(leg);
        });
        for (let h = 0.8; h < 4.2; h += 1.1) {
            const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.07, 0.07), woodMat);
            b1.position.set(0, h, 0.7); frame.add(b1);
            const b2 = b1.clone(); b2.position.z = -0.7; frame.add(b2);
            const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.06), woodMat);
            d.position.set(0, h + 0.5, 0.7); d.rotation.z = 0.78; frame.add(d);
        }
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 24), steelMat);
        wheel.position.set(0, 4.7, 0);
        frame.add(wheel);
        this.pitWheel = wheel;
        frame.position.set(-4.6, -0.2, -4.2);
        G.add(frame);

        // Lastbil (siluett) och malmhögar
        const orePile = new THREE.MeshStandardMaterial({ color: 0x5a2a18, roughness: 1, flatShading: true });
        [[4.8, -3.8, 1.5], [6.5, -2.6, 1.0], [-7.5, -2.8, 1.2]].forEach(([x, z, r]) => {
            const pile = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), orePile);
            pile.scale.y = 0.55;
            pile.position.set(x, -0.2 + r * 0.2, z);
            pile.castShadow = true; pile.receiveShadow = true;
            G.add(pile);
        });

        // Damm & värmedis
        this.dust = this._particles(260, [26, 5, 14], 0xd89a62, 0.09, 0.4, 0.05);
        this.dust.position.set(0, -0.2, -1);
        G.add(this.dust);

        // Legosoldater: riktiga figurer med basker, solglasögon, cigaretter och gevär
        const mk = (id, x, z, yaw, style) => {
            const m = R.createCharacterMesh(id, style);
            m.group.position.set(x, -0.2, z);
            m.group.rotation.y = yaw;
            m.group.scale.setScalar(1.25);
            G.add(m.group);
            if (m.cigTip) this.cigGlows.push(m.cigTip);
            return m;
        };
        mk('merc_a', -1.9, 1.6, 0.45, { jacketColor: 0x5c6040, shirtColor: 0x7a7c5a, pantsColor: 0x4a4d34, hairColor: 0x1a1512, skinColor: 0x6b4026, beretColor: 0x7a1f18, shoulderScale: 1.12 });
        mk('merc_b', 1.9, 1.0, -0.5, { jacketColor: 0x4f5238, shirtColor: 0x6a6c4c, pantsColor: 0x3f422d, hairColor: 0x7a6a50, skinColor: 0xe6b08c, beretColor: 0x1d2a4a, shoulderScale: 1.2, heightScale: 1.04 });
    },

    _buildNdolaNightJungle(R) {
        const G = this.ndolaGroup;
        G.add(this._skyDome([[0, '#02040a'], [0.5, '#0b1630'], [0.72, '#1c2f52'], [1, '#050810']]));

        // Stjärnor
        const stars = this._particles(500, [90, 40, 20], 0xdfe8ff, 0.18, 0.9, 0);
        stars.position.set(0, 8, -40);
        G.add(stars);

        // Måne
        const moon = this._glowSprite(0x9ab8ff, 14);
        moon.position.set(8, 13, -35);
        G.add(moon);
        const moonCore = this._glowSprite(0xf4f8ff, 3.4);
        moonCore.position.set(8, 13, -34.5);
        G.add(moonCore);

        const moonLight = new THREE.DirectionalLight(0x6f8fd8, 1.0);
        moonLight.position.set(6, 12, 3);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(1024, 1024);
        moonLight.shadow.camera.left = -12; moonLight.shadow.camera.right = 12;
        moonLight.shadow.camera.top = 10; moonLight.shadow.camera.bottom = -6;
        G.add(moonLight);
        G.add(new THREE.HemisphereLight(0x3a4f86, 0x0a0f08, 0.5));

        const groundTex = this._canvasTex(256, 256, (g, w, h) => {
            g.fillStyle = '#1a2414';
            g.fillRect(0, 0, w, h);
            for (let i = 0; i < 1800; i++) {
                g.fillStyle = 'hsla(' + (80 + Math.random() * 60) + ',35%,' + (8 + Math.random() * 14) + '%,0.6)';
                g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 2 + Math.random() * 9);
            }
        }, [10, 5]);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.3, -6);
        ground.receiveShadow = true;
        G.add(ground);

        // Djungel: flera lager träd med stam, flera krondomer och hängande skuggor
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x0e1218, roughness: 1 });
        const leafMats = [0x0f2414, 0x0b1c10, 0x14301a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true }));
        const tree = (x, z, s) => {
            const t = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.26 * s, 4.2 * s, 7), trunkMat);
            trunk.position.y = 2.1 * s;
            trunk.castShadow = true;
            t.add(trunk);
            for (let i = 0; i < 5; i++) {
                const lobe = new THREE.Mesh(new THREE.IcosahedronGeometry((0.9 + Math.random() * 0.7) * s, 1), leafMats[i % 3]);
                lobe.scale.y = 0.6;
                lobe.position.set((Math.random() - 0.5) * 2.2 * s, (4.0 + Math.random() * 0.9) * s, (Math.random() - 0.5) * 1.6 * s);
                lobe.castShadow = true;
                t.add(lobe);
            }
            t.position.set(x, -0.3, z);
            G.add(t);
        };
        for (let i = -14; i <= 14; i += 2.2) tree(i + Math.random(), -9 - Math.random() * 2, 1.5 + Math.random() * 0.5);
        for (let i = -12; i <= 12; i += 3) tree(i + Math.random() * 1.5, -5.5 - Math.random() * 1.5, 1.15 + Math.random() * 0.4);
        tree(-6.5, -1.5, 1.0); tree(6.8, -2, 1.1);
        for (let g = 0; g < 70; g++) {
            const blade = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.35 + Math.random() * 0.3, 4), leafMats[g % 3]);
            blade.position.set((Math.random() - 0.5) * 22, -0.1, -2 + Math.random() * 5);
            blade.rotation.z = (Math.random() - 0.5) * 0.4;
            G.add(blade);
        }

        // Markdimma
        const mist = this._particles(160, [28, 1.6, 12], 0x6c82b0, 0.7, 0.07, 0);
        mist.position.set(0, 0, -3);
        G.add(mist);
        this.mist = mist;

        // Eld, glöd, rök
        this.fireLight = new THREE.PointLight(0xff6a1a, 3.2, 20);
        this.fireLight.position.set(2.4, 1.0, -2.6);
        this.fireLight.castShadow = false;
        G.add(this.fireLight);
        this.flames = [];
        for (let f = 0; f < 9; f++) {
            const fl = this._glowSprite(f % 2 ? 0xff7a20 : 0xffb340, 2.2);
            fl.position.set(2.4 + (Math.random() - 0.5) * 1.8, 0.4 + Math.random() * 0.4, -2.6 + (Math.random() - 0.5) * 0.8);
            fl.userData.seed = Math.random() * 10;
            fl.userData.bx = fl.position.x;
            G.add(fl);
            this.flames.push(fl);
        }
        this.smoke = this._particles(120, [1.6, 6, 1.6], 0x2a2c34, 0.5, 0.35, 0.7);
        this.smoke.position.set(2.4, 0.5, -2.6);
        G.add(this.smoke);
        this.embers = this._particles(90, [2.4, 4, 1.8], 0xff9a30, 0.07, 0.9, 1.4);
        this.embers.position.set(2.4, 0.5, -2.6);
        G.add(this.embers);

        // Vraket på marken: brinnande fuselage med trasiga vingar (liggande)
        const hull = new THREE.MeshStandardMaterial({ color: 0xb8bdc4, metalness: 0.75, roughness: 0.35 });
        const scorch = new THREE.MeshStandardMaterial({ color: 0x1a1612, metalness: 0.4, roughness: 0.8 });
        const wreck = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 2.8, 14), hull);
        body.rotation.z = Math.PI / 2 + 0.12;
        body.castShadow = true;
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), scorch);
        nose.position.set(1.45, 0.14, 0);
        const wingA = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 1.9), hull);
        wingA.position.set(0.1, 0.0, 1.1); wingA.rotation.set(0.1, 0.15, -0.1);
        const wingB = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.0), scorch);
        wingB.position.set(0.1, 0.1, -0.6); wingB.rotation.set(0.15, -0.3, 0.2);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.05), hull);
        tail.position.set(-1.4, 0.5, 0); tail.rotation.z = -0.2;
        [body, nose, wingA, wingB, tail].forEach(m => { m.castShadow = true; wreck.add(m); });
        wreck.position.set(2.4, 0.15, -2.6);
        wreck.rotation.y = -0.3;
        G.add(wreck);

        // Själva Albertina på väg ner (animeras)
        this.albertinaPlane = new THREE.Group();
        const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 2.6, 14), hull);
        pb.rotation.z = Math.PI / 2;
        const pw = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 3.0), hull);
        const pt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.05), hull);
        pt.position.set(-1.15, 0.3, 0);
        const pf = this._glowSprite(0xff7a20, 1.6);
        pf.position.set(-0.4, 0.0, 0.6);
        this.albertinaPlane.add(pb, pw, pt, pf);
        this.albertinaPlane.position.set(-5.5, 4.3, -3.2);
        this.albertinaPlane.traverse(o => { if (o.isMesh) o.castShadow = true; });
        G.add(this.albertinaPlane);
    },

    onInteract(hotspotId) {
        if (hotspotId === 'skip_intro_click') {
            window.VoiceEngine.stop();
            window.Engine.loadScene('scene1_boyroom');
            return true;
        }
        return false;
    }
});