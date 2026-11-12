/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - ÖVRE PLAN: POJKRUMMET v2.0 (scene1_boyroom.js)
 * Spelets interaktiva startpunkt efter prologen! Tjejsnack, fotboll, The Shadows
 * på golvet, pappans oväntade hemkomst, mellanölen och toalettbesöket.
 * ============================================================================
 */

window.Engine.registerScene('scene1_boyroom', {
    turntablePlatter: null,
    isPlayingRecord: false,
    bedLampLight: null,

    init() {
        const R = window.Renderer;
        const gs = window.GameState;
        if (!R || !gs) return;

        R.clearScene(0x181c22, 0.012);
        gs.webgl.cameraMode = 'room_25d';

        gs.player.x = 520;
        gs.player.y = 635;
        gs.player.direction = 'right';

        gs.companion.x = 760;
        gs.companion.y = 600;
        gs.companion.direction = 'left';

        this.isPlayingRecord = gs.getFlag('playedShadowsRecord');

        this._buildPanelledRoom(R);
        this._buildStairsDownDoor(R);
        this._buildKrypinDoor(R);
        this._buildWindowWithBlinds(R);
        this._buildDeskChairAndWickerBasket(R, gs);
        this._buildBedAndWallShelves(R, gs);
        this._buildHangingLuteAndPosters(R);
        this._buildFloorRecordPlayerAndSleeves(R);

        R.spawnMainActors(true);
    },

    onEnter() {
        const gs = window.GameState;
        const V = window.VoiceEngine;

        if (!gs.getFlag('boyroomStartIntro')) {
            gs.setFlag('boyroomStartIntro', true);
            V.speakSequence([
                {
                    speaker: 'conny',
                    text: 'Hörru Lasse, sluta deppa över att du spillde kalops på tröjan framför Britt-Marie i matsalen idag! Dra igång The Shadows på grammofonen på golvet å snacka lite med mej istället!'
                },
                {
                    speaker: 'lasse',
                    text: 'Hon log faktiskt mot mig, Conny! Ända tills du drog skämtet om magister Karlssons tupé. Men visst, låt oss snurra igång en platta på mattan.'
                }
            ]);
        }
    },

    update(dt, timestamp) {
        const t = timestamp * 0.001;
        if (this.turntablePlatter && this.isPlayingRecord) {
            this.turntablePlatter.rotation.y += dt * 4.5;
        }
        if (this.bedLampLight) {
            this.bedLampLight.intensity = 0.95 + Math.sin(t * 4) * 0.03;
        }
    },

    _buildPanelledRoom(R) {
        const panelCanvas = document.createElement('canvas');
        panelCanvas.width = 256;
        panelCanvas.height = 256;
        const pCtx = panelCanvas.getContext('2d');
        pCtx.fillStyle = '#d8d4c8';
        pCtx.fillRect(0, 0, 256, 256);
        for (let x = 0; x < 256; x += 16) {
            pCtx.fillStyle = 'rgba(90, 85, 75, 0.25)';
            pCtx.fillRect(x, 0, 2, 256);
            pCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            pCtx.fillRect(x + 2, 0, 2, 256);
        }
        const panelTex = new THREE.CanvasTexture(panelCanvas);
        panelTex.wrapS = THREE.RepeatWrapping;
        panelTex.wrapT = THREE.RepeatWrapping;
        panelTex.repeat.set(16, 2);

        const ambient = new THREE.AmbientLight(0xfff6e8, 0.62);
        R.roomGroup.add(ambient);

        const sunLight = new THREE.DirectionalLight(0xffeedd, 0.75);
        sunLight.position.set(-3, 7, 6);
        sunLight.castShadow = true;
        R.roomGroup.add(sunLight);

        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x7a756c,
            map: R.proceduralTextures.fabric,
            roughness: 0.85
        });
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 12), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        R.roomGroup.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({
            map: panelTex,
            bumpMap: panelTex,
            bumpScale: 0.012,
            roughness: 0.75
        });
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), wallMat);
        backWall.position.set(0, 4.0, -3.5);
        backWall.receiveShadow = true;
        R.roomGroup.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), wallMat);
        leftWall.position.set(-11.5, 4.0, 1.5);
        leftWall.rotation.y = Math.PI / 2;
        R.roomGroup.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), wallMat);
        rightWall.position.set(11.5, 4.0, 1.5);
        rightWall.rotation.y = -Math.PI / 2;
        R.roomGroup.add(rightWall);
    },

    _buildStairsDownDoor(R) {
        const group = new THREE.Group();
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, map: R.proceduralTextures.wood, roughness: 0.5 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xf0ece1, roughness: 0.6 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 3.3, 0.18), frameMat);
        frame.position.y = 1.65;
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.1, 0.22), doorMat);
        door.position.y = 1.55;

        group.add(frame, door);
        group.position.set(-6.2, 0, -3.35);
        R.roomGroup.add(group);

        R.registerInteractive(door, {
            id: 'trappa_ner_hall',
            name: 'Dörr ut till Övre Hallen & Trappan ner',
            walkX: 160,
            walkY: 600,
            lookAt: 'left'
        });
    },

    _buildKrypinDoor(R) {
        const group = new THREE.Group();
        const doorMat = new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 0.7 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a8275, roughness: 0.7 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.45, 0.16), frameMat);
        frame.position.y = 1.22;
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.30, 0.20), doorMat);
        door.position.y = 1.15;

        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.22, 0.04),
            new THREE.MeshStandardMaterial({ color: 0xb52222 })
        );
        sign.position.set(0, 1.65, 0.12);

        group.add(frame, door, sign);
        group.position.set(5.9, 0, -3.35);
        R.roomGroup.add(group);

        R.registerInteractive(door, {
            id: 'dorr_mitt_krypin',
            name: 'Låg vindsdörr till "Mitt krypin"',
            walkX: 1120,
            walkY: 595,
            lookAt: 'right'
        });
    },

    _buildWindowWithBlinds(R) {
        const winGroup = new THREE.Group();
        const whiteWood = new THREE.MeshStandardMaterial({ color: 0xf2efe9, roughness: 0.5 });
        const blindMat = new THREE.MeshStandardMaterial({ color: 0xdcd7c9, roughness: 0.4 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.1, 0.16), whiteWood);
        const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 1.85), new THREE.MeshBasicMaterial({ color: 0x3b526b }));
        sky.position.z = 0.06;
        winGroup.add(frame, sky);

        for (let y = -0.75; y <= 0.75; y += 0.15) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.03, 0.04), blindMat);
            slat.position.set(0, y, 0.08);
            slat.rotation.x = 0.3;
            winGroup.add(slat);
        }

        const sill = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.08, 0.35), whiteWood);
        sill.position.set(0, -1.05, 0.14);
        const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.10, 0.26, 12),
            new THREE.MeshStandardMaterial({ color: 0xa84a28, roughness: 0.7 })
        );
        pot.position.set(-0.55, -0.88, 0.16);
        const snakeLeaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.65, 6),
            new THREE.MeshStandardMaterial({ color: 0x2b5e2e, roughness: 0.5 })
        );
        snakeLeaf.position.set(-0.55, -0.45, 0.16);
        winGroup.add(sill, pot, snakeLeaf);

        winGroup.position.set(-3.6, 2.45, -3.4);
        R.roomGroup.add(winGroup);

        R.registerInteractive(frame, {
            id: 'pojkrum_fonster',
            name: 'Fönster med persienner och svärmorstunga',
            walkX: 350,
            walkY: 575,
            lookAt: 'front'
        });
    },

    _buildDeskChairAndWickerBasket(R, gs) {
        const deskGroup = new THREE.Group();
        const whitePaint = new THREE.MeshStandardMaterial({ color: 0xedeae2, roughness: 0.45 });
        const teakTopMat = new THREE.MeshStandardMaterial({ color: 0x7c4824, map: R.proceduralTextures.wood, roughness: 0.35 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.09, 1.05), teakTopMat);
        top.position.set(0, 1.18, 0);
        top.castShadow = true;
        deskGroup.add(top);

        const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.12, 0.98), whitePaint);
        drawerUnit.position.set(0.62, 0.56, 0);
        drawerUnit.castShadow = true;
        deskGroup.add(drawerUnit);

        [0.25, 0.50, 0.75, 1.0].forEach(dy => {
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.22, 0.04, 0.06),
                new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.6 })
            );
            handle.position.set(0.62, dy, 0.50);
            deskGroup.add(handle);
        });

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 0.95), whitePaint);
        leftLeg.position.set(-0.98, 0.57, 0);
        deskGroup.add(leftLeg);

        const chairGroup = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16), whitePaint);
        seat.position.y = 0.68;
        chairGroup.add(seat);
        for (let s = -2; s <= 2; s++) {
            const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6), whitePaint);
            spindle.position.set(s * 0.08, 0.96, -0.22);
            chairGroup.add(spindle);
        }
        chairGroup.position.set(-0.35, 0, 0.65);
        chairGroup.rotation.y = 0.35;
        deskGroup.add(chairGroup);

        const basketMat = new THREE.MeshStandardMaterial({
            color: 0x8c5828,
            map: R.proceduralTextures.fabric,
            roughness: 0.85
        });
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.25, 0.52, 16), basketMat);
        basket.position.set(-1.38, 0.26, 0.25);
        basket.castShadow = true;

        const magStack = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.28, 0.22),
            new THREE.MeshStandardMaterial({ color: 0xe6d8b5 })
        );
        magStack.position.set(-1.38, 0.48, 0.25);
        magStack.rotation.z = 0.18;
        deskGroup.add(basket, magStack);

        deskGroup.position.set(-3.3, 0, -2.55);
        R.roomGroup.add(deskGroup);

        R.registerInteractive(drawerUnit, {
            id: 'pojkrum_skrivbord',
            name: 'Skrivbord med fyra lådor',
            walkX: 410,
            walkY: 590,
            lookAt: 'front'
        });

        R.registerInteractive(basket, {
            id: 'flätad_tidningskorg',
            name: 'Flätad tidningskorg (Full med serietidningar & skolböcker)',
            walkX: 295,
            walkY: 605,
            lookAt: 'left'
        });
    },

    _buildBedAndWallShelves(R, gs) {
        const bedGroup = new THREE.Group();
        const frameWood = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.5 });

        const quiltCanvas = document.createElement('canvas');
        quiltCanvas.width = 256;
        quiltCanvas.height = 128;
        const qCtx = quiltCanvas.getContext('2d');
        const hexColors = ['#2b2b2b', '#8c3b2b', '#d9c8a9', '#4a6278', '#6e5238'];
        for (let y = 0; y < 128; y += 24) {
            for (let x = 0; x < 256; x += 24) {
                qCtx.fillStyle = hexColors[((x + y) / 24) % hexColors.length];
                qCtx.beginPath();
                qCtx.arc(x + 12, y + 12, 11, 0, Math.PI * 2);
                qCtx.fill();
            }
        }
        const quiltMat = new THREE.MeshStandardMaterial({
            map: new THREE.CanvasTexture(quiltCanvas),
            roughness: 0.85
        });

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 1.35), quiltMat);
        mattress.position.set(0, 0.52, 0);
        mattress.castShadow = true;
        bedGroup.add(mattress);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 1.38), frameWood);
        headboard.position.set(-1.68, 0.65, 0);
        const footboard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 1.38), frameWood);
        footboard.position.set(1.68, 0.48, 0);
        bedGroup.add(headboard, footboard);

        const bagMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.65 });
        const blackBag = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.36), bagMat);
        blackBag.position.set(-1.05, 0.98, -0.15);
        blackBag.rotation.y = 0.25;
        blackBag.castShadow = true;
        bedGroup.add(blackBag);

        R.registerInteractive(blackBag, {
            id: 'svart_sängväska',
            name: 'Svart skolväska på sängen (Med pilsner & betyg)',
            walkX: 675,
            walkY: 585,
            lookAt: 'front'
        });

        const shelfPlank1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.36), frameWood);
        shelfPlank1.position.set(-0.6, 1.95, -0.52);
        const shelfPlank2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.36), frameWood);
        shelfPlank2.position.set(1.0, 2.25, -0.52);
        bedGroup.add(shelfPlank1, shelfPlank2);

        const plushie = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })
        );
        plushie.position.set(1.45, 2.42, -0.48);
        const pomPom = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xfff8e7 })
        );
        pomPom.position.set(1.35, 1.75, -0.38);
        bedGroup.add(plushie, pomPom);

        this.bedLampLight = new THREE.PointLight(0xffcc77, 0.95, 7);
        this.bedLampLight.position.set(-1.1, 1.65, -0.2);
        bedGroup.add(this.bedLampLight);

        bedGroup.position.set(2.15, 0, -2.55);
        R.roomGroup.add(bedGroup);

        R.registerInteractive(shelfPlank2, {
            id: 'vägghylla_prylar',
            name: 'Konsolhylla med LP-skivor, souvenirer och pom-pom-bollar',
            walkX: 880,
            walkY: 585,
            lookAt: 'front'
        });
    },

    _buildHangingLuteAndPosters(R) {
        const luteGroup = new THREE.Group();
        const spruceMat = new THREE.MeshStandardMaterial({ color: 0xd99b4e, roughness: 0.35 });
        const darkBackMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 0.4 });
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x8c2d19, roughness: 0.8 });

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), spruceMat);
        body.scale.set(1.0, 1.25, 0.42);
        const soundHole = new THREE.Mesh(
            new THREE.CircleGeometry(0.11, 14),
            new THREE.MeshBasicMaterial({ color: 0x1a110a })
        );
        soundHole.position.set(0, 0.05, 0.17);

        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.72, 0.06), darkBackMat);
        neck.position.set(0, 0.65, 0);

        const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 0.03), strapMat);
        strapLeft.position.set(-0.18, 0.68, 0.04);
        strapLeft.rotation.z = -0.32;
        const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.03), strapMat);
        strapRight.position.set(0.12, 0.82, 0.04);
        strapRight.rotation.z = 0.25;

        luteGroup.add(body, soundHole, neck, strapLeft, strapRight);
        luteGroup.rotation.z = -0.48;
        luteGroup.position.set(-0.85, 2.75, -3.40);
        R.roomGroup.add(luteGroup);

        R.registerInteractive(body, {
            id: 'svensk_luta',
            name: 'Svensk luta med broderat axelband på väggen',
            walkX: 565,
            walkY: 575,
            lookAt: 'front'
        });

        const posterMat = new THREE.MeshBasicMaterial({ color: 0xcfd4d8 });
        const bigPoster = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.25), posterMat);
        bigPoster.position.set(0.95, 3.10, -3.42);
        R.roomGroup.add(bigPoster);

        R.registerInteractive(bigPoster, {
            id: 'pop_affisch',
            name: 'Popaffischer (Cliff Richard, The Shadows & Elvis 1961)',
            walkX: 730,
            walkY: 575,
            lookAt: 'front'
        });
    },

    _buildFloorRecordPlayerAndSleeves(R) {
        const phonoGroup = new THREE.Group();
        const caseMat = new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.5 });
        const vinylMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.15, metalness: 0.4 });
        const labelMat = new THREE.MeshBasicMaterial({ color: 0xd62828 });

        const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 0.58), caseMat);
        base.position.y = 0.09;
        base.castShadow = true;
        phonoGroup.add(base);

        this.turntablePlatter = new THREE.Group();
        this.turntablePlatter.position.set(0, 0.20, 0);
        const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.015, 20), vinylMat);
        const label = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14), labelMat);
        this.turntablePlatter.add(vinyl, label);
        phonoGroup.add(this.turntablePlatter);

        const speakerBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.55, 0.48),
            new THREE.MeshStandardMaterial({ color: 0x6e4224, roughness: 0.5 })
        );
        speakerBox.position.set(0.68, 0.28, 0.12);
        speakerBox.rotation.y = -0.35;
        phonoGroup.add(speakerBox);

        const sleevePositions = [
            [-0.65, 0.35, 0.22, 0x2b547e],
            [-0.45, -0.45, -0.15, 0xb8332a],
            [0.25, 0.52, 0.40, 0x222222],
            [0.85, -0.35, -0.28, 0xd9a74a]
        ];
        sleevePositions.forEach(([sx, sz, rot, col], idx) => {
            const sleeve = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.015, 0.42),
                new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
            );
            sleeve.position.set(sx, 0.01, sz);
            sleeve.rotation.y = rot;
            phonoGroup.add(sleeve);

            if (idx === 1) {
                R.registerInteractive(sleeve, {
                    id: 'skivkonvolut_shadows',
                    name: 'EP-skivor på golvet ("The Shadows – Apache" & "Jack Ross")',
                    walkX: 600,
                    walkY: 660,
                    lookAt: 'right'
                });
            }
        });

        phonoGroup.position.set(0.35, 0, -0.75);
        R.roomGroup.add(phonoGroup);

        R.registerInteractive(base, {
            id: 'golv_grammofon',
            name: 'Bärbar 60-tals resgrammofon på golvet',
            walkX: 640,
            walkY: 650,
            lookAt: 'front'
        });
    },

    onInteract(hotspotId, verb, selectedItem) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'conny_npc':
                if (verb === 'PRATA MED') {
                    this._openBoyroomTeenDialogue();
                    return true;
                }
                break;

            case 'svart_sängväska':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Min svarta skolväska på sängöverkastet. Där inne gömmer sig tre ljumna pilsner och mitt vårterminsbetyg.');
                    return true;
                }
                if (verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    if (A) A.playSFX('bottles_clink');
                    gs.addItem('betyg_engelska');
                    gs.addItem('pilsner_tom');

                    if (gs.getFlag('listenedToRadio') && !gs.getFlag('drankNerveBeer')) {
                        gs.setFlag('drankNerveBeer', true);
                        gs.setFlag('needsBathroom', true);
                        V.speakSequence([
                            {
                                speaker: 'lasse',
                                text: 'Efter nyheten om Dag Hammarskjöld på radion behöver vi banne mig styrketår! Vi knäpper varsin ljummen pilsner ur skolväskan och sveper den!'
                            },
                            {
                                speaker: 'conny',
                                text: 'Ah, den satt där den skulle! Nu är vi redo att rädda världen, Lasse!'
                            },
                            {
                                speaker: 'lasse',
                                text: 'Vänta... öl på tom mage och kallsvettig nervositet... Nu måste jag akut gå på muggen här utanför i övre hallen innan vi gör nåt annat!'
                            }
                        ]);
                        return true;
                    }

                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag plockar upp en pilsnerflaska och mitt vårterminsbetyg med en stark trea i engelska! Men 1954 års världsatlas ligger inte i väskan...'
                        },
                        {
                            speaker: 'conny',
                            text: 'Kolla i den flätade tidningskorgen bredvid skrivbordet, där brukar vi ju slänga alla böcker!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'flätad_tidningskorg':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En flätad tidningskorg sprängfylld med Bildjournalen, Rekord-Magasinet och gamla skolböcker.');
                    return true;
                }
                if (verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    if (gs.hasItem('skolatlas_1954')) {
                        V.speak('lasse', 'Jag har redan räddat 1954 års världsatlas ur korgen.');
                        return true;
                    }
                    gs.addItem('skolatlas_1954');
                    gs.setFlag('openedSchoolBag', true);
                    V.speak(
                        'lasse',
                        'Längst ner under Rekord-Magasinet låg den! Folkskolans Stora Världsatlas från 1954 med smörfläckar över halva Afrika!'
                    );
                    return true;
                }
                break;

            case 'golv_grammofon':
            case 'skivkonvolut_shadows':
                this.isPlayingRecord = !this.isPlayingRecord;
                gs.setFlag('playedShadowsRecord', this.isPlayingRecord);
                if (A) A.playSFX('pickup');
                if (this.isPlayingRecord) {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag lägger på The Shadows med "Apache" på resgrammofonen på golvet!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Hör på Hank Marvins gitarr, Lasse! Snacka med mej nu så ska jag berätta hur det går med tjejerna och fotbollen!'
                        }
                    ]);
                } else {
                    V.speak('lasse', 'Jag lyfter av tonarmen.');
                }
                return true;

            case 'svensk_luta':
                if (A) A.playSFX('pickup');
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Jag drar ett dämpat mollackord på lutan på väggen...'
                    },
                    {
                        speaker: 'conny',
                        text: 'Inga sorgliga visor nu Lasse, vi har tjejer i plugget och fotboll att avhandla!'
                    }
                ]);
                return true;

            case 'dorr_mitt_krypin':
                if (verb === 'GÅ TILL' || verb === 'ÖPPNA' || verb === 'ANVÄND') {
                    window.Engine.loadScene('villa_krypin');
                    return true;
                }
                break;

            case 'trappa_ner_hall':
                if (!gs.getFlag('dadCameHome')) {
                    V.speak(
                        'conny',
                        'Vart ska du ta vägen Lasse? Stanna här i rummet å snacka klart med mej om Britt-Marie i 2:a ring å fotbollen först!'
                    );
                    return true;
                }
                window.Engine.loadScene('villa_ovre_hall');
                return true;
        }

        return false;
    },

    _openBoyroomTeenDialogue() {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        const opts = [];

        if (!gs.getFlag('talkedGirlsAndFootball')) {
            opts.push({
                text: 'Tror du verkligen Britt-Marie i 2:a ring tittade på mig i skolmatsalen idag, Conny?',
                onSelect: () => {
                    window.Engine.endDialogue();
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Ärligt talat Conny, tror du Britt-Marie i 2:a ring tittade på mig i matsalen idag, eller flinade hon bara åt kalopsfläcken?'
                        },
                        {
                            speaker: 'conny',
                            text: 'Klart tjejen spanade in dej, Lasse! Men ska du ha nån riktig chans på skoldansen på fredag måste du låna min Brylcreem å lära dej finta bort tilt-spärren på flipperspelet vid Shell-macken!'
                        }
                    ], () => this._openBoyroomTeenDialogue());
                }
            });

            opts.push({
                text: 'Vad tror du om fotbollen i höst då? Tar IFK Norrköping eller Åtvidaberg hem det?',
                onSelect: () => {
                    window.Engine.endDialogue();
                    gs.setFlag('talkedGirlsAndFootball', true);
                    gs.setFlag('dadCameHome', true);

                    setTimeout(() => {
                        if (A) A.playSFX('footstep_wood');
                    }, 1200);

                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Vad tror du om fotbollen i höst då, Conny? Håller Pekings guldform eller kommer Åtvidaberg ikapp?'
                        },
                        {
                            speaker: 'conny',
                            text: 'Äh, så länge inte domarn är mutad så... VÄNTA LITE! Hörde du dä där?!'
                        },
                        {
                            speaker: 'pappa',
                            text: '(Nerifrån hallen:) Åh herregud... hela världen rämnar... allt hopp är ute... var la jag Treo-röret?!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Dä va farsan som kom hem och smällde igen ytterdörren! Mitt på blanka eftermiddan?! Han brukar ju aldrig lämna SAAB:s ritkontor före sju! Kom Lasse, vi går ner i hallen å slår på AGA-radion för att höra vad som har hänt i världen!'
                        }
                    ]);
                }
            });
        } else if (!gs.getFlag('listenedToRadio')) {
            opts.push({
                text: 'Varför lät din farsa så förtvivlad när han kom hem?',
                onSelect: () => {
                    window.Engine.endDialogue();
                    V.speak('conny', 'Ingen aning, han lät helt knäckt! Vi tar trappan ner till bottenplan och slår på AGA-radion på teakskänken!');
                }
            });
        } else if (!gs.getFlag('drankNerveBeer')) {
            opts.push({
                text: 'De har skjutit ner Dag Hammarskjöld i Ndola! Vad fan tar vi oss till, Conny?!',
                onSelect: () => {
                    window.Engine.endDialogue();
                    V.speak('conny', 'Jag skakar i hela kroppen av ilska, Lasse! Öppna din svarta väska på sängen så tar vi varsin ljummen pilsner för att lugna nerverna å tänka ut en plan!');
                }
            });
        } else {
            opts.push({
                text: 'Akta dig Conny, efter den där pilsnern måste jag akut in på muggen i övre hallen!',
                onSelect: () => {
                    window.Engine.endDialogue();
                    V.speak('conny', 'Skynda dej in på badrummet i övre hallen då innan du spricker, Lasse!');
                }
            });
        }

        opts.push({
            text: 'Vi hörs strax. (Avsluta samtal)',
            onSelect: () => window.Engine.endDialogue()
        });

        window.Engine.startDialogue(opts);
    }
});