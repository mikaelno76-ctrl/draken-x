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

        R.clearScene(0x3a180c, 0.025);
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
            R.scene.fog = new THREE.FogExp2(0x070b12, 0.03);
            R.scene.background = new THREE.Color(0x070b12);
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
        } else if (this.phase === 2) {
            R.camera.position.set(0, 2.1, 7.5);
            R.camera.lookAt(0, 1.4, -3.0);

            if (this.albertinaPlane) {
                this.albertinaPlane.position.x += dt * 1.35;
                this.albertinaPlane.position.y -= dt * 0.42;
                this.albertinaPlane.rotation.z = -0.22 + Math.sin(t * 14) * 0.04;
            }
            if (this.fireLight) {
                this.fireLight.intensity = 2.2 + Math.sin(t * 28) * 1.1;
            }
        }
    },

    _buildKatangaOpenPitMine(R) {
        const sun = new THREE.DirectionalLight(0xff7733, 1.4);
        sun.position.set(-6, 9, 4);
        this.katangaGroup.add(sun);

        const ambient = new THREE.AmbientLight(0x8c3b20, 0.55);
        this.katangaGroup.add(ambient);

        const rustEarthMat = new THREE.MeshStandardMaterial({
            color: 0x7a2e16,
            map: R.proceduralTextures.fabric,
            roughness: 0.92
        });
        const darkPitMat = new THREE.MeshStandardMaterial({
            color: 0x42180b,
            roughness: 0.95
        });
        const cobaltVeinMat = new THREE.MeshStandardMaterial({
            color: 0x2b6cb0,
            metalness: 0.85,
            roughness: 0.25
        });

        for (let step = 0; step < 5; step++) {
            const terrace = new THREE.Mesh(
                new THREE.CylinderGeometry(3.2 + step * 1.9, 2.4 + step * 1.7, 0.9, 18, 1, true),
                step % 2 === 0 ? rustEarthMat : darkPitMat
            );
            terrace.position.set(0, -1.2 + step * 0.72, -3.5);
            this.katangaGroup.add(terrace);
        }

        for (let c = 0; c < 8; c++) {
            const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), cobaltVeinMat);
            ore.position.set(-3.5 + c * 1.0, 0.15 + (c % 3) * 0.35, -2.8 - (c % 2) * 1.2);
            this.katangaGroup.add(ore);
        }

        const towerMat = new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.8 });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.8, 0.9), towerMat);
        tower.position.set(-4.2, 1.9, -4.2);
        this.katangaGroup.add(tower);

        const mercMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.85 });
        const beretMat = new THREE.MeshStandardMaterial({ color: 0x3b1d11, roughness: 0.7 });
        const cigMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });

        [[-1.8, 0.35], [1.9, -0.35]].forEach(([mx, rotY]) => {
            const merc = new THREE.Group();
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 1.1, 12), mercMat);
            torso.position.y = 0.75;
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), mercMat);
            head.position.y = 1.48;
            const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.08, 12), beretMat);
            beret.position.set(0.04, 1.62, 0);
            beret.rotation.z = -0.28;
            const cig = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), cigMat);
            cig.position.set(0.12, 1.42, 0.18);
            this.cigGlows.push(cig);

            const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), mercMat);
            rifle.position.set(0.22, 0.95, 0.12);
            rifle.rotation.z = 0.45;

            merc.add(torso, head, beret, cig, rifle);
            merc.position.set(mx, -0.2, 1.8);
            merc.rotation.y = rotY;
            this.katangaGroup.add(merc);
        });
    },

    _buildNdolaNightJungle(R) {
        const moon = new THREE.DirectionalLight(0x4466aa, 0.5);
        moon.position.set(4, 10, 2);
        this.ndolaGroup.add(moon);

        const treeMat = new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.9 });
        for (let i = -8; i <= 8; i += 1.4) {
            const canopy = new THREE.Mesh(
                new THREE.ConeGeometry(1.1 + (Math.abs(i) % 2) * 0.4, 3.2, 8),
                treeMat
            );
            canopy.position.set(i, 0.8, -3.8 - (Math.abs(i) % 3) * 0.8);
            this.ndolaGroup.add(canopy);
        }

        this.fireLight = new THREE.PointLight(0xff4400, 2.5, 16);
        this.fireLight.position.set(2.2, 1.2, -3.2);
        this.ndolaGroup.add(this.fireLight);

        this.albertinaPlane = new THREE.Group();
        const planeMat = new THREE.MeshStandardMaterial({ color: 0x1e242b, metalness: 0.5 });
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 2.4, 12), planeMat);
        fuselage.rotation.z = Math.PI / 2;
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 2.8), planeMat);
        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xff5500 })
        );
        flame.position.set(-0.3, -0.05, 0.55);

        this.albertinaPlane.add(fuselage, wing, flame);
        this.albertinaPlane.position.set(-4.5, 3.6, -2.5);
        this.ndolaGroup.add(this.albertinaPlane);
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