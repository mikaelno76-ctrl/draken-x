/**
 * ============================================================================
 * DRAKEN X: TORS VREDE (1961) - HELA VILLANS PLANLÖSNING v6.0 (scene1_house_map.js)
 * Nu är ALLA nyckelrum i hela 3-våningsvillan möblerade och sammanlänkade:
 *   - Bottenplan: Hall/Vardagsrum, Berså-Köket, Finrummet & Föräldrasovrummet!
 *   - Övre Plan: Övre Hall (Sybordet), TV-rummet (Tjock-TV & Ball Chair),
 *                Röda Arbetsrummet (Facit), Badrummet, Pojkrummet & Krypinet!
 *   - Källarplan: Gillestugan/Källargången, Mörkrummet, Pannrummet/Ritbordet
 *                 samt Hobbyrummet med Märklin-tågbanan!
 * ============================================================================
 */

window.HouseMap = {
    blockedDoors: {
        'to_altan': 'Det ösregnar på altanen och dörren är reglad för hösten. Inget intressant där ute!',
        'to_garage': 'Garaget och långförrådet är låsta med hänglås. Inget intressant där inne ikväll!'
    },

    rooms: {
        'villa_gastrum': {
            title: 'Bottenplan: Föräldrasovrum & Gästrum (Blått överkast & Ljuskrona)',
            wallColor: 0x526b7c, // Duvblå väggfärg från image_20dd06.jpg!
            floorColor: 0x6e4526,
            woodFloor: true,
            ambient: 0.58,
            intro: 'Föräldrarnas sovrum i vänstra flygeln! Kolla in mässingsljuskronan, den runda ljusblå sammetskudden på det blåa överkastet och nattduksbordet med franslampan!',
            doors: [
                { id: 'to_hall', x: 5.8, label: 'Dörr tillbaka ut till Hallen', target: 'scene1_villa', walkX: 1100 }
            ]
        },
        'villa_kok': {
            title: 'Bottenplan: Berså-Köket (Tant Karin & Raketosten)',
            wallColor: 0xffffff,
            floorColor: 0x6e4526,
            woodFloor: true,
            wallpaperType: 'wp_bersa',
            ambient: 0.62,
            furnitureSet: 'kitchen',
            intro: 'Kolla in Stig Lindbergs Berså-tapet på väggarna, Bumling-lampan över det runda bordet och Kavlis Raketost på bänken! Och där står Tant Karin!',
            doors: [
                { id: 'to_hall', x: -5.8, label: 'Dörr ut till Hallen & Vardagsrummet', target: 'scene1_villa', walkX: 180 },
                { id: 'to_matsal', x: 5.8, label: 'Serveringsgång till Finrum & Matsal', target: 'villa_matsal', walkX: 1100 }
            ]
        },
        'villa_matsal': {
            title: 'Bottenplan: Matsal & Finrum (Medaljongtapet & Bröstpanel)',
            wallColor: 0xffffff,
            floorColor: 0x6e4526,
            woodFloor: true,
            wallpaperType: 'wp_medaljong',
            wainscoting: true,
            ambient: 0.58,
            furnitureSet: 'finrum',
            intro: 'Finrummet med salviagrön medaljongtapet, vit träbröstpanel, Bubble-lampor, abstrakt konst och Cado-vägghyllan i teak!',
            doors: [
                { id: 'to_hall', x: -6.2, label: 'Öppning mot Hallen & Vardagsrummet', target: 'scene1_villa', walkX: 150 },
                { id: 'to_altan', x: 6.2, label: 'Glasveranda mot Altanen (Reglad)', target: 'BLOCKED', walkX: 1120 }
            ]
        },
        'villa_ovre_hall': {
            title: 'Övre plan: Övre Hall (Nervbladstapet & Sybordet)',
            wallColor: 0xffffff,
            floorColor: 0x6e4526,
            woodFloor: true,
            wallpaperType: 'wp_nervblad',
            ambient: 0.58,
            intro: 'Övre trapphallen med den ljusa nervbladstapeten! Bredvid dörrarna står morsans antika sybord med uppfällt lock!',
            doors: [
                { id: 'to_bottenplan', x: -6.2, label: 'Trappan ner till Bottenplan (Hallen)', target: 'scene1_villa', walkX: 150 },
                { id: 'to_tvrum', x: -3.2, label: 'Dörr till TV-rummet (Tjock-TV & Ball Chair)', target: 'villa_tvrum', walkX: 390 },
                { id: 'to_bad_uppe', x: -0.6, label: 'Dörr till Badrummet (Muggen)', target: 'villa_bad_uppe', walkX: 590 },
                { id: 'to_mitt_sovrum', x: 3.4, label: 'Dörr till "Mitt sovrum" (Röda skrivbordet)', target: 'villa_mitt_sovrum', walkX: 900 },
                { id: 'to_pojkrum', x: 6.2, label: 'Dörr till "Mitt rum" (Pojkrummet med lutan)', target: 'scene1_boyroom', walkX: 1120 }
            ]
        },
        'villa_bad_uppe': {
            title: 'Övre plan: Badrummet (Blomtapeten & Muggen)',
            wallColor: 0xffffff,
            floorColor: 0x384a4c,
            wallpaperType: 'wp_blom_brun',
            ambient: 0.62,
            intro: 'Åh vilken lättnad efter den där ljumna pilsnern! Och kolla den stormönstrade bruna blomtapeten! Men vänta – på handfatskanten ligger farsans spår!',
            doors: [
                { id: 'to_ovre_hall', x: -4.8, label: 'Dörr ut till Övre Hallen', target: 'villa_ovre_hall', walkX: 250 },
                { id: 'handfat_treo_spår', x: 1.8, label: 'Handfat & Spegelskåp (Pappans kvarglömda spår)', target: 'BATHROOM_CLUE', walkX: 780 }
            ]
        },
        'villa_tvrum': {
            title: 'Övre plan: TV- & Musikrum (Tjock-TV, Philips & Ball Chair)',
            wallColor: 0xffffff,
            floorColor: 0x6e4526,
            woodFloor: true,
            wallpaperType: 'wp_droppar',
            ambient: 0.56,
            furnitureSet: 'tvrum',
            intro: 'TV- och musikrummet! Här står 1961 års tjock-TV med röd Philips skivspelare, trearmad golvlampa, trekantigt Perstorpsbord och den vita klotfåtöljen!',
            doors: [
                { id: 'to_ovre_hall', x: 5.8, label: 'Dörr ut till Övre Hallen', target: 'villa_ovre_hall', walkX: 1100 }
            ]
        },
        'villa_mitt_sovrum': {
            title: 'Övre plan: Arbetsrummet / "Mitt sovrum" (Facit)',
            wallColor: 0x1b4d5e,
            floorColor: 0x727a78,
            woodFloor: false,
            ambient: 0.58,
            furnitureSet: 'red_study',
            intro: 'Det blågröna arbetsrummet! Här står det knallröda skrivbordet med Facit-skrivmaskinen, gula tulpaner och Ivar Lo-Johansson på vägghyllan!',
            doors: [
                { id: 'to_ovre_hall', x: -5.8, label: 'Dörr ut till Övre Hallen', target: 'villa_ovre_hall', walkX: 180 },
                { id: 'to_pojkrum', x: 5.8, label: 'Mellandörr till Pojkrummet ("Mitt rum")', target: 'scene1_boyroom', walkX: 1100 }
            ]
        },
        'villa_krypin': {
            title: 'Övre plan: "Mitt krypin" (Hobbybänken)',
            wallColor: 0x4a3f35,
            floorColor: 0x5c3c20,
            woodFloor: true,
            ambient: 0.48,
            intro: 'Lasses hemliga "Mitt krypin" under snedtaket med den slitna turkosmålade snickar- och modellbyggarbänken!',
            doors: [
                { id: 'to_pojkrum', x: -5.2, label: 'Låg dörr tillbaka till Pojkrummet', target: 'scene1_boyroom', walkX: 220 }
            ]
        },
        'villa_kallare_hall': {
            title: 'Källarplan: Gillestuga & Källargång (Elvis, Sifon & Strutlampa)',
            wallColor: 0x5c4632,
            floorColor: 0x2b2e33,
            ambient: 0.50,
            intro: 'Källarens gillestuga! Här nere står serveringsvagnen, den röda strutlampan, sodasifonerna och Elvis- och James Dean-affischerna mellan dörrarna till Mörkrummet och Tågbanan!',
            doors: [
                { id: 'to_bottenplan', x: -6.4, label: 'Källartrappan upp till Bottenplan (Hallen)', target: 'scene1_villa', walkX: 140 },
                { id: 'to_morkrum', x: -3.6, label: 'Ljustät dörr till Mörkrummet', target: 'villa_morkrum', walkX: 350 },
                { id: 'to_tvatt', x: -0.1, label: 'Dörr till Pannrummet & Konstruktörens Ritbord', target: 'villa_tvatt_pannrum', walkX: 630 },
                { id: 'to_tagbana', x: 3.3, label: 'Dörr till Hobbyrummet & "Min tågbana"', target: 'villa_tagbana', walkX: 900 },
                { id: 'to_garage', x: 6.2, label: 'Plåtdörr till Garage & Förråd (Låst)', target: 'BLOCKED', walkX: 1120 }
            ]
        },
        'villa_morkrum': {
            title: 'Källarplan: Mörkrummet (Fotolabb)',
            wallColor: 0x2b1111,
            floorColor: 0x1a1111,
            ambient: 0.34,
            redDarkroomLight: true,
            intro: 'Mörkrummet i källaren! I det röda skenet syns förstoringsapparaten, mörkrumsklockorna och den orangebruna våtbänken med framkallningsskålarna!',
            doors: [
                { id: 'to_kallare_hall', x: -5.8, label: 'Dörr ut till Gillestugan & Källargången', target: 'villa_kallare_hall', walkX: 180 }
            ]
        },
        'villa_tvatt_pannrum': {
            title: 'Källarplan: Pannrum & Konstruktörens Ritbord',
            wallColor: 0x383d3b,
            floorColor: 0x262928,
            ambient: 0.50,
            intro: 'Pannrummet och farsans hemliga källarkontor! Här står hans lutande ritbord på gjutjärnspelare bredvid det fastbultade SAAB-kassaskåpet!',
            doors: [
                { id: 'to_kallare_hall', x: -5.8, label: 'Dörr ut till Gillestugan & Källargången', target: 'villa_kallare_hall', walkX: 180 },
                { id: 'to_tagbana', x: 5.8, label: 'Genomgång till Hobbyrummet ("Min tågbana")', target: 'villa_tagbana', walkX: 1100 }
            ]
        },
        'villa_tagbana': {
            title: 'Källarplan: Hobbyrum & "Min tågbana" (Märklin!)',
            wallColor: 0x4a453b,
            floorColor: 0x2e332f,
            ambient: 0.56,
            furnitureSet: 'train_room',
            intro: 'Kolla in källarens stolthet: en hel Märklin-järnväg på bord med alpkuliss, lokstall, vattentorn, pusselkartonger och flygplanshyllor!',
            doors: [
                { id: 'to_kallare_hall', x: -6.0, label: 'Dörr ut till Gillestugan & Källargången', target: 'villa_kallare_hall', walkX: 160 }
            ]
        }
    },

    registerAllRooms() {
        Object.keys(this.rooms).forEach(roomId => {
            const cfg = this.rooms[roomId];

            window.Engine.registerScene(roomId, {
                init() {
                    const R = window.Renderer;
                    const gs = window.GameState;
                    if (!R || !gs) return;

                    R.clearScene(0x12151a, 0.015);
                    gs.webgl.cameraMode = 'room_25d';

                    gs.player.x = 340;
                    gs.player.y = 625;
                    gs.player.direction = 'right';

                    gs.companion.x = 500;
                    gs.companion.y = 600;
                    gs.companion.direction = 'left';

                    R.buildStandardRoom({
                        wallColor: cfg.wallColor,
                        floorColor: cfg.floorColor,
                        woodFloor: !!cfg.woodFloor,
                        wallpaper: !!cfg.wallpaperType,
                        wallpaperType: cfg.wallpaperType || null,
                        wainscoting: !!cfg.wainscoting,
                        ambientIntensity: cfg.ambient
                    });

                    window.HouseMap._buildBareCeilingBulb(R, cfg.redDarkroomLight);
                    window.HouseMap._buildBlueprintPlaque(R, cfg.title);

                    cfg.doors.forEach(d => window.HouseMap._buildDoor(R, d));

                    if (window.FurniturePack1961 && cfg.furnitureSet) {
                        if (cfg.furnitureSet === 'kitchen') window.FurniturePack1961.buildKitchenAndMom(R);
                        if (cfg.furnitureSet === 'finrum') window.FurniturePack1961.buildFinrumFurniture(R);
                        if (cfg.furnitureSet === 'tvrum') window.FurniturePack1961.buildTvrumLoungeChairs(R);
                        if (cfg.furnitureSet === 'red_study') window.FurniturePack1961.buildRedStudyRoom(R);
                    }

                    if (window.TrainRoom1961 && cfg.furnitureSet === 'train_room') {
                        window.TrainRoom1961.buildTrainRoom(R, gs);
                    }

                    if (window.DarkroomPack1961) {
                        if (roomId === 'villa_morkrum') window.DarkroomPack1961.buildDarkroomInterior(R, gs);
                        if (roomId === 'villa_tvatt_pannrum') window.DarkroomPack1961.buildDraftingTableAndBoiler(R);
                        if (roomId === 'villa_ovre_hall') window.DarkroomPack1961.buildSewingTableInUpperHall(R);
                        if (roomId === 'villa_krypin') window.DarkroomPack1961.buildRusticKrypinBench(R);
                    }

                    // 4. De 8 nya bilderna: TV-elektroniken, Gillestugan, Föräldrasovrummet & Pollock-tavlan!
                    if (window.RetroLivingPack1961) {
                        if (roomId === 'villa_tvrum') window.RetroLivingPack1961.buildTvRoomElectronics(R, gs);
                        if (roomId === 'villa_kallare_hall') window.RetroLivingPack1961.buildBasementGillestuga(R);
                        if (roomId === 'villa_gastrum') window.RetroLivingPack1961.buildMasterBedroom(R);
                        if (roomId === 'villa_matsal') window.RetroLivingPack1961.buildFinrumArtAndCabinet(R);
                    }

                    R.spawnMainActors(true);
                },

                update(dt, timestamp) {
                    if (cfg.furnitureSet === 'train_room' && window.TrainRoom1961) {
                        window.TrainRoom1961.updateTrain(dt, timestamp);
                    }
                },

                onEnter() {
                    const gs = window.GameState;
                    const visitedFlag = `visited_${roomId}`;
                    if (!gs.getFlag(visitedFlag)) {
                        gs.setFlag(visitedFlag, true);
                        window.VoiceEngine.speak('lasse', cfg.intro);
                    }
                },

                onInteract(hotspotId, verb, selectedItem) {
                    if (window.FurniturePack1961 && window.FurniturePack1961.handleFurnitureInteraction(hotspotId, verb)) {
                        return true;
                    }
                    if (cfg.furnitureSet === 'train_room' && window.TrainRoom1961 && window.TrainRoom1961.handleTrainInteraction(hotspotId, verb)) {
                        return true;
                    }
                    if (window.DarkroomPack1961 && window.DarkroomPack1961.handleDarkroomPackInteraction(hotspotId, verb, selectedItem)) {
                        return true;
                    }
                    if (window.RetroLivingPack1961 && window.RetroLivingPack1961.handleRetroLivingInteraction(hotspotId, verb)) {
                        return true;
                    }

                    const door = cfg.doors.find(d => d.id === hotspotId);
                    if (door) {
                        if (door.id === 'to_bad_uppe' && !window.GameState.getFlag('needsBathroom')) {
                            window.VoiceEngine.speak('lasse', 'Jag är inte ett dugg kissnödig än. Vi måste höra på radion och ta en styrketår ur väskan först!');
                            return true;
                        }
                        if (door.target === 'BATHROOM_CLUE') {
                            window.GameState.setFlag('bathroomClueFound', true);
                            window.VoiceEngine.speakSequence([
                                {
                                    speaker: 'lasse',
                                    text: 'På handfatskanten ligger ett tomt Treo-rör och en blöt lapp ur farsans skjortficka: "Har slängt ifrån mig mässingsnyckeln till J 35X Tors Vrede på virkade duken i hallen och skrivit utkast till polisanmälan mot Bulten på Facit-maskinen i röda rummet!"'
                                },
                                {
                                    speaker: 'conny',
                                    text: 'Vilken tur att du behövde gå på muggen efter mellanölen, Lasse! Nu vet vi exakt var vi ska leta!'
                                }
                            ]);
                            return true;
                        }
                        if (door.target === 'BLOCKED' || window.HouseMap.blockedDoors[door.id]) {
                            const msg = window.HouseMap.blockedDoors[door.id] || 'Inget intressant där inne just nu!';
                            window.VoiceEngine.speak('lasse', msg);
                            return true;
                        }
                        if (verb === 'TITTA PÅ') {
                            window.VoiceEngine.speak('lasse', `Det är ${door.label.toLowerCase()}.`);
                            return true;
                        }
                        if (verb === 'GÅ TILL' || verb === 'ÖPPNA' || verb === 'ANVÄND') {
                            window.Engine.loadScene(door.target);
                            return true;
                        }
                    }

                    if (hotspotId === 'blueprint_plaque') {
                        window.VoiceEngine.speak('conny', `Vi står i "${cfg.title}" enligt kåkens ritning!`);
                        return true;
                    }
                    return false;
                }
            });
        });
    },

    _buildDoor(R, doorCfg) {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 0.6 });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, map: R.proceduralTextures.wood, roughness: 0.5 });
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.55, 3.25, 0.16), frameMat);
        frame.position.y = 1.62;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.38, 3.10, 0.20), doorMat);
        panel.position.y = 1.55;
        panel.castShadow = true;

        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), handleMat);
        knob.position.set(0.50, 1.45, 0.14);

        group.add(frame, panel, knob);
        group.position.set(doorCfg.x, 0, -3.36);
        R.roomGroup.add(group);

        R.registerInteractive(panel, {
            id: doorCfg.id,
            name: doorCfg.label,
            walkX: doorCfg.walkX,
            walkY: 590,
            lookAt: 'front'
        });
    },

    _buildBareCeilingBulb(R, isRedDarkroom = false) {
        const bulbColor = isRedDarkroom ? 0xff2222 : 0xffe6a3;
        const light = new THREE.PointLight(bulbColor, isRedDarkroom ? 1.4 : 0.95, 14);
        light.position.set(0, 3.4, -1.2);
        light.castShadow = true;
        R.roomGroup.add(light);
    },

    _buildBlueprintPlaque(R, titleText) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#e8dec5';
        ctx.fillRect(0, 0, 512, 80);
        ctx.strokeStyle = '#8c2d19';
        ctx.lineWidth = 5;
        ctx.strokeRect(5, 5, 502, 70);
        ctx.fillStyle = '#1f1d1a';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(titleText.toUpperCase(), 256, 48);

        const plaque = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.38, 0.04),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) })
        );
        plaque.position.set(0, 3.35, -3.42);
        R.roomGroup.add(plaque);

        R.registerInteractive(plaque, {
            id: 'blueprint_plaque',
            name: `Ritningsmarkering (${titleText})`,
            walkX: 640,
            walkY: 585,
            lookAt: 'front'
        });
    },

    injectMainHallConnections(R) {
        const extraDoors = [
            { id: 'door_to_ovre_plan', x: -4.1, label: 'Trappa upp till Övre Plan (TV-rum, Röda rummet & Pojkrum)', walkX: 305 },
            { id: 'door_to_kok', x: 1.45, label: 'Dörr in till Berså-Köket (Tant Karin)', walkX: 745 },
            { id: 'door_to_matsal', x: 4.85, label: 'Öppning till Finrum & Matsal', walkX: 1010 },
            { id: 'door_to_gastrum', x: -7.5, label: 'Dörr till Föräldrasovrummet (Vänster flygel)', walkX: 60 }
        ];
        extraDoors.forEach(d => this._buildDoor(R, d));
    },

    handleMainHallDoorClick(hotspotId, verb) {
        if (this.blockedDoors[hotspotId]) {
            window.VoiceEngine.speak('lasse', this.blockedDoors[hotspotId]);
            return true;
        }
        if (verb !== 'GÅ TILL' && verb !== 'ÖPPNA' && verb !== 'ANVÄND') return false;

        const map = {
            'door_to_ovre_plan': 'villa_ovre_hall',
            'door_to_kok': 'villa_kok',
            'door_to_matsal': 'villa_matsal',
            'door_to_gastrum': 'villa_gastrum',
            'kallardorr': 'villa_kallare_hall'
        };
        if (map[hotspotId]) {
            window.Engine.loadScene(map[hotspotId]);
            return true;
        }
        return false;
    }
};

window.HouseMap.registerAllRooms();