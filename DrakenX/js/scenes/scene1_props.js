/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - SCEN 1 REKVISITA & TAXEN SPUTNIK (scene1_props.js)
 * Möblerar bottenplanets hall/vardagsrum med röllakanmatta, bokhylla,
 * blommor, tavlor, Red Herrings och familjens strävhåriga tax Sputnik.
 * ============================================================================
 */

window.Scene1Props = {
    dogActor: null,
    dogState: {
        x: -1.8,
        z: -0.65,
        targetX: 2.2,
        speed: 0.95,
        direction: 1,
        pauseTimer: 0
    },

    buildRichInterior(R) {
        this._buildRollakanRug(R);
        this._buildTeakBookshelfAndRedHerrings(R);
        this._buildPlantPedestalAndMonstera(R);
        this._buildOilPaintingRoxen(R);
        this._buildHallCoatRackAndBrylcreem(R);
        this._buildMagazineRedHerring(R);
        this._buildSputnikTheDog(R);
    },

    _buildSputnikTheDog(R) {
        const dogGroup = new THREE.Group();
        const furMat = new THREE.MeshStandardMaterial({
            color: 0x5c361a,
            map: R.proceduralTextures.fabric,
            roughness: 0.85
        });
        const tanMat = new THREE.MeshStandardMaterial({ color: 0xa66b38, roughness: 0.75 });
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xb52222, roughness: 0.4 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.85, roughness: 0.2 });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.78, 12), furMat);
        body.rotation.z = Math.PI / 2;
        body.position.set(0, 0.28, 0);
        body.castShadow = true;
        dogGroup.add(body);

        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.06, 12), collarMat);
        collar.rotation.z = Math.PI / 2;
        collar.position.set(0.32, 0.29, 0);
        const tag = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), brassMat);
        tag.position.set(0.35, 0.14, 0);
        dogGroup.add(collar, tag);

        const headGroup = new THREE.Group();
        headGroup.position.set(0.44, 0.42, 0);

        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), furMat);
        skull.castShadow = true;
        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 0.24, 10), tanMat);
        snout.rotation.z = -Math.PI / 2;
        snout.position.set(0.16, -0.02, 0);
        const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), noseMat);
        noseTip.position.set(0.28, -0.01, 0);

        [-0.07, 0.07].forEach(ez => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), noseMat);
            eye.position.set(0.09, 0.05, ez);
            headGroup.add(eye);
        });

        [-0.12, 0.12].forEach(ez => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.22, 0.04), furMat);
            ear.position.set(-0.02, -0.04, ez);
            ear.rotation.x = ez > 0 ? 0.18 : -0.18;
            headGroup.add(ear);
        });

        headGroup.add(skull, snout, noseTip);
        dogGroup.add(headGroup);

        const legGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.20, 8);
        const legs = [];
        [[0.26, 0.09], [0.26, -0.09], [-0.26, 0.09], [-0.26, -0.09]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, tanMat);
            leg.position.set(lx, 0.10, lz);
            leg.castShadow = true;
            dogGroup.add(leg);
            legs.push(leg);
        });

        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.28, 8), furMat);
        tail.position.set(-0.42, 0.38, 0);
        tail.rotation.z = 0.65;
        dogGroup.add(tail);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.65, 0.55),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.set(0, 0.32, 0);
        dogGroup.add(hitbox);

        dogGroup.position.set(this.dogState.x, 0, this.dogState.z);
        R.actorsGroup.add(dogGroup);

        R.registerInteractive(hitbox, {
            id: 'sputnik_dog',
            name: 'Familjens strävhåriga tax Sputnik',
            walkX: 600,
            walkY: 635,
            lookAt: 'front'
        });

        this.dogActor = { group: dogGroup, headGroup, tail, legs, hitbox };
    },

    updateDog(dt, timestamp) {
        if (!this.dogActor) return;
        const t = timestamp * 0.001;
        const ds = this.dogState;

        this.dogActor.tail.rotation.x = Math.sin(t * 18) * 0.45;

        if (ds.pauseTimer > 0) {
            ds.pauseTimer -= dt;
            this.dogActor.headGroup.rotation.z = 0.25 + Math.sin(t * 14) * 0.12;
            this.dogActor.legs.forEach(l => { l.rotation.z = 0; });
            return;
        }

        this.dogActor.headGroup.rotation.z = Math.sin(t * 6) * 0.05;

        const diff = ds.targetX - ds.x;
        if (Math.abs(diff) < 0.08) {
            ds.pauseTimer = 2.2 + Math.random() * 2.5;
            ds.targetX = ds.x > 0 ? (-2.8 + Math.random() * 1.5) : (1.5 + Math.random() * 2.2);
            ds.direction = ds.targetX > ds.x ? 1 : -1;
        } else {
            ds.direction = diff > 0 ? 1 : -1;
            ds.x += ds.direction * ds.speed * dt;

            const targetRotY = ds.direction > 0 ? 0 : Math.PI;
            this.dogActor.group.rotation.y += (targetRotY - this.dogActor.group.rotation.y) * 0.15;

            const legSwing = Math.sin(t * 20) * 0.55;
            this.dogActor.legs[0].rotation.z = legSwing;
            this.dogActor.legs[1].rotation.z = -legSwing;
            this.dogActor.legs[2].rotation.z = -legSwing;
            this.dogActor.legs[3].rotation.z = legSwing;
        }

        this.dogActor.group.position.x = ds.x;
        const currentRoomX = Math.round((ds.x / 6.8) * 640 + 640);
        this.dogActor.hitbox.userData.walkX = currentRoomX;
    },

    _buildRollakanRug(R) {
        const rugGroup = new THREE.Group();
        const rugMat = new THREE.MeshStandardMaterial({
            map: R.proceduralTextures.rug1961,
            bumpMap: R.proceduralTextures.fabric,
            bumpScale: 0.02,
            roughness: 0.9
        });
        const rugMesh = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.025, 2.5), rugMat);
        rugMesh.position.set(0.4, 0.015, -0.85);
        rugMesh.receiveShadow = true;
        rugGroup.add(rugMesh);

        const fringeMat = new THREE.MeshStandardMaterial({ color: 0xebe3d0, roughness: 0.95 });
        [-2.84, 2.84].forEach(fx => {
            const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 2.46), fringeMat);
            fringe.position.set(0.4 + fx, 0.01, -0.85);
            rugGroup.add(fringe);
        });
        R.roomGroup.add(rugGroup);
    },

    _buildTeakBookshelfAndRedHerrings(R) {
        const shelfGroup = new THREE.Group();
        const teakMat = new THREE.MeshStandardMaterial({
            color: 0x693414,
            map: R.proceduralTextures.wood,
            roughness: 0.35
        });

        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.75, 0.08), teakMat);
        backPanel.position.set(0, 1.38, -0.22);
        backPanel.castShadow = true;
        shelfGroup.add(backPanel);

        [-0.9, 0.9].forEach(sx => {
            const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.75, 0.52), teakMat);
            side.position.set(sx, 1.38, 0);
            side.castShadow = true;
            shelfGroup.add(side);
        });

        [0.18, 0.95, 1.72, 2.55].forEach(sy => {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.06, 0.50), teakMat);
            plank.position.set(0, sy, 0);
            shelfGroup.add(plank);
        });

        const bookColors = [0x8b1e1e, 0x1e4d6b, 0x2e5a36, 0xb8860b, 0x5c3c20, 0x7a1f1f, 0x24476e];
        for (let i = 0; i < 11; i++) {
            const bMat = new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length], roughness: 0.5 });
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.42 + (i % 3) * 0.04, 0.34), bMat);
            book.position.set(-0.72 + i * 0.13, 0.42, 0.02);
            shelfGroup.add(book);
        }

        const cigarBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.18, 0.32),
            new THREE.MeshStandardMaterial({ color: 0x8a4820, roughness: 0.4 })
        );
        cigarBox.position.set(-0.35, 1.07, 0.05);
        const goldSeal = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.19, 0.33),
            new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.8 })
        );
        goldSeal.position.set(-0.35, 1.07, 0.05);
        shelfGroup.add(cigarBox, goldSeal);

        R.registerInteractive(cigarBox, {
            id: 'red_herring_cigarrlada',
            name: 'Mystisk cigarrlåda med guldsigill',
            walkX: 300,
            walkY: 575,
            lookAt: 'front'
        });

        const tunnanGroup = new THREE.Group();
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdce3ea, metalness: 0.9, roughness: 0.15 });
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.05, 14), teakMat);
        const standArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), chromeMat);
        standArm.position.y = 0.15;
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.52, 14), chromeMat);
        fuselage.rotation.z = Math.PI / 2;
        fuselage.rotation.y = 0.25;
        fuselage.position.y = 0.30;
        const sweptWing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.58), chromeMat);
        sweptWing.position.y = 0.30;
        tunnanGroup.add(standBase, standArm, fuselage, sweptWing);
        tunnanGroup.position.set(0.35, 1.76, 0.05);
        shelfGroup.add(tunnanGroup);

        R.registerInteractive(fuselage, {
            id: 'red_herring_tunnan',
            name: 'Blankpolerad modell av J 29 Flygande Tunnan',
            walkX: 345,
            walkY: 575,
            lookAt: 'front'
        });

        shelfGroup.position.set(-4.25, 0, -3.15);
        R.roomGroup.add(shelfGroup);

        R.registerInteractive(backPanel, {
            id: 'bokhylla_focus',
            name: 'Bokhylla med Focus uppslagsverk',
            walkX: 280,
            walkY: 580,
            lookAt: 'front'
        });
    },

    _buildPlantPedestalAndMonstera(R) {
        const plantGroup = new THREE.Group();
        const potMat = new THREE.MeshStandardMaterial({ color: 0xb5532c, roughness: 0.75 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x255c29, roughness: 0.45 });
        const darkLeafMat = new THREE.MeshStandardMaterial({ color: 0x18421b, roughness: 0.5 });

        const pedTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.32, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 })
        );
        pedTop.position.y = 0.68;
        plantGroup.add(pedTop);

        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.42, 16), potMat);
        pot.position.y = 0.91;
        pot.castShadow = true;
        plantGroup.add(pot);

        for (let i = 0; i < 9; i++) {
            const angle = (i / 9) * Math.PI * 2;
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), i % 2 === 0 ? leafMat : darkLeafMat);
            leaf.scale.set(0.55, 1.85, 0.15);
            leaf.position.set(Math.cos(angle) * 0.18, 1.32 + (i % 3) * 0.12, Math.sin(angle) * 0.18);
            leaf.rotation.z = Math.cos(angle) * 0.45;
            leaf.rotation.x = Math.sin(angle) * 0.35;
            leaf.castShadow = true;
            plantGroup.add(leaf);
        }

        plantGroup.position.set(1.42, 0, -2.65);
        R.roomGroup.add(plantGroup);

        R.registerInteractive(pot, {
            id: 'red_herring_krukväxt',
            name: 'Frodig krukväxt på blompedestal',
            walkX: 745,
            walkY: 580,
            lookAt: 'front'
        });
    },

    _buildOilPaintingRoxen(R) {
        const artGroup = new THREE.Group();
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 256;
        pCanvas.height = 160;
        const pCtx = pCanvas.getContext('2d');
        const skyGrad = pCtx.createLinearGradient(0, 0, 0, 90);
        skyGrad.addColorStop(0, '#4a7ba6');
        skyGrad.addColorStop(1, '#e8b878');
        pCtx.fillStyle = skyGrad;
        pCtx.fillRect(0, 0, 256, 95);
        pCtx.fillStyle = '#29527a';
        pCtx.fillRect(0, 95, 256, 65);
        pCtx.fillStyle = '#263e28';
        pCtx.fillRect(0, 82, 256, 16);
        pCtx.fillStyle = '#ffffff';
        pCtx.beginPath();
        pCtx.moveTo(180, 75); pCtx.lineTo(192, 105); pCtx.lineTo(174, 105);
        pCtx.closePath();
        pCtx.fill();

        const paintingTex = new THREE.CanvasTexture(pCanvas);
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.75, 1.15, 0.08),
            new THREE.MeshStandardMaterial({ color: 0xc99e32, metalness: 0.65, roughness: 0.3 })
        );
        frame.castShadow = true;

        const canvasMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.55, 0.95),
            new THREE.MeshBasicMaterial({ map: paintingTex })
        );
        canvasMesh.position.z = 0.045;

        artGroup.add(frame, canvasMesh);
        artGroup.position.set(-0.2, 2.65, -3.42);
        R.roomGroup.add(artGroup);

        R.registerInteractive(frame, {
            id: 'tavla_roxen',
            name: 'Oljemålning ("Sommarafton över sjön Roxen")',
            walkX: 620,
            walkY: 570,
            lookAt: 'front'
        });
    },

    _buildHallCoatRackAndBrylcreem(R) {
        const rackGroup = new THREE.Group();
        const teakMat = new THREE.MeshStandardMaterial({ color: 0x5c3214, roughness: 0.4 });

        const shelfPlank = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.07, 0.38), teakMat);
        shelfPlank.position.set(0, 2.25, 0);
        rackGroup.add(shelfPlank);

        const brylJar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, 0.18, 14),
            new THREE.MeshStandardMaterial({ color: 0xc91e1e, roughness: 0.2 })
        );
        brylJar.position.set(-0.28, 2.38, 0.05);
        const brylLid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.115, 0.115, 0.05, 14),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.2 })
        );
        brylLid.position.set(-0.28, 2.48, 0.05);
        rackGroup.add(brylJar, brylLid);

        R.registerInteractive(brylJar, {
            id: 'red_herring_brylcreem',
            name: 'Rödvit burk Brylcreem (Original 1961)',
            walkX: 990,
            walkY: 595,
            lookAt: 'front'
        });

        const hatCrown = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.19, 0.20, 14),
            new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: 0.85 })
        );
        hatCrown.position.set(0.28, 2.38, 0.02);
        const hatBrim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.30, 0.30, 0.03, 16),
            new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: 0.85 })
        );
        hatBrim.position.set(0.28, 2.30, 0.02);
        rackGroup.add(hatCrown, hatBrim);

        rackGroup.position.set(5.0, 0, -3.15);
        R.roomGroup.add(rackGroup);
    },

    _buildMagazineRedHerring(R) {
        const magMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.03, 0.38),
            new THREE.MeshStandardMaterial({ color: 0xe6d296, roughness: 0.6 })
        );
        magMesh.position.set(-1.35, 0.035, -0.35);
        magMesh.rotation.y = 0.42;
        R.roomGroup.add(magMesh);

        R.registerInteractive(magMesh, {
            id: 'red_herring_tidning',
            name: 'Tummad 1961 års Bildjournalen på golvet',
            walkX: 470,
            walkY: 635,
            lookAt: 'left'
        });
    },

    handlePropInteraction(hotspotId, verb, selectedItem) {
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        switch (hotspotId) {
            case 'sputnik_dog':
                if (A) A.playSFX('dog_bark');
                this.dogState.pauseTimer = 3.0;

                if (verb === 'ANVÄND' && selectedItem === 'skogaholms_messmor') {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Varsågod Sputnik, vill du smaka på en bit Skogaholmslimpa med fjällbrynt messmör?'
                        },
                        {
                            speaker: 'conny',
                            text: 'Är du från vettet Lasse?! Matar du taxen med messmör så spricker väl kraken mitt på morsans dyra röllakanmatta!'
                        }
                    ]);
                    return true;
                }
                if (verb === 'TITTA PÅ') {
                    V.speak(
                        'lasse',
                        'Det är familjens strävhåriga tax Sputnik! Han har vädrat Skogaholmslimpan på telefonbordet och patrullerar mattan som en kryssningsrobot.'
                    );
                } else if (verb === 'PRATA MED') {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Sitt fint nu Sputnik, och skvallra inte för chefskonstruktören i källaren att vi lånar hans J 35X Draken över helgen!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Kolla hur han viftar på svansen! Den där jycken är 100 procent lojal mot oss!'
                        }
                    ]);
                } else if (verb === 'PLOCKA UPP') {
                    V.speak(
                        'lasse',
                        'Hur mysigt det än vore med en strävhårig tax i knät i Mach 2 så tror jag inte SAAB har syrgasmask i tax-storlek!'
                    );
                } else {
                    V.speak('lasse', 'Bra vovve, Sputnik!');
                }
                return true;

            case 'bokhylla_focus':
                V.speak(
                    'lasse',
                    'Chefskonstruktörens bokhylla i äkta teak. Fullproppad med Focus uppslagsverk och dammiga årgångar av Teknisk Tidskrift.'
                );
                return true;

            case 'red_herring_cigarrlada':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En tung cigarrlåda i cederträ med guldsigill från Havanna! Tänk om gubben gömt hemliga koder till SAAB:s larm här i?!');
                } else if (verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    if (A) A.playSFX('ui_click');
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag gläntar försiktigt på locket... Äh! Den är ju bara full med krokiga gem, tre torkade lakritspipor och ett kvitto på vinterdäck till en SAAB 96!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Sluta snoka i gubbens kontorsskräp nu Lasse, vi har ett överljudsplan att sno!'
                        }
                    ]);
                } else {
                    return false;
                }
                return true;

            case 'red_herring_tunnan':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En blankpolerad skrivbordsmodell i krom av SAAB J 29 Flygande Tunnan. Tjusig, men ikväll siktar vi på dess storebror: J 35X Tors Vrede!');
                } else if (verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Hörru Conny, vi kanske ska ta med den här modellen av Flygande Tunnan som reservplan?'
                        },
                        {
                            speaker: 'conny',
                            text: 'Är du helt snurrig eller?! Den där ä ju i skala ett till femtio! Den rymmer inte ens en halv Skogaholmslimpa!'
                        }
                    ]);
                } else {
                    return false;
                }
                return true;

            case 'red_herring_krukväxt':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En ståtlig krukväxt på en trebent 60-tals blompedestal. Morsan vattnar den med kallt kaffe varje söndag.');
                } else if (verb === 'PLOCKA UPP' || verb === 'ANVÄND' || verb === 'ÖPPNA') {
                    V.speak('lasse', 'Jag tänker då rakt inte gräva i blomjorden. Det ligger ingen extranyckel under krukan, det har jag redan kollat tusen gånger.');
                } else {
                    return false;
                }
                return true;

            case 'tavla_roxen':
                V.speakSequence([
                    {
                        speaker: 'lasse',
                        text: 'En oljemålning av sjön Roxen i solnedgång. Man blir nästan lite blödig i själen när man glor på den.'
                    },
                    {
                        speaker: 'conny',
                        text: 'Ja, å kollar du bakom tavlan efter nåt hemligt kassaskåp så blir du besviken, för det sitter i källaren!'
                    }
                ]);
                return true;

            case 'red_herring_brylcreem':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En rödvit glasburk äkta Brylcreem på hatthyllan. Grundpelaren i svensk ungdomskultur 1961.');
                } else if (verb === 'PLOCKA UPP' || verb === 'ANVÄND' || verb === 'ÖPPNA') {
                    V.speakSequence([
                        {
                            speaker: 'conny',
                            text: 'Ge fan i Brylcreemen, Lasse! Min lugg är kalibrerad på millimetern för aerodynamik och flipperspel! En enda klick till så tappar ja balansen i nacken!'
                        }
                    ]);
                } else {
                    return false;
                }
                return true;

            case 'red_herring_tidning':
                if (verb === 'TITTA PÅ' || verb === 'ÖPPNA' || verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Det är senaste numret av Bildjournalen! Stora rubriker om Lennart Hyland, Elvis Presley och frågan om raggarkulturen hotar den svenska folkhälsan.'
                        },
                        {
                            speaker: 'conny',
                            text: 'Raggarkulturen kommer i alla fall rädda vårat skinn ikväll så fort Bulten varvar upp Chevan!'
                        }
                    ]);
                } else {
                    return false;
                }
                return true;
        }

        return false;
    }
};