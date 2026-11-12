/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - MÖRKRUMMET, RITBORDET, SYBORDET & HOBBYBÄNKEN
 * (js/scenes/scene1_darkroom_pack.js)
 * ============================================================================
 */

window.DarkroomPack1961 = {
    enlargerLight: null,
    developingPhotoMesh: null,

    buildDarkroomInterior(R, gs) {
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e2226, metalness: 0.7, roughness: 0.35 });
        const orangeWood = new THREE.MeshStandardMaterial({ color: 0x9e4b28, roughness: 0.65 });
        const trayWhite = new THREE.MeshStandardMaterial({ color: 0xf0f2f5, roughness: 0.2 });
        const corkMat = new THREE.MeshStandardMaterial({ color: 0x9c7a54, roughness: 0.9 });

        const enlargerGroup = new THREE.Group();
        const tableTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.55, 0.08, 1.15),
            new THREE.MeshStandardMaterial({ color: 0x6e5238, roughness: 0.6 })
        );
        tableTop.position.y = 0.85;
        enlargerGroup.add(tableTop);

        const easelBoard = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.75), corkMat);
        easelBoard.position.set(0, 0.91, 0.1);
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.55, 10), darkMetal);
        column.position.set(0, 1.68, -0.22);
        const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), darkMetal);
        lampHead.scale.set(1.0, 1.35, 1.0);
        lampHead.position.set(0, 2.22, 0.05);
        const bellows = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 12), darkMetal);
        bellows.rotation.x = Math.PI;
        bellows.position.set(0, 1.88, 0.05);

        this.enlargerLight = new THREE.PointLight(0xffe0a3, 0.0, 3.5);
        this.enlargerLight.position.set(0, 1.55, 0.08);

        enlargerGroup.add(easelBoard, column, lampHead, bellows, this.enlargerLight);
        enlargerGroup.position.set(-2.65, 0, -2.15);
        R.roomGroup.add(enlargerGroup);

        R.registerInteractive(lampHead, {
            id: 'morkrum_forstoringsapparat',
            name: 'Svart 60-tals förstoringsapparat (För 35mm negativ)',
            walkX: 410,
            walkY: 605,
            lookAt: 'left'
        });

        const duct = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.16, 1.85, 14),
            new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.85, roughness: 0.25 })
        );
        duct.position.set(-1.35, 3.45, -2.85);
        R.roomGroup.add(duct);

        const shelfPlank = new THREE.Mesh(
            new THREE.BoxGeometry(4.8, 0.06, 0.42),
            new THREE.MeshStandardMaterial({ color: 0xe6e2d8 })
        );
        shelfPlank.position.set(0.2, 2.85, -3.22);
        R.roomGroup.add(shelfPlank);

        const boxColors = [0xe6b800, 0xd99b26, 0xc8c2b8, 0xb52222];
        for (let i = 0; i < 9; i++) {
            const pBox = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.09, 0.36),
                new THREE.MeshStandardMaterial({ color: boxColors[i % boxColors.length] })
            );
            pBox.position.set(-1.8 + (i % 4) * 0.85, 2.94 + Math.floor(i / 4) * 0.10, -3.20);
            R.roomGroup.add(pBox);
        }

        const sinkGroup = new THREE.Group();
        const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 1.15), orangeWood);
        sinkBasin.position.set(0, 1.05, 0);
        sinkBasin.castShadow = true;
        sinkGroup.add(sinkBasin);

        [-0.95, 0.0, 0.95].forEach((tx, idx) => {
            const tray = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.10, 0.62), trayWhite);
            tray.position.set(tx, 1.40, 0.08);
            sinkGroup.add(tray);

            if (idx === 1) {
                this.developingPhotoMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.55, 0.42),
                    new THREE.MeshBasicMaterial({ color: 0xd8dee9 })
                );
                this.developingPhotoMesh.rotation.x = -Math.PI / 2;
                this.developingPhotoMesh.position.set(tx, 1.46, 0.08);
                this.developingPhotoMesh.visible = gs.getFlag('developedBultenPhoto');
                sinkGroup.add(this.developingPhotoMesh);
            }
        });

        const towel = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.68, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x4a2e24, roughness: 0.95 })
        );
        towel.position.set(1.95, 1.55, -0.45);
        towel.rotation.z = 0.08;

        const redDrum = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.28, 0.78, 16),
            new THREE.MeshStandardMaterial({ color: 0x9e1b1b, roughness: 0.35 })
        );
        redDrum.position.set(2.55, 1.35, 0.15);

        sinkGroup.add(towel, redDrum);
        sinkGroup.position.set(0.35, 0, -2.55);
        R.roomGroup.add(sinkGroup);

        R.registerInteractive(sinkBasin, {
            id: 'morkrum_vatbank_skalar',
            name: 'Orangebrun våtbänk med tre vita framkallningsskålar',
            walkX: 680,
            walkY: 595,
            lookAt: 'front'
        });

        const wallGroup = new THREE.Group();
        const corkBoard1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.15, 0.04), corkMat);
        corkBoard1.position.set(-0.35, 2.15, -3.38);
        const corkBoard2 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.15, 0.04), corkMat);
        corkBoard2.position.set(1.35, 2.15, -3.38);
        wallGroup.add(corkBoard1, corkBoard2);

        const bigTimer = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.08, 20),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        bigTimer.rotation.x = Math.PI / 2;
        bigTimer.position.set(-0.25, 2.05, -3.34);
        wallGroup.add(bigTimer);

        const bwMat = new THREE.MeshBasicMaterial({ color: 0xd0d5dd });
        for (let p = 0; p < 7; p++) {
            const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.40), bwMat);
            photo.position.set(-0.85 + p * 0.42, 1.95 + (p % 2) * 0.32, -3.35);
            wallGroup.add(photo);
        }

        R.roomGroup.add(wallGroup);

        R.registerInteractive(bigTimer, {
            id: 'morkrum_timers_foton',
            name: 'Mörkrumsklockor och anslagstavla med svartvita provfoton',
            walkX: 640,
            walkY: 580,
            lookAt: 'front'
        });
    },

    buildDraftingTableAndBoiler(R) {
        const draftGroup = new THREE.Group();
        const castIronMat = new THREE.MeshStandardMaterial({ color: 0x7c8278, metalness: 0.65, roughness: 0.4 });
        const honeyWoodMat = new THREE.MeshStandardMaterial({
            color: 0xc87d28,
            map: R.proceduralTextures.wood,
            roughness: 0.32
        });
        const tealLampMat = new THREE.MeshStandardMaterial({ color: 0x5c9ead, metalness: 0.4, roughness: 0.3 });

        const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.08, 24), castIronMat);
        baseRing.position.y = 0.04;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.25, 16), castIronMat);
        pillar.position.y = 0.65;
        const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.12), castIronMat);
        pedal.position.set(-0.18, 0.16, 0.35);

        const board = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.45, 0.07), honeyWoodMat);
        board.position.set(0, 1.55, 0);
        board.rotation.x = -0.42;
        board.castShadow = true;

        const rulerH = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.02), castIronMat);
        rulerH.position.set(-0.35, 1.38, 0.12);
        const rulerV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.02), castIronMat);
        rulerV.position.set(-0.68, 1.62, 0.02);
        const counterweight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), castIronMat);
        counterweight.position.set(0.18, 2.45, -0.35);

        const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 14), tealLampMat);
        lampShade.position.set(-0.45, 2.25, -0.10);
        lampShade.rotation.z = -0.35;
        const draftLight = new THREE.PointLight(0xfff0cc, 1.1, 6);
        draftLight.position.set(-0.45, 2.05, 0.25);

        const chairGroup = new THREE.Group();
        const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.44), honeyWoodMat);
        cSeat.position.y = 0.68;
        const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.04), honeyWoodMat);
        cBack.position.set(0, 0.98, -0.22);
        const cStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), castIronMat);
        cStem.position.y = 0.34;
        chairGroup.add(cSeat, cBack, cStem);
        chairGroup.position.set(-1.55, 0, 0.45);
        chairGroup.rotation.y = 0.55;

        draftGroup.add(
            baseRing, pillar, pedal, board, rulerH, rulerV,
            counterweight, lampShade, draftLight, chairGroup
        );
        draftGroup.position.set(0.35, 0, -2.15);
        R.roomGroup.add(draftGroup);

        R.registerInteractive(board, {
            id: 'konstruktorens_ritbord',
            name: 'Chefskonstruktörens lutande ritbord med originalritningar på J 35X',
            walkX: 660,
            walkY: 605,
            lookAt: 'front'
        });

        const safe = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 1.25, 0.75),
            new THREE.MeshStandardMaterial({ color: 0x2b3035, metalness: 0.75, roughness: 0.35 })
        );
        safe.position.set(3.2, 0.62, -2.55);
        safe.castShadow = true;
        R.roomGroup.add(safe);

        R.registerInteractive(safe, {
            id: 'kallare_kassaskap',
            name: 'Fastbultat SAAB-kassaskåp i stål',
            walkX: 920,
            walkY: 595,
            lookAt: 'right'
        });
    },

    buildSewingTableInUpperHall(R) {
        const sewGroup = new THREE.Group();
        const mahoganyMat = new THREE.MeshStandardMaterial({
            color: 0x6e2c14,
            map: R.proceduralTextures.wood,
            roughness: 0.28
        });

        [[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.78, 10), mahoganyMat);
            leg.position.set(lx, 0.39, lz);
            sewGroup.add(leg);
        });
        const stretcher = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.76, 8), mahoganyMat);
        stretcher.rotation.z = Math.PI / 2;
        stretcher.position.set(0, 0.22, 0);
        sewGroup.add(stretcher);

        const compartmentBox = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.58), mahoganyMat);
        compartmentBox.position.y = 0.84;
        compartmentBox.castShadow = true;

        const pulledDrawer = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.09, 0.48), mahoganyMat);
        pulledDrawer.position.set(0, 0.73, 0.34);

        const openLid = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.56, 0.04), mahoganyMat);
        openLid.position.set(0, 1.18, -0.28);
        openLid.rotation.x = -0.22;

        sewGroup.add(compartmentBox, pulledDrawer, openLid);
        sewGroup.position.set(1.55, 0, -2.35);
        R.roomGroup.add(sewGroup);

        R.registerInteractive(compartmentBox, {
            id: 'antikt_sybord_fack',
            name: 'Morsans antika sybord med småfack och uppfällt lock',
            walkX: 760,
            walkY: 600,
            lookAt: 'front'
        });
    },

    buildRusticKrypinBench(R) {
        const benchGroup = new THREE.Group();
        const weatheredWood = new THREE.MeshStandardMaterial({
            color: 0x9c6b3b,
            map: R.proceduralTextures.wood,
            roughness: 0.75
        });
        const turquoisePaint = new THREE.MeshStandardMaterial({ color: 0x2892a8, roughness: 0.6 });

        [[-0.75, -0.32], [0.75, -0.32], [-0.75, 0.32], [0.75, 0.32]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.88, 0.09), weatheredWood);
            leg.position.set(lx, 0.42, lz);
            leg.rotation.z = lx < 0 ? -0.14 : 0.14;
            benchGroup.add(leg);
        });

        const mainTop = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 0.85), weatheredWood);
        mainTop.position.y = 0.92;
        mainTop.castShadow = true;

        const rightTurquoiseDrawer = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.04), turquoisePaint);
        rightTurquoiseDrawer.position.set(0.42, 0.92, 0.43);

        const riserBack = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.24, 0.18), weatheredWood);
        riserBack.position.set(0, 1.12, -0.32);
        const riserTurquoiseTop = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.03, 0.19), turquoisePaint);
        riserTurquoiseTop.position.set(0, 1.25, -0.32);

        benchGroup.add(mainTop, rightTurquoiseDrawer, riserBack, riserTurquoiseTop);
        benchGroup.position.set(0.5, 0, -2.25);
        R.roomGroup.add(benchGroup);

        R.registerInteractive(mainTop, {
            id: 'krypin_hobbybank',
            name: 'Sliten snickar- och modellbyggarbänk med turkosmålad låda',
            walkX: 680,
            walkY: 600,
            lookAt: 'front'
        });
    },

    handleDarkroomPackInteraction(hotspotId, verb) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'antikt_sybord_fack':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Morsans antika sybord med uppfällt lock och sex små fack för trådrullar, knappar och stoppnålar.');
                    return true;
                }
                if (verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    if (gs.hasItem('bulten_negativ') || gs.hasItem('bulten_skamfoto')) {
                        V.speak('lasse', 'Det ligger bara synålar och knappar kvar i sybordets småfack.');
                        return true;
                    }
                    gs.addItem('bulten_negativ');
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag rotar i de små träfacken i sybordet... Vänta nu! Under morsans fingerborgar ligger en oframkallad 35-millimeters filmrulle märkt "BULTEN PÅ KOLONILOTTEN - TOPPHEMLIGT"!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Haha! Där är ju spionrullen ja knäppte på Bulten i somras när han satt i blommigt förkläde hos sin mormor å drack hallonsaft! Framkallar vi den nere i farsans mörkrum i källaren så har vi total hållhake på honom!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'morkrum_forstoringsapparat':
            case 'morkrum_vatbank_skalar':
                if (gs.hasItem('bulten_skamfoto')) {
                    V.speak('conny', 'Vi har redan framkallat utpressningsfotot på Bulten i blommigt förkläde! Nu vågar han aldrig säga nej när vi ringer!');
                    return true;
                }
                if (!gs.hasItem('bulten_negativ')) {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Farsans kompletta mörkrum med förstoringsapparat och tre vita framkallningsskålar i den orangebruna våtbänken.'
                        },
                        {
                            speaker: 'conny',
                            text: 'Om vi bara hittar min oframkallade filmrulle på Bulten uppe i huset kan vi framkalla världens bästa hållhake här inne!'
                        }
                    ]);
                    return true;
                }
                if (A) A.playSFX('treo_fizz');
                if (this.enlargerLight) this.enlargerLight.intensity = 2.0;
                if (this.developingPhotoMesh) this.developingPhotoMesh.visible = true;
                gs.removeItem('bulten_negativ');
                gs.addItem('bulten_skamfoto');
                gs.setFlag('developedBultenPhoto', true);

                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Jag sätter negativet i förstoringsapparaten, belyser ett ark Ilford-papper i fem sekunder och lägger ner det i framkallningsskålen i våtbänken...'
                    },
                    {
                        speaker: 'conny',
                        text: 'Kolla i skålen Lasse, bilden träder fram! Bulten i rosa blommigt förkläde med sugrör i saftglaset! Hota honom med det här fotot i telefonen så kommer han bränna gummi runt SAAB-rondellen tills däcken smälter!'
                    }
                ]);
                return true;

            case 'morkrum_timers_foton':
                V.speak('lasse', 'Tre mörkrumsklockor och två korktavlor fulla med svartvita provfoton på jaktplan, familjesemestrar och taxen Sputnik.');
                return true;

            case 'konstruktorens_ritbord':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Farsans stora lutande konstruktionsbord på gjutjärnspelare med parallellinjal! På de fasttejpade pappren syns detaljritningar på luftintagen till J 35X Tors Vrede!'
                    },
                    {
                        speaker: 'conny',
                        text: 'Å på marginalen har gubben klottrat: "Startspärr i bergsrummet: vrid mässingsnyckeln medurs och håll i hatten!"'
                    }
                ]);
                return true;

            case 'kallare_kassaskap':
                V.speak('lasse', 'Det tunga stålkassaskåpet i källaren. Farsan har låst in pärmarna där, men mässingsnyckeln till själva flygplanet glömde han uppe på telefonbordet i hallen!');
                return true;

            case 'krypin_hobbybank':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'Min slitna snickar- och modellbyggarbänk med turkosmålad högerlåda här inne i krypinet! Full av Karlssons Klister och balsaspån.'
                    },
                    {
                        speaker: 'conny',
                        text: 'Luktar precis som träslöjden i femman! Har du kollat i morsans sybord ute i övre hallen förresten?'
                    }
                ]);
                return true;
        }

        return false;
    }
};