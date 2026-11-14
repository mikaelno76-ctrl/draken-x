/**
 * ============================================================================
 * DRAKEN X — SCEN 2: EXTRA MILJÖER (första utkast, utan pussel)
 *   scene2_shell     Shell-macken vid rondellen (natt)
 *   scene2_centrum   Stora Torget i centrala Linköping (natt)
 *   scene2_verkstad  Bultens verkstad (interiör)
 *
 * Alla tre är utkast för miljö och stämning. Hotspots har tittatexter, men
 * inga föremål eller flaggor förändras – de krokar som kan bli pussel står
 * i listan HOOKS längst ner i varje scen.
 * Utgångar: gate <-> shell <-> verkstad, centrum <-> shell, centrum <-> gate.
 * ============================================================================
 */
(function () {
    'use strict';
    const T = THREE;

    // ------------------------------------------------------------------
    // Hjälpare
    // ------------------------------------------------------------------
    const mat = (c, r = 0.7, m = 0.05, extra) =>
        new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra || {}));
    const glow = (c) => new T.MeshBasicMaterial({ color: c, fog: false });
    const px = (worldX) => Math.round(640 + (worldX / 6.8) * 640);

    function put(parent, mesh, x, y, z, shadow = true) {
        mesh.position.set(x, y, z);
        if (shadow) { mesh.castShadow = true; mesh.receiveShadow = true; }
        parent.add(mesh);
        return mesh;
    }
    const box = (p, w, h, d, x, y, z, m) => put(p, new T.Mesh(new T.BoxGeometry(w, h, d), m), x, y, z);
    const cyl = (p, rt, rb, h, x, y, z, m, seg = 16) => put(p, new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m), x, y, z);
    const ball = (p, r, x, y, z, m) => put(p, new T.Mesh(new T.SphereGeometry(r, 16, 12), m), x, y, z);

    function canvasTexture(w, h, draw) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        draw(c.getContext('2d'), w, h);
        return new T.CanvasTexture(c);
    }

    /** Skylt med text (självlysande, påverkas inte av dimma). */
    function sign(parent, text, w, h, x, y, z, opt = {}) {
        const bg = opt.bg || '#c8102e', fg = opt.fg || '#fff2c4';
        const tex = canvasTexture(512, Math.max(64, Math.round(512 * h / w)), (g, cw, ch) => {
            g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
            if (opt.border !== false) {
                g.strokeStyle = opt.border || fg; g.lineWidth = 10;
                g.strokeRect(10, 10, cw - 20, ch - 20);
            }
            g.fillStyle = fg;
            g.textAlign = 'center'; g.textBaseline = 'middle';
            const lines = String(text).split('\n');
            const fs = opt.font || Math.min(ch / (lines.length + 0.6), cw / (Math.max(...lines.map(l => l.length)) * 0.62 + 1));
            g.font = 'bold ' + Math.round(fs) + 'px Oswald, Impact, Arial Black, sans-serif';
            lines.forEach((l, i) => g.fillText(l, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * fs * 1.08));
        });
        const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, fog: false }));
        m.position.set(x, y, z);
        if (opt.ry) m.rotation.y = opt.ry;
        parent.add(m);
        return m;
    }

    /** Upplyst fönster med spröjs. */
    function windowLit(parent, w, h, x, y, z, color = 0xffd98a) {
        const g = new T.Group();
        g.add(new T.Mesh(new T.PlaneGeometry(w, h), glow(color)));
        const bar = mat(0x2a1d14, 0.8);
        box(g, w + 0.14, 0.07, 0.06, 0, h / 2, 0.02, bar);
        box(g, w + 0.14, 0.07, 0.06, 0, -h / 2, 0.02, bar);
        box(g, 0.07, h, 0.06, -w / 2, 0, 0.02, bar);
        box(g, 0.07, h, 0.06, w / 2, 0, 0.02, bar);
        box(g, 0.05, h, 0.05, 0, 0, 0.02, bar);
        box(g, w, 0.05, 0.05, 0, 0.0, 0.02, bar);
        g.position.set(x, y, z);
        parent.add(g);
        return g;
    }

    /** Amerikansk 50-talsbil, nosen åt +x. */
    function makeCar(o = {}) {
        const car = new T.Group();
        const body = mat(o.body || 0x1a1715, 0.32, 0.18);
        const top = mat(o.top || o.body || 0xb52222, 0.34, 0.12);
        const chrome = mat(0xe9edf0, 0.2, 0.35);
        const glass = mat(0x1d2c3d, 0.1, 0.1, { emissive: 0x0a1018, emissiveIntensity: 0.6 });
        const tyre = mat(0x0c0c0d, 0.9, 0.0);
        box(car, 4.3, 0.52, 1.72, 0, 0.56, 0, body);
        box(car, 1.25, 0.16, 1.62, 1.5, 0.9, 0, body);             // huv
        box(car, 1.05, 0.14, 1.6, -1.65, 0.9, 0, body);            // bagage
        box(car, 1.9, 0.5, 1.5, -0.15, 1.15, 0, glass);            // kupé
        box(car, 1.95, 0.08, 1.56, -0.15, 1.42, 0, top);           // tak
        [[0.7, 1.45], [-1.05, 1.15]].forEach(([x]) => box(car, 0.08, 0.5, 1.56, x, 1.15, 0, body)); // stolpar
        if (o.fins) {
            [-1, 1].forEach(s => { const f = box(car, 0.7, 0.22, 0.1, -2.05, 1.0, s * 0.76, body); f.rotation.z = 0.22; });
        }
        [-1, 1].forEach(s => {
            box(car, 4.34, 0.05, 0.03, 0, 0.62, s * 0.87, chrome); // kromlist
            ball(car, 0.14, 2.12, 0.66, s * 0.55, glow(0xfff1c2));  // strålkastare
            box(car, 0.08, 0.12, 0.22, -2.17, 0.72, s * 0.58, glow(0xc01818)); // baklykta
        });
        box(car, 0.14, 0.18, 1.7, 2.2, 0.32, 0, chrome);           // främre stötfångare
        box(car, 0.14, 0.18, 1.7, -2.2, 0.32, 0, chrome);          // bakre
        box(car, 0.05, 0.22, 0.9, 2.17, 0.62, 0, chrome);          // grill
        [[1.4, 0.84], [1.4, -0.84], [-1.4, 0.84], [-1.4, -0.84]].forEach(([x, z]) => {
            const w = cyl(car, 0.34, 0.34, 0.24, x, 0.34, z, tyre, 20);
            w.rotation.x = Math.PI / 2;
            const white = cyl(car, 0.25, 0.25, 0.255, x, 0.34, z, mat(0xe8e1cf, 0.8), 20);
            white.rotation.x = Math.PI / 2;
            const hub = cyl(car, 0.13, 0.13, 0.27, x, 0.34, z, chrome, 14);
            hub.rotation.x = Math.PI / 2;
        });
        return car;
    }

    /** Gatlykta i 50-talsstil. */
    function lampPost(parent, x, z, lightColor = 0xffd9a0, withLight = true, h = 4.2) {
        const g = new T.Group();
        const iron = mat(0x2c353d, 0.5, 0.35);
        cyl(g, 0.06, 0.1, h, 0, h / 2, 0, iron, 10);
        const arm = box(g, 0.9, 0.06, 0.06, 0.4, h, 0, iron);
        put(g, new T.Mesh(new T.SphereGeometry(0.24, 16, 12), glow(lightColor)), 0.85, h - 0.05, 0, false);
        if (withLight) {
            const l = new T.PointLight(lightColor, 0.9, 9);
            l.position.set(0.85, h - 0.3, 0.1);
            g.add(l);
        }
        g.position.set(x, 0, z);
        parent.add(g);
        return g;
    }

    /** Registrera hotspot. */
    function hot(mesh, id, name, worldX, look = 'front', walkY = 612) {
        window.Renderer.registerInteractive(mesh, { id, name, walkX: px(worldX), walkY, lookAt: look });
    }

    // ------------------------------------------------------------------
    // Generisk scenfabrik
    // ------------------------------------------------------------------
    const goTo = (sceneId, side) => {
        window.GameState.entryFrom = side;
        window.Engine.loadScene(sceneId);
    };
    window.GoTo = goTo;

    function makeScene(def) {
        const hotspots = def.hotspots; // id -> { look:[spk,txt]|[[spk,txt],...], other?, exit?:[scene,side] }
        window.Engine.registerScene(def.id, {
            fx: {},
            init() {
                const R = window.Renderer, gs = window.GameState;
                R.clearScene(def.fog[0], def.fog[1], def.grade);
                gs.webgl.cameraMode = 'room_25d';
                const from = gs.entryFrom;
                gs.entryFrom = null;
                const start = (def.starts && def.starts[from]) || def.starts.default;
                gs.player.x = start[0]; gs.player.y = start[1]; gs.player.direction = start[2] || 'right';
                gs.companion.x = start[0] + (start[2] === 'left' ? 90 : -90); gs.companion.y = start[1] - 18;
                gs.companion.direction = start[2] || 'right';
                this.fx = {};
                this.t = 0;
                def.build.call(this, R, gs);
                R.spawnMainActors(true);
            },
            onEnter() {
                const gs = window.GameState;
                const flag = def.id + 'IntroPlayed';
                if (def.intro && !gs.getFlag(flag)) {
                    gs.setFlag(flag, true);
                    window.VoiceEngine.speakSequence(def.intro);
                }
            },
            update(dt, ts) {
                this.t = ts * 0.001;
                if (def.update) def.update.call(this, dt, this.t);
            },
            onInteract(id, verb) {
                const h = hotspots[id];
                if (!h) return false;
                const V = window.VoiceEngine;
                if (h.exit) { goTo(h.exit[0], h.exit[1]); return true; }
                const pick = (h.other && verb && verb !== 'TITTA PÅ' && verb !== 'GÅ TILL') ? h.other : h.look;
                if (Array.isArray(pick[0])) V.speakSequence(pick.map(([s, t]) => ({ speaker: s, text: t })));
                else V.speak(pick[0], pick[1]);
                return true;
            }
        });
    }

    // ==================================================================
    // 1. SHELL-MACKEN
    // ==================================================================
    makeScene({
        id: 'scene2_shell',
        fog: [0x0a0f18, 0.02],
        grade: { exposure: 3.1, bloom: 0.6, bloomThreshold: 0.85, vignette: 0.42, saturation: 1.12,
                 shadowTint: [0.82, 0.93, 1.22], highTint: [1.1, 1.0, 0.84] },
        starts: { default: [180, 640, 'right'], right: [1090, 640, 'left'], left: [180, 640, 'right'] },
        intro: [
            { speaker: 'conny', text: 'Där har vi henne. Shell-macken, nattöppet och kaffet är kallt sen midsommar.' },
            { speaker: 'lasse', text: 'Och bakom verkstaden hör jag Bultens motor. Han övervarvar den så att pumparna dallrar.' }
        ],
        build(R, gs) {
            const room = R.roomGroup;
            room.add(new T.AmbientLight(0x28364a, 0.55));
            const moon = new T.DirectionalLight(0x8ab4f8, 0.7);
            moon.position.set(-5, 11, 6); moon.castShadow = true;
            moon.shadow.camera.left = -12; moon.shadow.camera.right = 12; moon.shadow.camera.top = 9; moon.shadow.camera.bottom = -6;
            room.add(moon);

            // Underlag: asfalt och betongplatta under taket
            const asph = new T.Mesh(new T.PlaneGeometry(40, 20), mat(0x1c2027, 0.5, 0.1));
            asph.rotation.x = -Math.PI / 2; asph.receiveShadow = true; asph.position.z = -2; room.add(asph);
            const slab = new T.Mesh(new T.PlaneGeometry(13.5, 5.6), mat(0x3b424b, 0.85));
            slab.rotation.x = -Math.PI / 2; slab.position.set(-0.2, 0.012, -1.1); slab.receiveShadow = true; room.add(slab);
            // målade linjer
            for (let i = -5; i <= 5; i++) box(room, 0.07, 0.01, 2.2, i * 1.2, 0.02, 3.4, mat(0xcfc7a8, 0.9));

            // Kioskbyggnad
            const kiosk = new T.Group();
            const wall = mat(0xd8d3c4, 0.9), red = mat(0xc8102e, 0.5), yellow = mat(0xffc72c, 0.5);
            box(kiosk, 5.4, 2.7, 2.6, 0, 1.35, 0, wall);
            box(kiosk, 5.6, 0.22, 2.8, 0, 2.8, 0, mat(0x6b2a22, 0.7));
            box(kiosk, 5.62, 0.2, 2.82, 0, 2.55, 0, red);
            box(kiosk, 5.62, 0.1, 2.82, 0, 2.38, 0, yellow);
            windowLit(kiosk, 1.5, 1.1, -1.7, 1.45, 1.32);
            windowLit(kiosk, 1.5, 1.1, 1.7, 1.45, 1.32, 0xffe3a8);
            // Dörr
            const door = box(kiosk, 0.95, 1.9, 0.08, 0, 0.98, 1.31, mat(0x7a2a24, 0.6));
            box(kiosk, 0.7, 1.0, 0.09, 0, 1.2, 1.32, glow(0xffd98a));
            sign(kiosk, 'NATTÖPPET', 1.9, 0.38, 0, 2.05, 1.34, { bg: '#10151c', fg: '#ffd86a', font: 40 });
            // Vittrade hyllor i fönstret: tidningar, cigarettpaket, läskflaskor
            [-1.7, 1.7].forEach((x, i) => {
                for (let k = 0; k < 5; k++) box(kiosk, 0.2, 0.28, 0.1, x - 0.5 + k * 0.25, 1.05, 1.28, mat([0xd23a2a, 0x2a6fb0, 0xe0b53a, 0x3a8a4a, 0xf0f0e6][(k + i) % 5], 0.6));
            });
            kiosk.position.set(2.7, 0, -4.6);
            room.add(kiosk);
            hot(box(room, 0.95, 1.9, 0.12, 2.7, 0.98, -3.27, mat(0x7a2a24, 0.6)), 'shell_kioskdorr', 'Kioskens dörr (nattöppet)', 2.7, 'front');
            hot(kiosk.children[0], 'shell_kiosk', 'Kioskbyggnaden', 1.0, 'front');

            // Flipperspel utanför kiosken (Connys älsklingsbål)
            const pin = new T.Group();
            box(pin, 0.9, 0.95, 1.5, 0, 0.48, 0, mat(0x233a63, 0.5, 0.2));
            const glass = box(pin, 0.86, 0.04, 1.4, 0, 1.02, 0, mat(0x9fe8ff, 0.2, 0.1, { emissive: 0x2a6a8a, emissiveIntensity: 0.6 }));
            glass.rotation.x = -0.28;
            box(pin, 0.9, 0.55, 0.08, 0, 1.45, -0.7, mat(0x233a63, 0.5));
            sign(pin, 'SPACE\nSHOT', 0.8, 0.45, 0, 1.45, -0.65, { bg: '#7a1030', fg: '#ffe38a', font: 62 });
            pin.position.set(5.2, 0, -3.2); pin.rotation.y = -0.4;
            room.add(pin);
            hot(pin.children[0], 'shell_flipper', 'Flipperspel "Space Shot"', 5.2, 'left');

            // Tak (kapell) på fyra pelare
            const canopy = new T.Group();
            box(canopy, 9.2, 0.35, 4.0, 0, 3.9, 0, mat(0xf0e7cf, 0.6));
            box(canopy, 9.3, 0.24, 4.1, 0, 3.62, 0, red);
            box(canopy, 9.32, 0.12, 4.12, 0, 3.42, 0, yellow);
            [[-4.2, -1.7], [4.2, -1.7], [-4.2, 1.5], [4.2, 1.5]].forEach(([x, z]) => cyl(canopy, 0.15, 0.15, 3.6, x, 1.8, z, mat(0xe2ddd0, 0.7), 12));
            const lamps = [];
            [-3.2, 0, 3.2].forEach(x => {
                const l = new T.PointLight(0xfff0c8, 1.05, 10);
                l.position.set(x, 3.1, 0); canopy.add(l); lamps.push(l);
                box(canopy, 0.9, 0.06, 0.5, x, 3.2, 0, glow(0xfff8e0));
            });
            this.fx.canopyLights = lamps;
            canopy.position.set(-1.2, 0, -1.4);
            room.add(canopy);

            // Pumpöar med tre pumpar
            const pumpGroup = new T.Group();
            [-2.4, 0.6, 3.4].forEach((x, i) => {
                const p = new T.Group();
                box(p, 0.58, 1.55, 0.46, 0, 0.78, 0, mat(0xc8102e, 0.38, 0.1));
                box(p, 0.62, 0.34, 0.5, 0, 1.28, 0, mat(0xf3eedb, 0.5));
                box(p, 0.5, 0.2, 0.5, 0, 1.6, 0, mat(0xffc72c, 0.45));
                ball(p, 0.28, 0, 1.88, 0, mat(0xffd27a, 0.3, 0.05, { emissive: 0xaa7a1a, emissiveIntensity: 0.7 }));
                box(p, 0.06, 0.06, 0.42, 0.34, 0.95, 0, mat(0x111111, 0.6));  // slanghållare
                cyl(p, 0.03, 0.03, 0.55, 0.37, 0.62, 0.2, mat(0x0e0e0e, 0.8), 6);
                p.position.set(x, 0, 0);
                p.userData.idx = i;
                pumpGroup.add(p);
                hot(p.children[0], 'shell_pump' + i, 'Bensinpump', x - 1.2, 'front', 625);
            });
            pumpGroup.position.set(-1.2, 0, -1.0);
            room.add(pumpGroup);
            box(room, 8.0, 0.2, 0.9, -1.2, 0.1, -1.0, mat(0x4a525c, 0.85)); // pumpö

            // Hög Shell-skylt på stolpe
            const pole = new T.Group();
            cyl(pole, 0.1, 0.12, 6.2, 0, 3.1, 0, mat(0xdcdcdc, 0.4, 0.3), 12);
            const disc = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 0.16, 36), mat(0xffc72c, 0.4, 0.05, { emissive: 0x7a5a00, emissiveIntensity: 0.5 }));
            disc.rotation.x = Math.PI / 2; disc.position.set(0, 5.9, 0); pole.add(disc);
            const ring = new T.Mesh(new T.TorusGeometry(1.0, 0.1, 10, 36), mat(0xc8102e, 0.4));
            ring.position.set(0, 5.9, 0.08); pole.add(ring);
            sign(pole, 'SHELL', 1.5, 0.5, 0, 5.9, 0.1, { bg: '#ffc72c', fg: '#c8102e', border: false, font: 92 });
            sign(pole, 'BENSIN 0,69  ·  OLJA  ·  SERVICE', 2.4, 0.4, 0, 4.9, 0.06, { bg: '#10151c', fg: '#ffd86a', font: 30 });
            pole.position.set(-6.1, 0, -1.2);
            room.add(pole);
            hot(disc, 'shell_skylt', 'Skylten (lyser som en fyr)', -6.1, 'right');
            const glowL = new T.PointLight(0xffbb33, 1.1, 10); glowL.position.set(-5.4, 5.2, 0.2); room.add(glowL);

            // Oljeställ, däckstapel, luftslang
            const oil = new T.Group();
            box(oil, 1.4, 1.2, 0.6, 0, 0.6, 0, mat(0x30343a, 0.6, 0.2));
            for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++)
                cyl(oil, 0.1, 0.1, 0.32, -0.55 + c * 0.22, 0.2 + r * 0.38, 0.32, mat([0xffc72c, 0xc8102e, 0x1d4e89][r], 0.4, 0.3), 10);
            oil.position.set(-4.7, 0, -2.6); room.add(oil);
            hot(oil.children[0], 'shell_olja', 'Oljestället "Motorolja 20W"', -4.7, 'right');

            const tyres = new T.Group();
            for (let i = 0; i < 4; i++) {
                const ty = new T.Mesh(new T.TorusGeometry(0.34, 0.15, 12, 24), mat(0x111214, 0.92));
                ty.rotation.x = Math.PI / 2; ty.position.set(0, 0.16 + i * 0.3, 0);
                ty.castShadow = true; tyres.add(ty);
            }
            tyres.position.set(-6.0, 0, -2.4); room.add(tyres);
            hot(tyres.children[0], 'shell_dack', 'Däckstapel', -6.0, 'right');

            const air = new T.Group();
            box(air, 0.34, 1.3, 0.34, 0, 0.65, 0, mat(0x1d4e89, 0.4, 0.25));
            sign(air, 'LUFT', 0.3, 0.2, 0, 1.0, 0.18, { bg: '#fff2c4', fg: '#1d4e89', border: false });
            air.position.set(1.6, 0, 0.3);
            room.add(air);
            hot(air.children[0], 'shell_luft', 'Luftpump (gratis)', 1.6, 'front', 630);

            // Gatlykta och rondellens skylt bakom
            lampPost(room, -5.6, 0.6, 0xffd9a0, false, 4.0);

            // Bultens Cheva -57 vid verkstadsgaveln + Bulten
            const cheva = makeCar({ body: 0x3a322c, top: 0xc42a2a, fins: true });
            cheva.position.set(5.4, 0, -0.9); cheva.rotation.y = Math.PI + 0.25; cheva.scale.setScalar(0.9);
            room.add(cheva);
            hot(cheva.children[0], 'shell_cheva', 'Bultens Cheva -57', 5.0, 'left');
            this.fx.cheva = cheva;
            const bulten = R.createCharacterMesh('bulten', { jacketColor: 0x1a1a1c, shirtColor: 0xf0f0e6, pantsColor: 0x2a3a5c, hairColor: 0x15110d, pompadour: true, shoulderScale: 1.18 });
            bulten.group.position.set(3.7, 0, 0.5); bulten.group.rotation.y = -0.9;
            R.actorsGroup.add(bulten.group);
            R.registerInteractive(bulten.hitbox, { id: 'shell_bulten', name: 'Bulten', walkX: px(3.0), walkY: 640, lookAt: 'right' });
            this.fx.bulten = bulten;

            // Verkstadsport (utgång höger) — Bultens verkstad
            const garage = new T.Group();
            box(garage, 3.6, 3.0, 2.2, 0, 1.5, 0, mat(0x59493c, 0.9));
            box(garage, 2.4, 2.2, 0.1, 0, 1.1, 1.12, mat(0x2d2a28, 0.6));
            for (let i = 0; i < 8; i++) box(garage, 2.36, 0.04, 0.12, 0, 0.2 + i * 0.27, 1.14, mat(0x1a1917, 0.7));
            sign(garage, 'BULTENS\nBIL & MOTOR', 2.5, 0.8, 0, 2.55, 1.15, { bg: '#1a1917', fg: '#ff4d2e', font: 54 });
            const gDoor = box(garage, 2.4, 2.2, 0.08, 0, 1.1, 1.17, mat(0x2d2a28, 0.6));
            garage.position.set(6.4, 0, -3.8); room.add(garage);
            hot(gDoor, 'shell_verkstad_dorr', 'Bultens verkstad', 5.9, 'right');

            // Vägvisare åt vänster (rondellen)
            const sg = new T.Group();
            cyl(sg, 0.05, 0.05, 2.2, 0, 1.1, 0, mat(0x666c74, 0.5, 0.4), 8);
            const arrow = sign(sg, '← RONDELLEN\nSAAB-GRINDEN', 1.6, 0.52, 0, 2.1, 0.04, { bg: '#1d4e89', fg: '#ffffff', font: 30 });
            sg.position.set(-6.4, 0, 0.7); room.add(sg);
            hot(arrow, 'shell_exit_gate', 'Vägen tillbaka till rondellen', -6.4, 'left', 640);
            // Skylt åt centrum
            const sg2 = new T.Group();
            cyl(sg2, 0.05, 0.05, 2.0, 0, 1.0, 0, mat(0x666c74, 0.5, 0.4), 8);
            const arrow2 = sign(sg2, 'LINKÖPING C →\nSTORA TORGET', 1.6, 0.52, 0, 1.9, 0.04, { bg: '#1d4e89', fg: '#ffffff', font: 28 });
            sg2.position.set(-4.7, 0, 0.9); room.add(sg2);
            hot(arrow2, 'shell_exit_centrum', 'Vägen in till centrum', -4.7, 'front', 640);
        },
        update(dt, t) {
            if (this.fx.canopyLights) this.fx.canopyLights.forEach((l, i) => { l.intensity = 1.0 + Math.sin(t * 40 + i * 2.1) * (Math.sin(t * 0.7 + i) > 0.985 ? 0.5 : 0.015); });
            if (this.fx.cheva) this.fx.cheva.position.y = Math.sin(t * 38) * 0.006; // tomgång
        },
        hotspots: {
            shell_kioskdorr: { look: ['lasse', 'Nattöppet säger skylten. Dörren är låst och innanför sover Sture bakom kassan med tidningen över ansiktet.'], other: ['conny', 'Jag knackar inte. En man som sover bland cigarettpaketen ska man respektera.'] },
            shell_kiosk: { look: ['conny', 'Här kan man köpa allt: tuggummi, bensin, tidningar och en sorts korv som varit varm sedan kriget.'] },
            shell_flipper: { look: ['conny', 'Space Shot! Rekordet är 48 200 poäng och det har jag på mitt samvete. Nästan.'], other: ['lasse', 'Conny, du har inga tioöringar. Det har du sagt tre gånger nu.'] },
            shell_pump0: { look: ['lasse', 'Bensinpump. Skylten säger sextionio öre litern, vilket är rena rånet.'] },
            shell_pump1: { look: ['conny', 'Den här pumpen går bara på blyfri fantasi. Vi har ingen bil, Lasse.'] },
            shell_pump2: { look: ['lasse', 'Slangen är hoptejpad. Någon har försökt tanka sig själv.'] },
            shell_skylt: { look: ['conny', 'Man ser skylten från Norrköping. Det är meningen. Skeppsbrutna sjömän ska hitta hit.'] },
            shell_olja: { look: ['lasse', 'Motorolja i alla färger. En burk saknas, lagom för att bli en intressant ledtråd.'] },
            shell_dack: { look: ['conny', 'Fyra däck. Ett av dem har ett hål och ett rykte.'] },
            shell_luft: { look: ['lasse', 'Gratis luft. Det enda i Linköping som är gratis, kanske.'] },
            shell_cheva: { look: ['conny', 'Chevan står och gnolar på tomgång. Hon vill inte stå still. Bulten har fått henne att tro att hon är en tjur.'] },
            shell_bulten: { look: [['bulten', 'Tjena, grabbar! Vill ni ha en tur? Jag har bara tre gånger vält hela säsongen!'], ['lasse', 'Vi tackar nej. Fortfarande.']] },
            shell_verkstad_dorr: { exit: ['scene2_verkstad', 'left'] },
            shell_exit_gate: { exit: ['scene2_gate', 'right'] },
            shell_exit_centrum: { exit: ['scene2_centrum', 'left'] }
        }
    });

    // ==================================================================
    // 2. CENTRALA LINKÖPING — STORA TORGET
    // ==================================================================
    makeScene({
        id: 'scene2_centrum',
        fog: [0x0b1220, 0.015],
        grade: { exposure: 3.0, bloom: 0.65, bloomThreshold: 0.85, vignette: 0.42, saturation: 1.1,
                 shadowTint: [0.84, 0.94, 1.2], highTint: [1.1, 1.0, 0.84] },
        starts: { default: [180, 640, 'right'], left: [180, 640, 'right'], right: [1090, 640, 'left'] },
        intro: [
            { speaker: 'lasse', text: 'Stora Torget klockan tre på natten. Domkyrkan står där och ser missbelåten ut.' },
            { speaker: 'conny', text: 'Det är Folkungabrunnen som tittar. Den har sett alla fylletåg sen tjugosju.' }
        ],
        build(R, gs) {
            const room = R.roomGroup;
            room.add(new T.AmbientLight(0x2a3a55, 0.6));
            const moon = new T.DirectionalLight(0x9ab8ff, 0.75);
            moon.position.set(-6, 12, 5); moon.castShadow = true;
            moon.shadow.camera.left = -13; moon.shadow.camera.right = 13; moon.shadow.camera.top = 10; moon.shadow.camera.bottom = -8;
            room.add(moon);

            // Kullersten
            const cobble = canvasTexture(256, 256, (g, w, h) => {
                g.fillStyle = '#4a4d52'; g.fillRect(0, 0, w, h);
                for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
                    const l = 38 + Math.random() * 26;
                    g.fillStyle = 'hsl(' + (200 + Math.random() * 30) + ',6%,' + l + '%)';
                    g.beginPath(); g.ellipse(x * 16 + 8 + (y % 2) * 8, y * 16 + 8, 7, 6.5, 0, 0, 7); g.fill();
                }
            });
            cobble.wrapS = cobble.wrapT = T.RepeatWrapping; cobble.repeat.set(10, 6);
            const ground = new T.Mesh(new T.PlaneGeometry(44, 26), new T.MeshStandardMaterial({ map: cobble, roughness: 0.55, metalness: 0.05, bumpMap: cobble, bumpScale: 0.02 }));
            ground.rotation.x = -Math.PI / 2; ground.position.z = -4; ground.receiveShadow = true; room.add(ground);

            // Domkyrkan bakom (hög, upplyst västtorn med spira)
            const dom = new T.Group();
            const stone = mat(0xb9b3a4, 0.95), roofM = mat(0x3e5a52, 0.6, 0.2), dark = mat(0x4a463e, 0.9);
            box(dom, 9.5, 5.2, 3.6, 0, 2.6, 0, stone);                                   // långhus
            const roof = box(dom, 9.7, 0.4, 3.9, 0, 5.5, 0, roofM);
            put(dom, new T.Mesh(new T.CylinderGeometry(0.01, 2.3, 1.8, 4, 1), roofM), 0, 6.4, 0).rotation.y = Math.PI / 4;
            box(dom, 2.6, 8.8, 2.6, -4.6, 4.4, 0.9, stone);                              // västtorn
            box(dom, 2.9, 0.3, 2.9, -4.6, 8.9, 0.9, dark);
            const spire = put(dom, new T.Mesh(new T.ConeGeometry(1.55, 5.0, 4), roofM), -4.6, 11.5, 0.9);
            spire.rotation.y = Math.PI / 4;
            [[-4.6, 7.4], [-4.6, 5.0]].forEach(([x, y]) => windowLit(dom, 0.5, 1.1, x, y, 2.22, 0xffe2a0));
            for (let i = 0; i < 5; i++) windowLit(dom, 0.55, 1.7, -2.4 + i * 1.5, 2.7, 1.82, 0xffd480);
            const portal = box(dom, 1.3, 2.3, 0.2, -4.6, 1.15, 2.26, dark);
            box(dom, 0.9, 1.9, 0.22, -4.6, 0.95, 2.27, glow(0xffcf80));
            dom.position.set(1.0, 0, -11.5); dom.scale.setScalar(0.56); dom.position.z = -10.5;
            room.add(dom);
            const flood = new T.SpotLight(0xffe6b0, 2.4, 40, 0.8, 0.6);
            flood.position.set(-4, 1, -4); flood.target.position.set(-2.4, 6, -10.6);
            room.add(flood); room.add(flood.target);
            hot(dom.children[0], 'centrum_domkyrka', 'Linköpings domkyrka', 1.0, 'front', 600);

            // Hus längs sidorna med upplysta fönster
            const mkHouse = (x, z, w, h, col, floors, signText) => {
                const g = new T.Group();
                box(g, w, h, 3, 0, h / 2, 0, mat(col, 0.92));
                box(g, w + 0.2, 0.3, 3.2, 0, h + 0.1, 0, mat(0x4a403a, 0.8));
                const cols = Math.max(2, Math.floor(w / 1.6));
                for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++)
                    if (Math.random() > 0.35 || f === 0) windowLit(g, 0.7, 1.0, -w / 2 + (c + 0.5) * (w / cols), 1.8 + f * 2.0, 1.52, Math.random() > 0.5 ? 0xffd98a : 0xffeebd);
                g.position.set(x, 0, z);
                room.add(g);
                return g;
            };
            const left = mkHouse(-8.0, -7.5, 5.2, 7.2, 0xc7a67e, 3);
            const right = mkHouse(10.2, -7.0, 6.6, 6.4, 0x9fae9a, 3);
            

            // Bio med neonmarkis (vänster hus)
            const bio = new T.Group();
            box(bio, 3.2, 0.9, 0.5, 0, 2.4, 0, mat(0x14181e, 0.5));
            sign(bio, 'B I O', 3.0, 0.7, 0, 2.4, 0.27, { bg: '#14181e', fg: '#ff4d6a', font: 78, border: '#ff4d6a' });
            const poster = (x, txt, col) => sign(bio, txt, 0.8, 1.15, x, 1.05, 0.12, { bg: col, fg: '#fff3c8', font: 36 });
            poster(-1.1, 'WESTERN\nIDAG', '#7a3a1a'); poster(0, 'ROCK\nNATT', '#1d2f6a'); poster(1.1, 'KOMEDI\n17.45', '#5a1a40');
            const bioL = new T.PointLight(0xff4d6a, 1.0, 7); bioL.position.set(0, 2.2, 1.2); bio.add(bioL);
            bio.position.set(-5.6, 0, -5.8); room.add(bio);
            hot(bio.children[0], 'centrum_bio', 'Biografen (kvällsföreställning slut)', -5.6, 'front');
            this.fx.bioLight = bioL;

            // Konditori med skylt
            const kond = new T.Group();
            box(kond, 3.6, 2.6, 0.4, 0, 1.3, 0, mat(0x7a5a46, 0.8));
            windowLit(kond, 2.6, 1.2, 0, 1.2, 0.22, 0xffcc88);
            sign(kond, 'KONDITORI', 2.4, 0.5, 0, 2.5, 0.25, { bg: '#2a1a14', fg: '#ffd27a', font: 52 });
            for (let i = 0; i < 6; i++) box(kond, 0.28, 0.2, 0.08, -0.9 + i * 0.36, 0.95, 0.22, mat([0xe8b0c0, 0xf4e2a0, 0xb5764a][i % 3], 0.7));
            kond.position.set(5.3, 0, -5.9); room.add(kond);
            hot(kond.children[0], 'centrum_konditori', 'Konditoriet (stängt, men det luktar kardemumma)', 5.3, 'front');

            // Folkungabrunnen (stiliserad)
            const fount = new T.Group();
            const bronze = mat(0x4a7a66, 0.45, 0.35), granite = mat(0x8c9096, 0.85);
            cyl(fount, 2.25, 2.35, 0.35, 0, 0.18, 0, granite, 40);
            cyl(fount, 2.0, 2.0, 0.55, 0, 0.5, 0, granite, 40);
            const water = new T.Mesh(new T.CircleGeometry(1.92, 40), mat(0x2d5b8a, 0.1, 0.4, { emissive: 0x0a2040, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }));
            water.rotation.x = -Math.PI / 2; water.position.y = 0.76; fount.add(water);
            cyl(fount, 0.45, 0.7, 1.3, 0, 1.2, 0, granite, 20);
            cyl(fount, 1.0, 0.4, 0.2, 0, 1.95, 0, granite, 24);
            // ryttare och springare (stiliserade)
            const horse = new T.Group();
            ball(horse, 0.42, 0, 0, 0, bronze).scale.set(1.6, 0.75, 0.8);
            cyl(horse, 0.1, 0.12, 0.7, 0.5, 0.35, 0.1, bronze, 8).rotation.z = -0.5;
            ball(horse, 0.22, 0.85, 0.55, 0.1, bronze);
            [[-0.4, 0.2], [-0.4, -0.2], [0.35, 0.2], [0.35, -0.2]].forEach(([x, z]) => cyl(horse, 0.07, 0.05, 0.6, x, -0.45, z, bronze, 6));
            cyl(horse, 0.14, 0.18, 0.55, 0, 0.55, 0, bronze, 8);
            ball(horse, 0.13, 0, 0.92, 0, bronze);
            horse.position.set(0, 2.55, 0); fount.add(horse);
            for (let i = 0; i < 6; i++) {
                const a = i / 6 * Math.PI * 2;
                const jet = cyl(fount, 0.02, 0.05, 0.9, Math.cos(a) * 1.5, 1.2, Math.sin(a) * 1.5, mat(0xbfe4ff, 0.1, 0.1, { transparent: true, opacity: 0.55 }), 6);
                jet.castShadow = false;
            }
            fount.position.set(1.6, 0, -3.4);
            fount.scale.setScalar(0.95);
            room.add(fount);
            hot(fount.children[1], 'centrum_brunn', 'Folkungabrunnen', 1.6, 'front', 615);
            this.fx.water = water;

            // Gatlyktor
            [[-3.6, 0.2], [4.4, 0.0], [-6.8, -1.0], [7.6, -2.0]].forEach(([x, z], i) => lampPost(room, x, z, 0xffd9a0, i < 2));

            // Parkerade bilar
            const volvo = makeCar({ body: 0x2f5b7a, top: 0xd9d4c4 }); volvo.position.set(-6.2, 0, -2.4); volvo.rotation.y = 0.08; volvo.scale.setScalar(0.85); room.add(volvo);
            const sedan = makeCar({ body: 0x8a2a2a, top: 0x8a2a2a }); sedan.position.set(5.9, 0, -1.9); sedan.rotation.y = Math.PI - 0.1; sedan.scale.setScalar(0.85); room.add(sedan);
            hot(volvo.children[0], 'centrum_bil', 'Parkerad Volvo (olåst, men bromsvätskan luktar)', -6.2, 'front', 625);

            // Cykelställ och cyklar
            const racks = new T.Group();
            for (let i = 0; i < 5; i++) {
                const wheelR = new T.Mesh(new T.TorusGeometry(0.34, 0.03, 8, 20), mat(0x1c1c1c, 0.7, 0.4));
                wheelR.position.set(i * 0.32, 0.36, (i % 2) * 0.15); wheelR.rotation.y = 0.35; wheelR.castShadow = true; racks.add(wheelR);
            }
            box(racks, 1.9, 0.04, 0.06, 0.64, 0.45, 0.05, mat(0x1c1c1c, 0.7, 0.4));
            racks.position.set(3.1, 0, -0.5); room.add(racks);
            hot(racks.children[0], 'centrum_cyklar', 'Cykelställ', 3.2, 'front', 625);

            // Bänk
            const bench = new T.Group();
            box(bench, 1.6, 0.08, 0.5, 0, 0.55, 0, mat(0x6a4a2a, 0.8));
            box(bench, 1.6, 0.5, 0.06, 0, 0.82, -0.22, mat(0x6a4a2a, 0.8));
            [-0.7, 0.7].forEach(x => box(bench, 0.08, 0.55, 0.45, x, 0.27, 0, mat(0x1c1c1c, 0.7, 0.4)));
            bench.position.set(-0.4, 0, 0.0); room.add(bench);
            hot(bench.children[0], 'centrum_bank', 'Parkbänk med inbränt hjärta', -0.4, 'front', 625);

            // Telefonkiosk
            const tk = new T.Group();
            box(tk, 0.9, 2.2, 0.9, 0, 1.1, 0, mat(0x2a5a3a, 0.5, 0.2));
            box(tk, 0.7, 1.4, 0.92, 0, 1.2, 0, glow(0xfff0b0));
            sign(tk, 'TELEFON', 0.7, 0.22, 0, 2.05, 0.46, { bg: '#fff0b0', fg: '#1a3a24', border: false });
            tk.position.set(-6.5, 0, 0.0); room.add(tk);
            hot(tk.children[0], 'centrum_telefon', 'Telefonkiosk', -6.5, 'right', 625);

            // Kiosk med kvällstidningar
            const tid = new T.Group();
            box(tid, 1.5, 2.2, 1.2, 0, 1.1, 0, mat(0x8a2a22, 0.6));
            windowLit(tid, 1.0, 0.7, 0, 1.3, 0.62);
            sign(tid, 'TIDNINGAR', 1.4, 0.32, 0, 2.1, 0.62, { bg: '#2a1a14', fg: '#ffd27a', font: 36 });
            tid.position.set(7.4, 0, -0.6); room.add(tid);
            hot(tid.children[0], 'centrum_tidningskiosk', 'Tidningskiosk', 7.2, 'left', 625);

            // Polisens Plymouth, parkerad med blinkande blåljus (de jagar Bulten)
            const pol = makeCar({ body: 0x2c3038, top: 0xf5f5f5 });
            pol.position.set(-2.8, 0, -0.9); pol.rotation.y = Math.PI + 0.1; pol.scale.setScalar(0.72);
            room.add(pol);
            const siren = new T.PointLight(0x3a7bff, 1.8, 8); siren.position.set(-2.8, 1.7, -0.9); room.add(siren);
            const sirenMesh = ball(room, 0.08, -2.8, 1.3, -0.9, glow(0x3a7bff));
            this.fx.siren = siren; this.fx.sirenMesh = sirenMesh;
            hot(pol.children[0], 'centrum_polisbil', 'Tomt polisfordon med blåljuset på', -2.8, 'front', 625);

            // Utgångar: vägvisare
            const sgL = new T.Group();
            cyl(sgL, 0.05, 0.05, 2.0, 0, 1.0, 0, mat(0x666c74, 0.5, 0.4), 8);
            const aL = sign(sgL, '← SHELL\nMACKEN', 1.4, 0.62, 0, 1.9, 0.04, { bg: '#1d4e89', fg: '#ffffff', font: 36 });
            sgL.position.set(-7.5, 0, 0.8); room.add(sgL);
            hot(aL, 'centrum_exit_shell', 'Tillbaka mot Shell-macken', -7.5, 'left', 640);
            const sgR = new T.Group();
            cyl(sgR, 0.05, 0.05, 2.0, 0, 1.0, 0, mat(0x666c74, 0.5, 0.4), 8);
            const aR = sign(sgR, 'SAAB →\nGRINDEN', 1.4, 0.62, 0, 1.9, 0.04, { bg: '#1d4e89', fg: '#ffffff', font: 36 });
            sgR.position.set(7.6, 0, 0.8); room.add(sgR);
            hot(aR, 'centrum_exit_gate', 'Mot SAAB-grinden', 7.6, 'right', 640);
        },
        update(dt, t) {
            if (this.fx.siren) {
                const on = Math.sin(t * 9) > 0;
                this.fx.siren.intensity = on ? 2.2 : 0.2;
                this.fx.siren.color.set(on ? 0x3a7bff : 0xff3a3a);
                this.fx.sirenMesh.material.color.set(on ? 0x3a7bff : 0xff3a3a);
            }
            if (this.fx.bioLight) this.fx.bioLight.intensity = 0.8 + (Math.sin(t * 17) > 0.6 ? 0.5 : 0);
            if (this.fx.water) this.fx.water.material.emissiveIntensity = 0.45 + Math.sin(t * 2.2) * 0.1;
        },
        hotspots: {
            centrum_domkyrka: { look: [['lasse', 'Linköpings domkyrka. Femhundra år av folk som ångrar sig.'], ['conny', 'Och ändå dyker det upp nya syndare varje lördag.']] },
            centrum_bio: { look: ['conny', 'Bio! Kvällens film är slut, men affischen lovar en cowboy som aldrig verkar komma fram.'] },
            centrum_konditori: { look: ['lasse', 'Konditoriet. Stängt, men man känner kardemumman genom fönstret.'] },
            centrum_brunn: { look: [['lasse', 'Folkungabrunnen. Bronsryttaren rider mot Kungsgatan i åttio års tid utan att komma fram.'], ['conny', 'Samma resa som vi gör med vårt liv i Linköping.']] },
            centrum_bil: { look: ['conny', 'En Volvo. Någon har lämnat en halvrökt cigarr i askkoppen och ett fotbollskort på instrumentbrädan.'] },
            centrum_cyklar: { look: ['lasse', 'Cyklar. En har ett kedjeskydd gjort av en gammal Rydéns-skylt.'] },
            centrum_bank: { look: ['conny', 'Någon har skrivit "T + K 1959" i bänken. Det är minst tre T och två K i Linköping.'] },
            centrum_telefon: { look: ['lasse', 'Telefonkiosken ringer inte. Telefonbanken ligger fuktig på hyllan.'], other: ['conny', 'Vi har inga tioöringar, Lasse. Men det finns en lapp med ett nummer här.'] },
            centrum_tidningskiosk: { look: ['conny', 'Kvällstidningarna är på väg: "Raggarplågan hotar Östergötland". Stort kort på en Cheva.'] },
            centrum_polisbil: { look: [['lasse', 'Polisbilen står övergiven med blåljuset på.'], ['conny', 'Överkonstapel Grym är fortfarande på jakt. Det här är vår chans.']] },
            centrum_exit_shell: { exit: ['scene2_shell', 'right'] },
            centrum_exit_gate: { exit: ['scene2_gate', 'left'] }
        }
    });

    // ==================================================================
    // 3. BULTENS VERKSTAD
    // ==================================================================
    makeScene({
        id: 'scene2_verkstad',
        fog: [0x120d09, 0.012],
        grade: { exposure: 2.0, bloom: 0.45, bloomThreshold: 1.0, vignette: 0.4, saturation: 1.12,
                 shadowTint: [0.92, 0.96, 1.1], highTint: [1.12, 1.02, 0.84] },
        starts: { default: [210, 640, 'right'], left: [210, 640, 'right'] },
        intro: [
            { speaker: 'conny', text: 'Det luktar bensin, cigarr och ungdomlig övermod. Välkommen till Bultens salong.' },
            { speaker: 'lasse', text: 'Titta, Cheva femtisju på lyft. Hon har ju ingen avgasledning kvar!' }
        ],
        build(R, gs) {
            const room = R.roomGroup;
            room.add(new T.HemisphereLight(0xb8c4d8, 0x2a1f14, 0.55));

            // Golv, väggar, tak
            const floorMat = R._floorMaterial({ floorType: 'concrete', floorColor: 0x5a5650 });
            const floor = new T.Mesh(new T.PlaneGeometry(22, 12), floorMat);
            floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -2); floor.receiveShadow = true; room.add(floor);
            const brick = canvasTexture(256, 256, (g, w, h) => {
                g.fillStyle = '#7a4a38'; g.fillRect(0, 0, w, h);
                for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
                    g.fillStyle = 'hsl(' + (10 + Math.random() * 14) + ',40%,' + (28 + Math.random() * 16) + '%)';
                    g.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14);
                }
            });
            brick.wrapS = brick.wrapT = T.RepeatWrapping; brick.repeat.set(4, 1);
            const backWall = new T.Mesh(new T.PlaneGeometry(22, 6.5), new T.MeshStandardMaterial({ map: brick, roughness: 0.95 }));
            backWall.position.set(0, 3.25, -8); backWall.receiveShadow = true; room.add(backWall);
            const sideL = new T.Mesh(new T.PlaneGeometry(12, 6.5), mat(0x6b5a4a, 0.95));
            sideL.rotation.y = Math.PI / 2; sideL.position.set(-9.2, 3.25, -2); room.add(sideL);
            const sideR = sideL.clone(); sideR.rotation.y = -Math.PI / 2; sideR.position.x = 9.2; room.add(sideR);
            const ceil = new T.Mesh(new T.PlaneGeometry(22, 12), mat(0x2a241e, 0.95));
            ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 6.4, -2); room.add(ceil);
            for (let x = -8; x <= 8; x += 4) box(room, 0.3, 0.4, 12, x, 6.1, -2, mat(0x3a2e24, 0.9));

            // Arbetslampor
            this.fx.lamps = [];
            [-5, 0, 5].forEach((x, i) => {
                const l = new T.PointLight(0xffe0a8, 1.25, 12);
                l.position.set(x, 5.4, -3); room.add(l); this.fx.lamps.push(l);
                cyl(room, 0.04, 0.04, 0.7, x, 6.0, -3, mat(0x222222), 6);
                const shade = put(room, new T.Mesh(new T.ConeGeometry(0.55, 0.38, 20, 1, true), mat(0x3a5a3a, 0.5, 0.2, { side: T.DoubleSide })), x, 5.55, -3, false);
                ball(room, 0.12, x, 5.4, -3, glow(0xfff4d0));
            });

            // Skjutport (utgång) i vänster vägg → Shell
            const gate = new T.Group();
            box(gate, 3.4, 3.6, 0.2, 0, 1.8, 0, mat(0x3a3430, 0.7));
            for (let i = 0; i < 9; i++) box(gate, 3.3, 0.05, 0.24, 0, 0.2 + i * 0.4, 0, mat(0x24201c, 0.8));
            box(gate, 3.5, 3.8, 0.1, 0, 1.9, -0.12, glow(0x1c2a44)); // natthimlen bakom springor
            sign(gate, 'UT TILL\nSHELL', 1.2, 0.5, 0, 3.9, 0.15, { bg: '#10151c', fg: '#ffd86a', font: 40 });
            gate.position.set(-6.6, 0, -4.6); gate.rotation.y = Math.PI / 2 * 0.0;
            room.add(gate);
            hot(gate.children[0], 'verkstad_exit', 'Verkstadsporten ut mot Shell-macken', -6.6, 'left', 635);

            // Bilen på lyft: Chevan
            const lift = new T.Group();
            [-1.2, 1.2].forEach(x => { box(lift, 0.28, 1.3, 0.28, x, 0.65, -0.95, mat(0xd2a022, 0.5, 0.3)); box(lift, 0.28, 1.3, 0.28, x, 0.65, 0.95, mat(0xd2a022, 0.5, 0.3)); });
            box(lift, 3.6, 0.16, 0.24, 0, 1.28, -0.95, mat(0xd2a022, 0.5, 0.3));
            box(lift, 3.6, 0.16, 0.24, 0, 1.28, 0.95, mat(0xd2a022, 0.5, 0.3));
            const cheva = makeCar({ body: 0x3a322c, top: 0xc42a2a, fins: true });
            cheva.position.set(0, 1.4, 0); cheva.scale.setScalar(0.85);
            lift.add(cheva);
            lift.position.set(0.8, 0, -3.2); room.add(lift);
            hot(cheva.children[0], 'verkstad_cheva', 'Bultens Cheva -57 på lyft', 0.8, 'front', 630);
            this.fx.cheva = cheva;

            // Motor på stativ (V8)
            const eng = new T.Group();
            box(eng, 1.1, 0.2, 0.9, 0, 0.45, 0, mat(0x25282c, 0.6, 0.4));
            [-0.1, 0.1].forEach(() => {});
            const block = box(eng, 0.9, 0.5, 0.7, 0, 0.8, 0, mat(0x4a4f56, 0.5, 0.4));
            [-0.27, 0.27].forEach(z => {
                const head = box(eng, 0.9, 0.2, 0.28, 0, 1.18, z, mat(0x8a8f96, 0.4, 0.4));
                head.rotation.x = z < 0 ? 0.35 : -0.35;
                for (let i = 0; i < 4; i++) cyl(eng, 0.05, 0.05, 0.22, -0.32 + i * 0.21, 1.32, z * 1.5, mat(0xc8102e, 0.5, 0.3), 8);
            });
            box(eng, 0.5, 0.18, 0.5, 0, 1.4, 0, mat(0xc8c8c8, 0.3, 0.5));
            eng.position.set(-4.2, 0, -1.8); room.add(eng);
            hot(block, 'verkstad_motor', 'Chevans V8-motor på stativ', -4.2, 'front', 625);

            // Arbetsbänk med skruvstycke, verktyg, termos
            const bench = new T.Group();
            box(bench, 3.4, 0.14, 1.1, 0, 1.0, 0, mat(0x6a4a2a, 0.75));
            [-1.5, 1.5].forEach(x => box(bench, 0.12, 1.0, 0.9, x, 0.5, 0, mat(0x2a2a2a, 0.7, 0.2)));
            box(bench, 3.2, 0.5, 0.9, 0, 0.35, 0, mat(0x3a3a3a, 0.7, 0.2));
            box(bench, 0.4, 0.4, 0.3, -1.1, 1.3, 0, mat(0xb8b8bd, 0.35, 0.5));       // skruvstycke
            cyl(bench, 0.1, 0.1, 0.35, 0.9, 1.25, 0.1, mat(0xc8102e, 0.4, 0.4), 12);  // termos
            for (let i = 0; i < 6; i++) box(bench, 0.04, 0.04, 0.28 + (i % 3) * 0.05, -0.4 + i * 0.12, 1.08, -0.15 + (i % 2) * 0.1, mat(0xb8b8bd, 0.3, 0.7)); // verktyg
            bench.position.set(5.2, 0, -6.6); room.add(bench);
            hot(bench.children[0], 'verkstad_banken', 'Arbetsbänk', 5.2, 'front', 600);

            // Verktygstavla (pegboard med silhuetter) bakom bänken
            const peg = new T.Group();
            box(peg, 3.4, 2.0, 0.08, 0, 0, 0, mat(0x6a5a3a, 0.9));
            const sil = mat(0x1a140e, 0.9);
            [[-1.2, 0.5, 0.1, 0.9], [-0.8, 0.5, 0.3, 0.2], [-0.2, 0.4, 0.14, 1.0], [0.4, 0.4, 0.5, 0.15], [0.9, 0.45, 0.16, 0.9], [1.3, 0.3, 0.3, 0.3]].forEach(([x, y, w, h]) => box(peg, w, h, 0.02, x, y, 0.06, sil));
            [[-1.2, -0.5], [-0.6, -0.55], [0.1, -0.5], [0.7, -0.6], [1.2, -0.5]].forEach(([x, y], i) => box(peg, 0.4 - (i % 2) * 0.15, 0.12, 0.02, x, y, 0.06, sil));
            peg.position.set(5.2, 3.0, -7.9); room.add(peg);
            hot(peg.children[0], 'verkstad_tavla', 'Verktygstavlan (alla silhuetter utom en)', 5.2, 'front', 600);

            // Verktygsskåp
            const chest = new T.Group();
            box(chest, 1.0, 1.7, 0.6, 0, 0.85, 0, mat(0xc8102e, 0.45, 0.25));
            for (let i = 0; i < 5; i++) box(chest, 0.9, 0.02, 0.62, 0, 0.3 + i * 0.3, 0.01, mat(0x6a1020, 0.6));
            for (let i = 0; i < 5; i++) box(chest, 0.3, 0.04, 0.08, 0, 0.2 + i * 0.3, 0.34, mat(0xd6d6da, 0.3, 0.7));
            chest.position.set(2.5, 0, -6.9); room.add(chest);
            hot(chest.children[0], 'verkstad_skap', 'Verktygsskåp (röd, låst)', 2.5, 'front', 600);

            // Däckhög och oljefat
            const tyres = new T.Group();
            for (let i = 0; i < 5; i++) {
                const ty = new T.Mesh(new T.TorusGeometry(0.34, 0.15, 12, 24), mat(0x111214, 0.92));
                ty.rotation.x = Math.PI / 2; ty.position.y = 0.16 + i * 0.3; ty.castShadow = true; tyres.add(ty);
            }
            tyres.position.set(-7.6, 0, -6.0); room.add(tyres);
            hot(tyres.children[0], 'verkstad_dack', 'Däckhög', -7.6, 'right', 610);
            [[-6.5, -7.0], [-7.2, -7.2]].forEach(([x, z]) => cyl(room, 0.38, 0.38, 1.0, x, 0.5, z, mat(0x2a3b5a, 0.5, 0.35), 18));
            hot(room.children[room.children.length - 1], 'verkstad_fat', 'Oljefat', -7.2, 'right', 610);

            // Soffa av bilsäte, radio, kylskåp (raggarhörnan)
            const sofa = new T.Group();
            box(sofa, 2.4, 0.4, 0.9, 0, 0.5, 0, mat(0x8a2a2a, 0.7));
            box(sofa, 2.4, 0.7, 0.25, 0, 0.9, -0.35, mat(0x8a2a2a, 0.7));
            [-1.3, 1.3].forEach(x => box(sofa, 0.2, 0.6, 0.9, x, 0.6, 0, mat(0x6a1a1a, 0.7)));
            sofa.position.set(-3.2, 0, -6.9); room.add(sofa);
            hot(sofa.children[0], 'verkstad_soffa', 'Soffa av ett Chevrolet-baksäte', -3.2, 'front', 600);

            const radio = new T.Group();
            box(radio, 0.7, 0.4, 0.3, 0, 0, 0, mat(0x8a5a2a, 0.5));
            ball(radio, 0.14, -0.2, 0, 0.16, glow(0xffd070)).scale.z = 0.3;
            for (let i = 0; i < 5; i++) box(radio, 0.04, 0.2, 0.02, 0.0 + i * 0.07, 0.0, 0.16, glow(0x3a2a14));
            radio.position.set(-3.0, 1.5, -7.0); room.add(radio);
            hot(radio.children[0], 'verkstad_radio', 'Radion (Radio Luxembourg)', -3.0, 'front', 600);

            const fridge = new T.Group();
            box(fridge, 0.9, 1.7, 0.8, 0, 0.85, 0, mat(0xd8d3c4, 0.4, 0.15));
            box(fridge, 0.05, 0.5, 0.06, 0.38, 1.1, 0.42, mat(0xc0c0c8, 0.3, 0.7));
            fridge.position.set(-1.7, 0, -7.2); room.add(fridge);
            hot(fridge.children[0], 'verkstad_kyl', 'Kylskåp med pilsner', -1.7, 'front', 600);

            // Affischer
            sign(room, 'ROCK\n& ROLL\nNATT', 1.2, 1.6, -8.6, 3.3, -3.0, { bg: '#1d2f6a', fg: '#ffd86a', font: 46, ry: Math.PI / 2 });
            sign(room, 'JAGA\nHÖGA FARTER', 1.5, 1.0, 9.1, 3.2, -3.6, { bg: '#7a1030', fg: '#fff2c4', font: 36, ry: -Math.PI / 2 });

            // Svetsgnista (animerad)
            const spark = new T.PointLight(0x7ab4ff, 0, 5);
            spark.position.set(3.7, 1.4, -4.6); room.add(spark);
            this.fx.spark = spark;
        },
        update(dt, t) {
            if (this.fx.spark) this.fx.spark.intensity = (Math.sin(t * 31) > 0.9 && Math.sin(t * 3.3) > 0.4) ? 1.8 : 0;
            if (this.fx.lamps) this.fx.lamps.forEach((l, i) => { l.intensity = 1.2 + Math.sin(t * 47 + i * 3) * 0.03; });
        },
        hotspots: {
            verkstad_exit: { exit: ['scene2_shell', 'right'] },
            verkstad_cheva: { look: [['lasse', 'Chevan hänger från taket som en förtrollad fisk. Hon har ingen avgasledning och ändå hörs hon över halva Linköping.'], ['conny', 'Bulten påstår att hon har fyrahundra hästar. Det är fyra hästar. Och en get.']] },
            verkstad_motor: { look: ['lasse', 'V8:an är hel, men någon har tagit tändstiften och sått dem i sin brevlåda.'] },
            verkstad_banken: { look: ['conny', 'Arbetsbänken. En termos, en halvt uppäten korvbröd och tre sorters skiftnycklar som inte passar.'] },
            verkstad_tavla: { look: ['lasse', 'Verktygstavlan. Det finns en silhuett för varje verktyg utom en – någon har lånat momentnyckeln. Det är aldrig bra.'] },
            verkstad_skap: { look: ['conny', 'Det röda skåpet är låst med ett hänglås större än min mamma.'], other: ['lasse', 'Det går inte att dyrka med fickkniven. Jag har försökt. Tre gånger.'] },
            verkstad_dack: { look: ['lasse', 'En hög däck. Alla bär avtryck av Bultens speciella förarstil.'] },
            verkstad_fat: { look: ['conny', 'Oljefat. Ett av dem luktar inte olja, utan bränd gummi och dåligt omdöme.'] },
            verkstad_soffa: { look: ['lasse', 'En soffa av ett Chevrolet-baksäte. Någon har sovit här med kängorna på.'] },
            verkstad_radio: { look: ['conny', 'Radion står på Radio Luxembourg. Där spelas Elvis i ett prasslande hav av brus.'] },
            verkstad_kyl: { look: ['lasse', 'Kylskåpet är fullt av pilsner. Och en burk surströmming som någon glömt sedan 1959.'] }
        }
    });
})();
