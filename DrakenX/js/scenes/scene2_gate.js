/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - SCEN 2: SAAB-GRINDEN & RONDELLEN (scene2_gate.js)
 * Maxad 2.5D/3D nattscen med Shell-macken vid rondellen, vaktkur, glappande
 * larmkablar, Red Herrings, Överkonstapel Gryms 1961 Polis-Plymouth och
 * raggarkungen Bultens däckbrännande Cheva -57 i full 3D-action!
 * ============================================================================
 */

window.Engine.registerScene('scene2_gate', {
    policeCarGroup: null,
    copActor: null,
    bultenCarGroup: null,
    sparkLight: null,
    sparkMesh: null,
    sirenLight: null,
    shellLight: null,

    chaseSequence: {
        active: false,
        timer: 0,
        bultenX: -14.0,
        policeX: 0.2
    },

    init() {
        const R = window.Renderer;
        const gs = window.GameState;
        if (!R || !gs) return;

        R.clearScene(0x090d14, 0.022, { exposure: 3.4, bloom: 0.55, bloomThreshold: 0.9, vignette: 0.42, shadowTint: [0.82, 0.93, 1.22], highTint: [1.08, 1.0, 0.86], saturation: 1.12 });
        gs.webgl.cameraMode = 'room_25d';

        gs.player.x = 220;
        gs.player.y = 635;
        gs.player.direction = 'right';

        gs.companion.x = 110;
        gs.companion.y = 615;
        gs.companion.direction = 'right';

        this.chaseSequence.active = false;
        this.chaseSequence.timer = 0;

        this._buildNightGroundAndSky(R);
        this._buildShellStationCorner(R);
        this._buildRoundaboutLampPost(R);
        this._buildNewspaperStandRedHerring(R);
        this._buildSaabFenceAndWarningSign(R);
        this._buildGuardBoothAndThermos(R);
        this._buildSparkingAlarmBoxAndVent(R, gs);
        this._buildPoliceAndBultenCars(R, gs);
        this._buildSignpost(R);

        R.spawnMainActors(true);
    },

    onEnter() {
        const gs = window.GameState;
        if (!gs.getFlag('gateIntroPlayed')) {
            gs.setFlag('gateIntroPlayed', true);
            window.VoiceEngine.speakSequence([
                {
                    speaker: 'lasse',
                    text: 'Kolla borta vid SAAB-grinden, Conny! Överkonstapel Grym står parkerad mitt framför vaktkuren med sin svartvita Plymouth!'
                },
                {
                    speaker: 'conny',
                    text: 'Lugn i stormen! Bulten står säkert redan å puttrar med Chevan bakom Shell-macken. Vi behöver bara ge honom en tydlig signal vid gatlyktan i rondellen så brakar helvetet lös!'
                }
            ]);
        }
    },

    update(dt, timestamp) {
        const t = timestamp * 0.001;

        if (this.sparkLight && this.sparkMesh) {
            const isSparking = Math.sin(t * 28) > 0.82 && Math.cos(t * 11) > 0.2;
            this.sparkLight.intensity = isSparking ? 2.2 : 0.05;
            this.sparkMesh.visible = isSparking;
        }

        if (this.sirenLight && this.policeCarGroup && this.policeCarGroup.visible) {
            const sirenActive = this.chaseSequence.active;
            this.sirenLight.intensity = sirenActive ? (1.8 + Math.sin(t * 35) * 1.6) : 0.35;
        }

        if (this.chaseSequence.active) {
            this.chaseSequence.timer += dt;
            const cs = this.chaseSequence;

            if (this.bultenCarGroup) {
                this.bultenCarGroup.visible = true;
                cs.bultenX += dt * 11.5;
                this.bultenCarGroup.position.x = cs.bultenX;
                this.bultenCarGroup.position.y = Math.abs(Math.sin(t * 50)) * 0.04;
                this.bultenCarGroup.rotation.y = Math.sin(cs.timer * 4.5) * 0.18;
            }

            if (cs.timer > 2.2) {
                if (this.copActor) this.copActor.group.visible = false;
                if (this.policeCarGroup) {
                    cs.policeX += dt * 10.2;
                    this.policeCarGroup.position.x = cs.policeX;
                    this.policeCarGroup.rotation.z = -0.04;
                }
            }

            if (cs.policeX > 18) {
                this.chaseSequence.active = false;
                if (this.bultenCarGroup) this.bultenCarGroup.visible = false;
                if (this.policeCarGroup) this.policeCarGroup.visible = false;
            }
        }
    },

    _buildNightGroundAndSky(R) {
        const ambient = new THREE.AmbientLight(0x28364a, 0.52);
        R.roomGroup.add(ambient);

        const moonLight = new THREE.DirectionalLight(0x8ab4f8, 0.65);
        moonLight.position.set(-5, 11, 6);
        moonLight.castShadow = true;
        R.roomGroup.add(moonLight);

        const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.45, metalness: 0.15 });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), asphaltMat);
        road.rotation.x = -Math.PI / 2;
        road.receiveShadow = true;
        R.roomGroup.add(road);

        const curbMat = new THREE.MeshStandardMaterial({ color: 0x5a626e, roughness: 0.8 });
        const curb = new THREE.Mesh(new THREE.BoxGeometry(30, 0.16, 1.4), curbMat);
        curb.position.set(0, 0.08, -2.6);
        curb.receiveShadow = true;
        R.roomGroup.add(curb);

        const skySilMat = new THREE.MeshBasicMaterial({ color: 0x0b1018 });
        const distantHangar = new THREE.Mesh(new THREE.BoxGeometry(14, 3.8, 1.5), skySilMat);
        distantHangar.position.set(3.5, 1.9, -7.5);
        R.roomGroup.add(distantHangar);
    },

    // Vägvisare till de nya miljöerna (Shell-macken och centrum)
    _buildSignpost(R) {
        const mkSign = (text, y, id, name, rot) => {
            const tex = document.createElement('canvas');
            tex.width = 512; tex.height = 160;
            const g = tex.getContext('2d');
            g.fillStyle = '#1d4e89'; g.fillRect(0, 0, 512, 160);
            g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(8, 8, 496, 144);
            g.fillStyle = '#ffffff'; g.font = 'bold 46px Oswald, Impact, sans-serif';
            g.textAlign = 'center'; g.textBaseline = 'middle';
            text.split('\n').forEach((l, i, a) => g.fillText(l, 256, 80 + (i - (a.length - 1) / 2) * 52));
            const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.55),
                new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tex), fog: false }));
            m.position.set(3.2, y, 0.9);
            R.roomGroup.add(m);
            R.registerInteractive(m, { id, name, walkX: 940, walkY: 650, lookAt: rot });
        };
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x666c74, metalness: 0.4, roughness: 0.5 }));
        pole.position.set(3.2, 1.25, 0.85);
        R.roomGroup.add(pole);
        mkSign('← SHELL-\nMACKEN', 2.15, 'vagvisare_shell', 'Vägvisare: Shell-macken', 'left');
        mkSign('LINKÖPING C →\nSTORA TORGET', 1.5, 'vagvisare_centrum', 'Vägvisare: centrum', 'right');
    },

    _buildShellStationCorner(R) {
        const shellGroup = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, metalness: 0.5, roughness: 0.4 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 4.2, 12), poleMat);
        pole.position.set(0, 2.1, 0);
        shellGroup.add(pole);

        const signYellow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.52, 0.16, 18),
            new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.65 })
        );
        signYellow.rotation.x = Math.PI / 2;
        signYellow.position.set(0, 4.1, 0);
        const signRedBorder = new THREE.Mesh(
            new THREE.BoxGeometry(1.15, 0.28, 0.20),
            new THREE.MeshStandardMaterial({ color: 0xd61f1f })
        );
        signRedBorder.position.set(0, 3.65, 0);
        shellGroup.add(signYellow, signRedBorder);

        this.shellLight = new THREE.PointLight(0xffbb33, 1.1, 9);
        this.shellLight.position.set(0.3, 3.8, 0.8);
        shellGroup.add(this.shellLight);

        const pumpBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 1.45, 0.42),
            new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.35 })
        );
        pumpBody.position.set(0.95, 0.72, 0.3);
        pumpBody.castShadow = true;
        const pumpDial = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.32, 0.44),
            new THREE.MeshBasicMaterial({ color: 0xf5f0dc })
        );
        pumpDial.position.set(0.95, 1.12, 0.3);
        shellGroup.add(pumpBody, pumpDial);

        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.32, 0.88, 16),
            new THREE.MeshStandardMaterial({ color: 0x1d4e89, roughness: 0.5, metalness: 0.4 })
        );
        barrel.position.set(1.75, 0.44, 0.45);
        barrel.castShadow = true;
        shellGroup.add(barrel);

        shellGroup.position.set(-6.4, 0, -2.5);
        R.roomGroup.add(shellGroup);

        R.registerInteractive(pumpBody, {
            id: 'shell_mack',
            name: 'Shell-macken vid rondellen (Connys flipperspelshak)',
            walkX: 95,
            walkY: 600,
            lookAt: 'left'
        });

        R.registerInteractive(barrel, {
            id: 'red_herring_oljetunna',
            name: 'Oljetunna med trassel vid Shell-macken',
            walkX: 165,
            walkY: 605,
            lookAt: 'left'
        });
    },

    _buildRoundaboutLampPost(R) {
        const lampGroup = new THREE.Group();
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x2c353d, metalness: 0.7, roughness: 0.4 });

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 4.4, 12), ironMat);
        post.position.y = 2.2;
        post.castShadow = true;

        const fixture = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffe8a3 })
        );
        fixture.position.set(0.35, 4.25, 0.2);

        const streetLight = new THREE.PointLight(0xffdd88, 1.35, 12);
        streetLight.position.set(0.35, 4.0, 0.5);
        streetLight.castShadow = true;

        const signDisc = new THREE.Mesh(
            new THREE.CylinderGeometry(0.34, 0.34, 0.04, 18),
            new THREE.MeshStandardMaterial({ color: 0x004b93, roughness: 0.3 })
        );
        signDisc.rotation.x = Math.PI / 2;
        signDisc.position.set(0, 1.95, 0.12);

        lampGroup.add(post, fixture, streetLight, signDisc);
        lampGroup.position.set(-3.4, 0, -2.1);
        R.roomGroup.add(lampGroup);

        R.registerInteractive(post, {
            id: 'rondell_lykta',
            name: 'Gatlykta vid SAAB-rondellen (Signalplats till Bulten)',
            walkX: 330,
            walkY: 600,
            lookAt: 'front'
        });
    },

    _buildNewspaperStandRedHerring(R) {
        const standGroup = new THREE.Group();
        const yellowMetal = new THREE.MeshStandardMaterial({ color: 0xe6b800, roughness: 0.4 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.95, 0.12), yellowMetal);
        frame.position.y = 0.48;
        frame.rotation.x = -0.12;
        frame.castShadow = true;

        const lCanvas = document.createElement('canvas');
        lCanvas.width = 128;
        lCanvas.height = 192;
        const lCtx = lCanvas.getContext('2d');
        lCtx.fillStyle = '#fff59d';
        lCtx.fillRect(0, 0, 128, 192);
        lCtx.fillStyle = '#c62828';
        lCtx.fillRect(0, 0, 128, 34);
        lCtx.fillStyle = '#111111';
        lCtx.font = 'bold 18px sans-serif';
        lCtx.fillText('NDOLA-', 14, 70);
        lCtx.fillText('KRISEN!', 14, 94);
        lCtx.font = 'bold 13px sans-serif';
        lCtx.fillText('RAGGARNA I', 10, 138);
        lCtx.fillText('LINKÖPING!', 10, 158);

        const poster = new THREE.Mesh(
            new THREE.PlaneGeometry(0.48, 0.78),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lCanvas) })
        );
        poster.position.set(0, 0.48, 0.07);
        poster.rotation.x = -0.12;

        standGroup.add(frame, poster);
        standGroup.position.set(-2.15, 0.16, -2.35);
        R.roomGroup.add(standGroup);

        R.registerInteractive(frame, {
            id: 'red_herring_lopsedel',
            name: 'Kvällstidningens löpsedel (Hösten 1961)',
            walkX: 435,
            walkY: 595,
            lookAt: 'front'
        });
    },

    _buildSaabFenceAndWarningSign(R) {
        const fenceGroup = new THREE.Group();
        const wireMat = new THREE.MeshStandardMaterial({ color: 0x6c757d, metalness: 0.8, roughness: 0.35 });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x3b4248, metalness: 0.7, roughness: 0.4 });

        for (let fx = -1.2; fx <= 8.5; fx += 1.6) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 8), postMat);
            post.position.set(fx, 1.8, -3.1);
            fenceGroup.add(post);
        }

        [3.35, 3.50, 3.65].forEach(by => {
            const barbedWire = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.02, 0.02), wireMat);
            barbedWire.position.set(3.6, by, -2.95);
            fenceGroup.add(barbedWire);
        });

        const boomBar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 3.4, 12),
            new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 })
        );
        boomBar.rotation.z = Math.PI / 2;
        boomBar.position.set(0.2, 1.05, -2.4);
        fenceGroup.add(boomBar);

        const signBoard = new THREE.Mesh(
            new THREE.BoxGeometry(1.45, 0.85, 0.06),
            new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.4 })
        );
        signBoard.position.set(2.35, 2.15, -3.05);
        fenceGroup.add(signBoard);

        R.roomGroup.add(fenceGroup);

        R.registerInteractive(signBoard, {
            id: 'saab_varningsskylt',
            name: 'Militär varningsskylt ("SAAB Skyddsområde – Spionerilagen")',
            walkX: 825,
            walkY: 585,
            lookAt: 'front'
        });
    },

    _buildGuardBoothAndThermos(R) {
        const boothGroup = new THREE.Group();
        const boothMat = new THREE.MeshStandardMaterial({ color: 0x3b4d3e, roughness: 0.65 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x222629, roughness: 0.5 });
        const windowGlow = new THREE.MeshBasicMaterial({ color: 0xffcc66 });

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.55, 1.35), boothMat);
        cabin.position.y = 1.28;
        cabin.castShadow = true;

        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.55, 4), roofMat);
        roof.position.y = 2.82;
        roof.rotation.y = Math.PI / 4;

        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.75), windowGlow);
        win.position.set(0, 1.65, 0.68);

        const boothLight = new THREE.PointLight(0xffaa44, 0.95, 7);
        boothLight.position.set(0, 1.8, 1.2);

        const bench = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 0.45, 0.42),
            new THREE.MeshStandardMaterial({ color: 0x5c3c20 })
        );
        bench.position.set(1.15, 0.25, 0.35);

        const thermos = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.34, 12),
            new THREE.MeshStandardMaterial({ color: 0x2d6a4f, metalness: 0.5, roughness: 0.3 })
        );
        thermos.position.set(1.15, 0.64, 0.35);

        boothGroup.add(cabin, roof, win, boothLight, bench, thermos);
        boothGroup.position.set(-0.65, 0, -2.95);
        R.roomGroup.add(boothGroup);

        R.registerInteractive(cabin, {
            id: 'vaktkur',
            name: 'SAAB:s vaktkur',
            walkX: 550,
            walkY: 590,
            lookAt: 'front'
        });

        R.registerInteractive(thermos, {
            id: 'red_herring_termos',
            name: 'Polisens och nattvaktens kaffetermos',
            walkX: 645,
            walkY: 595,
            lookAt: 'front'
        });
    },

    _buildSparkingAlarmBoxAndVent(R, gs) {
        const secretGroup = new THREE.Group();

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.68, 0.22),
            new THREE.MeshStandardMaterial({ color: 0x495057, metalness: 0.6, roughness: 0.4 })
        );
        box.position.set(0, 1.65, 0);

        this.sparkMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x66ddff })
        );
        this.sparkMesh.position.set(0, 1.32, 0.14);

        this.sparkLight = new THREE.PointLight(0x44ccff, 1.5, 4.5);
        this.sparkLight.position.set(0, 1.32, 0.35);

        const ventHousing = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, 1.15, 0.65),
            new THREE.MeshStandardMaterial({ color: 0x343a40, metalness: 0.7, roughness: 0.45 })
        );
        ventHousing.position.set(1.25, 0.58, 0.15);
        ventHousing.castShadow = true;

        const grate = new THREE.Mesh(
            new THREE.PlaneGeometry(1.05, 0.85),
            new THREE.MeshStandardMaterial({ color: 0x16191d, roughness: 0.8 })
        );
        grate.position.set(1.25, 0.58, 0.48);

        secretGroup.add(box, this.sparkMesh, this.sparkLight, ventHousing, grate);
        secretGroup.position.set(4.5, 0, -2.85);
        R.roomGroup.add(secretGroup);

        R.registerInteractive(box, {
            id: 'glappande_larm',
            name: 'Stängsel med glappande larmkablar',
            walkX: 1015,
            walkY: 590,
            lookAt: 'front'
        });

        R.registerInteractive(ventHousing, {
            id: 'ventilationsschakt',
            name: 'Ventilationsschakt ner till SAAB:s bergsrum',
            walkX: 1125,
            walkY: 600,
            lookAt: 'right'
        });
    },

    _buildPoliceAndBultenCars(R, gs) {
        const alreadyDistracted = gs.getFlag('bultenTriggered');

        this.policeCarGroup = R.createCar3D('police61');
        this.policeCarGroup.position.set(0.2, 0.12, -1.65);
        this.policeCarGroup.visible = !alreadyDistracted;

        this.sirenLight = new THREE.PointLight(0x2277ff, 0.5, 8);
        this.sirenLight.position.set(-0.2, 1.85, 0);
        this.policeCarGroup.add(this.sirenLight);
        R.actorsGroup.add(this.policeCarGroup);

        this.copActor = R.createCharacterMesh('polis', {
            jacketColor: 0x14213d,
            shirtColor: 0xdbe4ee,
            pantsColor: 0x101828,
            hairColor: 0x555b6e,
            pompadour: false
        });
        this.copActor.group.position.set(1.65, 0, -1.35);
        this.copActor.group.rotation.y = -0.5;
        this.copActor.group.visible = !alreadyDistracted;
        R.actorsGroup.add(this.copActor.group);

        R.registerInteractive(this.copActor.hitbox, {
            id: 'overkonstapel_grym',
            name: 'Överkonstapel Grym (Linköpings ordningspolis)',
            walkX: 690,
            walkY: 625,
            lookAt: 'right'
        });

        this.bultenCarGroup = R.createCar3D('cheva57');
        this.bultenCarGroup.position.set(-14.0, 0.05, -0.45);
        this.bultenCarGroup.visible = false;

        const headLightBeam = new THREE.PointLight(0xffeeaa, 2.5, 14);
        headLightBeam.position.set(2.4, 0.7, 0);
        this.bultenCarGroup.add(headLightBeam);
        R.actorsGroup.add(this.bultenCarGroup);
    },

    onInteract(hotspotId, verb, selectedItem) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'vagvisare_shell':
                window.GoTo('scene2_shell', 'left');
                return true;
            case 'vagvisare_centrum':
                window.GoTo('scene2_centrum', 'left');
                return true;
            case 'shell_mack':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Shell-macken vid rondellen! Det var här inne vid flipperspelet som Conny drog in två extrabollar på rymdbanan utan att tilta maskinen en enda gång!'
                    },
                    {
                        speaker: 'conny',
                        text: 'Stämmer på pricken dä, Lasse! Å Bulten står garanterat runt hörnet med Chevan å väntar på vår signal vid gatlyktan i rondellen!'
                    }
                ]);
                return true;

            case 'red_herring_oljetunna':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En blå 200-liters oljetunna med gammalt trassel. Luktar blybensin och tvåtaktsolja.');
                } else {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Hörru Conny, om vi tänder eld på trasslet i oljetunnan så får vi ju en rökridå!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Är du helt från vettet?! Om Shell-macken flyger i luften brinner ju mitt flipperspelsrekord inne! Använd gatlyktan vid rondellen för att ge Bulten signalen istället!'
                        }
                    ]);
                }
                return true;

            case 'red_herring_lopsedel':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Kvällstidningens löpsedel: "CHOCK I NDOLA – FN I KRIS". Och längst ner står det: "RAGGARPLÅGAN I LINKÖPING: LÄKARE VARNAR FÖR BRYLKRÄM OCH V8-MULLER".'
                    },
                    {
                        speaker: 'conny',
                        text: 'Vänta bara tills överkonstapel Grym får höra Bultens raka rör, då ska han få se på raggarplåga!'
                    }
                ]);
                return true;

            case 'red_herring_termos':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En grön plåttermos med polisens och nattvaktens nattskiftskaffe.');
                } else if (verb === 'ANVÄND' && selectedItem === 'skogaholms_messmor') {
                    V.speak('conny', 'Ska du blanda fjällbrynt messmör i polisens termoskaffe?! Det vore ju ett brott mot Genèvekonventionen, Lasse!');
                } else {
                    V.speak('lasse', 'Bäst att inte röra termosen medan Överkonstapel Grym står två meter bort och blänger.');
                }
                return true;

            case 'saab_varningsskylt':
            case 'vaktkur':
                V.speak(
                    'lasse',
                    'Det står "STRÄNGT HEMLIGT SKYDDSOMRÅDE – KUNGLIGA FLYGFÖRVALTNINGEN & SAAB". Så länge polisen står här kommer vi inte en meter närmare bergsrummet.'
                );
                return true;

            case 'overkonstapel_grym':
                if (gs.getFlag('bultenTriggered')) {
                    V.speak('lasse', 'Överkonstapel Grym är redan halvvägs till Stora Torget i jakten på Bultens Cheva!');
                    return true;
                }
                gs.setFlag('talkedToGrumpyCops', true);
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Överkonstapel Grym. Linköpings suraste polis. Han håller handen på sabelkopplet och spanar efter trimmade mopeder och raggarbilar.');
                } else {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'God afton konstapeln! Fint men lite kyligt höstväder ikväll!'
                        },
                        {
                            speaker: 'polis',
                            text: 'Jaha, två slynglar i brylkräm ute och ränner mitt i natten?! Det räcker med den där förbannade raggarkungen Bulten och hans drägg som varvar V8-motorer och spelar Elvis så skattebetalarna inte får en blund i ögonen!'
                        },
                        {
                            speaker: 'polis',
                            text: 'Ser jag skymten av en enda sänkt Cheva femtisjua inatt så drar jag in körkortet ända till år 2000! Avlägsna er från SAAB:s grindar omedelbart!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Hörde du Lasse? Gubben är ju som en uppspänd råttfälla! Ge Bulten signalen borta vid gatlyktan i rondellen nu!'
                        }
                    ]);
                }
                return true;

            case 'rondell_lykta':
                if (gs.getFlag('bultenTriggered')) {
                    V.speak('lasse', 'Signalen fungerade perfekt! Bulten har redan dragit med sig hela Linköpings poliskår!');
                    return true;
                }
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Gatlyktan mitt i rondellen framför Shell-macken. Om vi slår en pilsnerflaska i stolpen eller låter Conny busvissla härifrån så hör Bulten oss direkt!');
                    return true;
                }
                if (verb === 'ANVÄND' || verb === 'PLOCKA UPP' || verb === 'ÖPPNA' || verb === 'PRATA MED') {
                    this._startBultenDistractionShow();
                    return true;
                }
                break;

            case 'conny_npc':
                if (verb === 'PRATA MED' || verb === 'ANVÄND') {
                    if (!gs.getFlag('bultenTriggered')) {
                        this._startBultenDistractionShow();
                    } else {
                        V.speak('conny', 'Kusten är helt fri, Lasse! Öppna ventilationsschaktet borta vid det glappande stängslet så kryper vi ner till Tors Vrede!');
                    }
                    return true;
                }
                break;

            case 'glappande_larm':
                if (!gs.getFlag('bultenTriggered')) {
                    V.speak('polis', 'Hallå där! Ge blanka tusan i SAAB:s elskåp och larmledningar om ni inte vill sova i fyllecellen!');
                    return true;
                }
                V.speak(
                    'lasse',
                    'Precis som vi visste! Larmkablarna till den här sektionen av stängslet glappar rejält. Larmet är helt urkopplat runt ventilationsschaktet!'
                );
                return true;

            case 'ventilationsschakt':
                if (!gs.getFlag('bultenTriggered')) {
                    V.speakSequence([
                        {
                            speaker: 'polis',
                            text: 'Vad i hela friden gör ni borta vid SAAB:s stängsel?! Försvinn därifrån innan jag släpper ut vakthunden!'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Det är omöjligt att krypa in så länge Överkonstapel Grym vaktar grinden. Vi måste ge Bulten signalen borta vid gatlyktan i rondellen först!'
                        }
                    ]);
                    return true;
                }

                if (verb === 'ÖPPNA' || verb === 'GÅ TILL' || verb === 'ANVÄND' || verb === 'TITTA PÅ') {
                    gs.setFlag('fenceUnlocked', true);
                    if (A) A.playSFX('pickup');
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Larmkablarna glappar och varenda polis i Linköping jagar Bultens Cheva bort mot Stora Torget! Jag lyfter bort ventilationsgallret!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Ner i schaktet nu Lasse! Klockan är snart kvart över fyra och Tors Vrede väntar på oss i bergrumskylan!'
                        }
                    ], () => {
                        window.Engine.loadScene('scene3_hangar');
                    });
                    return true;
                }
                break;
        }

        return false;
    },

    _startBultenDistractionShow() {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        gs.setFlag('bultenTriggered', true);

        if (A) {
            A.playSFX('bottles_clink');
            setTimeout(() => {
                A.playSFX('v8_cheva_burnout');
                gs.webgl.cameraShake = 0.08;
            }, 600);
            setTimeout(() => {
                A.playSFX('police_siren_1961');
            }, 2200);
        }

        this.chaseSequence.active = true;
        this.chaseSequence.timer = 0;
        this.chaseSequence.bultenX = -13.5;
        this.chaseSequence.policeX = 0.2;

        V.speakSequence([
            {
                speaker: 'conny',
                text: 'Ja klirrar till med pilsnerflaskan i lyktstolpen och drar en busvissling! Nu kommer han, Lasse!'
            },
            {
                speaker: 'bulten',
                text: 'ÄT DAMM OCH BRÄNT GUMMI, BYLINGAR! INGEN RÅR PÅ BULTENS CHEVA FEMTISJUA! LINKÖPING ROCK CITY!'
            },
            {
                speaker: 'polis',
                text: 'VAD I HELA HÄLSINGLAND?! Han sladdar ju runt rondellen utan ljuddämpare och med rävsvans i antennen! NU ÄR MÅTTET RÅGAT! På med saftblandaren, nu ska raggarsvinet buras in enligt 1951 års vägtrafikstadga!'
            },
            {
                speaker: 'lasse',
                text: 'Haha! Titta hur Överkonstapel Grym och nattvakten rivstartar iväg efter Bulten! Hela SAAB-stängslet och ventilationsschaktet ligger helt obevakade!'
            }
        ]);
    }
});