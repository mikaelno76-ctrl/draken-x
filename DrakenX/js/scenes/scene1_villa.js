/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - BOTTENPLAN: HALL & VARDAGSRUM (scene1_villa.js)
 * Komplett med inzoomad kamerapanorering, Scene1Props, taxen Sputnik,
 * HouseMap-dörrarna till Kök/Finrum/Övre plan/Källare och utriven katalogsida!
 * ============================================================================
 */

window.Engine.registerScene('scene1_villa', {
    radioEyeMesh: null,
    radioLight: null,
    keyMeshGroup: null,
    sandwichMeshGroup: null,
    lampLight: null,

    init() {
        const R = window.Renderer;
        const gs = window.GameState;
        if (!R || !gs) return;

        R.clearScene(0x16191d, 0.015);
        gs.webgl.cameraMode = 'room_25d';

        gs.player.x = 520;
        gs.player.y = 615;
        gs.player.direction = 'right';

        gs.companion.x = 780;
        gs.companion.y = 585;
        gs.companion.direction = 'left';

        R.buildStandardRoom({
            wallColor: 0x46594b,
            floorColor: 0x6e4526,
            woodFloor: true,
            wallpaper: true,
            ambientIntensity: 0.48
        });

        // 1. Bygg villans kärn-hotspots
        this._buildCellarDoor(R);
        this._buildWindowWithCrescent(R);
        this._buildPhoneTableAndItems(R, gs);
        this._buildTeakSideboardAndRadio(R);
        this._buildFloorLamp(R);
        this._buildFrontDoor(R);

        // 2. Bygg all extra rekvisita, Red Herrings och taxen Sputnik!
        if (window.Scene1Props) {
            window.Scene1Props.buildRichInterior(R);
        }

        // 3. Lägg in dörrarna till Kök, Finrum, Övre Plan och Gästrum enligt planlösningen!
        if (window.HouseMap) {
            window.HouseMap.injectMainHallConnections(R);
        }

        // 4. Spawna Lasse och Conny
        R.spawnMainActors(true);
    },

    onEnter() {
        const gs = window.GameState;
        if (!gs.getFlag('villaIntroPlayed')) {
            gs.setFlag('villaIntroPlayed', true);
            window.VoiceEngine.speakSequence([
                {
                    speaker: 'lasse',
                    text: 'Här nere i hallen lät det som om din farsa nyss rusade förbi och låste in sig i källaren, Conny! Kolla om det är nåt på AGA-radion borta på teakskänken!'
                },
                {
                    speaker: 'conny',
                    text: 'Jajamän! Å akta så inte taxen Sputnik kniper Skogaholmslimpan på telefonbordet bara!'
                }
            ]);
        }
    },

    update(dt, timestamp) {
        const t = timestamp * 0.001;
        if (this.radioEyeMesh && this.radioLight) {
            const pulse = 0.75 + Math.sin(t * 6.5) * 0.25;
            this.radioEyeMesh.scale.set(pulse, 1, 1);
            this.radioLight.intensity = 0.6 + Math.sin(t * 12) * 0.15;
        }
        if (this.lampLight) {
            this.lampLight.intensity = 1.15 + Math.sin(t * 3.2) * 0.04;
        }
        if (window.Scene1Props) {
            window.Scene1Props.updateDog(dt, timestamp);
        }
    },

    _buildCellarDoor(R) {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x3b2614, roughness: 0.7 });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3c20, map: R.proceduralTextures.wood, roughness: 0.6 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 3.3, 0.18), frameMat);
        frame.position.set(0, 1.65, 0);
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.45, 3.1, 0.22), doorMat);
        door.position.set(0, 1.55, 0.02);
        door.castShadow = true;

        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), brassMat);
        handle.position.set(0.52, 1.45, 0.16);

        group.add(frame, door, handle);
        group.position.set(-6.1, 0, -3.35);
        R.roomGroup.add(group);

        R.registerInteractive(door, {
            id: 'kallardorr',
            name: 'Källardörr (Ner till Mörkrum, Pannrum & Tågbana)',
            walkX: 165,
            walkY: 575,
            lookAt: 'left'
        });
    },

    _buildWindowWithCrescent(R) {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.5 });
        const skyMat = new THREE.MeshBasicMaterial({ color: 0x1b2838 });
        const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1e3f20, roughness: 0.8 });

        const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.0, 0.15), frameMat);
        const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.7), skyMat);
        glassPane.position.z = 0.09;

        const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 0.05), hedgeMat);
        hedge.position.set(0, -0.5, 0.10);

        const mopedTank = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.22, 0.06),
            new THREE.MeshBasicMaterial({ color: 0xb8332a })
        );
        mopedTank.position.set(-0.2, -0.35, 0.11);
        mopedTank.rotation.z = 0.28;

        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.75, 0.18), frameMat);
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.08, 0.18), frameMat);

        group.add(outerFrame, glassPane, hedge, mopedTank, crossV, crossH);
        group.position.set(-2.25, 2.35, -3.4);
        R.roomGroup.add(group);

        R.registerInteractive(outerFrame, {
            id: 'fonster_moped',
            name: 'Fönster mot syrenhäcken & Connys Crescent',
            walkX: 430,
            walkY: 565,
            lookAt: 'front'
        });
    },

    _buildPhoneTableAndItems(R, gs) {
        const tableGroup = new THREE.Group();
        const teakMat = new THREE.MeshStandardMaterial({ color: 0x7a3e18, map: R.proceduralTextures.wood, roughness: 0.35 });
        const laceMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f2, roughness: 0.9 });
        const bakeliteMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.18, metalness: 0.3 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.05), teakMat);
        top.position.y = 1.05;
        top.castShadow = true;
        tableGroup.add(top);

        [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 1.05, 8), teakMat);
            leg.position.set(lx, 0.52, lz);
            tableGroup.add(leg);
        });

        const doily = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.02, 20), laceMat);
        doily.position.set(0, 1.12, 0);
        doily.scale.set(1.3, 1, 0.65);
        tableGroup.add(doily);

        const phoneGroup = new THREE.Group();
        const phoneBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.36), bakeliteMat);
        const dialFace = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16),
            new THREE.MeshBasicMaterial({ color: 0xdedede })
        );
        dialFace.position.set(0, 0.11, 0.08);
        dialFace.rotation.x = 0.4;
        const handset = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.14), bakeliteMat);
        handset.position.set(0, 0.16, -0.02);
        phoneGroup.add(phoneBase, dialFace, handset);
        phoneGroup.position.set(-0.68, 1.22, -0.05);
        tableGroup.add(phoneGroup);

        R.registerInteractive(phoneBase, {
            id: 'bakelittelefon',
            name: 'Svart bakelittelefon',
            walkX: 555,
            walkY: 575,
            lookAt: 'front'
        });

        const catalogMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, 0.10, 0.36),
            new THREE.MeshStandardMaterial({ color: 0x3a6b8c, roughness: 0.7 })
        );
        catalogMesh.position.set(-0.10, 1.17, -0.12);
        tableGroup.add(catalogMesh);

        R.registerInteractive(catalogMesh, {
            id: 'telefonkatalog',
            name: 'Telefonkatalogen (Linköping 1961)',
            walkX: 610,
            walkY: 575,
            lookAt: 'front'
        });

        this.keyMeshGroup = new THREE.Group();
        const brassTag = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16),
            new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.9, roughness: 0.15 })
        );
        brassTag.scale.set(1.4, 1, 0.85);
        this.keyMeshGroup.add(brassTag);
        this.keyMeshGroup.position.set(0.32, 1.15, 0.18);
        this.keyMeshGroup.visible = !gs.hasItem('messing_nyckel');
        tableGroup.add(this.keyMeshGroup);

        R.registerInteractive(brassTag, {
            id: 'messingbricka_obj',
            name: 'Mässingsbricka ("Draken X – Tors Vrede")',
            walkX: 650,
            walkY: 575,
            lookAt: 'front'
        });

        this.sandwichMeshGroup = new THREE.Group();
        const loaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.22, 0.26),
            new THREE.MeshStandardMaterial({ color: 0xc88a4b, roughness: 0.8 })
        );
        const messmorTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, 0.28, 12),
            new THREE.MeshStandardMaterial({ color: 0xd9a74a, metalness: 0.4 })
        );
        messmorTube.rotation.z = Math.PI / 2;
        messmorTube.position.set(0.1, 0.14, 0.08);
        this.sandwichMeshGroup.add(loaf, messmorTube);
        this.sandwichMeshGroup.position.set(0.75, 1.22, -0.05);
        this.sandwichMeshGroup.visible = !gs.hasItem('skogaholms_messmor');
        tableGroup.add(this.sandwichMeshGroup);

        R.registerInteractive(loaf, {
            id: 'skogaholms_obj',
            name: 'Skogaholmslimpa & tub fjällbrynt messmör',
            walkX: 690,
            walkY: 575,
            lookAt: 'front'
        });

        tableGroup.position.set(-0.2, 0, -2.5);
        R.roomGroup.add(tableGroup);
    },

    _buildTeakSideboardAndRadio(R) {
        const group = new THREE.Group();
        const teakMat = new THREE.MeshStandardMaterial({ color: 0x6b3212, map: R.proceduralTextures.wood, roughness: 0.3 });
        const radioWood = new THREE.MeshStandardMaterial({ color: 0x4a200a, roughness: 0.25 });
        const grilleMat = new THREE.MeshStandardMaterial({ color: 0xd8cba8, map: R.proceduralTextures.fabric, roughness: 0.7 });

        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.15, 0.95), teakMat);
        cabinet.position.y = 0.85;
        cabinet.castShadow = true;
        group.add(cabinet);

        const radioBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 0.48), radioWood);
        radioBox.position.set(0, 1.76, 0);
        radioBox.castShadow = true;

        const speakerGrille = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.36), grilleMat);
        speakerGrille.position.set(0, 1.84, 0.245);

        this.radioEyeMesh = new THREE.Mesh(
            new THREE.CircleGeometry(0.065, 16),
            new THREE.MeshBasicMaterial({ color: 0x33ff77 })
        );
        this.radioEyeMesh.position.set(0.35, 1.86, 0.25);

        this.radioLight = new THREE.PointLight(0x33ff77, 0.7, 3.5);
        this.radioLight.position.set(0.35, 1.86, 0.5);

        group.add(radioBox, speakerGrille, this.radioEyeMesh, this.radioLight);
        group.position.set(3.2, 0, -2.55);
        R.roomGroup.add(group);

        R.registerInteractive(radioBox, {
            id: 'aga_radio',
            name: 'AGA-radioapparat med magiskt grönt öga',
            walkX: 880,
            walkY: 585,
            lookAt: 'front'
        });
    },

    _buildFloorLamp(R) {
        const lampGroup = new THREE.Group();
        const standMat = new THREE.MeshStandardMaterial({ color: 0xb89644, metalness: 0.7, roughness: 0.3 });
        const shadeMat = new THREE.MeshStandardMaterial({
            color: 0xffd280,
            emissive: 0xaa5511,
            emissiveIntensity: 0.55,
            roughness: 0.8
        });

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.7, 10), standMat);
        pole.position.y = 1.35;
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.65, 16, 1, true), shadeMat);
        shade.position.y = 2.65;

        this.lampLight = new THREE.PointLight(0xffaa44, 1.2, 11);
        this.lampLight.position.set(0, 2.4, 0.3);
        this.lampLight.castShadow = true;

        lampGroup.add(pole, shade, this.lampLight);
        lampGroup.position.set(4.3, 0, -2.2);
        R.roomGroup.add(lampGroup);
    },

    _buildFrontDoor(R) {
        const group = new THREE.Group();
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x422814, map: R.proceduralTextures.wood, roughness: 0.6 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x2b190b, roughness: 0.7 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 3.4, 0.2), frameMat);
        frame.position.y = 1.7;
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.55, 3.2, 0.24), doorMat);
        door.position.y = 1.6;

        group.add(frame, door);
        group.position.set(6.4, 0, -2.8);
        group.rotation.y = -0.35;
        R.roomGroup.add(group);

        R.registerInteractive(door, {
            id: 'ytterdorr',
            name: 'Ytterdörr (Ut mot Linköpingsnatten & SAAB)',
            walkX: 1120,
            walkY: 615,
            lookAt: 'right'
        });
    },

    onInteract(hotspotId, verb, selectedItem) {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        // 1. Kolla först taxen Sputnik och 1961-rekvisitan
        if (window.Scene1Props && window.Scene1Props.handlePropInteraction(hotspotId, verb, selectedItem)) {
            return true;
        }

        // 2. Kolla om spelaren klickar på en rumsdörr (Kök, Finrum, Övre Plan, Källare)
        if (window.HouseMap && hotspotId !== 'kallardorr' && window.HouseMap.handleMainHallDoorClick(hotspotId, verb)) {
            return true;
        }

        switch (hotspotId) {
            case 'aga_radio':
                if (verb === 'TITTA PÅ' || verb === 'ANVÄND' || verb === 'PRATA MED') {
                    if (A) A.playSFX('aga_radio_tune');
                    gs.setFlag('listenedToRadio', true);
                    V.speakSequence([
                        {
                            speaker: 'radio',
                            text: 'Från TT och Sveriges Radio: FN:s generalsekreterare Dag Hammarskjölds flygplan Albertina har störtat utanför Ndola. Misstankar riktas mot utländska legosoldater i Katanga, men stormakterna avvaktar.'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Ska de dära legoknäckarna få mörda vår egen Dagge utan att nån säjer ifrån?! Är alla vuxna i det här landet totalt fega, eller?'
                        },
                        {
                            speaker: 'conny',
                            text: 'Nä, nu ä dä banne mej slutfikat, Lasse! Kom så går vi upp på pojkrummet och tar en styrketår pilsner ur din väska så vi kan smida en plan!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'kallardorr':
                if (verb === 'TITTA PÅ' || verb === 'PRATA MED') {
                    if (A) A.playSFX('treo_fizz');
                    gs.setFlag('checkedCellarDoor', true);
                    V.speakSequence([
                        {
                            speaker: 'pappa',
                            text: 'Åh herregud... mitt livsverk... två Treo till i vattenglaset... hoppas jag inte glömde mässingsnyckeln till Tors Vrede ute i hallen...'
                        },
                        {
                            speaker: 'lasse',
                            text: 'Hörde du Conny? Gubben sitter i pannrummet och har glömt nyckeln till själva prototypen här i hallen!'
                        }
                    ]);
                    return true;
                }
                if (verb === 'GÅ TILL' || verb === 'ÖPPNA' || verb === 'ANVÄND') {
                    window.Engine.loadScene('villa_kallare_hall');
                    return true;
                }
                break;

            case 'fonster_moped':
                if (verb === 'TITTA PÅ') {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Utanför i höstmörkret syns grannens tilltufsade syrenhäck där Conny parkerade sin Crescent-moped i tisdags.'
                        },
                        {
                            speaker: 'conny',
                            text: 'Hörru, gashandtaget hängde sej faktiskt! Å knät mitt ä fortfarande blått!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'messingbricka_obj':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En tung mässingsbricka med en nyckel på morsans virkade duk. Det står präglat: "Draken X – Tors Vrede"!');
                    return true;
                }
                if (verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    gs.addItem('messing_nyckel');
                    gs.setFlag('tookKeyAndSandwich', true);
                    if (this.keyMeshGroup) this.keyMeshGroup.visible = false;
                    V.speak('lasse', 'Jag tar hand om nyckeln till Tors Vrede! Nu har vi bokstavligt talat nyckeln till världens modernaste överljudsplan i fickan.');
                    return true;
                }
                break;

            case 'skogaholms_obj':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En halv påse Skogaholmslimpa och en tub fjällbrynt messmör. Perfekt färdkost till Afrika!');
                    return true;
                }
                if (verb === 'PLOCKA UPP' || verb === 'ANVÄND') {
                    gs.addItem('skogaholms_messmor');
                    if (this.sandwichMeshGroup) this.sandwichMeshGroup.visible = false;
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag packar ner Skogaholmslimpan med fjällbrynt messmör innan taxen Sputnik når upp till bordskanten!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Håll den dära bruna sörjan långt borta från mej bara, Lasse! Min mage tål inte messmör!'
                        }
                    ]);
                    return true;
                }
                break;

            case 'telefonkatalog':
                if (gs.getFlag('foundBultenNumber')) {
                    V.speak('conny', 'Vi har redan hittat den utrivna sidan med Bultens nummer i Cado-skåpet i Finrummet! Använd bakelittelefonen nu!');
                } else {
                    V.speakSequence([
                        {
                            speaker: 'lasse',
                            text: 'Jag bläddrar i 1961 års telefonkatalog... Men va i helvete?! Någon har rivit ut hela sidan med Bultens Bil & Däckbränning!'
                        },
                        {
                            speaker: 'conny',
                            text: 'Det måste va farsan som rivit ut sidan! Kolla på hans Facit-skrivmaskin i röda rummet på övervåningen eller inne i Finrummet!'
                        }
                    ]);
                }
                return true;

            case 'bakelittelefon':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'En tung svart bakelittelefon från Televerket.');
                    return true;
                }
                if (verb === 'ANVÄND' || verb === 'PRATA MED' || verb === 'PLOCKA UPP') {
                    if (gs.getFlag('calledBulten')) {
                        V.speak('conny', 'Vi har redan ringt Bulten! Han håller på att skruva loss ljuddämparna på Chevan i detta nu!');
                        return true;
                    }
                    if (!gs.getFlag('foundBultenNumber')) {
                        V.speak('lasse', 'Sidan med Bultens nummer är utriven ur telefonkatalogen! Vi måste leta rätt på den utrivna sidan i huset först.');
                        return true;
                    }
                    if (!gs.getFlag('connyAgreedToFly')) {
                        V.speak('lasse', 'Jag har Bultens nummer, men jag måste snacka med Conny först så vi är överens om vem som ska flyga planet!');
                        return true;
                    }
                    this._triggerBultenPhoneCall();
                    return true;
                }
                break;

            case 'conny_npc':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Conny i sin fina mockajacka och nykammade brylkrämslugg.');
                    return true;
                }
                if (verb === 'PRATA MED') {
                    this._openConnyDialogue();
                    return true;
                }
                break;

            case 'ytterdorr':
                if (verb === 'TITTA PÅ') {
                    V.speak('lasse', 'Ytterdörren ut i den beckmörka Linköpingsnatten. Bortom rondellen ligger SAAB:s hemliga bergsrum.');
                    return true;
                }
                if (verb === 'ÖPPNA' || verb === 'GÅ TILL' || verb === 'ANVÄND') {
                    this._tryLeaveVilla();
                    return true;
                }
                break;
        }

        return false;
    },

    _openConnyDialogue() {
        const gs = window.GameState;
        const V = window.VoiceEngine;

        const buildOptions = () => {
            const opts = [];

            if (!gs.getFlag('connyAgreedToFly')) {
                opts.push({
                    text: 'Vi snor Draken X i bergsrummet och flyger ner till Katanga och skipar rättvisa för Dagge!',
                    onSelect: () => {
                        window.Engine.endDialogue();
                        V.speakSequence([
                            {
                                speaker: 'lasse',
                                text: 'Vi snor Draken X i bergsrummet och flyger ner till Katanga och skipar rättvisa för Dagge!'
                            },
                            {
                                speaker: 'conny',
                                text: 'Hörru Lasse... vem faen ska spaka den häringa maskinen egentlien? Ingen av oss har ju ens tagit lätt mc-kort än! Ja krocka ju me grannens syrenhäck me Crescenten förra tisdan å slog knät blått!'
                            }
                        ], () => this._openConnyDialogue());
                    }
                });

                opts.push({
                    text: 'Du ska flyga, Conny! Du har ju rekordet på flipperspelet på Shell-macken, och jag tar radion med min trea i engelska!',
                    onSelect: () => {
                        window.Engine.endDialogue();
                        gs.setFlag('connyAgreedToFly', true);
                        V.speakSequence([
                            {
                                speaker: 'lasse',
                                text: 'Men dä ä ju självklart att du ska flyga, Conny! Du drog ju in två extrabollar på rymdbanan på Shell-macken utan att tilta! Cockpiten ä ju bare som ett flipperspel med vingar! Å ja sätter mej i baksits och sköter utrikessnacket med min starka trea i engelska!'
                            },
                            {
                                speaker: 'conny',
                                text: 'Jo... i å för sej! Tilt-sensorn ä ja jävligt vass på att finta me höften! Å raggarkungen Bulten ä skyldig mej en hundring sen ja spöade honom på flipperspelet! Leta rätt på hans nummer så ringer vi honom!'
                            }
                        ]);
                    }
                });
            } else if (!gs.getFlag('calledBulten')) {
                opts.push({
                    text: 'Hur får vi tag på Bultens telefonnummer när farsan rivit ut sidan ur katalogen?',
                    onSelect: () => {
                        window.Engine.endDialogue();
                        V.speak(
                            'conny',
                            'Kolla vad gubben har skrivit på sin Facit-skrivmaskin i det blågröna arbetsrummet på övervåningen!'
                        );
                    }
                });
            } else {
                opts.push({
                    text: 'Bulten är på väg ut med raggarbilen! Är du redo att dra till SAAB-grindarna?',
                    onSelect: () => {
                        window.Engine.endDialogue();
                        V.speak('conny', 'Jajamän! Se bara till att vi fått med oss mässingsnyckeln, 1954 års världsatlas, käket och gärna tittat in till morsan i köket innan vi går ut!');
                    }
                });
            }

            opts.push({
                text: 'Vi hörs om en stund, Conny. (Avsluta samtal)',
                onSelect: () => window.Engine.endDialogue()
            });

            return opts;
        };

        window.Engine.startDialogue(buildOptions());
    },

    _triggerBultenPhoneCall() {
        const gs = window.GameState;
        const V = window.VoiceEngine;
        const A = window.AudioEngine;

        if (A) A.playSFX('rotary_dial');
        gs.setFlag('calledBulten', true);

        setTimeout(() => {
            if (A) A.playSFX('phone_ring_1961');
        }, 550);

        V.speakSequence([
            {
                speaker: 'conny',
                text: 'Hallå Bulten! Dä ä Conny! Det är dags att du hostar upp hundralappen du ä skyldig mej sen ja utklassade dej på rymdbanan nere på Shell-macken!'
            },
            {
                speaker: 'bulten',
                text: 'Dra åt fanders, din lilla brylkrämsvalp! Tror du ja skiter hundralappar eller?! Jag har precis köpt nya kromlister och rävsvans till Chevan!'
            },
            {
                speaker: 'conny',
                text: 'Hör nu på mej, Bulten! Du slipper betala hundringen om du gör det du ä absolut bäst på: ta din mattsvarta Cheva femtisjua, skruva bort ljuddämparen och se till att få varenda förbannad polis i hela Linköping efter dej förbi SAAB-rondellen om en kvart!'
            },
            {
                speaker: 'bulten',
                text: 'Haha! Ska ja bara reta gallfeber på överkonstapel Grym och snutarna för att bli kvitt skulden?! Det gör ja gratis vilken kväll i veckan som helst! Håll i hatten grabbar, nu ska det brännas gummi!'
            },
            {
                speaker: 'lasse',
                text: 'Lysande, Conny! Det luktade nästan svavel och bränd motorolja rakt genom bakelitluren! Nu har vi vår avledning vid SAAB-grindarna!'
            }
        ]);
    },

    _tryLeaveVilla() {
        const gs = window.GameState;
        const V = window.VoiceEngine;

        const missing = [];
        if (!gs.hasItem('messing_nyckel')) missing.push('mässingsnyckeln till Tors Vrede på telefonbordet');
        if (!gs.hasItem('skolatlas_1954')) missing.push('1954 års världsatlas i den flätade tidningskorgen uppe på pojkrummet');
        if (!gs.hasItem('skogaholms_messmor')) missing.push('Skogaholmslimpan med messmör på telefonbordet');
        if (!gs.getFlag('connyAgreedToFly')) missing.push('att prata med Conny om vem som ska spaka planet');
        if (!gs.getFlag('calledBulten')) missing.push('att hitta Bultens nummer och ringa honom på bakelittelefonen');

        if (missing.length > 0) {
            V.speak(
                'lasse',
                `Vänta lite! Vi kan inte ge oss ut i Linköpingsnatten än. Vi saknar fortfarande ${missing[0]}!`
            );
            return;
        }

        V.speakSequence([
            {
                speaker: 'conny',
                text: 'Nyckeln i mockajackan, världsatlasen under armen och Bulten på väg med trimmad V8! Nu smyger vi ner till SAAB-stängslet, Lasse!'
            }
        ], () => {
            window.Engine.loadScene('scene2_gate');
        });
    }
});