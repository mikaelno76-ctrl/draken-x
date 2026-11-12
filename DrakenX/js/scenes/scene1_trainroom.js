/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - KÄLLARPLAN: "MIN TÅGBANA" (scene1_trainroom.js)
 * Bygger Märklin-modelltågsrummet i källaren utifrån de 3 referensbilderna.
 * ============================================================================
 */

window.TrainRoom1961 = {
    trainGroup: null,
    trainAngle: 0,
    isTrainRunning: false,
    isOverdriveSpeed: false,
    signalLight: null,

    buildTrainRoom(R, gs) {
        this.isTrainRunning = gs.getFlag('trainRunning');
        this.isOverdriveSpeed = gs.getFlag('trainOverdrive');

        this._buildCollectorWallShelvesAndPlanes(R);
        this._buildPuzzleBoxStacks(R);
        this._buildMarklinTableAndBackdrop(R);
        this._buildRoundhouseAndWaterTower(R);
        this._buildAnimatedMarklinTrain(R);
    },

    updateTrain(dt, timestamp) {
        if (!this.trainGroup || !this.isTrainRunning) return;

        const speed = this.isOverdriveSpeed ? 3.4 : 1.25;
        this.trainAngle += dt * speed;

        const rx = 2.45;
        const rz = 0.82;

        this.trainGroup.children.forEach((car, idx) => {
            const a = this.trainAngle - idx * 0.24;
            const cx = Math.cos(a) * rx;
            const cz = Math.sin(a) * rz;
            const bridgeLift = cz < -0.15 ? Math.abs(cz + 0.15) * 0.22 : 0;

            car.position.set(cx, bridgeLift, cz);

            const tx = -Math.sin(a) * rx;
            const tz = Math.cos(a) * rz;
            car.rotation.y = Math.atan2(tx, tz);
        });

        if (this.signalLight) {
            this.signalLight.intensity = this.isOverdriveSpeed
                ? 1.5 + Math.sin(timestamp * 0.025) * 1.2
                : 0.8;
        }
    },

    _buildCollectorWallShelvesAndPlanes(R) {
        const shelfGroup = new THREE.Group();
        const pineMat = new THREE.MeshStandardMaterial({ color: 0xc8a26a, roughness: 0.55 });

        const backBoard = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.55, 0.06), pineMat);
        backBoard.position.set(0, 2.55, 0);
        shelfGroup.add(backBoard);

        [1.9, 2.3, 2.7, 3.1].forEach(hy => {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(5.15, 0.04, 0.28), pineMat);
            plank.position.set(0, hy, 0.14);
            shelfGroup.add(plank);
        });

        const miniColors = [0xb52222, 0x245888, 0xd9a74a, 0x2d6a4f, 0xeeeeee];
        for (let i = 0; i < 18; i++) {
            const mini = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.14, 0.10),
                new THREE.MeshStandardMaterial({ color: miniColors[i % miniColors.length] })
            );
            mini.position.set(-2.2 + i * 0.25, 2.38 + (i % 2) * 0.4, 0.16);
            shelfGroup.add(mini);
        }

        const yellowPlane = new THREE.Group();
        const yMat = new THREE.MeshStandardMaterial({ color: 0xe6c229, roughness: 0.35 });
        const gMat = new THREE.MeshStandardMaterial({ color: 0x3b5e2b, roughness: 0.45 });
        const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.65, 10), gMat);
        fuse.rotation.z = Math.PI / 2;
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.72), yMat);
        yellowPlane.add(fuse, wing);
        yellowPlane.position.set(-1.3, 3.28, 0.18);
        yellowPlane.rotation.y = 0.35;
        yellowPlane.rotation.z = 0.15;
        shelfGroup.add(yellowPlane);

        shelfGroup.position.set(-2.4, 0, -3.38);
        R.roomGroup.add(shelfGroup);

        R.registerInteractive(backBoard, {
            id: 'samlarhylla_flygplan',
            name: 'Samlarhyllor med modellflygplan och tennsoldater',
            walkX: 430,
            walkY: 575,
            lookAt: 'front'
        });
    },

    _buildPuzzleBoxStacks(R) {
        const stackGroup = new THREE.Group();
        const boxColors = [0xd64527, 0x245888, 0xe6af2e, 0x2b7a4b, 0x9e2a2b, 0x3b6e8c];

        for (let s = 0; s < 3; s++) {
            for (let b = 0; b < 6; b++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(0.56, 0.11, 0.42),
                    new THREE.MeshStandardMaterial({ color: boxColors[(s + b) % boxColors.length], roughness: 0.5 })
                );
                box.position.set(s * 0.62, 1.85 + b * 0.115, 0);
                box.rotation.y = (b % 2 === 0 ? 0.04 : -0.04);
                stackGroup.add(box);
            }
        }

        stackGroup.position.set(2.4, 0.3, -3.15);
        R.roomGroup.add(stackGroup);

        R.registerInteractive(stackGroup.children[0], {
            id: 'pusselkartonger_trave',
            name: 'Travar med 1500- och 2000-bitars pusselkartonger',
            walkX: 880,
            walkY: 575,
            lookAt: 'front'
        });
    },

    _buildMarklinTableAndBackdrop(R) {
        const tableGroup = new THREE.Group();

        const plywoodMat = new THREE.MeshStandardMaterial({
            color: 0xd8b888,
            map: R.proceduralTextures.wood,
            roughness: 0.65
        });
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x4f6d3a,
            map: R.proceduralTextures.fabric,
            roughness: 0.9
        });
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x8c7355, roughness: 0.88 });

        [[-2.8, -0.9], [0, -0.9], [2.8, -0.9], [-2.8, 0.9], [0, 0.9], [2.8, 0.9]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.88, 0.12), plywoodMat);
            leg.position.set(lx, 0.44, lz);
            leg.castShadow = true;
            tableGroup.add(leg);
        });

        const boardBase = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.08, 2.2), grassMat);
        boardBase.position.y = 0.90;
        boardBase.receiveShadow = true;
        tableGroup.add(boardBase);

        const frontRim = new THREE.Mesh(new THREE.BoxGeometry(6.08, 0.22, 0.05), plywoodMat);
        frontRim.position.set(0, 0.96, 1.12);
        const leftRim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 2.24), plywoodMat);
        leftRim.position.set(-3.02, 0.96, 0);
        const rightRim = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 2.24), plywoodMat);
        rightRim.position.set(3.02, 0.96, 0);
        tableGroup.add(frontRim, leftRim, rightRim);

        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 512;
        bgCanvas.height = 128;
        const bCtx = bgCanvas.getContext('2d');
        bCtx.fillStyle = '#8ecae6';
        bCtx.fillRect(0, 0, 512, 128);
        bCtx.fillStyle = '#38573a';
        bCtx.beginPath();
        bCtx.moveTo(0, 128); bCtx.lineTo(90, 28); bCtx.lineTo(190, 95);
        bCtx.lineTo(310, 22); bCtx.lineTo(430, 88); bCtx.lineTo(512, 35); bCtx.lineTo(512, 128);
        bCtx.fill();
        bCtx.fillStyle = '#ffffff';
        bCtx.fillRect(390, 14, 104, 28);
        bCtx.fillStyle = '#c91e1e';
        bCtx.font = 'bold 20px sans-serif';
        bCtx.fillText('Märklin', 404, 35);

        const backdropMesh = new THREE.Mesh(
            new THREE.BoxGeometry(6.04, 0.85, 0.04),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bgCanvas) })
        );
        backdropMesh.position.set(0, 1.36, -1.08);
        tableGroup.add(backdropMesh);

        const mountain = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.65, 9), rockMat);
        mountain.position.set(-1.55, 1.22, -0.55);
        mountain.scale.set(1.5, 1, 0.7);
        const tunnelPortal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.25, 12),
            new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
        );
        tunnelPortal.rotation.x = Math.PI / 2;
        tunnelPortal.position.set(-1.55, 1.05, -0.15);
        tableGroup.add(mountain, tunnelPortal);

        const trackRing = new THREE.Mesh(
            new THREE.RingGeometry(2.25, 2.62, 36),
            new THREE.MeshStandardMaterial({ color: 0x33373b, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide })
        );
        trackRing.rotation.x = -Math.PI / 2;
        trackRing.scale.set(1.0, 0.34, 1.0);
        trackRing.position.set(0, 0.955, 0);
        tableGroup.add(trackRing);

        const housePositions = [[-0.8, 0.2], [1.45, 0.35], [0.9, -0.45]];
        housePositions.forEach(([hx, hz]) => {
            const hWalls = new THREE.Mesh(
                new THREE.BoxGeometry(0.32, 0.22, 0.26),
                new THREE.MeshStandardMaterial({ color: 0xf2efe9 })
            );
            hWalls.position.set(hx, 1.04, hz);
            const hRoof = new THREE.Mesh(
                new THREE.ConeGeometry(0.26, 0.16, 4),
                new THREE.MeshStandardMaterial({ color: 0xb8332a })
            );
            hRoof.position.set(hx, 1.22, hz);
            hRoof.rotation.y = Math.PI / 4;
            tableGroup.add(hWalls, hRoof);
        });

        const treeMat = new THREE.MeshStandardMaterial({ color: 0x1e4620 });
        for (let t = 0; t < 12; t++) {
            const spruce = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 7), treeMat);
            spruce.position.set(-2.2 + t * 0.38, 1.06, (t % 2 === 0 ? 0.45 : -0.35));
            tableGroup.add(spruce);
        }

        const trafo = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.22, 0.28),
            new THREE.MeshStandardMaterial({ color: 0x1d4e89, metalness: 0.4, roughness: 0.3 })
        );
        trafo.position.set(-1.85, 1.08, 0.92);
        const redKnob = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12),
            new THREE.MeshStandardMaterial({ color: 0xd62828 })
        );
        redKnob.position.set(-1.85, 1.20, 0.92);
        tableGroup.add(trafo, redKnob);

        R.registerInteractive(trafo, {
            id: 'marklin_transformator',
            name: 'Blå Märklin-transformator (220V med röd hastighetsratt)',
            walkX: 465,
            walkY: 645,
            lookAt: 'front'
        });

        tableGroup.position.set(0.4, 0, -1.65);
        R.roomGroup.add(tableGroup);

        R.registerInteractive(backdropMesh, {
            id: 'marklin_landskap',
            name: 'Märklin-modelltågbana med alpkuliss, broar och tunnlar',
            walkX: 660,
            walkY: 625,
            lookAt: 'front'
        });
    },

    _buildRoundhouseAndWaterTower(R) {
        const industrialGroup = new THREE.Group();
        const brickMat = new THREE.MeshStandardMaterial({ color: 0x7a2e22, roughness: 0.75 });
        const roofGrey = new THREE.MeshStandardMaterial({ color: 0x7d858c, roughness: 0.5 });

        const roundhouse = new THREE.Mesh(
            new THREE.CylinderGeometry(0.75, 0.75, 0.28, 12, 1, false, 0, Math.PI * 0.85),
            brickMat
        );
        roundhouse.position.set(0.15, 1.08, -1.65);
        const rhRoof = new THREE.Mesh(
            new THREE.CylinderGeometry(0.78, 0.78, 0.04, 12, 1, false, 0, Math.PI * 0.85),
            roofGrey
        );
        rhRoof.position.set(0.15, 1.23, -1.65);

        const chimney1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.55, 8), brickMat);
        chimney1.position.set(-0.25, 1.35, -1.55);
        const chimney2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.50, 8), brickMat);
        chimney2.position.set(0.55, 1.32, -1.75);

        const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.36, 12), brickMat);
        towerBase.position.set(-2.15, 1.12, -0.85);
        const towerTank = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.20, 14), roofGrey);
        towerTank.position.set(-2.15, 1.38, -0.85);

        this.signalLight = new THREE.PointLight(0xff3300, 0.8, 3.5);
        this.signalLight.position.set(0.15, 1.45, -1.4);

        industrialGroup.add(roundhouse, rhRoof, chimney1, chimney2, towerBase, towerTank, this.signalLight);
        R.roomGroup.add(industrialGroup);

        R.registerInteractive(roundhouse, {
            id: 'lokstall_vandskiva',
            name: 'Halvmåneformat lokstall med vändskiva och växelspak',
            walkX: 660,
            walkY: 635,
            lookAt: 'front'
        });
    },

    _buildAnimatedMarklinTrain(R) {
        this.trainGroup = new THREE.Group();
        this.trainGroup.position.set(0.4, 0.99, -1.65);

        const blackMetal = new THREE.MeshStandardMaterial({ color: 0x151719, metalness: 0.7, roughness: 0.3 });
        const redChassis = new THREE.MeshStandardMaterial({ color: 0xc91e1e, roughness: 0.4 });
        const wagonColors = [0xb8332a, 0x1d4e89, 0xd99b26];

        const loco = new THREE.Group();
        const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 10), blackMetal);
        boiler.rotation.x = Math.PI / 2;
        boiler.position.y = 0.08;
        const cab = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.12), blackMetal);
        cab.position.set(0, 0.10, -0.12);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.34), redChassis);
        base.position.y = 0.02;
        const headLamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffee77 })
        );
        headLamp.position.set(0, 0.08, 0.17);
        loco.add(boiler, cab, base, headLamp);
        this.trainGroup.add(loco);

        wagonColors.forEach(col => {
            const wagon = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.11, 0.28),
                new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 })
            );
            wagon.position.y = 0.06;
            this.trainGroup.add(wagon);
        });

        R.roomGroup.add(this.trainGroup);
        this.updateTrain(0.01, 0);
    },

    handleTrainInteraction(hotspotId, verb) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'marklin_transformator':
                if (A) A.playSFX('ui_click');
                this.isTrainRunning = !this.isTrainRunning;
                gs.setFlag('trainRunning', this.isTrainRunning);

                if (this.isTrainRunning) {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag vrider upp den röda ratten på den blå Märklin-transformatorn! Det luktar varm ozon och ångloket börjar tuffa runt banan!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Kolla hur det lyser i lokets framlykta, Lasse! Om vi drar i växelspaken vid det runda lokstallet kan vi säkert skrämma ut gubben ur pannrummet!'
                        }
                    ]);
                } else {
                    this.isOverdriveSpeed = false;
                    V.speak('lasse', 'Jag vrider ner Märklin-transformatorn till noll så tåget stannar.');
                }
                return true;

            case 'lokstall_vandskiva':
                if (!this.isTrainRunning) {
                    V.speak('lasse', 'Det är ett halvmåneformat lokstall i tegel med vändskiva och ett brunt vattentorn. Men vi måste slå på strömmen på den blå Märklin-transformatorn först!');
                    return true;
                }
                if (!this.isOverdriveSpeed) {
                    this.isOverdriveSpeed = true;
                    gs.setFlag('trainOverdrive', true);
                    if (A) A.playSFX('aga_radio_tune');
                    V.speakSequence([
                        {
                            speaker: 'conny',
                            text: 'Nu lägger ja om växeln vid lokstallet och drar upp Märklin-trafon på 24 volt backström! Håll i hatten, nu går snälltåget i Mach 2 runt alpkulissen!'
                        },
                        {
                            speaker: 'pappa',
                            text: '(Inifrån pannrummet:) Vafalls?! Vem är det som kör mitt dyra Märklin-krokodillok på överväxel över viadukten?! Jag kommer ut direkt!'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Lysande Conny! Farsan blev så svettig om sin modelltågbana att han låste upp pannrumsdörren till ritkontoret!'
                        }
                    ]);
                } else {
                    V.speak('conny', 'Tåget går redan så fort i kurvorna att granarna lutar!');
                }
                return true;

            case 'marklin_landskap':
                V.speak(
                    'lasse',
                    'En gigantisk Märklin-anläggning med alpkuliss, bergstunnlar, järnvägsbroar, små hus med röda tak och granar. Farsan har byggt på den sen 1956.'
                );
                return true;

            case 'samlarhylla_flygplan':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Långa trähyllor fulla med modellbilar, tennsoldater och ett gul-grönt propellerplan högst upp.'
                    },
                    {
                        speaker: 'conny',
                        text: 'Snygga grejer, men ingenting slår en riktig J 35X Draken i skala ett till ett!'
                    }
                ]);
                return true;

            case 'pusselkartonger_trave':
                V.speak('lasse', 'Höga travar med pussel på 1500 och 2000 bitar med motiv från Alperna och Göta kanal. Morsans vinterprojekt.');
                return true;
        }

        return false;
    }
};